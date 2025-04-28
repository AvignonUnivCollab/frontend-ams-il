// src/components/ui/button.js
import React from 'react';

export const Button = ({ onClick, children, className }) => {
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};