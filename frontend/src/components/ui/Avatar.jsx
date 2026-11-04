import React, { useState } from 'react';
import { getDefaultAvatar } from '../../utils/avatarLibrary';

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  role = 'patient',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const resolvedSrc = src || getDefaultAvatar(name || alt, role);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-[#F2F5FF] text-[#4C5BBD] font-bold border-0 shadow-xs shrink-0 ${sizes[size]} ${className}`}
    >
      <img
        src={!imageError ? resolvedSrc : getDefaultAvatar(name || alt, role)}
        alt={alt || name}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
