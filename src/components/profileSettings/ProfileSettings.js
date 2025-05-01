import React, { useState } from 'react';
import styles from './ProfileSettings.module.css';
import Button from '../button/Button';
import Input from '../input/Input';
import { updateUserInFirebase, deleteUserFromFirebase } from '@/firebase'; // Import delete function
import PasswordModal from '../passwordModal/PasswordModal';

export const ProfileSettings = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    uid: currentUser.uid,
    username: currentUser.username,
    email: currentUser.email,
  });
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isUsernameValid = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/; // Allows 3-20 characters, alphanumeric, hyphens, and underscores
    return usernameRegex.test(username);
  };
  
  const validateForm = () => {
    if (!isUsernameValid(formData.username)) {
      setError(
        'Username must be 3-20 characters and can only contain letters, numbers, hyphens, and underscores.'
      );
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
      if (
        formData.username === currentUser.username &&
        formData.email === currentUser.email
      ) {
        setIsEditing(false);
        return;
      }

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
          setError(result.error);
          return;
        }

        window.location.reload();
      } catch (error) {
        console.error('Error updating user:', error);
        setError('An error occurred while updating your profile.');
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDeleteClick = () => {
    setShowPasswordModal(true); // Show the password modal
  };

  const handlePasswordConfirm = async (password) => {
    setShowPasswordModal(false); // Hide the modal

    if (!password) {
      setError('Password is required to delete your account.');
      return;
    }

    try {
      await deleteUserFromFirebase(
        currentUser.uid,
        currentUser.email,
        password
      );
    } catch (error) {
      console.error('Error deleting user:', error);

      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'An error occurred while deleting your account.';
      if (error.code === 'auth/invalid-credential') {
        errorMessage =
          'The password you entered is incorrect. Please try again.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage =
          'For security reasons, please log in again to delete your account.';
      }

      setError(errorMessage);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
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
         

          <Button variant="red" onClick={handleDeleteClick}>
            Delete Account
          </Button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
      {showPasswordModal && (
        <PasswordModal
          onConfirm={handlePasswordConfirm}
          onCancel={handlePasswordCancel}
        />
      )}
    </div>
  );
};
