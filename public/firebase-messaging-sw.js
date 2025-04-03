importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

const firebaseConfig = {
  apiKey: 'AIzaSyBkaYaC-TuYV4T-Mi41beOEsfzLyKzQ794',
  authDomain: 'legion-of-tones-abf3b.firebaseapp.com',
  projectId: 'legion-of-tones-abf3b',
  storageBucket: 'legion-of-tones-abf3b.firebasestorage.app',
  messagingSenderId: '222990024696',
  appId: '1:222990024696:web:6838d7df43c9528d81600d',
  measurementId: 'G-MZJK11KQT7',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('Received background message: ', payload);

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/firebase-logo.png',
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  // No need to manually show the notification
});
