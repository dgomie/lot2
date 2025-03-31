import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './RoundCard.module.css';

const RoundCard = ({ round, legionId }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/legions/${legionId}/${round.roundNumber}`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.card__image}></div>
      <div className={styles.card__content}>
        <span className={styles.card__title}>Round {round.roundNumber}</span>
        <p className={styles.card__describe}>
          Prompt: {round.prompt || 'No prompt available'}
        </p>
        <p className={styles.card__describe}>
          Submission Deadline:{' '}
          {new Date(round.submissionDeadline).toLocaleString()}
        </p>
        <p className={styles.card__describe}>
          Vote Deadline: {new Date(round.voteDeadline).toLocaleString()}
        </p>
        <p className={styles.card__describe}>
          Status: {round.roundStatus}
        </p>
      </div>
    </div>
  );
};

export default RoundCard;
