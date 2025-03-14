import React, { useState } from 'react';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { uploadProfileImage } from '@/firebase';
import EditIcon from '../../../public/img/edit.svg';
import Spinner from '../spinner/Spinner';

const ProfileHeader = ({ userId, username, createdAt, profileImg }) => {
  const [imageUrl, setImageUrl] = useState(profileImg);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && userId) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG and PNG images are allowed.');
        return;
      }

      // Validate file size (500 KB or less)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (file.size > maxSize) {
        alert('Image size must be 500 KB or less.');
        return;
      }

      setLoading(true); // Set loading to true before starting the upload
      try {
        const url = await uploadProfileImage(file, userId);
        setImageUrl(url);
      } catch (error) {
        console.error('Error uploading profile image:', error);
      } finally {
        setLoading(false); // Set loading to false after the upload is complete
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
        {loading && (
          <div className={styles.loaderOverlay}>
            <Spinner />
          </div>
        )}
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
