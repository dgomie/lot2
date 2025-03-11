import React from 'react';
import styles from './ProfileCard.module.css';
import Image from 'next/image';

const ProfileCard = ({ iconUrl, numValue, title }) => {
  return (
    <div className={styles.mainContainer}>
      <Image src={iconUrl} alt={`${title} icon`} width={50} height={50} />
      <div className={styles.title}>{title}</div>
      <div className={styles.number}>{numValue}</div>
    </div>
  );
};

export default ProfileCard;
