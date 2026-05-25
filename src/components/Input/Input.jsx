import React from 'react';

export default function Input({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' }}>
      {label && <label style={{ fontWeight: '6px', color: '#444' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '14px',
          outline: 'none'
        }}
      />
    </div>
  );
}