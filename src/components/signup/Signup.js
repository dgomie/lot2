'use client';
import { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import styles from './Signup.module.css';
import Image from 'next/image';
import visibleOn from '../../../public/img/visible-on.svg';
import visibleOff from '../../../public/img/visible-off.svg';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, username } = formData;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user information to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        uid: user.uid,
        username: username,
        createdAt: new Date(),
      });

      // Redirect to home page or dashboard after successful signup
      window.location.href = '/dashboard';
    } catch (error) {
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
      <form onSubmit={handleSignup}>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <span className={styles.eyeIcon} onClick={toggleShowPassword}>
              <Image
                src={showPassword ? visibleOff : visibleOn}
                alt="Toggle visibility"
                width={24}
                height={24}
              />
            </span>
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password:
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <span
              className={styles.eyeIcon}
              onClick={toggleShowConfirmPassword}
            >
              <Image
                src={showConfirmPassword ? visibleOff : visibleOn}
                alt="Toggle visibility"
                width={24}
                height={24}
              />
            </span>
          </div>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>
          Signup
        </button>
      </form>
    </div>
  );
}
