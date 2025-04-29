import React, { useState } from 'react';
import styles from './ValidateEmail.module.css';
import Button from '../button/Button';
import { sendEmailVerification, getAuth } from 'firebase/auth';
import Image from 'next/image';

export function ValidateEmail() {
  const [verificationSent, setVerificationSent] = useState(false);

  const handleResendVerification = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (error) {
        console.error('Error resending verification email:', error);
      }
    } else {
      console.error('No authenticated user found.');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <p>Your email is not verified. Please check your inbox.</p>
      <div className={styles.buttonContainer}>
        <Button
          variant="aquamarine"
          onClick={handleResendVerification}
          disabled={verificationSent}
        >
          {verificationSent
            ? 'Verification Email Sent'
            : 'Resend Verification Email'}
        </Button>
      </div>
      <div
        className={styles.refreshButton}
        onClick={() => window.location.reload()}
      >
        <Image src={'/img/refresh.svg'} width={50} height={50} alt="Refresh" />
        Refresh Page
      </div>
    </div>
  );
}
