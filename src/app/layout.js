'use client'
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/navbar/Navbar';
import { useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// export const metadata = {
//   title: 'Legion of Tones',
//   description: 'Music for the Masses',
// };

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const isAlreadyRegistered = registrations.some(
          (registration) => registration.active?.scriptURL.includes('firebase-messaging-sw.js')
        );
        if (!isAlreadyRegistered) {
          navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then((registration) => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        } else {
          console.log('Service Worker already registered.');
        }
      });
    }
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