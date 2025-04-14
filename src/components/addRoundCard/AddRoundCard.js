import React, { useState } from 'react';
import styles from './AddRoundCard.module.css';
import Image from 'next/image';
import Modal from '../modal/Modal';
import Input from '../input/Input';
import Button from '../button/Button';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export const AddRoundCard = ({ legionId, rounds = [] }) => {
  // Default rounds to an empty array
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    submissionDeadline: '',
    voteDeadline: '',
  });

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.prompt ||
      !formData.submissionDeadline ||
      !formData.voteDeadline
    ) {
      alert('All fields are required.');
      return;
    }

    const newRound = {
      playersVoted: [],
      prompt: formData.prompt,
      roundNumber: rounds.length + 1, // Safely use rounds.length
      submissionDeadline: formData.submissionDeadline,
      voteDeadline: formData.voteDeadline,
      roundStatus: 'pending',
    };

    if (!legionId) {
      alert('Invalid legion ID.');
      return;
    }

    try {
      const legionDocRef = doc(db, 'legions', legionId);
      await updateDoc(legionDocRef, {
        rounds: [...rounds, newRound], 
      });
      setIsModalOpen(false); 
      window.location.reload();
    } catch (error) {
      console.error('Error adding new round:', error);
      alert('Failed to add new round. Please try again.');
    }
  };

  return (
    <div>
      <div className={styles.card} onClick={handleCardClick}>
        <div className={styles.card__content}>
          <span className={styles.card__prompt}>Add Round</span>
          <Image
            src={'/img/plus-dark.svg'}
            width={40}
            height={40}
            alt="Add Round"
          />
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2>Add New Round</h2>
          <Input
            id="prompt"
            name="prompt"
            label="Prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            required
          />
          <Input
            id="submissionDeadline"
            name="submissionDeadline"
            label="Submission Deadline"
            type="datetime-local"
            value={formData.submissionDeadline}
            onChange={handleInputChange}
            required
          />
          <Input
            id="voteDeadline"
            name="voteDeadline"
            label="Vote Deadline"
            type="datetime-local"
            value={formData.voteDeadline}
            onChange={handleInputChange}
            required
          />
          <div className={styles.actions}>
            <Button onClick={handleSubmit}>Add Round</Button>
            <Button onClick={() => setIsModalOpen(false)} variant="red">
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
