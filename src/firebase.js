import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
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
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
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

const submitLegion = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'legions'), formData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating legion: ', error);
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
  submitLegion,
};
