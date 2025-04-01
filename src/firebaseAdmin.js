import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';

if (!getApps().length) {
  try {
    // Decode the Base64 string and parse the JSON
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
    );

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:', error);
    throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable');
  }
}

const adminDb = getFirestore();

export { adminDb };