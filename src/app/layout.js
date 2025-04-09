'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import { useEffect } from 'react';
import { onMessageListener } from '../firebase';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const isAlreadyRegistered = registrations.some((registration) =>
          registration.active?.scriptURL.includes('firebase-messaging-sw.js')
        );
        if (!isAlreadyRegistered) {
          navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then((registration) => {
              console.log(
                'Service Worker registered with scope:',
                registration.scope
              );
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        } else {
          console.log('Service Worker already registered.');
        }
      });
    }

    // Set up the foreground notification listener
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log('Foreground notification received:', payload);
        alert(
          `Notification: ${payload.notification.title} - ${payload.notification.body}`
        );
      })
      .catch((err) =>
        console.error('Error receiving foreground notification:', err)
      );

    return () => unsubscribe;
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
