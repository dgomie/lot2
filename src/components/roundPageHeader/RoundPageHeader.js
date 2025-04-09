'use client';

import React from 'react';
import styles from './RoundPageHeader.module.css';
import Image from 'next/image';


export const RoundPageHeader = ({ currentUser, roundData, legionId, onBackClick, onSettingsClick }) => {


  return (
    <div className={styles.header}>
      <div
        className={styles.backArrow}
        onClick={onBackClick}
      >
        <Image src={'/img/arrow-back.svg'} width={25} height={25} alt="Back" />
      </div>
      {currentUser &&
        roundData &&
        currentUser.uid === roundData.legionAdmin.userId && (
          <div className={styles.gearIcon} onClick={onSettingsClick}>
            <Image
              src={'/img/gear.svg'}
              width={25}
              height={25}
              alt="settings"
            />
          </div>
        )}
    </div>
  );
};
