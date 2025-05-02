import nodemailer from 'nodemailer'; // Import nodemailer
import {
  adminDb,
  adminUpdateLegionStandings,
  adminIncrementUserVictories,
} from '../../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { stage, status } from '@/utils/status';
import admin from 'firebase-admin';

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send emails
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Legion App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const legionId = request.nextUrl.pathname.split('/').pop();

  if (!legionId) {
    return new Response('Legion ID is required', { status: 400 });
  }

  try {
    const currentDate = normalizeDate(new Date());

    // Fetch the specific legion
    const legionDoc = await adminDb.collection('legions').doc(legionId).get();

    if (!legionDoc.exists) {
      return new Response('Legion not found', { status: 404 });
    }

    const legionData = legionDoc.data();
    const currentRound = legionData.rounds?.find(
      (round) => round.roundNumber === legionData.currentRound
    );

    if (!currentRound) {
      return new Response('No active round found for this legion', {
        status: 404,
      });
    }

    const submissionDeadline = normalizeDate(currentRound.submissionDeadline);
    const dayBeforeSubmissionDeadline = normalizeDate(
      new Date(submissionDeadline.getTime() - 24 * 60 * 60 * 1000)
    );
    const dayAfterSubmissionDeadline = normalizeDate(
      new Date(submissionDeadline.getTime() + 24 * 60 * 60 * 1000)
    );
    const voteDeadline = normalizeDate(currentRound.voteDeadline);
    const dayBeforeVoteDeadline = normalizeDate(
      new Date(voteDeadline.getTime() - 24 * 60 * 60 * 1000)
    );

    const updates = [];
    const notifications = [];

    // Vote deadline reminder (day before vote deadline)
    if (dayBeforeVoteDeadline.getTime() === currentDate.getTime()) {
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

        if (uniqueTokens.length > 0) {
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
                  console.error(`Error sending vote deadline reminder`, error);
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

        if (uniqueTokens.length > 0) {
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
                .catch(async (error) => {
                  if (error.code === 'messaging/registration-token-not-registered') {
                    console.warn(`Invalid FCM token detected: ${token}`);
                    const userDoc = await adminDb
                      .collection('users')
                      .where('fcmToken', '==', token)
                      .get();
                    if (!userDoc.empty) {
                      userDoc.forEach(async (doc) => {
                        await doc.ref.update({ fcmToken: FieldValue.delete() });
                        console.log(`Removed invalid FCM token from user: ${doc.id}`);
                      });
                    }
                  } else {
                    console.error(
                      `Error sending round summary notification`,
                      error
                    );
                  }
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

    // Handle vote deadline and round completion
    const voteDeadlineDate = new Date(currentRound.voteDeadline);
    voteDeadlineDate.setHours(0, 0, 0, 0);

    if (voteDeadlineDate.getTime() <= currentDate.getTime()) {
      const legionDocRef = adminDb.collection('legions').doc(legionDoc.id);

      currentRound.roundStatus = status.COMPLETED;

      let isLegionActive = true;

      const nextRound = legionData.rounds?.find(
        (round) => round.roundNumber === legionData.currentRound + 1
      );

      if (nextRound) {
        nextRound.roundStatus = status.ACTIVE;
        nextRound.roundStage = stage.SUBMISSION;
      } else {
        isLegionActive = false;
      }

      updates.push(
        legionDocRef.update({
          rounds: legionData.rounds,
          currentRound: FieldValue.increment(1),
          isActive: isLegionActive,
        })
      );

      try {
        const { standings } = await adminUpdateLegionStandings(legionDoc.id);

        if (!Array.isArray(standings)) {
          throw new Error('Standings is not an array');
        }

        if (!isLegionActive) {
          const maxVotes = Math.max(...standings.map((user) => user.votes));
          const topUsers = standings.filter((user) => user.votes === maxVotes);

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

    // Wait for all updates and notifications to complete
    await Promise.all([...updates, ...notifications]);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cron job executed successfully for legion ${legionId}`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error executing cron job for specific legion:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
