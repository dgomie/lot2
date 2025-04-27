import React, { useState } from 'react';
import styles from './ProfileSettings.module.css';
import Button from '../button/Button';
import Input from '../input/Input';
import { updateUserInFirebase } from '@/firebase';

export const ProfileSettings = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: currentUser.uid,
    username: currentUser.username,
    email: currentUser.email,
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  console.log(currentUser)

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleEditClick = async () => {
  if (isEditing) {
    // Check if any changes were made
    if (
      formData.username === currentUser.username &&
      formData.email === currentUser.email
    ) {
      setIsEditing(false); // Reset editing state without making API calls
      return;
    }

    // Validate the form before saving
    if (!validateForm()) {
      return;
    }

    try {
      const result = await updateUserInFirebase(
        formData,
        currentUser.username,
        currentUser.email
      );
      if (!result.success) {
        setError(result.error); // Display the error if the username or email is taken
        return;
      }

      console.log('User updated successfully');
      window.location.reload(); // Refresh the page after successful save
    } catch (error) {
      console.error('Error updating user:', error);
      setError('An error occurred while updating your profile.');
    }
  } else {
    setIsEditing(true); // Enable editing mode
  }
};

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>Profile Settings</div>
      <div className={styles.form}>
        <Input
          id="username"
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <Input
          id="email"
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        <div className={styles.buttonContainer}>
          <Button variant="aquamarine" onClick={handleEditClick}>
            {isEditing ? 'Save Settings' : 'Edit Settings'}
          </Button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
};
