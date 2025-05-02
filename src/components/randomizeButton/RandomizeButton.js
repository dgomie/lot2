import React from 'react';
import styles from './RandomizeButton.module.css';
import Button from '../button/Button';
import Image from 'next/image';
import { musicLeaguePrompts } from '@/data/defaultPrompts'; // Import prompts

export const RandomizeButton = ({
  setEditableRoundData,
  editableRoundData,
}) => {
  const handleShufflePrompt = () => {
    if (musicLeaguePrompts.length === 0) {
      setEditableRoundData({
        ...editableRoundData,
        prompt: 'No prompts available', // Fallback prompt
      });
      return;
    }
    const randomPrompt =
      musicLeaguePrompts[Math.floor(Math.random() * musicLeaguePrompts.length)];
    setEditableRoundData({
      ...editableRoundData,
      prompt: randomPrompt,
    });
  };

  return (
    <div className={styles.mainContainer}>
      <Button variant="aquamarine" onClick={handleShufflePrompt}>
        <div className={styles.randomizeButtonContent}>
          <Image
            src="/img/shuffle.svg"
            height={20}
            width={20}
            alt="shuffle"
            className={styles.shuffleIcon}
          />
          Randomize Prompt
        </div>
      </Button>
    </div>
  );
};
