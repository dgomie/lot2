import React, { useState, useEffect } from 'react';
import styles from './AdminSettingsModal.module.css';
import { updateLegionSettings, deleteLegion } from '@/firebase';
import Input from '../input/Input';
import NumberInput from '../numberInput/NumberInput';
import Button from '../button/Button';
import Modal from '../modal/Modal'; // Import the Modal component

export const AdminSettingsModal = ({ legionData, legionId, onClose }) => {
  const [formData, setFormData] = useState({
    legionName: legionData.legionName,
    legionDescription: legionData.legionDescription,
    maxNumPlayers: legionData.maxNumPlayers,
    upVotesPerRound: legionData.upVotesPerRound,
    downVotesPerRound: legionData.downVotesPerRound,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State for confirmation modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'maxNumPlayers' ||
        name === 'upVotesPerRound' ||
        name === 'downVotesPerRound'
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const validateForm = () => {
    if (formData.legionName.length < 5 || formData.legionName.length > 40) {
      setError('Legion Name must be between 5 and 40 characters.');
      return false;
    }
    if (formData.legionDescription.length > 150) {
      setError('Description must be less than 150 characters.');
      return false;
    }
    if (formData.maxNumPlayers < legionData.players.length) {
      setError(
        `Max Players cannot be less than the current number of players: (${legionData.players.length}).`
      );
      return false;
    }
    if (formData.maxNumPlayers > 20) {
      setError('Max Players cannot exceed 20.');
      return false;
    }
    if (formData.upVotesPerRound > 10) {
      setError('Upvotes Per Round cannot exceed 10.');
      return false;
    }
    if (formData.upVotesPerRound < 1) {
      setError('Upvotes Per Round must be 1 or greater.');
      return false;
    }
    if (formData.downVotesPerRound < 0) {
      setError('Downvotes Per Round cannot be less than 0.');
      return false;
    }
    if (formData.downVotesPerRound > 10) {
      setError('Downvotes Per Round cannot exceed 10.');
      return false;
    }
    setError('');
    return true;
  };

  useEffect(() => {
    setIsValid(validateForm());
  }, [formData]);

  const handleSave = async () => {
    if (!isValid) return;

    if (JSON.stringify(formData) === JSON.stringify(legionData)) {
      alert('No changes detected.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateLegionSettings(legionId, formData);
      if (result.success) {
        onClose();
        window.location.reload();
      } else {
        alert('Failed to update settings. Please try again.');
      }
    } catch (error) {
      console.error('Error updating legion settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirmModal(false); // Close the confirmation modal

    setIsSaving(true);
    try {
      const result = await deleteLegion(legionId);
      if (result.success) {
        onClose();
        window.location.replace('/legions');
      } else {
        alert('Failed to delete legion. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting legion:', error);
      alert('Failed to delete legion. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Legion Settings</h2>
        <Input
          id="legionName"
          name="legionName"
          label="Legion Name"
          value={formData.legionName}
          onChange={handleChange}
          required
        />
        <Input
          id="legionDescription"
          name="legionDescription"
          label="Description"
          value={formData.legionDescription}
          onChange={handleChange}
          required
          type="text"
        />
        <NumberInput
          name="maxNumPlayers"
          label="Max Players"
          value={formData.maxNumPlayers}
          onChange={handleChange}
          required
          min={legionData.players.length}
          max={20}
        />
        <NumberInput
          name="upVotesPerRound"
          label="Upvotes Per Round"
          value={formData.upVotesPerRound}
          onChange={handleChange}
          required
          min={1}
          max={10}
        />
        <NumberInput
          name="downVotesPerRound"
          label="Downvotes Per Round"
          value={formData.downVotesPerRound}
          onChange={handleChange}
          required
          min={0}
          max={10}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            variant={!isValid || isSaving ? 'disabled' : 'blue'}
          >
            Save
          </Button>
          <Button onClick={onClose} disabled={isSaving} variant="gray">
            Cancel
          </Button>
        </div>
        <div className={styles.deleteButton}>
          <Button
            onClick={() => setShowConfirmModal(true)} // Show confirmation modal
            disabled={isSaving}
            variant="red"
          >
            Delete Legion
          </Button>
        </div>
      </div>

      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className={styles.confirmationContent}>
            <p>Are you sure you want to delete this legion? This action cannot be undone.</p>
            <div className={styles.actions}>
              <Button onClick={handleDelete} variant="red">
                Confirm
              </Button>
              <Button onClick={() => setShowConfirmModal(false)} variant="gray">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};