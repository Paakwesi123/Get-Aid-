// src/pages/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const navigate = useNavigate(); // ⬅️ Add this

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fullName, phoneNumber, password, medicalHistory })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful!');
        localStorage.setItem('token', data.token); // optional: store token
        navigate('/medicalform'); // ✅ redirect to medical form
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Signup error');
    }
  };

  return (
    <form onSubmit={handleSignup} style={styles.form}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={styles.input}
      />
      <textarea
        placeholder="Brief Medical History (e.g. Asthma, Allergies)"
        value={medicalHistory}
        onChange={(e) => setMedicalHistory(e.target.value)}
        rows={4}
        style={styles.textarea}
      />
      <button type="submit" style={styles.button}>Sign Up</button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center'
  },
  input: {
    display: 'block', width: '100%', padding: '10px', marginBottom: '10px'
  },
  textarea: {
    width: '100%', padding: '10px', marginBottom: '10px'
  },
  button: {
    padding: '10px 20px'
  }
};

export default Signup;
