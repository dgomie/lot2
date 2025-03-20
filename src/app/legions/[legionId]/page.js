'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loader from '@/components/loader/Loader';
import withAuth from '@/hoc/withAuth';
import Players from '@/components/players/Players';
import styles from './LegionPage.module.css';
import LegionHeader from '@/components/legionHeader/LegionHeader';

const LegionPage = () => {
  const params = useParams();
  const legionId = params.legionId;
  const [legionData, setLegionData] = useState(null);

  useEffect(() => {
    if (legionId) {
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

      fetchLegionData();
    }
  }, [legionId]);

  if (!legionData) {
    return <Loader />;
  }

  return (
    <div>
      <LegionHeader legionData={legionData} />
      <Players legionPlayers={legionData.players} />
    </div>
  );
};

export default withAuth(LegionPage);
