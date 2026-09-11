export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Ethiopian phone: accepts +251XXXXXXXXX, 251XXXXXXXXX, or 0XXXXXXXXX (9 digits after 0)
export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Must be 12 digits starting with 251, or 10 digits starting with 0
  return (
    (digits.length === 12 && digits.startsWith('251')) ||
    (digits.length === 10 && digits.startsWith('0'))
  );
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }

  return { valid: true };
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return value !== null && value !== undefined;
};

export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && Number(value) >= 0;
};

export const validatePositiveInteger = (value: string | number): boolean => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

export const validateSKU = (sku: string): boolean => {
  // SKU should be alphanumeric with optional hyphens and underscores
  const skuRegex = /^[A-Za-z0-9\-_]+$/;
  return skuRegex.test(sku) && sku.length >= 2;
};

export const validateVIN = (vin: string): boolean => {
  // VIN should be 17 characters alphanumeric
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
};

export const validatePlateNumber = (plate: string): boolean => {
  // Basic plate validation - alphanumeric with optional spaces and hyphens
  const plateRegex = /^[A-Z0-9\s\-]{2,10}$/i;
  return plateRegex.test(plate);
};
