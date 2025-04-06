import React from 'react';
import styles from './UserImageContainer.module.css';
import Image from 'next/image';

export const UserImageContainer = ({ users, title }) => {
  if (!users || users.length === 0) {
    return <div className={styles.mainContainer}></div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.imageContainer}>
      {users.map((user) => (
        <div key={user.uid} className={styles.userImage}>
          <Image
            src={user.profileImage || '/img/user.png'}
            alt={user.name || 'User'}
            width={30}
            height={30}
            className={styles.image}
          />
        </div>
      ))}
      </div>
    </div>
  );
};
