import React, { useState } from 'react';
import { Check, Sparkles, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { PATIENT_AVATAR_COLLECTION, DOCTOR_AVATAR_COLLECTION } from '../../utils/avatarLibrary';

/**
 * AvatarPickerModal or Inline Avatar Selector
 * Lets any user browse, preview, and select custom or library avatars
 * with one-click direct database persistence.
 */
export const AvatarSelector = ({
  currentAvatar = '',
  role = 'patient',
  userName = '',
  onSelectAvatar,
  className = '',
}) => {
  const collection = role === 'doctor' ? DOCTOR_AVATAR_COLLECTION : PATIENT_AVATAR_COLLECTION;
  const [selected, setSelected] = useState(currentAvatar);

  const handlePick = (url) => {
    setSelected(url);
    if (onSelectAvatar) {
      onSelectAvatar(url);
    }
  };

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#4C5BBD]" />
          <span>Choose from Avatar Library</span>
        </label>
        <span className="text-[10px] text-[#6B6E84] font-medium">Click to set as profile photo</span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {collection.map((item) => {
          const isSelected = selected === item.url || currentAvatar === item.url;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePick(item.url)}
              style={{ outline: 'none' }}
              title={item.label}
              className={`relative aspect-square rounded-2xl overflow-hidden p-1 transition-all border-0 cursor-pointer group flex items-center justify-center ${
                isSelected
                  ? 'ring-2 ring-[#4C5BBD] bg-[#F2F5FF] scale-105 shadow-xs'
                  : 'bg-[#F8FAFE] hover:bg-[#F2F5FF] hover:scale-105 shadow-xs'
              }`}
            >
              <img
                src={item.url}
                alt={item.label}
                className="w-full h-full object-cover rounded-xl"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-[#4C5BBD]/30 flex items-center justify-center rounded-2xl backdrop-blur-[0.5px]">
                  <div className="w-5 h-5 rounded-full bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

