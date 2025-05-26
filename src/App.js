// import React, { useState, useEffect } from 'react';
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue, off } from 'firebase/database';

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBzXzocbdytn4N8vLrT-V2JYZ8pgqWrbC0",
//   authDomain: "self-balancing-7a9fe.firebaseapp.com",
//   databaseURL: "https://self-balancing-7a9fe-default-rtdb.firebaseio.com",
//   projectId: "self-balancing-7a9fe",
//   storageBucket: "self-balancing-7a9fe.firebasestorage.app",
//   messagingSenderId: "1044959372723",
//   appId: "1:1044959372723:web:7e1f73307107cf91ba97c6",
//   measurementId: "G-357J7ZXYED"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// const SensorDashboard = () => {
//   const [sensorData, setSensorData] = useState({});
//   const [systemStatus, setSystemStatus] = useState('System Normal');
//   const [blinkingCards, setBlinkingCards] = useState({});
//   const [previousValues, setPreviousValues] = useState({});
//   const [connectionState, setConnectionState] = useState('connecting'); // connecting, connected, error, timeout
//   const [errorMessage, setErrorMessage] = useState('');

//   // Define unique colors for each sensor card
//   const sensorColors = {
//     acceleration: 'linear-gradient(135deg, #667eea, #764ba2)',
//     angle: 'linear-gradient(135deg, #f093fb, #f5576c)',
//     flame: 'linear-gradient(135deg, #4facfe, #00f2fe)',
//     gas_leak: 'linear-gradient(135deg, #43e97b, #38f9d7)',
//     impact: 'linear-gradient(135deg, #fa709a, #fee140)',
//     panic_button: 'linear-gradient(135deg,rgb(72, 134, 131),rgb(245, 94, 142))',
//     vibration: 'linear-gradient(135deg,rgb(253, 130, 134),rgb(252, 139, 216))'
//   };

//   useEffect(() => {
//     let timeoutId;
//     let sensorsRef;
//     let statusRef;

//     // Set a timeout to show error after 10 seconds
//     timeoutId = setTimeout(() => {
//       if (connectionState === 'connecting') {
//         setConnectionState('timeout');
//         setErrorMessage('Connection timeout. Please check your Firebase configuration.');
//       }
//     }, 10000);

//     try {
//       // Listen for real-time updates from Firebase
//       sensorsRef = ref(database, '1_Emergency_Response_System/sensors');
//       statusRef = ref(database, '1_Emergency_Response_System/status');

//       const handleSensorsData = (snapshot) => {
//         try {
//           const data = snapshot.val();
//           console.log('Firebase sensors data:', data);
          
//           if (data && typeof data === 'object') {
//             setConnectionState('connected');
//             clearTimeout(timeoutId);
            
//             // Check for changes from false to true for boolean values only
//             Object.keys(data).forEach(key => {
//               if (typeof data[key] === 'boolean' && 
//                   previousValues[key] === false && 
//                   data[key] === true) {
//                 // Start blinking animation
//                 setBlinkingCards(prev => ({ ...prev, [key]: true }));
                
//                 // Stop blinking after 3 seconds
//                 setTimeout(() => {
//                   setBlinkingCards(prev => ({ ...prev, [key]: false }));
//                 }, 3000);
//               }
//             });

//             setPreviousValues(data);
//             setSensorData(data);
//           } else {
//             console.log('No sensor data found or invalid data structure');
//             setConnectionState('error');
//             setErrorMessage('No sensor data found in Firebase. Please check your database structure.');
//           }
//         } catch (error) {
//           console.error('Error processing sensor data:', error);
//           setConnectionState('error');
//           setErrorMessage(`Data processing error: ${error.message}`);
//         }
//       };

//       const handleStatusData = (snapshot) => {
//         try {
//           const status = snapshot.val();
//           console.log('Firebase status data:', status);
//           if (status) {
//             setSystemStatus(status);
//           }
//         } catch (error) {
//           console.error('Error processing status data:', error);
//         }
//       };

//       const handleError = (error) => {
//         console.error('Firebase connection error:', error);
//         setConnectionState('error');
//         setErrorMessage(`Firebase error: ${error.message}`);
//         clearTimeout(timeoutId);
//       };

