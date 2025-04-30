import React, { useState } from 'react';
import {
  loginUser,
  getFcmToken,
  requestNotificationPermission,
} from '../../firebase';
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore'; // Import necessary Firestore functions
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
  
      // Request notification permission and get FCM token
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const newFcmToken = await getFcmToken();
        if (newFcmToken) {
          const userDocRef = doc(db, 'users', user.uid); // Reference to the user's Firestore document
  
          // Retrieve the old FCM token from the user's document
          const userDocSnap = await getDoc(userDocRef);
          const oldFcmToken = userDocSnap.exists()
            ? userDocSnap.data().fcmToken
            : null;
  
          // Update the user's FCM token
          await updateDoc(userDocRef, { fcmToken: newFcmToken });
  
          if (oldFcmToken) {
            // Query all legions where the old FCM token exists in the playerTokens array
            const legionsCollection = collection(db, 'legions'); // Use collection function
            const legionsQuery = query(
              legionsCollection,
              where('playerTokens', 'array-contains', oldFcmToken),
              where('isActive', '==', true)
            );
            const legionsSnapshot = await getDocs(legionsQuery); // Use getDocs to fetch the query results
  
            // Update each legion document
            const batch = writeBatch(db); // Use writeBatch for batch updates
            legionsSnapshot.forEach((legionDoc) => {
              const legionRef = legionDoc.ref;
              const updatedPlayerTokens = legionDoc
                .data()
                .playerTokens.map((token) =>
                  token === oldFcmToken ? newFcmToken : token
                );
              batch.update(legionRef, { playerTokens: updatedPlayerTokens });
            });
            await batch.commit();
          }
        } else {
          console.warn('Failed to retrieve FCM token.');
        }
      }
  
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
        {error && <p className={styles.error}>Invalid email or password</p>}
        <Button type="submit" className={styles.button} variant="blue">
          Login
        </Button>
      </form>
    </div>
  );
};

export default Login;
