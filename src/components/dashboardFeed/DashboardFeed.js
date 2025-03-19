import React, { useEffect, useState } from 'react';
import styles from './DashboardFeed.module.css';
import DashboardCard from '../dashboardCard/DashboardCard';
import { fetchLegionsByPlayer } from '@/firebase';
import { useRouter } from 'next/navigation';

const DashboardFeed = ({ currentUserId }) => {
  const [legions, setLegions] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (currentUserId) {
      fetchLegionsByPlayer(currentUserId)
        .then((result) => {
          if (result.success) {
            setLegions(result.legions);
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

  return (
    <div className={styles.mainContainer}>
      {error ? (
        <p className={styles.error}>Error: {error}</p>
      ) : (
        legions.map((legion) => (
          <DashboardCard
            key={legion.id}
            legionName={legion.legionName}
            legionDescription={legion.legionDescription}
            players={legion.players}
            maxNumPlayers={legion.maxNumPlayers}
            numRounds={legion.numRounds}
            onClick={() => handleCardClick(legion.id)}
          />
        ))
      )}
    </div>
  );
};

export default DashboardFeed;