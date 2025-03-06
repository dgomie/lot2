'use client';
import { useState } from 'react';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styles from './login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to home page or dashboard after successful login
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>Login</button>
      </form>
    </div>
  );
}