import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateEmail,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  deleteDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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

// Initialize Firebase Messaging (only in the browser)
let messaging;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// Function to get FCM token
export const getFcmToken = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging is not initialized (server-side).');
    return null;
  }

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn(
        'No registration token available. Request permission to generate one.'
      );
      return null;
    }
  } catch (error) {
    console.error('Error retrieving FCM token:', error);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Listen for incoming messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase Messaging is not initialized (server-side).');
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// Authentication functions
const signupUser = async (email, password, username) => {
  try {
    // Check if the username already exists
    const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
    const usernameDoc = await getDoc(usernameDocRef);

    if (usernameDoc.exists()) {
      throw new Error('Username is already taken. Please choose another one.');
    }

    // Check if the email already exists
    const emailDocRef = doc(db, 'emails', email.toLowerCase());
    const emailDoc = await getDoc(emailDocRef);

    if (emailDoc.exists()) {
      throw new Error('Email is already in use. Please use a different email.');
    }

    // Create the user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Add the username to the usernames collection
    await setDoc(usernameDocRef, { uid: user.uid });

    // Add the email to the emails collection
    await setDoc(emailDocRef, { uid: user.uid });

    // Add the user to the users collection
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      uid: user.uid,
      username: username.toLowerCase(),
      createdAt: new Date(),
      profileImg: null,
      numVotes: 0,
      numSongs: 0,
      numLegions: 0,
      numVictories: 0,
    });

    return user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error(
        'This email is already in use. Please use a different email.'
      );
    }
    console.error('Error signing up user:', error);
    throw error; // Re-throw other errors
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

export const updateUserInFirebase = async (
  userData,
  previousUsername,
  previousEmail
) => {
  const userRef = doc(db, 'users', userData.uid);
  const newUsernameRef = doc(db, 'usernames', userData.username.toLowerCase());
  const previousUsernameRef = doc(
    db,
    'usernames',
    previousUsername?.toLowerCase()
  );
  const newEmailRef = doc(db, 'emails', userData.email.toLowerCase());
  const previousEmailRef = doc(db, 'emails', previousEmail?.toLowerCase());

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    // Check if the username has changed
    if (
      previousUsername &&
      previousUsername.toLowerCase() !== userData.username.toLowerCase()
    ) {
      const newUsernameDoc = await getDoc(newUsernameRef);
      if (newUsernameDoc.exists()) {
        throw new Error(
          'Username is already taken. Please choose another one.'
        );
      }

      await setDoc(newUsernameRef, { uid: userData.uid });
      await deleteDoc(previousUsernameRef);
    }

    // Check if the email has changed
    if (
      previousEmail &&
      previousEmail.toLowerCase() !== userData.email.toLowerCase()
    ) {
      const newEmailDoc = await getDoc(newEmailRef);
      if (newEmailDoc.exists()) {
        throw new Error(
          'Email is already in use. Please use a different email.'
        );
      }

      // Send email verification if the email is not verified
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        throw new Error(
          'Please verify your current email address before updating.'
        );
      }

      // Update the email in Firebase Authentication
      await updateEmail(user, userData.email);

      // Add the new email to the emails collection
      await setDoc(newEmailRef, { uid: userData.uid });

      // Delete the previous email from the emails collection
      await deleteDoc(previousEmailRef);
    }

    // Update the user's profile in the users collection
    await updateDoc(userRef, {
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user in Firebase:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserFromFirebase = async (uid, email, password) => {
  try {
    const user = auth.currentUser;

    if (!user || user.uid !== uid) {
      throw new Error('User is not authenticated or does not match.');
    }

    // Reauthenticate the user
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete user data from Firestore collections
    await deleteDoc(doc(db, 'usernames', uid));
    await deleteDoc(doc(db, 'emails', uid));
    await deleteDoc(doc(db, 'users', uid));

    // Delete user from Firebase Authentication
    await deleteUser(user);

    console.log('User and associated data deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
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

export const incrementUserVotes = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      numVotes: increment(1),
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing numVotes: ', error);
    return { success: false, error };
  }
};

export const incrementUserSongs = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      numSongs: increment(1),
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing numSongs: ', error);
    return { success: false, error };
  }
};

export const incrementUserVictoriess = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      numVictories: increment(1),
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing victories: ', error);
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

const joinLegion = async ({
  legionId,
  userId,
  fcmToken,
  profileImg,
  username,
}) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);

    await updateDoc(legionDocRef, {
      players: arrayUnion({ userId, username, profileImg }),
      playerTokens: arrayUnion(fcmToken),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding user to legion:', error);
    return { success: false, error };
  }
};

