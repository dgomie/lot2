import React, { useState } from 'react';
import styles from './ForgotPassword.module.css';
import { resetPassword } from '@/firebase';
import Input from '../input/Input';
import Button from '../button/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError('');
  };

  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length > 1) {
      return `${localPart[0]}****@${domain}`;
    }
    return email; 
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

    setMaskedEmail(maskEmail(email));
    setResetSent(true);
    resetPassword(email);
  };

  return (
    <div className={styles.mainContainer}>
      {!resetSent ? (
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
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonContainer}>
            <Button onClick={handleClick}>Reset Password</Button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.text}>Reset password email sent to:</div>
          <div className={styles.text}>{maskedEmail}</div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
