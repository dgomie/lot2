import React, { useState } from 'react';
import styles from './PasswordModal.module.css';
import Button from '../button/Button';
import Input from '../input/Input';

const PasswordModal = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(password);
    setPassword(''); // Clear the password after confirmation
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>Confirm Account Deletion</h3>
        <p>Please enter your password to confirm account deletion:</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className={styles.passwordInput}
        />
        <div className={styles.buttonContainer}>
          <Button onClick={handleConfirm} variant='red'>
            Confirm
          </Button>
          <Button onClick={onCancel} variant='gray'>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
