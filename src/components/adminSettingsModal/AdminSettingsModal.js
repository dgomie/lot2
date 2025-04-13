import React, { useState } from 'react';
import styles from './AdminSettingsModal.module.css';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

export const AdminSettingsModal = ({ legionData, legionId, onClose }) => {
  const [formData, setFormData] = useState({
    legionName: legionData.legionName,
    legionDescription: legionData.legionDescription,
    maxNumPlayers: legionData.maxNumPlayers,
    upVotesPerRound: legionData.upVotesPerRound,
    downVotesPerRound: legionData.downVotesPerRound,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(legionData)) {
      alert('No changes detected.');
      return;
    }

    setIsSaving(true);
    try {
      const legionDocRef = doc(db, 'legions', legionId);
      await updateDoc(legionDocRef, formData);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating legion settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Legion Settings</h2>
        <label>
          Legion Name:
          <input
            type="text"
            name="legionName"
            value={formData.legionName}
            onChange={handleChange}
          />
        </label>
        <label>
          Description:
          <textarea
            name="legionDescription"
            value={formData.legionDescription}
            onChange={handleChange}
          />
        </label>
        <label>
          Max Players:
          <input
            type="number"
            name="maxNumPlayers"
            value={formData.maxNumPlayers}
            onChange={handleChange}
          />
        </label>
        <label>
          Upvotes Per Round:
          <input
            type="number"
            name="upVotesPerRound"
            value={formData.upVotesPerRound}
            onChange={handleChange}
          />
        </label>
        <label>
          Downvotes Per Round:
          <input
            type="number"
            name="downVotesPerRound"
            value={formData.downVotesPerRound}
            onChange={handleChange}
          />
        </label>
        <div className={styles.actions}>
          <button onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
