import React from 'react';
import styles from './Button.module.css';

const Button = ({ type = 'button', onClick, children, className, variant='blue' }) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass}>
      {children}
    </button>
  );
};

export default Button;