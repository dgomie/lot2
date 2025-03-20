import React from 'react';
import styles from './Button.module.css';

const Button = ({ type = 'button', onClick, children, className, variant='blue', disabled=false}) => {
  const buttonClass = `${styles.button} ${styles[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;