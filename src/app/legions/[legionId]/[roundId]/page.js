'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '@/firebase';
import styles from './RoundPage.module.css';
import Image from 'next/image';
import RoundSettingsModal from '@/components/roundSettingsModal/RoundSettingsModal';

const RoundPage = ({ currentUser }) => {
  const params = useParams();
  const { legionId, roundId } = params;

  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableRoundData, setEditableRoundData] = useState(null);

  const fetchRoundData = async () => {
    try {
      const docRef = doc(db, 'legions', legionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const legionData = docSnap.data();
        const round = legionData.rounds.find(
          (r) => r.roundNumber === parseInt(roundId, 10)
        );
        setRoundData(round);
        setEditableRoundData(round); // Initialize editable round data
      } else {
        console.error('No such document!');
      }
    } catch (error) {
      console.error('Error fetching round data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const docRef = doc(db, 'legions', legionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const legionData = docSnap.data();
        const updatedRounds = legionData.rounds.map((r) =>
          r.roundNumber === parseInt(roundId, 10) ? editableRoundData : r
        );

        await updateDoc(docRef, { rounds: updatedRounds });
        setRoundData(editableRoundData); // Update the round data
        setIsModalOpen(false); // Close the modal
      }
    } catch (error) {
      console.error('Error saving round data:', error);
    }
  };

  useEffect(() => {
    if (legionId && roundId) {
      fetchRoundData();
    }
  }, [legionId, roundId]);

  if (loading) {
    return <div className={styles.roundPage}>Loading...</div>;
  }

  if (!roundData) {
    return <div className={styles.roundPage}>Round not found.</div>;
  }

  return (
    <div className={styles.roundPage}>
      {/* Gear Icon for Admin */}
      {currentUser?.uid === roundData.legionAdmin && (
        <div className={styles.gearIcon} onClick={() => setIsModalOpen(true)}>
          <Image src={'/img/gear.svg'} width={25} height={25} alt='settings' />
        </div>
      )}

      <h1>Round {roundData.roundNumber}</h1>
      <p>Prompt: {roundData.prompt}</p>
      <p>
        Submission Deadline:{' '}
        {new Date(roundData.submissionDeadline).toLocaleString()}
      </p>
      <p>Vote Deadline: {new Date(roundData.voteDeadline).toLocaleString()}</p>
      <p>Status: {roundData.isRoundComplete ? 'Complete' : 'In Progress'}</p>

      {/* Modal */}
      {isModalOpen && (
        <RoundSettingsModal
          editableRoundData={editableRoundData}
          setEditableRoundData={setEditableRoundData}
          onSave={handleSaveChanges}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoundPage;
