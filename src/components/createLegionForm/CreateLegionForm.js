import React, { useState, useEffect } from 'react';
import styles from './CreateLegionForm.module.css';
import Input from '../input/Input';
import NumberInput from '../numberInput/NumberInput';
import { db } from '../../firebase';
import Button from '../button/Button';

const CreateLegionForm = () => {
  const [formData, setFormData] = useState({
    legionName: '',
    legionDescription: '',
    maxNumPlayers: 0,
    numRounds: 0,
    voteTime: 0,
    submitTime: 0,
    players: [],
  });

  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);

  useEffect(() => {
    validateStep();
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'legionName' || name === 'legionDescription'
          ? value
          : parseInt(value, 10) || 0,
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      setIsStepValid(
        formData.legionName.length > 0 &&
          formData.legionName.length < 25 &&
          formData.legionDescription.length > 0 &&
          formData.legionDescription.length < 150
      );
    } else if (step === 2) {
      setIsStepValid(formData.maxNumPlayers > 0);
    } else if (step === 3) {
      setIsStepValid(
        formData.numRounds > 0 &&
          formData.voteTime > 0 &&
          formData.submitTime > 0
      );
    }
  };

  const handleNext = () => {
    if (isStepValid) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (isStepValid) {
      try {
        console.log(formData);
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
            maxLength={100}
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
            maxLength={100}
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
        {step < 3 && (
          <Button
            onClick={handleNext}
            disabled={!isStepValid}
            variant={isStepValid ? 'blue' : 'disabled'}
          >
            Next
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid}
            variant={isStepValid ? 'blue' : 'disabled'}
          >
            Start Legion
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateLegionForm;
