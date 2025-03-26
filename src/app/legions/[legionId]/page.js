'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { fetchLegionData } from '@/firebase';
import Loader from '@/components/loader/Loader';
import withAuth from '@/hoc/withAuth';
import Players from '@/components/players/Players';
import LegionHeader from '@/components/legionHeader/LegionHeader';
import RoundCard from '@/components/roundCard/RoundCard';
import styles from './LegionPage.module.css';

const LegionPage = () => {
  const params = useParams();
  const legionId = params.legionId;
  const [legionData, setLegionData] = useState(null);

  const fetchData = async () => {
    const result = await fetchLegionData(legionId);
    if (result.success) {
      setLegionData(result.data);
    } else {
      console.error(result.error);
    }
  };

  const handlePlayerAdded = (userId) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: [...prevData.players, userId],
    }));
  };

  const handlePlayerRemoved = (userId) => {
    setLegionData((prevData) => ({
      ...prevData,
      players: prevData.players.filter((player) => player !== userId),
    }));
  };

  useEffect(() => {
    if (legionId) {
      fetchData();
    }
  }, [legionId]);

  if (!legionData) {
    return <Loader />;
  }

  return (
    <div className={styles.mainContainer}>
      <LegionHeader
        legionData={legionData}
        legionId={legionId}
        onPlayerAdded={handlePlayerAdded}
        onPlayerRemoved={handlePlayerRemoved}
      />
      <Players
        legionPlayers={legionData.players}
        legionAdmin={legionData.legionAdmin}
      />
      <div className={styles.currentRound}>
        <div className={styles.title}>Current Round</div>
        <RoundCard
          round={legionData.rounds[legionData.currentRound - 1]}
          legionId={legionId}
        />
      </div>
      <div>
        <div className={styles.allRoundsTitle}>All Rounds</div>
        <div className={`${styles.container} scroll-1`}>
          {legionData.rounds.map((round) => (
            <RoundCard
              key={round.roundNumber}
              round={round}
              legionId={legionId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(LegionPage);
