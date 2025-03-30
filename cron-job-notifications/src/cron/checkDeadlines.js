const cron = require('node-cron');
const { fetchRounds } = require('../firebase/roundService');
const { sendPushNotification } = require('../notifications/pushNotificationService');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const checkDeadlines = async () => {
  try {
    const rounds = await fetchRounds();
    const currentDate = new Date();

    rounds.forEach(round => {
      if (new Date(round.submissionDeadline) < currentDate && !round.isRoundComplete) {
        const legionTitle = round.legionTitle; // Assuming legionTitle is part of round data
        sendPushNotification(`A new playlist is available in the ${legionTitle}`);
      }
    });
  } catch (error) {
    console.error('Error checking deadlines:', error);
  }
};

// Schedule the cron job to run every hour
cron.schedule('0 * * * *', checkDeadlines);