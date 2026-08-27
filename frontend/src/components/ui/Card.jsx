import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  variant = 'white',
  pill = false,
  onClick,
  ...props
}) => {
  const bgStyles = {
    white: 'bg-white border-0',
    tint: 'bg-[#F2F5FF] border-0',
    navy: 'bg-[#4C5BBD] text-white border-0',
    glass: 'bg-white/90 border-0',
  };

  const roundedStyle = pill ? 'rounded-[2rem]' : 'rounded-3xl';

  return (
    <div
      onClick={onClick}
      className={`${bgStyles[variant] || bgStyles.white} ${roundedStyle} border-0 shadow-xs transition-all duration-200 ${
        hoverEffect
          ? 'hover:shadow-card-hover cursor-pointer hover:-translate-y-0.5'
          : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
