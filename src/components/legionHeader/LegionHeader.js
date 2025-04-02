import React, { useState } from 'react';
import styles from './LegionHeader.module.css';
import Button from '../button/Button';
import {
  joinLegion,
  leaveLegion,
  incrementUserLegions,
  decrementUserLegions,
} from '@/firebase';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const LegionHeader = ({
  legionData,
  legionId,
  onPlayerAdded,
  onPlayerRemoved,
}) => {
  const { currentUser } = useContext(AuthContext);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleJoinLegion = async () => {
    setIsDisabled(true);
    if (!currentUser) {
      alert('You must be logged in to join a legion.');
      return;
    }

    try {
      const result = await joinLegion(legionId, currentUser.uid, currentUser.fcmToken);
      if (result.success) {
        incrementUserLegions(currentUser.uid);
        onPlayerAdded(currentUser.uid);
      } else {
        alert('Failed to join the legion. Please try again.');
      }
    } catch (error) {
      console.error('Error joining legion:', error);
      alert('An error occurred while trying to join the legion.');
    } finally {
      setIsDisabled(false);
    }
  };

  const handleLeaveLegion = async () => {
    setIsDisabled(true);
    if (!currentUser) {
      alert('You must be logged in to leave a legion.');
      return;
    }

    try {
      const result = await leaveLegion(legionId, currentUser.uid, currentUser.fcmToken);
      if (result.success) {
        decrementUserLegions(currentUser.uid);
        onPlayerRemoved(currentUser.uid);
      } else {
        alert('Failed to leave the legion. Please try again.');
      }
    } catch (error) {
      console.error('Error leaving legion:', error);
      alert('An error occurred while trying to leave the legion.');
    } finally {
      setIsDisabled(false);
    }
  };

  const isMember = legionData.players.includes(currentUser?.uid);
  const isAdmin = legionData.legionAdmin === currentUser?.uid;
  const isFull = legionData.players.length >= legionData.maxNumPlayers;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <div className={styles.title}>{legionData.legionName}</div>
        <div className={styles.subtitle}>{legionData.legionDescription}</div>
        {!isAdmin &&
          (isMember ? (
            <Button
              variant="transparentBlack"
              onClick={handleLeaveLegion}
              disabled={isDisabled}
            >
              Leave Legion
            </Button>
          ) : (
            !isFull && (
              <Button
                variant="transparentBlack"
                onClick={handleJoinLegion}
                disabled={isDisabled}
              >
                Join Legion
              </Button>
            )
          ))}
      </div>
    </div>
  );
};

export default LegionHeader;
