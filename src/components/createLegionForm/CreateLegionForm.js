import React, { useState } from 'react';
import styles from './CreateLegionForm.module.css';
import Input from '../input/Input';
import { db } from '../../firebase'; 
import Button from '../button/Button';

const CreateLegion = () => {
  const [formData, setFormData] = useState({
    legionName: '',
    legionDescription: '',
    maxNumPlayers: null,
    numRounds: null,
    voteTime: null,
    submitTime: null,
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (formData.legionName && formData.legionDescription && formData.maxNumPlayers && formData.numRounds && formData.voteTime && formData.submitTime) {
      try {
        await db.collection('legions').add(formData);
        alert('Legion created successfully!');
      } catch (error) {
        console.error('Error creating legion: ', error);
        alert('Error creating legion.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className={styles.formContainer}>
      {step === 1 && (
        <div>
          <Input
            className={styles.inputField}
            type="text"
            name="legionName"
            value={formData.legionName}
            onChange={handleChange}
            placeholder="Legion Title"
            label="Legion Title"
            required
          />
          <Input
            className={styles.inputField}
            type="text"
            name="legionDescription"
            value={formData.legionDescription}
            onChange={handleChange}
            placeholder="Legion Description"
            label="Legion Description"
            required
          />
        </div>
      )}
      {step === 2 && (
        <div>
          <Input
            className={styles.inputField}
            type="number"
            name="maxNumPlayers"
            value={formData.maxNumPlayers}
            onChange={handleChange}
            placeholder="Max Number of Players"
            label="Max Number of Players"
            required
          />
        </div>
      )}
      {step === 3 && (
        <div>
          <Input
            className={styles.inputField}
            type="number"
            name="numRounds"
            value={formData.numRounds}
            onChange={handleChange}
            placeholder="Number of Rounds"
            label="Number of Rounds"
            required
          />
          <Input
            className={styles.inputField}
            type="number"
            name="voteTime"
            value={formData.voteTime}
            onChange={handleChange}
            placeholder="Vote Time (in minutes)"
            label="Vote Time (in minutes)"
            required
          />
          <Input
            className={styles.inputField}
            type="number"
            name="submitTime"
            value={formData.submitTime}
            onChange={handleChange}
            placeholder="Submit Time (in minutes)"
            label="Submit Time (in minutes)"
            required
          />
        </div>
      )}
      <div className={styles.buttonContainer}>
        {step > 1 && <Button onClick={handlePrevious}>Previous</Button>}
        {step < 3 && <Button onClick={handleNext}>Next</Button>}
        {step === 3 && <Button onClick={handleSubmit}>Start Legion</Button>}
      </div>
    </div>
  );
};

export default CreateLegion;