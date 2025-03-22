'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
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

  const fetchLegionData = async () => {
    try {
      const docRef = doc(db, 'legions', legionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        setLegionData(docSnap.data());
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
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
      fetchLegionData();
    }
  }, [legionId]);

  if (!legionData) {
    return <Loader />;
  }

  return (
    <div>
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
      <div className={`${styles.container} scroll-1`}>
        {legionData.rounds.map((round) => (
          <RoundCard key={round.roundNumber} round={round} />
        ))}
      </div>
    </div>
  );
};

export default withAuth(LegionPage);
