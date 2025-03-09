'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        MyApp
      </Link>
      <div className={styles.links}>
        <Link href="/">Home</Link>
        {currentUser ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <button className={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;