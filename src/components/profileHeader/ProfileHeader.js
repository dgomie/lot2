import React, { useState } from 'react';
import styles from './ProfileHeader.module.css';
import Image from 'next/image';
import { uploadProfileImage } from '@/firebase';
import EditIcon from '../../../public/img/edit.svg';
import Spinner from '../spinner/Spinner';
import imageCompression from 'browser-image-compression';
import { updateProfileImgInLegions } from '@/firebase';


const ProfileHeader = ({
  userId,
  currentUserId,
  username,
  createdAt,
  profileImg,
}) => {
  const [imageUrl, setImageUrl] = useState(profileImg);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && userId) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG and PNG images are allowed.');
        return;
      }
  
      setLoading(true);
      try {
        // Compress the image
        const options = {
          maxSizeMB: 0.5, // Maximum size in MB (500 KB)
          maxWidthOrHeight: 1920, // Optional: Resize the image if needed
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
  
        // Validate compressed file size
        if (compressedFile.size > 500 * 1024) {
          alert('Compressed image size exceeds 500 KB.');
          setLoading(false);
          return;
        }
  
        // Upload the compressed image
        const url = await uploadProfileImage(compressedFile, userId);
        setImageUrl(url);
  
        const result = await updateProfileImgInLegions({userId: userId, newProfileImgUrl: url});
        if (!result.success) {
          console.error('Failed to update profile image in legions:', result.error);
        }
      } catch (error) {
        console.error('Error uploading profile image:', error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error('File or userId is missing');
    }
  }; 

  const formatDate = (date) => {
    if (!date) return 'Unknown';

    if (date.toDate) {
      date = date.toDate();
    }

    const options = { year: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString(undefined, options);
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
          width={160}
          height={160}
          onError={() => setImageUrl('/img/user.png')} 
          onClick={() => {
            if (currentUserId === userId) {
              document.getElementById('fileInput').click();
            }
          }}
        />
        {currentUserId === userId && (
          <Image
            src={EditIcon}
            className={styles.gearIcon}
            alt="Edit Icon"
            width={70}
          />
        )}
      </div>
      {currentUserId === userId && (
        <input
          id="fileInput"
          type="file"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      )}
      <div className={styles.username}>{username}</div>
      <div className={styles.date}>Member Since {formatDate(createdAt)}</div>
    </div>
  );
};

export default ProfileHeader;
