import React, { useState } from 'react';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const getInitials = (n) => {
    if (!n) return 'SC';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-brand-100 text-brand-800 font-bold border border-slate-200 shadow-sm shrink-0 ${sizes[size]} ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}
    </div>
  );
};
