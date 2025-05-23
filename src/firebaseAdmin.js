import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // Import FieldValue
import 'dotenv/config';

if (!getApps().length) {
  try {
    // Decode the Base64 string and parse the JSON
    const serviceAccount = JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64,
        'base64'
      ).toString('utf8')
    );

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64:', error);
    throw new Error(
      'Invalid FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable'
    );
  }
}

const adminDb = getFirestore();

export const adminUpdateLegionStandings = async (legionId) => {
  try {
    const legionDocRef = adminDb.collection('legions').doc(legionId);
    const legionDoc = await legionDocRef.get();

    if (!legionDoc.exists) {
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

          if (uid !== undefined && typeof voteCount === 'number') {
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
    await legionDocRef.update({ standings });

    return { success: true, standings };
  } catch (error) {
    console.error('Error updating legion standings:', error);
    return { success: false, error };
  }
};

export const adminIncrementUserVictories = async (userId) => {
  try {
    const userDocRef = adminDb.collection('users').doc(userId);
    await userDocRef.update({
      numVictories: FieldValue.increment(1), // Use FieldValue from admin.firestore
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing victories (admin):', error);
    return { success: false, error };
  }
};

export const adminUpdateRoundStage = async (legionId, roundId, newStage) => {
  try {
    const legionDocRef = adminDb.collection('legions').doc(legionId);
    const legionDoc = await legionDocRef.get();

    if (!legionDoc.exists) {
      throw new Error('Legion not found');
    }

    const legionData = legionDoc.data();

    if (!legionData.rounds || !Array.isArray(legionData.rounds)) {
      throw new Error('Rounds data is missing or invalid');
    }

    const updatedRounds = legionData.rounds.map((round) => {
      if (round.id === roundId) {
        return { ...round, roundStage: newStage };
      }
      return round;
    });

    await legionDocRef.update({ rounds: updatedRounds });

    return { success: true, updatedRounds };
  } catch (error) {
    console.error('Error updating round stage:', error);
    return { success: false, error };
  }
};

export { adminDb };
