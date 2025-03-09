import React from 'react';
import styles from './Button.module.css';

const Button = ({ type = 'button', onClick, children, className }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
