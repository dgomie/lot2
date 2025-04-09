import React from 'react';
import styles from './VotesSubmitted.module.css';
import Image from 'next/image';

export const VotesSubmitted = () => {
  return (
    <div className={styles.votesSubmitted}>
      <Image
        src="/img/check.svg"
        alt="Votes Submitted"
        width={50}
        height={50}
      />
      <div className={styles.label}>Votes Submitted</div>
    </div>
  );
};
