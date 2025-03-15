import React from 'react';
import styles from './CreateLegionForm.module.css';
import { useState } from 'react';
import Input from '../input/Input';

const CreateLegion = () => {
  const [formData, setFormData] = useState({
    legionName: '',
    legionDescription: '',
    maxNumPlayers: null,
    numRounds: null,
    roundLength: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div>
      <form>
        <div className={styles.title}>Start a Legion</div>
        <Input
          id="legionName"
          name="legionName"
          type="text"
          value={formData.legionName}
          onChange={handleChange}
          label="Legion Name"
          required
        />
        <Input
          id="legionDescription"
          name="legionDescription"
          type="text"
          value={formData.legionDescription}
          onChange={handleChange}
          label="Legion Description"
          required
        />
        <Input
          id="maxNumPlayers"
          name="maxNumPlayers"
          type="number"
          value={formData.maxNumPlayers}
          onChange={handleChange}
          label="Max Number of Players"
          required
        />
        <Input
          id="numRounds"
          name="numRounds"
          type="number"
          value={formData.numRounds}
          onChange={handleChange}
          label="Number of Rounds"
          required
        />
        <Input
          id="roundLength"
          name="roundLength"
          type="number"
          value={formData.roundLength}
          onChange={handleChange}
          label="Round Length"
          required
        />
      </form>
    </div>
  );
};

export default CreateLegion;