//       // Set up listeners
//       onValue(sensorsRef, handleSensorsData, handleError);
//       onValue(statusRef, handleStatusData, handleError);

//     } catch (error) {
//       console.error('Firebase initialization error:', error);
//       setConnectionState('error');
//       setErrorMessage(`Initialization error: ${error.message}`);
//       clearTimeout(timeoutId);
//     }

//     return () => {
//       clearTimeout(timeoutId);
//       if (sensorsRef) off(sensorsRef);
//       if (statusRef) off(statusRef);
//     };
//   }, [previousValues, connectionState]);

//   const getCardGradient = (sensorName, value) => {
//     if (blinkingCards[sensorName]) {
//       return 'linear-gradient(135deg, #ff4757, #ff3838)'; // Red gradient for blinking
//     }
    
//     // Return unique color for each sensor
//     return sensorColors[sensorName] || 'linear-gradient(135deg, #667eea, #764ba2)';
//   };

//   const formatSensorName = (name) => {
//     return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   };

//   const formatValue = (value) => {
//     if (typeof value === 'boolean') {
//       return value.toString();
//     }
//     if (typeof value === 'number') {
//       return parseFloat(value).toFixed(4);
//     }
//     return value?.toString() || '';
//   };

//   const retryConnection = () => {
//     setConnectionState('connecting');
//     setErrorMessage('');
//     setSensorData({});
//     // Force re-render which will trigger useEffect
//     window.location.reload();
//   };

//   // Render loading state
//   if (connectionState === 'connecting') {
//     return (
//       <div style={styles.container}>
//         <div style={styles.header}>
//           <h1 style={styles.title}>Emergency Response System</h1>
//           <div style={styles.loadingMessage}>
//             <div style={styles.loader}></div>
//             <p>Connecting to Firebase...</p>
//             <p style={styles.subText}>Waiting for sensor data</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render error state
//   if (connectionState === 'error' || connectionState === 'timeout') {
//     return (
//       <div style={styles.container}>
//         <div style={styles.header}>
//           <h1 style={styles.title}>Emergency Response System</h1>
//           <div style={styles.errorMessage}>
//             <div style={styles.errorIcon}>⚠️</div>
//             <h3 style={styles.errorTitle}>Connection Failed</h3>
//             <p style={styles.errorText}>{errorMessage}</p>
//             <p style={styles.debugInfo}>
//               Please check:
//               <br />• Firebase configuration
//               <br />• Database rules (ensure read access is enabled)
//               <br />• Internet connection
//               <br />• Database structure (/sensors and /status paths)
//             </p>
//             <button style={styles.retryButton} onClick={retryConnection}>
//               Retry Connection
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render dashboard with data
//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h1 style={styles.title}>Emergency Response System</h1>
//         <div style={styles.systemStatus}>
//           <span style={styles.statusLabel}>System Status: </span>
//           <span style={{
//             ...styles.statusValue,
//             color: systemStatus === 'System Normal' ? '#2ed573' : '#ff4757'
//           }}>
//             {systemStatus}
//           </span>
//         </div>
//         <div style={styles.connectionStatus}>
//           <span style={{
//             ...styles.connectionIndicator,
//             backgroundColor: '#2ed573'
//           }}></span>
//           Connected to Firebase ({Object.keys(sensorData).length} sensors)
//         </div>
//       </div>

//       <div style={styles.cardGrid}>
//         {Object.entries(sensorData).map(([sensorName, value]) => (
//           <div
//             key={sensorName}
//             style={{
//               ...styles.card,
//               background: getCardGradient(sensorName, value),
//               animation: blinkingCards[sensorName] ? 'blink 0.5s infinite' : 'none',
//               transform: blinkingCards[sensorName] ? 'scale(1.05)' : 'scale(1)'
//             }}
//           >
//             <div style={styles.cardContent}>
//               <h3 style={styles.sensorName}>{formatSensorName(sensorName)}</h3>
//               <div style={styles.sensorValue}>{formatValue(value)}</div>
//               <div style={{
//                 ...styles.sensorStatus,
//                 backgroundColor: blinkingCards[sensorName] 
//                   ? 'rgba(255, 71, 87, 0.3)' 
//                   : 'rgba(255,255,255,0.2)'
//               }}>
//                 {systemStatus}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <style>{`
//         @keyframes blink {
//           0%, 50% { 
//             opacity: 1; 
//             box-shadow: 0 0 30px rgba(255, 71, 87, 0.8);
//           }
//           51%, 100% { 
//             opacity: 0.7; 
//             box-shadow: 0 0 15px rgba(255, 71, 87, 0.4);
//           }
//         }
        
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }

