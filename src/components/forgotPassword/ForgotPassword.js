import React, { useState } from 'react';
import styles from './ForgotPassword.module.css';
import { resetPassword } from '@/firebase';
import Input from '../input/Input';
import Button from '../button/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); 

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError(''); 
  };

  const handleClick = () => {
    if (!email.trim()) {
      setError('Please enter a valid email address'); 
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    resetPassword(email);
  };

  return (
    <div className={styles.mainContainer}>
      <form className={styles.form}>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          label="Email:"
          required
        />
        {error && <p className={styles.error}>{error}</p>}{' '}
        <Button onClick={handleClick}>Reset Password</Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
