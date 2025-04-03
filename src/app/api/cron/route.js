import { adminDb } from '../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { status } from '../../../utils/status';
import admin from 'firebase-admin'; // Ensure Firebase Admin SDK is initialized

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
        if (voteDeadline.getTime() === currentDate.getTime()) {
          const legionDocRef = legionsRef.doc(legionDoc.id);

          // Set the current round status to 'COMPLETED'
          currentRound.roundStatus = status.COMPLETED;

          // Find the next round and set its status to 'ACTIVE'
          const nextRound = legionData.rounds?.find(
            (round) => round.roundNumber === legionData.currentRound + 1
          );
          if (nextRound) {
            nextRound.roundStatus = status.ACTIVE;
          }

          // Update the Firestore document
          updates.push(
            legionDocRef.update({
              rounds: legionData.rounds, // Update the rounds array with updated statuses
              currentRound: FieldValue.increment(1), // Increment the currentRound
            })
          );

          // Prepare notifications for players
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players; // Array of UIDs
            console.log('Player UIDs:', playerUids);

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
            console.log('Unique player tokens:', uniqueTokens);

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
                        body: `Round ${currentRound.roundNumber} in ${legionData.legionName} is complete. Check out how you did!`,
                      },
                    })
                    .then((response) => {
                      console.log(
                        `Notification sent to token ${token}:`,
                        response
                      );
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending notification to token ${token}:`,
                        error
                      );
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

// export async function GET(req, res) {
//   try {
//     // Replace this with a valid FCM token for testing
//     const testToken =
//       'fYGHV2NbVUeRIuwA6PjPsY:APA91bEila8yefmZyMDJv_uTw_Xwn03XD6fAAVmlODq_lwGIlRqf9vpOksWH6_wNZSan1pxFqtAEIDsF9hl_Bn0tm0mc1sSbQziFmAlHddNpwGrrjBUGLfY';

//     // Prepare the test notification payload
//     const message = {
//       token: testToken,
//       notification: {
//         title: 'Test Notification',
//         body: 'This is a test notification from the cron job.',
//       },
//     };

//     // Send the notification
//     const response = await admin.messaging().send(message);
//     console.log('Test notification sent successfully:', response);

//     return new Response(
//       JSON.stringify({
//         success: true,
//         message: 'Test notification sent successfully',
//         response,
//       }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error sending test notification:', error);
//     return new Response(
//       JSON.stringify({ success: false, error: error.message }),
//       { status: 500 }
//     );
//   }
// }
