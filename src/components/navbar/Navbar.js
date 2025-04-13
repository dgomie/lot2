'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import styles from './Navbar.module.css';
import Image from 'next/image';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const iconSize = 30;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <Image
            src={'/img/navlogo.svg'}
            alt="Legion of Tones logo"
            width={200}
            height={50}
          />
        </Link>
        <div className={styles.links}>
          {currentUser ? (
            <div className={styles.linkContainer}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/legions">Legions</Link>
              <Link href="/profile">Profile</Link>
              <div className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </div>
            </div>
          ) : (
            <>
              <Link href="/">Home</Link>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <div className={styles.bottomNav}>
        {currentUser ? (
          <>
            <Link href="/dashboard">
              <Image
                className={styles.bottomNavIcon}
                src={'/img/home.svg'}
                alt="Dashboard Icon"
                width={iconSize}
                height={iconSize}
              />
              Dashboard
            </Link>
            <Link href="/legions">
              <Image
                className={styles.bottomNavIcon}
                src={'/img/legion.svg'}
                alt="Legions Icon"
                width={iconSize}
                height={iconSize}
              />
              Legions
            </Link>
            <Link href="/profile">
              <Image
                className={styles.bottomNavIcon}
                src={'/img/person.svg'}
                alt="Profile Icon"
                width={iconSize}
                height={iconSize}
              />
              Profile
            </Link>
            <div onClick={handleLogout}>
              <Image
                className={styles.bottomNavIcon}
                src={'/img/logout.svg'}
                alt="Logout Icon"
                width={iconSize}
                height={iconSize}
              />
              Logout
            </div>
          </>
        ) : (
          <>
            <Link href="/">
              <Image
                className={styles.bottomNavIcon}
                src={'/img/home.svg'}
                alt="Home Icon"
                width={iconSize}
                height={iconSize}
              />
              Home
            </Link>
            <Link href="/auth/login">
              <Image
                className={styles.bottomNavIcon}
                src={'/img/login.svg'}
                alt="Login Icon"
                width={iconSize}
                height={iconSize}
              />
              Login
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
