import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizePx = {
    small: 16,
    medium: 32,
    large: 48
  }[size] || 32;

  const borderWidth = Math.max(2, Math.round(sizePx / 8));

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div
        className="spinner"
        style={{ width: sizePx, height: sizePx, borderWidth, borderTopWidth: borderWidth }}
      ></div>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
