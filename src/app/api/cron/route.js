import { adminDb } from '../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { status } from '../../../utils/status';

export async function GET(req, res) {
  try {
    // Get the current date (ignoring the time)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Query all active legions
    const legionsRef = adminDb.collection('legions');
    const querySnapshot = await legionsRef.where('isActive', '==', true).get();

    const updates = [];

    querySnapshot.forEach((legionDoc) => {
      const legionData = legionDoc.data();
      const currentRound = legionData.rounds?.find(
        (round) => round.roundNumber === legionData.currentRound
      );

      if (currentRound) {
        const voteDeadline = new Date(currentRound.voteDeadline);
        voteDeadline.setHours(0, 0, 0, 0);

        // Check if the voteDeadline matches the current date
        if (voteDeadline.getTime() === currentDate.getTime()) {
          const legionDocRef = legionsRef.doc(legionDoc.id);

          // Set the current round status to 'COMPLETED'
          currentRound.roundStatus = status.COMPLETED;

          // Find the next round and set its status to 'ACTIVE'
          const nextRound = legionData.rounds?.find(
            (round) => round.roundNumber === legionData.currentRound + 1
          );
          if (nextRound) {
            nextRound.status = roundStatus.ACTIVE;
          }

          // Update the Firestore document
          updates.push(
            legionDocRef.update({
              rounds: legionData.rounds, // Update the rounds array with updated statuses
              currentRound: FieldValue.increment(1), // Increment the currentRound
            })
          );
        }
      }
    });

    // Wait for all updates to complete
    await Promise.all(updates);

    return new Response(
      JSON.stringify({ success: true, message: 'Cron job executed successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error executing cron job:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}