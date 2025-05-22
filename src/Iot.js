

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzXzocbdytn4N8vLrT-V2JYZ8pgqWrbC0",
  authDomain: "self-balancing-7a9fe.firebaseapp.com",
  databaseURL: "https://self-balancing-7a9fe-default-rtdb.firebaseio.com",
  projectId: "self-balancing-7a9fe",
  storageBucket: "self-balancing-7a9fe.firebasestorage.app",
  messagingSenderId: "1044959372723",
  appId: "1:1044959372723:web:7e1f73307107cf91ba97c6",
  measurementId: "G-357J7ZXYED"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const IrrigationDashboard = () => {
  const [irrigationData, setIrrigationData] = useState({});
  const [blinkingCards, setBlinkingCards] = useState({});
  const [previousValues, setPreviousValues] = useState({});
  const [connectionState, setConnectionState] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');

  // Define unique colors for IoT Smart Irrigation System
  const irrigationSensorColors = {
    batteryPercentage: 'linear-gradient(135deg, #11998e, #38ef7d)',
    current: 'linear-gradient(135deg, #fc466b, #3f5efb)',
    humidity: 'linear-gradient(135deg, #00c9ff, #92fe9d)',
    lastUpdate: 'linear-gradient(135deg,rgb(23, 177, 169),rgb(248, 112, 155))',
    pumpStatus: 'linear-gradient(135deg, #fd746c, #ff9068)',
    soilIsDry: 'linear-gradient(135deg, #8360c3, #2ebf91)',
    temperature: 'linear-gradient(135deg, #ff8a80, #ea4c89)',
    voltage: 'linear-gradient(135deg, #667eea, #764ba2)'
  };

  useEffect(() => {
    let timeoutId;
    let irrigationRef;

    // Set a timeout to show error after 10 seconds
    timeoutId = setTimeout(() => {
      if (connectionState === 'connecting') {
        setConnectionState('timeout');
        setErrorMessage('Connection timeout. Please check your Firebase configuration.');
      }
    }, 10000);

    try {
      // Listen for IoT Smart Irrigation System data
      irrigationRef = ref(database, '2_IOT_Smart_Irrigation_System');

      const handleIrrigationData = (snapshot) => {
        try {
          const data = snapshot.val();
          console.log('Firebase irrigation data:', data);
          
          if (data && typeof data === 'object') {
            setConnectionState('connected');
            clearTimeout(timeoutId);
            
            // Check for changes from false to true for boolean values
            Object.keys(data).forEach(key => {
              if (typeof data[key] === 'boolean' && 
                  previousValues[key] === false && 
                  data[key] === true) {
                setBlinkingCards(prev => ({ ...prev, [key]: true }));
                setTimeout(() => {
                  setBlinkingCards(prev => ({ ...prev, [key]: false }));
                }, 3000);
              }
            });

            setPreviousValues(data);
            setIrrigationData(data);
          } else {
            console.log('No irrigation data found or invalid data structure');
            setConnectionState('error');
            setErrorMessage('No irrigation system data found in Firebase. Please check your database structure.');
          }
        } catch (error) {
          console.error('Error processing irrigation data:', error);
          setConnectionState('error');
          setErrorMessage(`Data processing error: ${error.message}`);
        }
      };

      const handleError = (error) => {
        console.error('Firebase connection error:', error);
        setConnectionState('error');
        setErrorMessage(`Firebase error: ${error.message}`);
        clearTimeout(timeoutId);
      };

      // Set up listener
      onValue(irrigationRef, handleIrrigationData, handleError);

    } catch (error) {
      console.error('Firebase initialization error:', error);
      setConnectionState('error');
      setErrorMessage(`Initialization error: ${error.message}`);
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
      if (irrigationRef) off(irrigationRef);
    };
  }, [previousValues, connectionState]);

  const getCardGradient = (sensorName, value) => {
    if (blinkingCards[sensorName]) {
      return 'linear-gradient(135deg, #ff4757, #ff3838)';
    }
    
    return irrigationSensorColors[sensorName] || 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  const formatSensorName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatValue = (value, sensorName) => {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (typeof value === 'number') {
      if (sensorName === 'batteryPercentage') {
        return `${value}%`;
      }
      return parseFloat(value).toFixed(4);
    }
    return value?.toString() || '';
  };

  const getSensorStatus = (sensorName, value) => {
    switch(sensorName) {
      case 'pumpStatus':
        return value ? 'Running' : 'Stopped';
      case 'soilIsDry':
        return value ? 'Dry Soil' : 'Wet Soil';
      case 'batteryPercentage':
        return value < 20 ? 'Low Battery' : value < 50 ? 'Medium' : 'Good';
      case 'humidity':
        return value < 30 ? 'Low' : value > 70 ? 'High' : 'Normal';
      case 'temperature':
        return value < 15 ? 'Cold' : value > 35 ? 'Hot' : 'Normal';
      default:
        return 'Active';
    }
  };

  const retryConnection = () => {
    setConnectionState('connecting');
    setErrorMessage('');
    setIrrigationData({});
    window.location.reload();
  };

  // Render loading state
  if (connectionState === 'connecting') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>IoT Smart Irrigation System</h1>
          <div style={styles.loadingMessage}>
            <div style={styles.loader}></div>
            <p>Connecting to Firebase...</p>
            <p style={styles.subText}>Waiting for irrigation system data</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (connectionState === 'error' || connectionState === 'timeout') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>IoT Smart Irrigation System</h1>
          <div style={styles.errorMessage}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Connection Failed</h3>
            <p style={styles.errorText}>{errorMessage}</p>
            <p style={styles.debugInfo}>
              Please check:
              <br />• Firebase configuration
              <br />• Database rules (ensure read access is enabled)
              <br />• Internet connection
              <br />• Database structure (/2_IOT_Smart_Irrigation_System path)
            </p>
            <button style={styles.retryButton} onClick={retryConnection}>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render dashboard with data
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>IoT Smart Irrigation System</h1>
        <div style={styles.connectionStatus}>
          <span style={{
            ...styles.connectionIndicator,
            backgroundColor: '#2ed573'
          }}></span>
          Connected to Firebase ({Object.keys(irrigationData).length} sensors)
        </div>
      </div>

      <div style={styles.cardGrid}>
        {Object.entries(irrigationData).map(([sensorName, value]) => (
          <div
            key={sensorName}
            style={{
              ...styles.card,
              background: getCardGradient(sensorName, value),
              animation: blinkingCards[sensorName] ? 'blink 0.5s infinite' : 'none',
              transform: blinkingCards[sensorName] ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div style={styles.cardContent}>
              <h3 style={styles.sensorName}>{formatSensorName(sensorName)}</h3>
              <div style={styles.sensorValue}>{formatValue(value, sensorName)}</div>
              <div style={styles.sensorStatus}>
                {getSensorStatus(sensorName, value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { 
            opacity: 1; 
            box-shadow: 0 0 30px rgba(255, 71, 87, 0.8);
          }
          51%, 100% { 
            opacity: 0.7; 
            box-shadow: 0 0 15px rgba(255, 71, 87, 0.4);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'white',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: 'black'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    color: '#333'
  },
  connectionStatus: {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'black'
  },
  connectionIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  loadingMessage: {
    textAlign: 'center',
    color: 'black',
    marginTop: '50px'
  },
  loader: {
    border: '4px solid rgba(0,0,0,0.1)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  subText: {
    fontSize: '0.9rem',
    opacity: '0.8',
    marginTop: '10px'
  },
  errorMessage: {
    textAlign: 'center',
    color: 'black',
    marginTop: '50px',
    maxWidth: '600px',
    margin: '50px auto'
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '1.5rem',
    marginBottom: '15px'
  },
  errorText: {
    fontSize: '1rem',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  debugInfo: {
    fontSize: '0.9rem',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'left',
    lineHeight: '1.6',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  retryButton: {
    backgroundColor: '#4ecdc4',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  card: {
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.6s ease-out',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  cardContent: {
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    zIndex: 2
  },
  sensorName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  sensorValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '15px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  sensorStatus: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginTop: '15px',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)'
  }
};

export default IrrigationDashboard;