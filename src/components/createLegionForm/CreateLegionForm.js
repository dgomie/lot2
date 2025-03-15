import React, { useState } from 'react';
import styles from './CreateLegionForm.module.css';
import Input from '../input/Input';
import NumberInput from '../numberInput/NumberInput';
import { db } from '../../firebase';
import Button from '../button/Button';

const CreateLegion = () => {
  const [formData, setFormData] = useState({
    legionName: '',
    legionDescription: '',
    maxNumPlayers: 1,
    numRounds: 1,
    voteTime: 1,
    submitTime: 1,
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'legionName' || name === 'legionDescription' ? value : parseInt(value, 10) || 0,
    }));
  };

  const handleNext = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (
      formData.legionName &&
      formData.legionDescription &&
      formData.maxNumPlayers &&
      formData.numRounds &&
      formData.voteTime &&
      formData.submitTime
    ) {
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
      <div className={styles.title}>Create a Legion</div>
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
          <NumberInput
            className={styles.inputField}
            name="maxNumPlayers"
            value={formData.maxNumPlayers}
            onChange={handleChange}
            label="Max Number of Players"
            required
            min={1}
            max={100}
          />
        </div>
      )}
      {step === 3 && (
        <div>
          <NumberInput
            className={styles.inputField}
            name="numRounds"
            value={formData.numRounds}
            onChange={handleChange}
            label="Number of Rounds"
            required
            min={1}
            max={20}
          />
          <NumberInput
            className={styles.inputField}
            name="voteTime"
            value={formData.voteTime}
            onChange={handleChange}
            label="Vote Time (in days)"
            required
            min={1}
            max={60}
          />
          <NumberInput
            className={styles.inputField}
            name="submitTime"
            value={formData.submitTime}
            onChange={handleChange}
            label="Submit Time (in days)"
            required
            min={1}
            max={60}
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