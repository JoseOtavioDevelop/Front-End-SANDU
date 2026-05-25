import React from 'react';

export default function Button({ children, onClick, type = 'button', variant = 'primary', style }) {
  const baseStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
  };

  const variants = {
    primary: { backgroundColor: '#e65100', color: '#fff' },
    secondary: { backgroundColor: '#e0e0e0', color: '#333' },
    success: { backgroundColor: '#25D366', color: '#fff' },
    danger: { backgroundColor: '#d32f2f', color: '#fff' }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...baseStyle, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}