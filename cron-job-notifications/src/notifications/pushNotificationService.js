import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();

const sendPushNotification = async (title, body, legionTitle) => {
  const token = await getToken(messaging, { vapidKey: process.env.VAPID_KEY });

  if (!token) {
    console.error('No registration token available. Request permission to generate one.');
    return;
  }

  const notificationPayload = {
    notification: {
      title: title,
      body: body,
      icon: '/img/icon.png', // Path to your icon
    },
    data: {
      legionTitle: legionTitle,
    },
  };

  try {
    await fetch('/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        notification: notificationPayload,
      }),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default sendPushNotification;