import React from 'react';
import { HealFlowIcon } from './HealFlowIcon';

/**
 * HealFlow Logo Lockup Component
 * Mapped to official theme palette: #5B81FA (Primary Blue), #CEDEFF (Blue Tint), #1F1F1F (Charcoal).
 */
export const HealFlowLogo = ({ variant = 'dark', className = '', height = 28 }) => {
  const healColor = variant === 'light' ? '#FFFFFF' : '#1F1F1F';
  const flowColor = variant === 'light' ? '#CEDEFF' : '#5B81FA';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-heading font-black select-none tracking-tight ${className}`}
      style={{ fontSize: height ? `${height * 0.85}px` : '24px', lineHeight: 1 }}
    >
      {/* "HEAL" */}
      <span style={{ color: healColor }} className="font-extrabold">
        HEAL
      </span>

      {/* "FL[O-Icon]W" */}
      <span style={{ color: flowColor }} className="inline-flex items-center">
        <span>FL</span>
        <span className="inline-flex items-center justify-center mx-[1.5px] transform translate-y-[-1px]">
          <HealFlowIcon variant={variant} size={height ? height * 0.8 : 22} />
        </span>
        <span>W</span>
      </span>
    </div>
  );
};
