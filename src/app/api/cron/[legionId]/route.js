import {
  adminDb,
  adminUpdateLegionStandings,
  adminIncrementUserVictories,
  adminUpdateRoundStage,
} from '../../../../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { stage, status } from '@/utils/status';
import admin from 'firebase-admin'; 

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { legionId } = params; // Extract legionId from dynamic route

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

    // Playlist notification (day after submission deadline)
    if (dayAfterSubmissionDeadline.getTime() === currentDate.getTime()) {
      if (legionData.players && legionData.players.length > 0) {
        const playerUids = legionData.players
          .map((player) => player.userId)
          .filter(Boolean);

        const tokenFetchPromises = playerUids.map(async (uid) => {
          const userDoc = await adminDb.collection('users').doc(uid).get();
          return userDoc.exists ? userDoc.data().fcmToken : null;
        });

        const tokens = (await Promise.all(tokenFetchPromises)).filter(Boolean);
        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length > 0) {
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
    }

    // Submission deadline reminder (day before submission deadline)
    else if (dayBeforeSubmissionDeadline.getTime() === currentDate.getTime()) {
      if (legionData.players && legionData.players.length > 0) {
        const playerUids = legionData.players
          .map((player) => player.userId)
          .filter(Boolean);

        const tokenFetchPromises = playerUids.map(async (uid) => {
          const userDoc = await adminDb.collection('users').doc(uid).get();
          return userDoc.exists ? userDoc.data().fcmToken : null;
        });

        const tokens = (await Promise.all(tokenFetchPromises)).filter(Boolean);
        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length > 0) {
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
                  console.log(`Submission deadline reminder sent`, response);
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
      if (legionData.players && legionData.players.length > 0) {
        const playerUids = legionData.players
          .map((player) => player.userId)
          .filter(Boolean);

        const tokenFetchPromises = playerUids.map(async (uid) => {
          const userDoc = await adminDb.collection('users').doc(uid).get();
          return userDoc.exists ? userDoc.data().fcmToken : null;
        });

        const tokens = (await Promise.all(tokenFetchPromises)).filter(Boolean);
        const uniqueTokens = [...new Set(tokens)];

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
          const topUser = standings.reduce(
            (max, user) => (user.votes > max.votes ? user : max),
            { votes: -Infinity }
          );

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
