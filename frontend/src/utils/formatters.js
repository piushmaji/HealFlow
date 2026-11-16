export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTokenNumber = (specialtyPrefix, number) => {
  const prefix = (specialtyPrefix || 'CLN').substring(0, 4).toUpperCase();
  const paddedNum = String(number).padStart(3, '0');
  return `${prefix}-${paddedNum}`;
};

export const calculateEstimatedWaitTime = (patientsAhead, avgConsultationMinutes = 30) => {
  if (patientsAhead <= 0) return 'Immediate (Your Turn)';
  const totalMinutes = patientsAhead * avgConsultationMinutes;
  if (totalMinutes < 60) {
    return `~ ${totalMinutes} mins`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~ ${hours}h ${mins}m` : `~ ${hours}h`;
};

/**
 * Indian Standard Time (IST) Slot Validation Utilities
 */
export const parseSlotTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const getISTNow = () => {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);
  let hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  return { dateStr, minutesNow: hour * 60 + minute, hour, minute };
};

/**
 * Check if an appointment slot is currently active or upcoming in IST
 * Allows entry starting 10 minutes before slot time through the day
 * If it's an Instant Demo / Emergency slot, it is immediately active regardless of clock time!
 */
export const isSlotActiveNowIST = (slotDate, slotTime, isDemo = false) => {
  if (isDemo) return { isActive: true, reason: 'Instant', message: 'Instant Demo Session Active' };
  if (!slotTime) return { isActive: true, reason: 'Active', message: 'Slot Active' };
  if (slotTime.toLowerCase().includes('instant') || slotTime.toLowerCase().includes('demo') || slotTime.toLowerCase().includes('immediate') || slotTime.toLowerCase().includes('now')) {
    return { isActive: true, reason: 'Instant', message: 'Instant Connect Active' };
  }
  const { dateStr, minutesNow } = getISTNow();

  // If date is in the future
  if (slotDate && slotDate > dateStr) {
    return { isActive: false, reason: 'Future Date', message: `Scheduled for ${slotDate} at ${slotTime} (IST).` };
  }

  // If date is today, check time slot
  if (!slotDate || slotDate === dateStr) {
    const slotMinutes = parseSlotTimeToMinutes(slotTime);
    // Allow entry starting 10 mins before slot
    if (minutesNow < slotMinutes - 10) {
      const waitMins = slotMinutes - minutesNow;
      return {
        isActive: false,
        reason: 'Too Early',
        message: `OPD Queue unlocks at ${slotTime} IST (~${waitMins} mins remaining).`,
      };
    }
  }

  return { isActive: true, reason: 'Active', message: 'Slot Active' };
};

/**
 * Format address object or string into a clean readable string
 * Supports JSON object { street, city, district, state, pincode }
 */
export const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatAddress(parsed);
      }
    } catch {
      return address;
    }
    return address;
  }
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.district,
      address.state,
      address.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

/**
 * Normalize any address input into an address object { street, city, district, state, pincode }
 */
export const parseAddressObject = (address) => {
  const defaultAddress = { street: '', city: '', district: '', state: '', pincode: '' };
  if (!address) return defaultAddress;

  if (typeof address === 'object' && address !== null) {
    return {
      street: address.street || '',
      city: address.city || '',
      district: address.district || '',
      state: address.state || '',
      pincode: address.pincode || '',
    };
  }

  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          street: parsed.street || '',
          city: parsed.city || '',
          district: parsed.district || '',
          state: parsed.state || '',
          pincode: parsed.pincode || '',
        };
      }
    } catch {
      // Plain text address - place it into street
      return { ...defaultAddress, street: address };
    }
  }

  return defaultAddress;
};
