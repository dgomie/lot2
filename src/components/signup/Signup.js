'use client';
import { useState } from 'react';
import { signupUser } from '../../firebase';
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const user = await signupUser(email, password, username);
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
          <Button type="submit" className={styles.button} variant="green">
            Signup
          </Button>
        </form>
      </div>
    </div>
  );
}
