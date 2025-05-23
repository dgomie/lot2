'use client';
import { useState, useEffect } from 'react';
import {
  signupUser,
  getFcmToken,
  requestNotificationPermission,
  onMessageListener,
} from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../../firebase'; // Import Firestore instance
import styles from './Signup.module.css';
import Input from '../input/Input';
import Button from '../button/Button';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isUsernameValid = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const isFormValid = () => {
    const { email, password, confirmPassword, username } = formData;
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      username.trim() !== '' &&
      password === confirmPassword &&
      isUsernameValid(username)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(),
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, username } = formData;

    if (!email || !password || !confirmPassword || !username) {
      setError('All fields are required');
      return;
    }

    if (!isUsernameValid(username)) {
      setError(
        'Username must be 3-20 characters and can only contain letters, numbers, hyphens, and underscores.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const normalizedUsername = username.toLowerCase();

      const user = await signupUser(email, password, normalizedUsername);

      // Request notification permission and get FCM token
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          const userDocRef = doc(db, 'users', user.uid); // Reference Firestore document
          await updateDoc(userDocRef, { fcmToken }); // Save FCM token
        } else {
          console.warn('Failed to retrieve FCM token.');
        }
      }

      // Redirect after completing all tasks
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(
      (prevShowConfirmPassword) => !prevShowConfirmPassword
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Signup</h1>
      <div className={styles.formContainer}>
        <form onSubmit={handleSignup}>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            label="Username:"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            label="Email:"
            required
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            label="Password:"
            required
            showToggle
            toggleVisibility={toggleShowPassword}
            isVisible={showPassword}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            label="Confirm Password:"
            required
            showToggle
            toggleVisibility={toggleShowConfirmPassword}
            isVisible={showConfirmPassword}
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button
            type="submit"
            className={styles.button}
            variant={isFormValid() ? 'blue' : 'disabled'}
            disabled={!isFormValid()}
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}
