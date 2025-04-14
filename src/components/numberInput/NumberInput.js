import React from 'react';
import styles from './NumberInput.module.css';
import Button from '../button/Button';
import Image from 'next/image';

const NumberInput = ({
  name,
  value,
  onChange,
  label,
  required,
  min = 0,
  max = Infinity,
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange({ target: { name, value: value + 1 } });
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange({ target: { name, value: value - 1 } });
    }
  };

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <Button
          onClick={handleDecrement}
        >
          <Image src='/img/minus.svg' alt='decrement' width={25} height={25}/>
        </Button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={styles.input}
          
        />
        <Button
          onClick={handleIncrement}
        >
          <Image src='/img/plus.svg' alt='increment' width={25} height={25}/>
        </Button>
      </div>
    </div>
  );
};

export default NumberInput;
