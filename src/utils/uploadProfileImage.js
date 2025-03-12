import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, storage, db } from '../firebase';

const uploadProfileImage = async (file) => {
  if (!file) return;

  const user = auth.currentUser;
  if (!user) return;

  const storageRef = ref(storage, `profileImages/${user.uid}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const userDocRef = doc(db, 'users', user.uid);
  await updateDoc(userDocRef, { profileImg: downloadURL });

  return downloadURL;
};

export default uploadProfileImage;
