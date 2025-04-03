import Button from '@/components/button/Button';
import styles from './SongCard.module.css';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const extractYouTubeVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const SongCard = ({ youtubeUrl, positiveVotes, negativeVotes, onVote }) => {
  const videoId = extractYouTubeVideoId(youtubeUrl);
  const [videoTitle, setVideoTitle] = useState('Loading...');

  useEffect(() => {
    if (videoId) {
      const fetchVideoTitle = async () => {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
          );
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setVideoTitle(data.items[0].snippet.title);
          } else {
            setVideoTitle('Unknown Video');
          }
        } catch (error) {
          console.error('Error fetching video title:', error);
          setVideoTitle('Error loading title');
        }
      };

      fetchVideoTitle();
    }
  }, [videoId]);

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
      <div className={styles.videoTitle} title={videoTitle}>
        {videoTitle}
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