//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'white',
//     padding: '20px',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
//   },
//   header: {
//     textAlign: 'center',
//     marginBottom: '40px',
//     color: 'black'
//   },
//   title: {
//     fontSize: '2.5rem',
//     fontWeight: 'bold',
//     margin: '0 0 20px 0',
//     textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
//     color: '#333'
//   },
//   systemStatus: {
//     fontSize: '1.2rem',
//     fontWeight: '500',
//     marginBottom: '10px'
//   },
//   statusLabel: {
//     color: 'black'
//   },
//   statusValue: {
//     fontWeight: 'bold',
//     textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
//   },
//   connectionStatus: {
//     fontSize: '0.9rem',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '8px'
//   },
//   connectionIndicator: {
//     width: '8px',
//     height: '8px',
//     borderRadius: '50%',
//     display: 'inline-block'
//   },
//   loadingMessage: {
//     textAlign: 'center',
//     color: 'black',
//     marginTop: '50px'
//   },
//   loader: {
//     border: '4px solid rgba(0,0,0,0.1)',
//     borderTop: '4px solid #667eea',
//     borderRadius: '50%',
//     width: '40px',
//     height: '40px',
//     animation: 'spin 1s linear infinite',
//     margin: '0 auto 20px'
//   },
//   subText: {
//     fontSize: '0.9rem',
//     opacity: '0.8',
//     marginTop: '10px'
//   },
//   errorMessage: {
//     textAlign: 'center',
//     color: 'black',
//     marginTop: '50px',
//     maxWidth: '600px',
//     margin: '50px auto'
//   },
//   errorIcon: {
//     fontSize: '3rem',
//     marginBottom: '20px'
//   },
//   errorTitle: {
//     fontSize: '1.5rem',
//     marginBottom: '15px'
//   },
//   errorText: {
//     fontSize: '1rem',
//     marginBottom: '20px',
//     lineHeight: '1.5'
//   },
//   debugInfo: {
//     fontSize: '0.9rem',
//     backgroundColor: 'rgba(0,0,0,0.05)',
//     padding: '15px',
//     borderRadius: '8px',
//     marginBottom: '20px',
//     textAlign: 'left',
//     lineHeight: '1.6',
//     border: '1px solid rgba(0,0,0,0.1)'
//   },
//   retryButton: {
//     backgroundColor: '#4ecdc4',
//     color: 'white',
//     border: 'none',
//     padding: '12px 24px',
//     borderRadius: '25px',
//     fontSize: '1rem',
//     fontWeight: 'bold',
//     cursor: 'pointer',
//     transition: 'all 0.3s ease'
//   },
//   cardGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//     gap: '25px',
//     maxWidth: '1400px',
//     margin: '0 auto'
//   },
//   card: {
//     borderRadius: '15px',
//     padding: '25px',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
//     transition: 'all 0.3s ease',
//     animation: 'fadeIn 0.6s ease-out',
//     cursor: 'pointer',
//     position: 'relative',
//     overflow: 'hidden'
//   },
//   cardContent: {
//     textAlign: 'center',
//     color: 'white',
//     position: 'relative',
//     zIndex: 2
//   },
//   sensorName: {
//     fontSize: '1.3rem',
//     fontWeight: 'bold',
//     margin: '0 0 15px 0',
//     textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
//   },
//   sensorValue: {
//     fontSize: '2.2rem',
//     fontWeight: 'bold',
//     margin: '15px 0',
//     textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
//   },
//   sensorStatus: {
//     fontSize: '1rem',
//     fontWeight: '600',
//     marginTop: '15px',
//     padding: '10px 20px',
//     borderRadius: '25px',
//     display: 'inline-block',
//     textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
//     border: '2px solid rgba(255,255,255,0.3)'
//   }
// };

// export default SensorDashboard;






import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Zap, Shield, AlertTriangle, Radio, Waves } from 'lucide-react';

