import Button from '@/components/button/Button';
import styles from './SongCard.module.css';
import React from 'react';
import Image from 'next/image';

const SongCard = () => {
  return (
    <>
      <div className={styles.mainContainer}>
        <div>Song Card</div>
        <div>embedded video</div>
        <div className={styles.buttonContainer}>
          <Button>
            <Image src="/img/minus.svg" alt="Downvote" width={25} height={25} />
          </Button>
          <Button>
            <Image src="/img/plus.svg" alt="Downvote" width={25} height={25} />
          </Button>
        </div>
      </div>
      <div className={styles.mainContainer}>
        <div>Song Card</div>
        <div>embedded video</div>
        <div className={styles.buttonContainer}>
          <Button>
            <Image src="/img/minus.svg" alt="Downvote" width={25} height={25} />
          </Button>
          <Button>
            <Image src="/img/plus.svg" alt="Downvote" width={25} height={25} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default SongCard;