const leaveLegion = async (legionId, userId, fcmToken) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);

    // Fetch the current legion data
    const legionDoc = await getDoc(legionDocRef);
    if (!legionDoc.exists()) {
      throw new Error('Legion not found');
    }

    const legionData = legionDoc.data();

    // Filter out the tuple containing the userId
    const updatedPlayers = legionData.players.filter(
      (player) => player.userId !== userId
    );

    // Update the Firestore document
    await updateDoc(legionDocRef, {
      players: updatedPlayers,
      playerTokens: arrayRemove(fcmToken), // Remove the FCM token
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
    const q = query(legionsRef);
    const querySnapshot = await getDocs(q);

    const legions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const isPlayer = data.players.some((player) => player.userId === userId);
      if (isPlayer) {
        legions.push({ id: doc.id, ...data });
      }
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

export const addRoundToLegion = async (legionId, newRound) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);
    await updateDoc(legionDocRef, {
      rounds: arrayUnion(newRound),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding new round:', error);
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
        round: {
          ...round,
          legionAdmin: legionData.legionAdmin,
          players: legionData.players,
        },
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

export const updateRoundSubmissions = async (
  legionId,
  roundId,
  updatedSubmissions,
  userUid
) => {
  try {
    const roundDocRef = doc(db, 'legions', legionId); // Reference to the legion document
    const roundDoc = await getDoc(roundDocRef);

    if (!roundDoc.exists()) {
      throw new Error('Legion not found');
    }

    const legionData = roundDoc.data();

    // Ensure the `rounds` array exists
    if (!legionData.rounds || !Array.isArray(legionData.rounds)) {
      throw new Error('Rounds data is missing or invalid');
    }

    // Find the specific round by its roundNumber
    const updatedRounds = legionData.rounds.map((round) => {
      if (round.roundNumber === parseInt(roundId, 10)) {
        return {
          ...round,
          submissions: updatedSubmissions, // Update the submissions
          playersVoted: Array.isArray(round.playersVoted)
            ? [...new Set([...round.playersVoted, userUid])] // Add the user UID if not already present
            : [userUid], // Initialize the array if it doesn't exist
        };
      }
      return round;
    });

    // Update the Firestore document with the modified rounds array
    await updateDoc(roundDocRef, { rounds: updatedRounds });

    return { success: true };
  } catch (error) {
    console.error('Error updating submissions:', error);
    return { success: false, error };
  }
};

export const updateLegionStandings = async (legionId) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);
    const legionDoc = await getDoc(legionDocRef);

    if (!legionDoc.exists()) {
      throw new Error('Legion not found');
    }

    const legionData = legionDoc.data();

    // Ensure rounds data exists and is valid
    if (!legionData.rounds || !Array.isArray(legionData.rounds)) {
      throw new Error('Rounds data is missing or invalid');
    }

    // Aggregate votes per user UID
    const userVotes = {};

    legionData.rounds.forEach((round) => {
      if (round.submissions && Array.isArray(round.submissions)) {
        round.submissions.forEach((submission) => {
          const { uid, voteCount } = submission;

          if (uid && voteCount) {
            userVotes[uid] = (userVotes[uid] || 0) + voteCount;
          }
        });
      }
    });

    // Convert the aggregated votes into the standings array format
    const standings = Object.entries(userVotes).map(([uid, votes]) => ({
      uid,
      votes,
    }));

    // Update the legion's standings array in Firestore
    await updateDoc(legionDocRef, { standings });

    return { success: true, standings };
  } catch (error) {
    console.error('Error updating legion standings:', error);
    return { success: false, error };
  }
};

export const updateVoteDeadline = async (legionId, roundId, newDeadline) => {
  try {
    const roundRef = doc(db, 'legions', legionId); // Use db instead of adminDb
    const roundDoc = await getDoc(roundRef);

    if (!roundDoc.exists()) {
      throw new Error('Legion not found');
    }

    const legionData = roundDoc.data();

    // Ensure the `rounds` array exists
    if (!legionData.rounds || !Array.isArray(legionData.rounds)) {
      throw new Error('Rounds data is missing or invalid');
    }

    // Update the voteDeadline for the specific round
    const updatedRounds = legionData.rounds.map((round) => {
      if (round.roundNumber === parseInt(roundId, 10)) {
        return {
          ...round,
          voteDeadline: newDeadline,
        };
      }
      return round;
    });

    // Update the Firestore document with the modified rounds array
    await updateDoc(roundRef, { rounds: updatedRounds });

    return { success: true };
  } catch (error) {
    console.error('Error updating vote deadline:', error);
    return { success: false, error };
  }
};

export const updateProfileImgInLegions = async ({
  userId,
  newProfileImgUrl,
}) => {
  try {
    const legionsRef = collection(db, 'legions');
    const q = query(legionsRef); // Fetch all legions
    const querySnapshot = await getDocs(q);

    const updatePromises = [];

    querySnapshot.forEach((doc) => {
      const legionData = doc.data();

      // Check if the userId exists in the players array
      const isPlayerInLegion = legionData.players.some(
        (player) => player.userId === userId
      );

      if (isPlayerInLegion) {
        // Update the profileImg for the matching player
        const updatedPlayers = legionData.players.map((player) => {
          if (player.userId === userId) {
            return { ...player, profileImg: newProfileImgUrl };
          }
          return player;
        });

        // Add the update operation to the promises array
        const updatePromise = updateDoc(doc.ref, { players: updatedPlayers });
        updatePromises.push(updatePromise);
      }
    });

    await Promise.all(updatePromises);

    return { success: true };
  } catch (error) {
    console.error('Error updating profile image in legions:', error);
    return { success: false, error };
  }
};

export const updateLegionSettings = async (legionId, updatedData) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);
    await updateDoc(legionDocRef, updatedData);
    return { success: true };
  } catch (error) {
    console.error('Error updating legion settings:', error);
    return { success: false, error };
  }
};

export const deleteLegion = async (legionId) => {
  try {
    const legionDocRef = doc(db, 'legions', legionId);
    await deleteDoc(legionDocRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting legion:', error);
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
