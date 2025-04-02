import React, { useState } from 'react';
import {
  loginUser,
  getFcmToken,
  requestNotificationPermission,
} from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../../firebase'; // Import the Firestore instance
import styles from './Login.module.css';
import Input from '../input/Input';
import Button from '../button/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const user = await loginUser(email, password);
      console.log('Logged in user:', user);

      // Request notification permission and get FCM token
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          console.log('Saving FCM token for user:', user.uid);
          const userDocRef = doc(db, 'users', user.uid); // Create a reference to the user's Firestore document
          await updateDoc(userDocRef, { fcmToken }); // Update the document with the FCM token
          console.log('FCM token saved to Firestore:', fcmToken);
        } else {
          console.warn('Failed to retrieve FCM token.');
        }
      }

      // Redirect after completing all tasks
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleLogin}>
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
          showToggle
          toggleVisibility={toggleShowPassword}
          isVisible={showPassword}
          required
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" className={styles.button} variant="green">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
