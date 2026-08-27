import React from 'react';

/**
 * HealFlow 'O' Wave Icon SVG Component
 * Customizable ring & wave colors directly mapped to user specified theme palette.
 */
export const HealFlowIcon = ({
  variant = 'dark',
  ringColor: customRing,
  waveColor: customWave,
  className = 'w-6 h-6',
  size,
}) => {
  const style = size ? { width: size, height: size } : {};

  // Palette defaults:
  // variant light (for dark background): White ring (#FFFFFF) + Pastel Blue Tint wave (#CEDEFF)
  // variant dark (for light background): Midnight Navy ring (#29318A) + Royal Blue wave (#5B81FA)
  const ringColor = customRing || (variant === 'light' ? '#FFFFFF' : '#29318A');
  const waveColor = customWave || (variant === 'light' ? '#CEDEFF' : '#5B81FA');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={`inline-block align-middle ${className}`}
      style={style}
    >
      <defs>
        <mask id={`healflow-o-mask-${variant}-${ringColor.replace('#', '')}`}>
          <rect width="100" height="100" fill="#000000" />
          <path
            d="M 50 4 A 46 46 0 1 0 50 96 A 46 46 0 1 0 50 4 Z M 50 28 A 22 22 0 1 1 50 72 A 22 22 0 1 1 50 28 Z"
            fill="#ffffff"
            fillRule="evenodd"
          />
        </mask>
      </defs>

      {/* Ring Base */}
      <path
        d="M 50 4 A 46 46 0 1 0 50 96 A 46 46 0 1 0 50 4 Z M 50 28 A 22 22 0 1 1 50 72 A 22 22 0 1 1 50 28 Z"
        fill={ringColor}
        fillRule="evenodd"
      />

      {/* Fluid Ocean Wave Fill */}
      <path
        mask={`url(#healflow-o-mask-${variant}-${ringColor.replace('#', '')})`}
        d="M -10 54 C 18 72, 38 42, 60 58 C 78 72, 92 52, 110 56 L 110 110 L -10 110 Z"
        fill={waveColor}
      />
    </svg>
  );
};
