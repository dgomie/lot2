import nodemailer from 'nodemailer';
import { adminDb } from '../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { status, stage } from '../../../utils/status';
import admin from 'firebase-admin'; // Ensure Firebase Admin SDK is initialized
import {
  adminUpdateLegionStandings,
  adminIncrementUserVictories,
  adminUpdateRoundStage,
} from '../../../firebaseAdmin';

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Helper function to send emails
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Legion of Tones" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
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
        const submissionDeadline = normalizeDate(
          currentRound.submissionDeadline
        );

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

        const formattedDeadline = new Date(
          currentRound.voteDeadline
        ).toLocaleDateString('en-US', {
          month: 'long',
          day: '2-digit',
        });

        // console.log('submission dl', submissionDeadline);
        // console.log('today', currentDate);

        // console.log('day before', dayBeforeSubmissionDeadline);
        // console.log('day after', dayAfterSubmissionDeadline);
        // console.log('formatted dl', formattedDeadline);

        // Playlist notification (day after submission deadline)
        if (dayAfterSubmissionDeadline.getTime() === currentDate.getTime()) {
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens and emails for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                  fcmToken: userData.fcmToken || null,
                  email: userData.email || null,
                };
              }
              return null;
            });

            const userContacts = (await Promise.all(tokenFetchPromises)).filter(
              Boolean
            );

            const tokens = userContacts
              .map((contact) => contact.fcmToken)
              .filter(Boolean);
            const emails = userContacts
              .map((contact) => contact.email)
              .filter(Boolean);

            const uniqueTokens = [...new Set(tokens)];
            const uniqueEmails = [...new Set(emails)];

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
                        title: 'New Playlist 🎶',
                        body: `A new playlist is ready in ${legionData.legionName}!\n\nGet your votes in before ${formattedDeadline}`,
                      },
                    })
                    .then((response) => {
                      console.log(`Playlist notification sent`, response);
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending playlist notification`,
                        error
                      );
                    })
                );
              });
            }

            if (uniqueEmails.length > 0) {
              const emailSubject = 'New Playlist 🎶';
              const emailBody = `A new playlist is ready in ${legionData.legionName}!\n\nGet your votes in before ${formattedDeadline}`;
              uniqueEmails.forEach((email) => {
                notifications.push(sendEmail(email, emailSubject, emailBody));
              });
            }

            try {
              await adminUpdateRoundStage(
                legionDoc.id,
                currentRound.id,
                stage.VOTING
              );
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

        // Submission deadline reminder (day before submission deadline)
        else if (
          dayBeforeSubmissionDeadline.getTime() === currentDate.getTime()
        ) {
          // Send submission deadline reminder notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens and emails for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                  fcmToken: userData.fcmToken || null,
                  email: userData.email || null,
                };
              }
              return null;
            });

            const userContacts = (await Promise.all(tokenFetchPromises)).filter(
              Boolean
            );

            const tokens = userContacts
              .map((contact) => contact.fcmToken)
              .filter(Boolean);
            const emails = userContacts
              .map((contact) => contact.email)
              .filter(Boolean);

            const uniqueTokens = [...new Set(tokens)];
            const uniqueEmails = [...new Set(emails)];

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

            if (uniqueEmails.length > 0) {
              const emailSubject = 'Submission Deadline Approaches!';
              const emailBody = `Don't forget to submit for Round ${currentRound.roundNumber} in ${legionData.legionName}!`;
              uniqueEmails.forEach((email) => {
                notifications.push(sendEmail(email, emailSubject, emailBody));
              });
            }
          }
        } else if (dayBeforeVoteDeadline.getTime() === currentDate.getTime()) {
          // Send vote deadline reminder notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens and emails for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                  fcmToken: userData.fcmToken || null,
                  email: userData.email || null,
                };
              }
              return null;
            });

            const userContacts = (await Promise.all(tokenFetchPromises)).filter(
              Boolean
            );

            const tokens = userContacts
              .map((contact) => contact.fcmToken)
              .filter(Boolean);
            const emails = userContacts
              .map((contact) => contact.email)
              .filter(Boolean);

            const uniqueTokens = [...new Set(tokens)];
            const uniqueEmails = [...new Set(emails)];

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

            if (uniqueEmails.length > 0) {
              const emailSubject = 'Vote Deadline Approaches!';
              const emailBody = `Don't forget to cast your votes for Round ${currentRound.roundNumber} in ${legionData.legionName}!`;
              uniqueEmails.forEach((email) => {
                notifications.push(sendEmail(email, emailSubject, emailBody));
              });
            }
          }
        } else if (voteDeadline.getTime() <= currentDate.getTime()) {
          // Send round summary notification
          if (legionData.players && legionData.players.length > 0) {
            const playerUids = legionData.players
              .map((player) => player.userId)
              .filter(Boolean);

            // Fetch fcmTokens and emails for all UIDs
            const tokenFetchPromises = playerUids.map(async (uid) => {
              const userDoc = await adminDb.collection('users').doc(uid).get();
              if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                  fcmToken: userData.fcmToken || null,
                  email: userData.email || null,
                };
              }
              return null;
            });

            const userContacts = (await Promise.all(tokenFetchPromises)).filter(
              Boolean
            );

            const tokens = userContacts
              .map((contact) => contact.fcmToken)
              .filter(Boolean);
            const emails = userContacts
              .map((contact) => contact.email)
              .filter(Boolean);

            const uniqueTokens = [...new Set(tokens)];
            const uniqueEmails = [...new Set(emails)];

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

            if (uniqueEmails.length > 0) {
              const emailSubject = 'Votes are In!';
              const emailBody = `Results for Round ${currentRound.roundNumber} in ${legionData.legionName} are here. Check the app to see how you did!`;
              uniqueEmails.forEach((email) => {
                notifications.push(sendEmail(email, emailSubject, emailBody));
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
            const maxVotes = Math.max(...standings.map((user) => user.votes));
            const topUsers = standings.filter(
              (user) => user.votes === maxVotes
            );

            if (topUsers.length > 0) {
              await Promise.all(
                topUsers.map(async (user) => {
                  if (user.uid) {
                    try {
                      await adminIncrementUserVictories(user.uid);
                      console.log(`Victory incremented for user: ${user.uid}`);
                    } catch (error) {
                      console.error(
                        `Error incrementing victories for user ${user.uid}:`,
                        error
                      );
                    }
                  }
                })
              );
            } else {
              console.warn('No valid top users found in standings.');
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
