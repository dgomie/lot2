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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Save the updated data to Firebase
      updateUserInFirebase(formData)
        .then(() => {
          console.log('User updated successfully');
        })
        .catch((error) => {
          console.error('Error updating user:', error);
        });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className={styles.mainContainer}>
      <div>Profile Settings</div>
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
      </div>
    </div>
  );
};
