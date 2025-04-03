import React, { useState } from 'react';
import styles from './VoteCard.module.css';
import SongCard from '../songCard/SongCard';
import Button from '@/components/button/Button';
import { updateRoundSubmissions } from '@/firebase';

const VoteCard = ({ submissions, legionId, roundId }) => {
  const [votes, setVotes] = useState(submissions.map(() => 0)); // Initialize all votes to 0

  const handleVote = (index, type) => {
    setVotes((prevVotes) => {
      const updatedVotes = [...prevVotes];

      if (type === 'positive') {
   
        updatedVotes[index] = updatedVotes[index] === 1 ? 0 : 1;
      } else if (type === 'negative') {
        // Cycle between 0 -> -1 -> 0
        updatedVotes[index] = updatedVotes[index] === -1 ? 0 : -1;
      }

      return updatedVotes;
    });
  };

  const canSubmitVotes = votes.some((vote) => vote !== 0); // Allow submission if any vote is non-zero

  const handleSubmitVotes = async () => {
    const updatedSubmissions = submissions.map((submission, index) => ({
      ...submission,
      voteCount: submission.voteCount + votes[index], // Add the vote to the submission's voteCount
    }));

    try {
      const result = await updateRoundSubmissions(
        legionId,
        roundId,
        updatedSubmissions
      );

      if (result.success) {
        console.log('Votes successfully submitted');
      } else {
        console.error('Failed to submit votes:', result.error);
      }
    } catch (error) {
      console.error('Error submitting votes:', error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.carousel}>
        {submissions.map((submission, index) => (
          <SongCard
            key={index}
            youtubeUrl={submission.youtubeUrl}
            positiveVotes={votes[index] === 1 ? 1 : 0}
            negativeVotes={votes[index] === -1 ? 1 : 0}
            onVote={(type) => handleVote(index, type)}
          />
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <Button onClick={handleSubmitVotes} disabled={!canSubmitVotes}>
          Submit Votes
        </Button>
      </div>
    </div>
  );
};

export default VoteCard;