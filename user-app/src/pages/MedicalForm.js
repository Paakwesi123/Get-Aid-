import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MedicalForm = () => {
  const [formData, setFormData] = useState({
    allergies: '',
    chronicDiseases: '',
    bloodType: '',
    medications: '',
    previousSurgeries: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const key = name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [key]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/users/medical-history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medicalHistory: formData })
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Medical history saved!');
        navigate('/sos-panel');
      } else {
        alert(data.message || 'Failed to save.');
      }
    } catch (error) {
      alert('Something went wrong.');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
      <h2>🩺 Medical History Form</h2>
      <input name="allergies" placeholder="Allergies" onChange={handleChange} required /><br />
      <input name="chronicDiseases" placeholder="Chronic Diseases" onChange={handleChange} /><br />
      <input name="bloodType" placeholder="Blood Type" onChange={handleChange} /><br />
      <input name="medications" placeholder="Current Medications" onChange={handleChange} /><br />
      <input name="previousSurgeries" placeholder="Previous Surgeries" onChange={handleChange} /><br />
      <h4>Emergency Contact</h4>
      <input name="emergencyContact.name" placeholder="Name" onChange={handleChange} required /><br />
      <input name="emergencyContact.relationship" placeholder="Relationship" onChange={handleChange} required /><br />
      <input name="emergencyContact.phone" placeholder="Phone" onChange={handleChange} required /><br /><br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default MedicalForm;
