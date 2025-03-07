import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEnvelope } from 'react-icons/fa';
import './DoctorMatching.css';

function DoctorMatching() {
  const { id } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [emailDraft, setEmailDraft] = useState('');

  useEffect(() => {
    axios
      .get(`/api/trial/${id}/doctors/`)
      .then((response) => setDoctors(response.data))
      .catch((error) => {
        console.error('Error fetching doctors:', error);
        setDoctors([
          { id: 1, name: 'Dr. Smith', specialty: 'Oncology', location: 'California' },
          { id: 2, name: 'Dr. Jones', specialty: 'Endocrinology', location: 'New York' },
        ]);
      });
  }, [id]);

  const handleEmailDraft = async (doctorId) => {
    try {
      const response = await axios.get(`/api/trial/${id}/email-draft/`, {
        params: { doctor_id: doctorId },
      });
      setEmailDraft(response.data.email);
    } catch (error) {
      setEmailDraft(`Dear Dr.,\nWe invite you to join our trial...`);
    }
    setSelectedDoctor(doctorId);
  };

  const doctorVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.2 },
    }),
  };

  return (
    <div className="doctors-container">
      <h1>Matched Investigators</h1>
      {doctors.map((doctor, index) => (
        <motion.div
          key={doctor.id}
          custom={index}
          variants={doctorVariants}
          initial="hidden"
          animate="visible"
          className="doctor-card"
        >
          <div>
            <h3>{doctor.name}</h3>
            <p>Specialty: {doctor.specialty}</p>
            <p>Location: {doctor.location}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, color: '#ffd700' }}
            onClick={() => handleEmailDraft(doctor.id)}
          >
            <FaEnvelope /> Email Draft
          </motion.button>
        </motion.div>
      ))}
      
      {selectedDoctor && (
        <motion.div
          className="email-modal"
          variants={doctorVariants}
          initial="hidden"
          animate="visible"
        >
          <h3>Sample Email Draft</h3>
          <p>{emailDraft}</p>
          <input type="file" placeholder="Upload Document (Optional)" />
          <button onClick={() => setSelectedDoctor(null)}>Close</button>
        </motion.div>
      )}
    </div>
  );
}

export default DoctorMatching;
