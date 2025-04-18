import { adminDb } from '../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { status, stage } from '../../../utils/status';
import admin from 'firebase-admin'; // Ensure Firebase Admin SDK is initialized
import {
  adminUpdateLegionStandings,
  adminIncrementUserVictories,
  adminUpdateRoundStage
} from '../../../firebaseAdmin';

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export async function GET(request) {

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
   const currentDate = normalizeDate(new Date());

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
        const submissionDeadline = normalizeDate(currentRound.submissionDeadline);
        const dayBeforeSubmissionDeadline = normalizeDate(
          new Date(submissionDeadline.setDate(submissionDeadline.getDate() - 1))
        );
        const dayAfterSubmissionDeadline = normalizeDate(
          new Date(submissionDeadline.setDate(submissionDeadline.getDate() + 1))
        );
        const voteDeadline = normalizeDate(currentRound.voteDeadline);
        const dayBeforeVoteDeadline = normalizeDate(
          new Date(voteDeadline.setDate(voteDeadline.getDate() - 1))
        );

        // Playlist notification (day after submission deadline)
        if (dayAfterSubmissionDeadline.getTime() === currentDate.getTime()) {
          // Send playlist notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);
        
            // Fetch fcmTokens for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
              return userDoc.exists ? userDoc.data().fcmToken : null;
            });
        
            // Resolve all promises and filter out null/undefined tokens
            const tokens = (await Promise.all(tokenFetchPromises)).filter(Boolean);
            const uniqueTokens = [...new Set(tokens)]; // Ensure unique tokens
        
            if (uniqueTokens.length === 0) {
              console.warn(
                `No valid FCM tokens found for legion: ${legionData.legionName}`
              );
            } else {
              const formattedDeadline = new Date(
                currentRound.voteDeadline
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
              });
        
              uniqueTokens.forEach((token) => {
                notifications.push(
                  admin
                    .messaging()
                    .send({
                      token,
                      notification: {
                        title: 'New Playlist 🎶',
                        body: `A new playlist is ready in ${legionData.legionName}!\n\nGet your votes in before ${formattedDeadline}`,
                      },
                    })
                    .then((response) => {
                      console.log(`Playlist notification sent`, response);
                    })
                    .catch((error) => {
                      console.error(`Error sending playlist notification`, error);
                    })
                );
              });
        
              try {
                await adminUpdateRoundStage(legionDoc.id, currentRound.id, stage.VOTING);
                console.log(
                  `Round stage updated to VOTING for legion: ${legionData.legionName}`
                );
              } catch (error) {
                console.error(
                  `Error updating round stage to VOTING for legion ${legionData.legionName}:`,
                  error
                );
              }
            }
          }
        }

        // Submission deadline reminder (day before submission deadline)
        else if (
          dayBeforeSubmissionDeadline.getTime() === currentDate.getTime()
        ) {
          // Send submission deadline reminder notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
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
                        title: 'Submission Deadline Approaches!',
                        body: `Don't forget to submit for Round ${currentRound.roundNumber} in ${legionData.legionName}!`,
                      },
                    })
                    .then((response) => {
                      console.log(
                        `Submission deadline reminder sent`,
                        response
                      );
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending submission deadline reminder`,
                        error
                      );
                    })
                );
              });
            }
          }
        }

        // Vote deadline reminder (day before vote deadline)
        else if (dayBeforeVoteDeadline.getTime() === currentDate.getTime()) {
          // Send vote deadline reminder notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
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
                        title: 'Vote Deadline Approaches!',
                        body: `Don't forget to cast your votes for Round ${currentRound.roundNumber} in ${legionData.legionName}!`,
                      },
                    })
                    .then((response) => {
                      console.log(`Vote deadline reminder sent`, response);
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending vote deadline reminder`,
                        error
                      );
                    })
                );
              });
            }
          }
        }

        // Round summary notification (on vote deadline)
        else if (voteDeadline.getTime() <= currentDate.getTime()) {
          // Send round summary notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
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
                        title: 'Votes are In!',
                        body: `Results for Round ${currentRound.roundNumber} in ${legionData.legionName} are here. Check the app to see how you did!`,
                      },
                    })
                    .then((response) => {
                      console.log(`Round summary notification sent`, response);
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending round summary notification`,
                        error
                      );
                    })
                );
              });
            }
          }
        }
      }

      const voteDeadline = new Date(currentRound.voteDeadline);
      voteDeadline.setHours(0, 0, 0, 0);

      // Existing logic for handling voteDeadline matching the current date
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
          nextRound.roundStage = stage.SUBMISSION;
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
                console.error(
                  `Error incrementing victories for user ${topUser.uid}:`,
                  error
                );
              }
            } else {
              console.warn('No valid top user found in standings.');
            }
          }
        } catch (error) {
          console.error(
            `Error updating standings for legion ${legionDoc.id}:`,
            error
          );
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
