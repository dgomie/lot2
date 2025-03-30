// filepath: /cron-job-notifications/src/firebase/roundService.js

import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchRoundsPastDeadline = async () => {
  const roundsRef = collection(db, 'rounds');
  const now = new Date();
  const q = query(roundsRef, where('submissionDeadline', '<', now));
  const querySnapshot = await getDocs(q);
  
  const rounds = [];
  querySnapshot.forEach((doc) => {
    rounds.push({ id: doc.id, ...doc.data() });
  });
  
  return rounds;
};