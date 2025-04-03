import Button from '@/components/button/Button';
import styles from './SongCard.module.css';
import React from 'react';
import Image from 'next/image';

const extractYouTubeVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const SongCard = ({ youtubeUrl, positiveVotes, negativeVotes, onVote }) => {
  const videoId = extractYouTubeVideoId(youtubeUrl);

  const getBackgroundColor = () => {
    if (positiveVotes > 0) return '#25A18E'; // Green for positive vote
    if (negativeVotes > 0) return '#a12538'; // Red for negative vote
    return 'transparent'; // Default background
  };

  if (!videoId) {
    return <div className={styles.error}>Invalid YouTube URL</div>;
  }

  return (
    <div
      className={styles.mainContainer}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className={styles.videoTitle}>Votes: +{positiveVotes} / -{negativeVotes}</div>
      <div className={styles.videoContainer}>
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className={styles.buttonContainer}>
        <Button onClick={() => onVote('negative')}>
          <Image src="/img/minus.svg" alt="Downvote" width={25} height={25} />
        </Button>
        <Button onClick={() => onVote('positive')}>
          <Image src="/img/plus.svg" alt="Upvote" width={25} height={25} />
        </Button>
      </div>
    </div>
  );
};

export default SongCard;