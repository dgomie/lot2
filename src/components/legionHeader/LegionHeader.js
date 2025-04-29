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
import Image from 'next/image';
import { AdminSettingsModal } from '../adminSettingsModal/AdminSettingsModal';

const LegionHeader = ({
  legionData,
  legionId,
  onPlayerAdded,
  onPlayerRemoved,
}) => {
  const { currentUser } = useContext(AuthContext);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleJoinLegion = async () => {
    setIsDisabled(true);
    if (!currentUser) {
      alert('You must be logged in to join a legion.');
      setIsDisabled(false);
      return;
    }

    const {
      uid,
      username,
      fcmToken = null,
      profileImg = '/img/user.svg',
    } = currentUser;

    // Validate required fields
    if (!uid || !username) {
      console.error('Missing required user fields:', {
        uid,
        username,
        profileImg,
      });
      alert('Failed to join the legion. Missing required user information.');
      setIsDisabled(false);
      return;
    }

    try {
      const result = await joinLegion({
        legionId: legionId,
        userId: uid,
        username: username,
        fcmToken: fcmToken,
        profileImg: profileImg,
      });
      if (result.success) {
        incrementUserLegions(uid);
        onPlayerAdded({
          userId: uid,
          username: username,
          profileImg: profileImg,
        });
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
      setIsDisabled(false);
      return;
    }

    try {
      const { uid, fcmToken = null } = currentUser;

      const result = await leaveLegion(legionId, uid, fcmToken);
      if (result.success) {
        decrementUserLegions(uid);
        onPlayerRemoved(uid);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Check out this Legion!',
          text: `Join the Legion: ${legionData.legionName}`,
          url: window.location.href,
        })
        .then(() => console.log('Page shared successfully!'))
        .catch((error) => console.error('Error sharing the page:', error));
    } else {
      alert('Sharing is not supported on this device.');
    }
    setIsDropdownOpen(false); // Close dropdown after sharing
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const isMember = legionData.players.some(
    (player) => player.userId === currentUser?.uid
  );
  const isAdmin = legionData.legionAdmin.userId === currentUser?.uid;
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

      {/* Gear Icon and Dropdown */}
      <div className={styles.gearIconContainer}>
        <Image
          src={'/img/more-vert.svg'}
          width={30}
          height={30}
          alt="Legion Options"
          onClick={toggleDropdown}
          className={styles.gearIcon}
        />
        <div
          className={`${styles.dropdownMenu} ${
            isDropdownOpen ? styles.open : ''
          }`}
        >
          {isAdmin && (
            <div className={styles.dropdownItem} onClick={handleOpenModal}>
              Legion Settings
            </div>
          )}
          <div className={styles.dropdownItem} onClick={handleShare}>
            Share
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AdminSettingsModal
          legionData={legionData}
          legionId={legionId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LegionHeader;
