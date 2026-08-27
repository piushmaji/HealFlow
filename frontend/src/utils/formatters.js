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
