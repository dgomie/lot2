import React from 'react';
import styles from './AddRoundCard.module.css';
import Image from 'next/image';

export const AddRoundCard = () => {
  const handleCardClick = () => {
    router.push(`/legions/${legionId}/${round.roundNumber}`);
  };

  return (
    <div>
      <div className={styles.card}>
        <div className={styles.card__content}>
          <span className={styles.card__prompt}>Add Round</span>
          <Image src={'/img/plus-dark.svg'} width={40} height={40} alt="Add Round" />
        </div>
      </div>
    </div>
  );
};
