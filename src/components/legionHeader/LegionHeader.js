import React, { useState } from 'react';
import styles from './LegionHeader.module.css';
import Button from '../button/Button';
import { joinLegion, incrementUserLegions } from '@/firebase';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Import useRouter

const LegionHeader = ({ legionData, legionId, onPlayerAdded }) => {
  const { currentUser } = useContext(AuthContext);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleJoinLegion = async () => {
    setIsDisabled(true);
    if (!currentUser) {
      alert('You must be logged in to join a legion.');
      return;
    }

    try {
      const result = await joinLegion(legionId, currentUser.uid);
      if (result.success) {
        incrementUserLegions(currentUser.uid)
        onPlayerAdded(currentUser.uid); 
      } else {
        alert('Failed to join the legion. Please try again.');
      }
    } catch (error) {
      console.error('Error joining legion:', error);
      alert('An error occurred while trying to join the legion.');
    }
  };

  return (
    <div>
      <div className={styles.title}>{legionData.legionName}</div>
      <div className={styles.subtitle}>{legionData.legionDescription}</div>
      <Button variant="transparentBlack" onClick={handleJoinLegion} disabled={isDisabled}>
        Join Legion
      </Button>
    </div>
  );
};

export default LegionHeader;
