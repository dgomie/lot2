import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styles from './Login.module.css';
import Input from '../input/Input';
import Button from '../button/Button';

const Login = () => {
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
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email:"
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password:"
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