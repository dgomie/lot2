import React, { useState } from 'react';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { uploadProfileImage } from '@/firebase';
import EditIcon from '../../../public/img/edit.svg';

const ProfileHeader = ({ userId, username, createdAt, profileImg }) => {
  const [imageUrl, setImageUrl] = useState(profileImg);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && userId) {
      try {
        const url = await uploadProfileImage(file, userId);
        setImageUrl(url);
      } catch (error) {
        console.error('Error uploading profile image:', error);
      }
    } else {
      console.error('File or userId is missing');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.mainContainer}>
      <div style={{ position: 'relative' }}>
        <Image
          className={styles.profileImg}
          src={imageUrl}
          alt="Profile Image"
          width={180}
          height={180}
          onClick={() => document.getElementById('fileInput').click()}
        />
        <Image
          src={EditIcon}
          className={styles.gearIcon}
          alt="Edit Icon"
          width={70}
        />
      </div>
      <input
        id="fileInput"
        type="file"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
      <div className={styles.username}>{username}</div>
      <div className={styles.date}>Member Since {formatDate(createdAt)}</div>
    </div>
  );
};

export default ProfileHeader;
