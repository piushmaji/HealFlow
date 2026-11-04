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

export const calculateEstimatedWaitTime = (patientsAhead, avgConsultationMinutes = 12) => {
  if (patientsAhead <= 0) return 'Immediate';
  const totalMinutes = patientsAhead * avgConsultationMinutes;
  if (totalMinutes < 60) {
    return `~ ${totalMinutes} mins`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~ ${hours}h ${mins}m` : `~ ${hours}h`;
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
