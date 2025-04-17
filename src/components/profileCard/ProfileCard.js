import React from 'react';
import styles from './ProfileCard.module.css';
import Image from 'next/image';

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num;
};

const ProfileCard = ({ iconUrl, numValue, title }) => {
  return (
    <div className={styles.mainContainer}>
      <Image src={iconUrl} alt={`${title} icon`} width={50} height={50} />
      <div className={styles.title}>{title}</div>
      <div className={styles.number}>{formatNumber(numValue)}</div>
    </div>
  );
};

export default ProfileCard;
