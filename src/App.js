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

const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [systemStatus, setSystemStatus] = useState('System Normal');
  const [blinkingCards, setBlinkingCards] = useState({});
  const [previousValues, setPreviousValues] = useState({});
  const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, error, timeout
  const [errorMessage, setErrorMessage] = useState('');

  // Define unique colors for each sensor card
  const sensorColors = {
    acceleration: 'linear-gradient(135deg, #667eea, #764ba2)',
    angle: 'linear-gradient(135deg, #f093fb, #f5576c)',
    flame: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    gas_leak: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    impact: 'linear-gradient(135deg, #fa709a, #fee140)',
    panic_button: 'linear-gradient(135deg,rgb(72, 134, 131),rgb(245, 94, 142))',
    vibration: 'linear-gradient(135deg,rgb(253, 130, 134),rgb(252, 139, 216))'
  };

  useEffect(() => {
    let timeoutId;
    let sensorsRef;
    let statusRef;

    // Set a timeout to show error after 10 seconds
    timeoutId = setTimeout(() => {
      if (connectionState === 'connecting') {
        setConnectionState('timeout');
        setErrorMessage('Connection timeout. Please check your Firebase configuration.');
      }
    }, 10000);

    try {
      // Listen for real-time updates from Firebase
      sensorsRef = ref(database, '1_Emergency_Response_System/sensors');
      statusRef = ref(database, '1_Emergency_Response_System/status');

      const handleSensorsData = (snapshot) => {
        try {
          const data = snapshot.val();
          console.log('Firebase sensors data:', data);
          
          if (data && typeof data === 'object') {
            setConnectionState('connected');
            clearTimeout(timeoutId);
            
            // Check for changes from false to true for boolean values only
            Object.keys(data).forEach(key => {
              if (typeof data[key] === 'boolean' && 
                  previousValues[key] === false && 
                  data[key] === true) {
                // Start blinking animation
                setBlinkingCards(prev => ({ ...prev, [key]: true }));
                
                // Stop blinking after 3 seconds
                setTimeout(() => {
                  setBlinkingCards(prev => ({ ...prev, [key]: false }));
                }, 3000);
              }
            });

            setPreviousValues(data);
            setSensorData(data);
          } else {
            console.log('No sensor data found or invalid data structure');
            setConnectionState('error');
            setErrorMessage('No sensor data found in Firebase. Please check your database structure.');
          }
        } catch (error) {
          console.error('Error processing sensor data:', error);
          setConnectionState('error');
          setErrorMessage(`Data processing error: ${error.message}`);
        }
      };

      const handleStatusData = (snapshot) => {
        try {
          const status = snapshot.val();
          console.log('Firebase status data:', status);
          if (status) {
            setSystemStatus(status);
          }
        } catch (error) {
          console.error('Error processing status data:', error);
        }
      };

      const handleError = (error) => {
        console.error('Firebase connection error:', error);
        setConnectionState('error');
        setErrorMessage(`Firebase error: ${error.message}`);
        clearTimeout(timeoutId);
      };

      // Set up listeners
      onValue(sensorsRef, handleSensorsData, handleError);
      onValue(statusRef, handleStatusData, handleError);

    } catch (error) {
      console.error('Firebase initialization error:', error);
      setConnectionState('error');
      setErrorMessage(`Initialization error: ${error.message}`);
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
      if (sensorsRef) off(sensorsRef);
      if (statusRef) off(statusRef);
    };
  }, [previousValues, connectionState]);

  const getCardGradient = (sensorName, value) => {
    if (blinkingCards[sensorName]) {
      return 'linear-gradient(135deg, #ff4757, #ff3838)'; // Red gradient for blinking
    }
    
    // Return unique color for each sensor
    return sensorColors[sensorName] || 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  const formatSensorName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    if (typeof value === 'number') {
      return parseFloat(value).toFixed(4);
    }
    return value?.toString() || '';
  };

  const retryConnection = () => {
    setConnectionState('connecting');
    setErrorMessage('');
    setSensorData({});
    // Force re-render which will trigger useEffect
    window.location.reload();
  };

  // Render loading state
  if (connectionState === 'connecting') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Emergency Response System</h1>
          <div style={styles.loadingMessage}>
            <div style={styles.loader}></div>
            <p>Connecting to Firebase...</p>
            <p style={styles.subText}>Waiting for sensor data</p>
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
          <h1 style={styles.title}>Emergency Response System</h1>
          <div style={styles.errorMessage}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Connection Failed</h3>
            <p style={styles.errorText}>{errorMessage}</p>
            <p style={styles.debugInfo}>
              Please check:
              <br />• Firebase configuration
              <br />• Database rules (ensure read access is enabled)
              <br />• Internet connection
              <br />• Database structure (/sensors and /status paths)
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
        <h1 style={styles.title}>Emergency Response System</h1>
        <div style={styles.systemStatus}>
          <span style={styles.statusLabel}>System Status: </span>
          <span style={{
            ...styles.statusValue,
            color: systemStatus === 'System Normal' ? '#2ed573' : '#ff4757'
          }}>
            {systemStatus}
          </span>
        </div>
        <div style={styles.connectionStatus}>
          <span style={{
            ...styles.connectionIndicator,
            backgroundColor: '#2ed573'
          }}></span>
          Connected to Firebase ({Object.keys(sensorData).length} sensors)
        </div>
      </div>

      <div style={styles.cardGrid}>
        {Object.entries(sensorData).map(([sensorName, value]) => (
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
              <div style={styles.sensorValue}>{formatValue(value)}</div>
              <div style={{
                ...styles.sensorStatus,
                backgroundColor: blinkingCards[sensorName] 
                  ? 'rgba(255, 71, 87, 0.3)' 
                  : 'rgba(255,255,255,0.2)'
              }}>
                {systemStatus}
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
  systemStatus: {
    fontSize: '1.2rem',
    fontWeight: '500',
    marginBottom: '10px'
  },
  statusLabel: {
    color: 'black'
  },
  statusValue: {
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  connectionStatus: {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
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
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.6s ease-out',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  cardContent: {
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    zIndex: 2
  },
  sensorName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  sensorValue: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    margin: '15px 0',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  sensorStatus: {
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '15px',
    padding: '10px 20px',
    borderRadius: '25px',
    display: 'inline-block',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    border: '2px solid rgba(255,255,255,0.3)'
  }
};

export default SensorDashboard;



