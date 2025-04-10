'use client';
import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.mainContainer}>
      <div className={styles.styleContainer}>
        <Image
          src="/img/navlogo.svg"
          height={75}
          width={175}
          alt="Legion of Tones Logo"
        />
        <div className={styles.footerInfo}>
          <div className={styles.linkColum}>
            <ul className={styles.list}>
              <div className={styles.columnTitle}> About</div>
              <li>
                <Link href="/about" className={styles.logo}>
                  About
                </Link>
              </li>
              <li>
                <Link href="https://donate.stripe.com/3csfZl65kbeE2FG6oo" className={styles.logo}>
                  Donate
                </Link>
              </li>
            </ul>

            <ul className={styles.list}>
              <div className={styles.columnTitle}>Support</div>
              <li>
                <Link href="/FAQ" className={styles.logo}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/installation" className={styles.logo}>
                  How to Install
                </Link>
              </li>
            </ul>

            {/* <ul className={styles.list}>
              <div className={styles.columnTitle}>Legal</div>
              <li>
                <Link href="/terms" className={styles.logo}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={styles.logo}>
                  Privacy Policy
                </Link>
              </li>
            </ul> */}
          </div>
        </div>
      </div>
      <hr className={styles.horizontalRule} />
      <div className={styles.copyright}>
        ©{currentYear} Legion of Tones. All rights reserved.
      </div>
    </div>
  );
};
