import React, { useState } from 'react';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import uploadProfileImage from '../../utils/uploadProfileImage';
import EditIcon from '../../../public/img/edit.svg';

const ProfileHeader = ({ username, createdAt, profileImg }) => {
  const [imageUrl, setImageUrl] = useState(profileImg);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = await uploadProfileImage(file);
      setImageUrl(url);
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
          width={200}
          height={200}
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
