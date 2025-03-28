import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  increment,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
const signupUser = async (email, password, username) => {
  try {
    // Check if the username already exists
    const usernameDocRef = doc(db, 'usernames', username);
    const usernameDoc = await getDoc(usernameDocRef);

    if (usernameDoc.exists()) {
      throw new Error('Username is already taken. Please choose another one.');
    }

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Add the username to the usernames collection
    await setDoc(usernameDocRef, { uid: user.uid });

    // Add the user to the users collection
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      uid: user.uid,
      username: username,
      createdAt: new Date(),
      profileImg: null,
      numVotes: 0,
      numSongs: 0,
      numLegions: 0,
      numVictories: 0,
    });

    return user;
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

const uploadProfileImage = async (file, userId) => {
  if (!userId) {
    throw new Error('User ID is required to upload profile image');
  }

  // Get the current profile image URL
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  const currentProfileImg = userDoc.exists() ? userDoc.data().profileImg : null;

  // Delete the old profile image if it exists
  if (currentProfileImg) {
    const oldImageRef = ref(storage, currentProfileImg);
    await deleteObject(oldImageRef).catch((error) => {
      console.error('Error deleting old profile image:', error);
    });
  }

  // Upload the new profile image
  const storageRef = ref(storage, `profileImages/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Update the user's profile image URL in Firestore
  await updateDoc(userDocRef, { profileImg: url });

  return url;
};

const getUserProfile = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};

const getUserProfileByUsername = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first matching user profile
      return querySnapshot.docs[0].data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user profile by username:', error);
    throw error;
  }
};

const submitLegion = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'legions'), {
      ...formData,
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating legion: ', error);
    return { success: false, error };
  }
};

const incrementUserLegions = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      numLegions: increment(1),
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing numLegions: ', error);
    return { success: false, error };
  }
};

const decrementUserLegions = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      numLegions: increment(-1),
    });
    return { success: true };
  } catch (error) {
    console.error('Error decrementing numLegions: ', error);
    return { success: false, error };
  }
};

const fetchLegions = async (lastVisible) => {
  const legionsRef = collection(db, 'legions');
  let q;

  if (lastVisible) {
    q = query(
      legionsRef,
      where('isActive', '==', true),
      orderBy('createdAt'),
      startAfter(lastVisible),
      limit(10)
    );
  } else {
    q = query(
      legionsRef,
      where('isActive', '==', true),
      orderBy('createdAt'),
      limit(5)
    );
  }

  const querySnapshot = await getDocs(q);
  const legions = [];
  querySnapshot.forEach((doc) => {
    legions.push({ id: doc.id, ...doc.data() });
  });

  const lastVisibleDoc =
    querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { legions, lastVisibleDoc };
};

const joinLegion = async (legionId, userId) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);

    await updateDoc(legionDocRef, {
      players: arrayUnion(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding user to legion:', error);
    return { success: false, error };
  }
};

const leaveLegion = async (legionId, userId) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);

    await updateDoc(legionDocRef, {
      players: arrayRemove(userId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing user from legion:', error);
    return { success: false, error };
  }
};

const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

const fetchLegionsByPlayer = async (userId) => {
  try {
    const legionsRef = collection(db, 'legions');
    const q = query(
      legionsRef,
      where('players', 'array-contains', userId),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);

    const legions = [];
    querySnapshot.forEach((doc) => {
      legions.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, legions };
  } catch (error) {
    console.error('Error fetching legions by player:', error);
    return { success: false, error };
  }
};

const saveRoundData = async (legionId, roundId, updatedRoundData) => {
  try {
    const docRef = doc(db, 'legions', legionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const legionData = docSnap.data();
      const updatedRounds = legionData.rounds.map((r) =>
        r.roundNumber === parseInt(roundId, 10) ? updatedRoundData : r
      );

      await updateDoc(docRef, { rounds: updatedRounds });
      return { success: true };
    } else {
      console.error('No such document!');
      return { success: false, error: 'No such document!' };
    }
  } catch (error) {
    console.error('Error saving round data:', error);
    return { success: false, error };
  }
};

const fetchRoundData = async (legionId, roundId) => {
  try {
    // Validate input parameters
    if (!legionId || !roundId) {
      console.error('Invalid legionId or roundId');
      return { success: false, error: 'Invalid legionId or roundId' };
    }

    const docRef = doc(db, 'legions', legionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const legionData = docSnap.data();

      // Ensure rounds data exists and is valid
      if (!legionData.rounds || !Array.isArray(legionData.rounds)) {
        console.error('Rounds data is missing or invalid');
        return { success: false, error: 'Rounds data is missing or invalid' };
      }

      // Find the specific round
      const round = legionData.rounds.find(
        (r) => r.roundNumber === parseInt(roundId, 10)
      );

      if (!round) {
        console.error('Round not found');
        return { success: false, error: 'Round not found' };
      }

      // Include legionAdmin in the response
      return {
        success: true,
        round: { ...round, legionAdmin: legionData.legionAdmin },
      };
    } else {
      console.error('No such document!');
      return { success: false, error: 'No such document!' };
    }
  } catch (error) {
    console.error('Error fetching round data:', error);
    return { success: false, error };
  }
};

const fetchLegionData = async (legionId) => {
  try {
    const docRef = doc(db, 'legions', legionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      console.error('No such document!');
      return { success: false, error: 'No such document!' };
    }
  } catch (error) {
    console.error('Error fetching legion data:', error);
    return { success: false, error };
  }
};

export {
  auth,
  db,
  storage,
  signupUser,
  loginUser,
  uploadProfileImage,
  getUserProfile,
  getUserProfileByUsername,
  submitLegion,
  incrementUserLegions,
  decrementUserLegions,
  fetchLegions,
  fetchLegionsByPlayer,
  fetchLegionData,
  fetchRoundData,
  joinLegion,
  leaveLegion,
  resetPassword,
  saveRoundData,
};
