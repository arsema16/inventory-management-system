// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(date);
};

// Number formatting — Ethiopian Birr (ETB)
export const formatCurrency = (amount: number): string => {
  return 'ETB ' + new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-ET').format(num);
};

// Ethiopian phone format: +251-9X-XXX-XXXX or +251-11-XXX-XXXX
export const formatEthiopianPhone = (phone: string): string => {
  if (!phone) return '';
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle local format starting with 0 → replace with +251
  // e.g. 0911234567 → +251911234567
  const normalized = digits.startsWith('0')
    ? '251' + digits.slice(1)
    : digits.startsWith('251')
    ? digits
    : digits;

  if (normalized.length === 12 && normalized.startsWith('251')) {
    const cc  = normalized.slice(0, 3);   // 251
    const net = normalized.slice(3, 5);   // 09, 07, 11 etc.
    const p1  = normalized.slice(5, 8);
    const p2  = normalized.slice(8, 12);
    return `+${cc}-${net}-${p1}-${p2}`;
  }

  return phone; // return as-is if it doesn't match
};

// Status formatting
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    FULFILLED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'default',
    AVAILABLE: 'success',
    LOW_STOCK: 'warning',
    OUT_OF_STOCK: 'danger',
    RESERVED: 'info',
    SOLD: 'default',
    INACTIVE: 'default',
  };

  return statusColors[status] || 'default';
};

export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Role formatting
export const formatRole = (role: string): string => {
  return role
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
