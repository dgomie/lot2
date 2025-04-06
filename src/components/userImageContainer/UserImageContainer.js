import React from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './UserImageContainer.module.css';
import Image from 'next/image';

export const UserImageContainer = ({ users, title }) => {
  const router = useRouter(); 

  const handleImageClick = (username) => {
    if (username) {
      router.push(`/profile/${username}`); 
    }
  };

  if (!users || users.length === 0) {
    return <div className={styles.mainContainer}></div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.title}>{title}</div>
      <div className={styles.imageContainer}>
        {users.map((user) => (
          <div
            key={user.uid}
            className={styles.userImage}
            onClick={() => handleImageClick(user.username)}
          >
            <Image
              src={user.profileImage || '/img/user.png'}
              alt={user.username || 'User'}
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