// Mock Firebase functions for demo - replace with actual Firebase imports
const mockFirebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo.firebaseapp.com",
  databaseURL: "https://demo-rtdb.firebaseio.com",
  projectId: "demo-project"
};

const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [systemStatus, setSystemStatus] = useState('System Normal');
  const [blinkingCards, setBlinkingCards] = useState({});
  const [previousValues, setPreviousValues] = useState({});
  const [connectionState, setConnectionState] = useState('connected'); // Demo state
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'graphs'

  // Define sensor configurations
  const sensorConfigs = {
    acceleration: {
      name: 'Acceleration',
      unit: 'm/s²',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
      icon: TrendingUp,
      type: 'numeric',
      range: [0, 10]
    },
    angle: {
      name: 'Angle',
      unit: '°',
      color: '#f5576c',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
      icon: Activity,
      type: 'numeric',
      range: [-180, 180]
    },
    flame: {
      name: 'Flame Sensor',
      unit: '',
      color: '#00f2fe',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      icon: Zap,
      type: 'boolean',
      range: [0, 1]
    },
    gas_leak: {
      name: 'Gas Leak',
      unit: '',
      color: '#38f9d7',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      icon: Shield,
      type: 'boolean',
      range: [0, 1]
    },
    impact: {
      name: 'Impact Sensor',
      unit: '',
      color: '#fee140',
      gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
      icon: AlertTriangle,
      type: 'boolean',
      range: [0, 1]
    },
    panic_button: {
      name: 'Panic Button',
      unit: '',
      color: '#f55e8e',
      gradient: 'linear-gradient(135deg,rgb(72, 134, 131),rgb(245, 94, 142))',
      icon: Radio,
      type: 'boolean',
      range: [0, 1]
    },
    vibration: {
      name: 'Vibration',
      unit: '',
      color: '#fc8bd8',
      gradient: 'linear-gradient(135deg,rgb(253, 130, 134),rgb(252, 139, 216))',
      icon: Waves,
      type: 'boolean',
      range: [0, 1]
    }
  };

  // Wave data generator for realistic sensor readings
  const [wavePhase, setWavePhase] = useState({});
  const [waveAmplitude, setWaveAmplitude] = useState({});
  
  const generateWaveData = () => {
    const now = new Date();
    const mockData = {};
    const currentTime = now.getTime() / 1000; // Convert to seconds
    
    Object.keys(sensorConfigs).forEach(sensorName => {
      const config = sensorConfigs[sensorName];
      
      // Initialize wave parameters if not exists
      if (!wavePhase[sensorName]) {
        setWavePhase(prev => ({ ...prev, [sensorName]: Math.random() * Math.PI * 2 }));
        setWaveAmplitude(prev => ({ ...prev, [sensorName]: Math.random() * 0.5 + 0.5 }));
      }
      
      if (config.type === 'numeric') {
        const [min, max] = config.range;
        const center = (min + max) / 2;
        const range = (max - min) / 2;
        
        // Create wave patterns with different frequencies for each sensor
        const frequency = sensorName === 'acceleration' ? 0.1 : 0.05; // Different frequencies
        const noise = (Math.random() - 0.5) * 0.1; // Add some noise
        const phase = wavePhase[sensorName] || 0;
        const amplitude = waveAmplitude[sensorName] || 1;
        
        const waveValue = Math.sin(currentTime * frequency + phase) * amplitude;
        mockData[sensorName] = center + (waveValue * range * 0.8) + noise;
        
        // Keep within bounds
        mockData[sensorName] = Math.max(min, Math.min(max, mockData[sensorName]));
      } else {
        // For boolean sensors, create occasional spikes
        const spikeChance = Math.sin(currentTime * 0.02 + (wavePhase[sensorName] || 0)) > 0.7;
        mockData[sensorName] = spikeChance && Math.random() > 0.7;
      }
    });
    
    return mockData;
  };

  // Initialize historical data with wave patterns
  const initializeHistoricalData = () => {
    const historical = {};
    const now = new Date();
    
    Object.keys(sensorConfigs).forEach(sensorName => {
      historical[sensorName] = [];
      const config = sensorConfigs[sensorName];
      
      // Initialize wave parameters
      const phase = Math.random() * Math.PI * 2;
      const amplitude = Math.random() * 0.5 + 0.5;
      const frequency = sensorName === 'acceleration' ? 0.1 : sensorName === 'angle' ? 0.08 : 0.05;
      
      // Generate 50 data points for the last 50 time units
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000);
        const timeInSeconds = timestamp.getTime() / 1000;
        let value;
        
        if (config.type === 'numeric') {
          const [min, max] = config.range;
          const center = (min + max) / 2;
          const range = (max - min) / 2;
          
          // Create realistic wave with multiple harmonics
          const wave1 = Math.sin(timeInSeconds * frequency + phase) * amplitude;
          const wave2 = Math.sin(timeInSeconds * frequency * 2 + phase) * amplitude * 0.3;
          const wave3 = Math.sin(timeInSeconds * frequency * 0.5 + phase) * amplitude * 0.2;
          const noise = (Math.random() - 0.5) * 0.1;
          
          const combinedWave = wave1 + wave2 + wave3;
          value = center + (combinedWave * range * 0.6) + noise;
          
          // Keep within bounds
          value = Math.max(min, Math.min(max, value));
        } else {
          // For boolean sensors, create realistic trigger patterns
          const triggerWave = Math.sin(timeInSeconds * 0.02 + phase);
          const spikeChance = triggerWave > 0.8;
          value = spikeChance && Math.random() > 0.6 ? 1 : 0;
        }
        
        historical[sensorName].push({
          timestamp: timestamp.toLocaleTimeString(),
          value: value,
          rawTimestamp: timestamp
        });
      }
      
      // Set wave parameters for future use
      setWavePhase(prev => ({ ...prev, [sensorName]: phase }));
      setWaveAmplitude(prev => ({ ...prev, [sensorName]: amplitude }));
    });
    
    return historical;
  };

  useEffect(() => {
    // Initialize with wave data
    const initialData = generateWaveData();
    setSensorData(initialData);
    setHistoricalData(initializeHistoricalData());
    
    // Set up real-time updates (every 2 seconds for smoother waves)
    const interval = setInterval(() => {
      const newData = generateWaveData();
      const now = new Date();
      
      // Check for changes and trigger blinking
      Object.keys(newData).forEach(key => {
        if (sensorConfigs[key].type === 'boolean' && 
            previousValues[key] === false && 
            newData[key] === true) {
          setBlinkingCards(prev => ({ ...prev, [key]: true }));
          setTimeout(() => {
            setBlinkingCards(prev => ({ ...prev, [key]: false }));
          }, 3000);
        }
      });
      
      setPreviousValues(newData);
      setSensorData(newData);
      
      // Update historical data
      setHistoricalData(prev => {
        const updated = { ...prev };
        Object.keys(newData).forEach(sensorName => {
          if (updated[sensorName]) {
            const newPoint = {
              timestamp: now.toLocaleTimeString(),
              value: sensorConfigs[sensorName].type === 'boolean' ? (newData[sensorName] ? 1 : 0) : newData[sensorName],
              rawTimestamp: now
            };
            
            // Keep only last 50 points for smoother waves
            updated[sensorName] = [...updated[sensorName].slice(-49), newPoint];
          }
        });
        return updated;
      });
    }, 2000); // Update every 2 seconds for smoother animation
    
    return () => clearInterval(interval);
  }, [previousValues]);

  const formatValue = (value, sensorName) => {
    const config = sensorConfigs[sensorName];
    if (config.type === 'boolean') {
      return value ? 'ACTIVE' : 'INACTIVE';
    }
    if (typeof value === 'number') {
      return `${parseFloat(value).toFixed(2)} ${config.unit}`;
    }
    return value?.toString() || '';
  };

  const getCardGradient = (sensorName) => {
    if (blinkingCards[sensorName]) {
      return 'linear-gradient(135deg, #ff4757, #ff3838)';
    }
    return sensorConfigs[sensorName]?.gradient || 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sensorName = payload[0].dataKey === 'value' ? selectedSensor : null;
      const config = sensorName ? sensorConfigs[sensorName] : null;
      
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`Time: ${label}`}</p>
          <p style={{ margin: 0, color: payload[0].color }}>
            {`Value: ${config?.type === 'boolean' 
              ? (payload[0].value === 1 ? 'ACTIVE' : 'INACTIVE')
              : `${parseFloat(payload[0].value).toFixed(2)} ${config?.unit || ''}`
            }`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderGraph = (sensorName) => {
    const data = historicalData[sensorName] || [];
    const config = sensorConfigs[sensorName];
    
    if (!data.length) return null;
    
    return (
      <div key={sensorName} style={styles.graphContainer}>
        <div style={styles.graphHeader}>
          <div style={styles.graphTitle}>
            {React.createElement(config.icon, { 
              size: 20, 
              color: config.color,
              style: { marginRight: '8px' }
            })}
            {config.name}
          </div>
          <div style={styles.currentValue}>
            Current: {formatValue(sensorData[sensorName], sensorName)}
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          {config.type === 'boolean' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={Math.floor(data.length / 8)} // Show fewer labels
              />
              <YAxis 
                domain={[0, 1]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value === 1 ? 'ON' : 'OFF'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="stepAfter"
                dataKey="value" 
                stroke={config.color}
                strokeWidth={3}
                fill={config.color}
                fillOpacity={0.4}
                animationDuration={300}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={Math.floor(data.length / 8)} // Show fewer labels
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="cardinal" 
                dataKey="value" 
                stroke={config.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, stroke: config.color, strokeWidth: 2, fill: '#fff' }}
                animationDuration={300}
                tension={0.4}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  if (connectionState === 'connecting') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Emergency Response System</h1>
          <div style={styles.loadingMessage}>
            <div style={styles.loader}></div>
            <p>Connecting to Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

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
        
        <div style={styles.viewToggle}>
          <button 
            style={{
              ...styles.toggleButton,
              backgroundColor: viewMode === 'cards' ? '#4ecdc4' : '#e0e0e0',
              color: viewMode === 'cards' ? 'white' : '#666'
            }}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </button>
          <button 
            style={{
              ...styles.toggleButton,
              backgroundColor: viewMode === 'graphs' ? '#4ecdc4' : '#e0e0e0',
              color: viewMode === 'graphs' ? 'white' : '#666'
            }}
            onClick={() => setViewMode('graphs')}
          >
            Graph View
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div style={styles.cardGrid}>
          {Object.entries(sensorData).map(([sensorName, value]) => {
            const config = sensorConfigs[sensorName];
            const IconComponent = config?.icon || Activity;
            
            return (
              <div
                key={sensorName}
                style={{
                  ...styles.card,
                  background: getCardGradient(sensorName),
                  animation: blinkingCards[sensorName] ? 'blink 0.5s infinite' : 'none',
                  transform: blinkingCards[sensorName] ? 'scale(1.05)' : 'scale(1)'
                }}
                onClick={() => {
                  setSelectedSensor(sensorName);
                  setViewMode('graphs');
                }}
              >
                <div style={styles.cardContent}>
                  <div style={styles.cardIcon}>
                    <IconComponent size={32} color="white" />
                  </div>
                  <h3 style={styles.sensorName}>{config?.name || sensorName}</h3>
                  <div style={styles.sensorValue}>{formatValue(value, sensorName)}</div>
                  <div style={{
                    ...styles.sensorStatus,
                    backgroundColor: blinkingCards[sensorName] 
                      ? 'rgba(255, 71, 87, 0.3)' 
                      : 'rgba(255,255,255,0.2)'
                  }}>
                    Click to view graph
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.graphsContainer}>
          <div style={styles.graphsGrid}>
            {Object.keys(sensorData).map(sensorName => renderGraph(sensorName))}
          </div>
        </div>
      )}

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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#333'
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
    color: '#666'
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
    gap: '8px',
    marginBottom: '20px',
    color: '#666'
  },
  connectionIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  viewToggle: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '20px'
  },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#666',
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
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  card: {
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
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
  cardIcon: {
    marginBottom: '15px'
  },
  sensorName: {
    fontSize: '1.3rem',
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
    borderRadius: '25px',
    display: 'inline-block',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    border: '2px solid rgba(255,255,255,0.3)'
  },
  graphsContainer: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  graphsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '30px'
  },
  graphContainer: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    animation: 'fadeIn 0.6s ease-out'
  },
  graphHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0'
  },
  graphTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center'
  },
  currentValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: '5px 10px',
    borderRadius: '15px'
  }
};

export default SensorDashboard;
