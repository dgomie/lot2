import Button from '@/components/button/Button';
import styles from './SongCard.module.css';
import React, { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/input/Input';

const extractYouTubeVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const SongCard = ({
  youtubeUrl,
  videoTitle,
  vote,
  onVote,
  isUserSubmission,
  onCommentChange, // Callback to pass the comment to the parent
}) => {
  const [comment, setComment] = useState(''); // Local state for the comment
  const videoId = extractYouTubeVideoId(youtubeUrl);

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment); // Update local state
    onCommentChange(newComment); // Pass the comment to the parent
  };

  const getBackgroundColor = () => {
    if (vote === 1) return '#25A18E';
    if (vote === -1) return '#a12538';
    return 'white';
  };

  if (!videoId) {
    return <div className={styles.error}>Invalid YouTube URL</div>;
  }

  return (
    <div
      className={styles.mainContainer}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className={styles.videoTitle} title={videoTitle}>
        {videoTitle || 'Unknown Video'}
      </div>
      <div className={styles.videoContainer}>
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      {isUserSubmission ? (
        <div className={styles.userSubmissionMessage}>Your Submission</div>
      ) : (
        <>
          <div className={styles.buttonContainer}>
            <Button onClick={() => onVote('negative')}>
              <Image
                src="/img/minus.svg"
                alt="Downvote"
                width={25}
                height={25}
              />
            </Button>
            <Button onClick={() => onVote('positive')}>
              <Image src="/img/plus.svg" alt="Upvote" width={25} height={25} />
            </Button>
          </div>
          <div className={styles.commentContainer}>
            <Input
              type="text"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Add a comment..."
              className={styles.commentInput}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SongCard;
