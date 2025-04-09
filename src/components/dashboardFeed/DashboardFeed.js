import React, { useEffect, useState } from 'react';
import styles from './DashboardFeed.module.css';
import DashboardCard from '../dashboardCard/DashboardCard';
import { fetchLegionsByPlayer } from '@/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DashboardFeed = ({ currentUserId }) => {
  const [activeLegions, setActiveLegions] = useState([]);
  const [inactiveLegions, setInactiveLegions] = useState([]);
  const [error, setError] = useState(null);
  const [isInactiveCollapsed, setIsInactiveCollapsed] = useState(true); // State to toggle collapse
  const router = useRouter();

  useEffect(() => {
    if (currentUserId) {
      fetchLegionsByPlayer(currentUserId)
        .then((result) => {
          if (result.success) {
            // Split the legions into active and inactive arrays
            const active = result.legions.filter((legion) => legion.isActive);
            const inactive = result.legions.filter(
              (legion) => !legion.isActive
            );

            setActiveLegions(active);
            setInactiveLegions(inactive);
          } else {
            setError(result.error);
          }
        })
        .catch((err) => {
          console.error('Error fetching legions:', err);
          setError(err.message);
        });
    }
  }, [currentUserId]);

  if (!currentUserId) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleCardClick = (legionId) => {
    router.push(`/legions/${legionId}`);
  };

  const toggleInactiveLegions = () => {
    setIsInactiveCollapsed((prev) => !prev); // Toggle the collapse state
  };

  return (
    <div className={styles.mainContainer}>
      {error ? (
        <p className={styles.error}>Error: {error}</p>
      ) : (
        <>
          <h2 className={styles.sectionTitle}>Active Legions</h2>
          {activeLegions.map((legion) => (
            <DashboardCard
              key={legion.id}
              legionName={legion.legionName}
              legionDescription={legion.legionDescription}
              players={legion.players}
              maxNumPlayers={legion.maxNumPlayers}
              numRounds={legion.numRounds}
              onClick={() => handleCardClick(legion.id)}
            />
          ))}

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Completed Legions</h2>
            <div
              className={styles.expandCollapseButtons}
              onClick={toggleInactiveLegions}
            >
              {isInactiveCollapsed ? (
                <Image
                  src="/img/down.svg" // Path to the "down" icon
                  width={35}
                  height={35}
                  alt="Expand"
                />
              ) : (
                <Image
                  src="/img/up.svg" // Path to the "up" icon
                  width={35}
                  height={35}
                  alt="Collapse"
                />
              )}
            </div>
          </div>

          <div
            className={`${styles.inactiveLegionsContainer} ${
              isInactiveCollapsed ? styles.collapsed : ''
            }`}
          >
            {inactiveLegions.map((legion) => (
              <DashboardCard
                key={legion.id}
                legionName={legion.legionName}
                legionDescription={legion.legionDescription}
                players={legion.players}
                maxNumPlayers={legion.maxNumPlayers}
                numRounds={legion.numRounds}
                onClick={() => handleCardClick(legion.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardFeed;
