import React from 'react';
import styles from './Input.module.css';
import Image from 'next/image';
import visibleOn from '../../../public/img/visible-on.svg';
import visibleOff from '../../../public/img/visible-off.svg';

const Input = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  label,
  required = false,
  showToggle = false,
  toggleVisibility,
  isVisible,
  maxLength,
  placeholder = '', // Add placeholder prop with a default value
}) => {
  return (
    <div className={styles.inputGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={styles.input}
          maxLength={maxLength}
          placeholder={placeholder} 
        />
        {showToggle && (
          <span className={styles.eyeIcon} onClick={toggleVisibility}>
            <Image
              src={isVisible ? visibleOff : visibleOn}
              alt="Toggle visibility"
              width={24}
              height={24}
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
