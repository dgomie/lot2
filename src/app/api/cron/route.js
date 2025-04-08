import { adminDb } from '../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { status } from '../../../utils/status';
import admin from 'firebase-admin'; // Ensure Firebase Admin SDK is initialized
import { adminUpdateLegionStandings, adminIncrementUserVictories } from '../../../firebaseAdmin';

export async function GET(req, res) {
  try {
    // Get the current date (ignoring the time)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Query all active legions
    const legionsRef = adminDb.collection('legions');
    const querySnapshot = await legionsRef.where('isActive', '==', true).get();

    const updates = [];
    const notifications = [];

    // Use a for...of loop to handle async operations
    for (const legionDoc of querySnapshot.docs) {
      const legionData = legionDoc.data();
      const currentRound = legionData.rounds?.find(
        (round) => round.roundNumber === legionData.currentRound
      );

      if (currentRound) {
        const voteDeadline = new Date(currentRound.voteDeadline);
        voteDeadline.setHours(0, 0, 0, 0);

        // Check if the voteDeadline matches the current date
        if (voteDeadline.getTime() <= currentDate.getTime()) {
          const legionDocRef = legionsRef.doc(legionDoc.id);

          // Set the current round status to 'COMPLETED'
          currentRound.roundStatus = status.COMPLETED;

          let isLegionActive = true;

          // Find the next round and set its status to 'ACTIVE'
          const nextRound = legionData.rounds?.find(
            (round) => round.roundNumber === legionData.currentRound + 1
          );
          if (nextRound) {
            nextRound.roundStatus = status.ACTIVE;
          } else {
            isLegionActive = false;
          }

          // Update the Firestore document
          updates.push(
            legionDocRef.update({
              rounds: legionData.rounds, // Update the rounds array with updated statuses
              currentRound: FieldValue.increment(1), // Increment the currentRound
              isActive: isLegionActive,
            })
          );

          // Update the standings for the legion
          try {
            const { standings } = await adminUpdateLegionStandings(legionDoc.id);
          
            if (!Array.isArray(standings)) {
              throw new Error('Standings is not an array');
            }
          
            if (!isLegionActive) {
              const topUser = standings.length
                ? standings.reduce(
                    (max, user) => (user.votes > max.votes ? user : max),
                    { votes: -Infinity }
                  )
                : null;
          
              if (topUser && topUser.uid) {
                try {
                  await adminIncrementUserVictories(topUser.uid);
                  console.log(`Victory incremented for user: ${topUser.uid}`);
                } catch (error) {
                  console.error(`Error incrementing victories for user ${topUser.uid}:`, error);
                }
              } else {
                console.warn('No valid top user found in standings.');
              }
            }
          } catch (error) {
            console.error(`Error updating standings for legion ${legionDoc.id}:`, error);
          }
          // Prepare notifications for players
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get(); // Adjust the collection name if needed
              return userDoc.exists ? userDoc.data().fcmToken : null;
            });

            // Resolve all promises and filter out null/undefined tokens
            const tokens = (await Promise.all(tokenFetchPromises)).filter(
              Boolean
            );
            const uniqueTokens = [...new Set(tokens)]; // Ensure unique tokens

            if (uniqueTokens.length === 0) {
              console.warn(
                `No valid FCM tokens found for legion: ${legionData.legionName}`
              );
            } else {
              uniqueTokens.forEach((token) => {
                notifications.push(
                  admin
                    .messaging()
                    .send({
                      token,
                      notification: {
                        title: 'The Votes are In!',
                        body: `Round ${currentRound.roundNumber} in ${legionData.legionName} is complete. Check the app to see how you did!`,
                      },
                    })
                    .then((response) => {
                      console.log(`Notification sent`, response);
                    })
                    .catch((error) => {
                      console.error(`Error sending notification`, error);
                      // Optionally, handle invalid tokens here
                    })
                );
              });
            }
          }
        }
      }
    }

    // Wait for all updates and notifications to complete
    await Promise.all([...updates, ...notifications]);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cron job executed successfully',
      }),
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
