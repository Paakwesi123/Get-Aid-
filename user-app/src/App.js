import React from 'react';

function App() {
  const sendSOS = async (type) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const payload = { latitude, longitude, type };

        try {
          const res = await fetch('http://localhost:5000/api/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          alert(data.message || "SOS sent successfully!");
        } catch (error) {
          alert("Failed to send SOS. Please try again.");
          console.error(error);
        }
      },
      (error) => {
        alert("Failed to get location. Please enable GPS.");
        console.error(error);
      }
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚨 SOS Emergency App</h1>
      <div style={styles.buttonContainer}>
        <button style={{ ...styles.button, backgroundColor: '#e63946' }} onClick={() => sendSOS('fire')}>🔥 Fire</button>
        <button style={{ ...styles.button, backgroundColor: '#457b9d' }} onClick={() => sendSOS('health')}>🏥 Health</button>
        <button style={{ ...styles.button, backgroundColor: '#6a0dad' }} onClick={() => sendSOS('crime')}>🚓 Crime</button>
        <button style={{ ...styles.button, backgroundColor: '#f4a261' }} onClick={() => sendSOS('unknown')}>❓ Unknown</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f8f8',
    height: '100vh'
  },
  title: {
    marginBottom: '30px',
    color: '#333'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '300px',
    margin: '0 auto'
  },
  button: {
    padding: '15px',
    fontSize: '18px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default App;

