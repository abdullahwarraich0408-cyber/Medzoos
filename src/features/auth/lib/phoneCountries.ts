export type AuthCountry = {
  code: string;
  name: string;
  dial: string;
  flag: string;
  placeholder: string;
};

export const AUTH_COUNTRIES: AuthCountry[] = [
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', placeholder: '3XX XXXXXXX' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', placeholder: '5X XXX XXXX' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', placeholder: '5X XXX XXXX' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', placeholder: '7XXX XXXXXX' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', placeholder: '201 555 0123' },
];

export const DEFAULT_AUTH_COUNTRY = AUTH_COUNTRIES[0];

export function nationalDigits(value: string) {
  return String(value || '').replace(/\D/g, '');
}

export function isValidNationalNumber(country: AuthCountry, value: string) {
  const digits = nationalDigits(value);
  if (country.code === 'PK') {
    const local = digits.startsWith('0') ? digits.slice(1) : digits;
    return /^3\d{9}$/.test(local);
  }
  return digits.length >= 8 && digits.length <= 12;
}

export function toE164(country: AuthCountry, value: string) {
  const digits = nationalDigits(value);
  if (!digits) return '';
  if (country.code === 'PK') {
    const local = digits.startsWith('0') ? digits.slice(1) : digits;
    return `+92${local}`;
  }
  const local = digits.startsWith('0') ? digits.slice(1) : digits;
  return `${country.dial}${local}`;
}
