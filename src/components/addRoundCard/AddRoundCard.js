import React, { useState } from 'react';
import styles from './AddRoundCard.module.css';
import Image from 'next/image';
import Modal from '../modal/Modal';
import Input from '../input/Input';
import Button from '../button/Button';
import { addRoundToLegion } from '@/firebase';

export const AddRoundCard = ({ legionId, rounds = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    submissionDeadline: '',
    voteDeadline: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleCardClick = () => {
    setIsModalOpen(true);
    setErrorMessage('');
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
      setErrorMessage('All fields are required');
      return;
    }

    const newRound = {
      playersVoted: [],
      prompt: formData.prompt,
      roundNumber: rounds.length + 1,
      submissionDeadline: formData.submissionDeadline,
      voteDeadline: formData.voteDeadline,
      roundStatus: 'pending',
      submissions: [],
    };

    if (!legionId) {
      alert('Invalid legion ID.');
      return;
    }

    const result = await addRoundToLegion(legionId, newRound);

    if (result.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
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
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}{' '}
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
