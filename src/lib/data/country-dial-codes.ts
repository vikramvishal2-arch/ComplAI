export type CountryDialCode = {
  code: string;
  dial: string;
  name: string;
};

/** Common dial codes — India first (default for Propel Ready). */
export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'AE', dial: '+971', name: 'United Arab Emirates' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
  { code: 'AU', dial: '+61', name: 'Australia' },
  { code: 'CA', dial: '+1', name: 'Canada' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'FR', dial: '+33', name: 'France' },
  { code: 'NL', dial: '+31', name: 'Netherlands' },
  { code: 'CH', dial: '+41', name: 'Switzerland' },
  { code: 'SE', dial: '+46', name: 'Sweden' },
  { code: 'NO', dial: '+47', name: 'Norway' },
  { code: 'DK', dial: '+45', name: 'Denmark' },
  { code: 'FI', dial: '+358', name: 'Finland' },
  { code: 'IE', dial: '+353', name: 'Ireland' },
  { code: 'ES', dial: '+34', name: 'Spain' },
  { code: 'IT', dial: '+39', name: 'Italy' },
  { code: 'PT', dial: '+351', name: 'Portugal' },
  { code: 'BE', dial: '+32', name: 'Belgium' },
  { code: 'AT', dial: '+43', name: 'Austria' },
  { code: 'PL', dial: '+48', name: 'Poland' },
  { code: 'CZ', dial: '+420', name: 'Czech Republic' },
  { code: 'JP', dial: '+81', name: 'Japan' },
  { code: 'KR', dial: '+82', name: 'South Korea' },
  { code: 'CN', dial: '+86', name: 'China' },
  { code: 'HK', dial: '+852', name: 'Hong Kong' },
  { code: 'MY', dial: '+60', name: 'Malaysia' },
  { code: 'ID', dial: '+62', name: 'Indonesia' },
  { code: 'PH', dial: '+63', name: 'Philippines' },
  { code: 'TH', dial: '+66', name: 'Thailand' },
  { code: 'VN', dial: '+84', name: 'Vietnam' },
  { code: 'NZ', dial: '+64', name: 'New Zealand' },
  { code: 'ZA', dial: '+27', name: 'South Africa' },
  { code: 'NG', dial: '+234', name: 'Nigeria' },
  { code: 'KE', dial: '+254', name: 'Kenya' },
  { code: 'EG', dial: '+20', name: 'Egypt' },
  { code: 'IL', dial: '+972', name: 'Israel' },
  { code: 'TR', dial: '+90', name: 'Turkey' },
  { code: 'BR', dial: '+55', name: 'Brazil' },
  { code: 'MX', dial: '+52', name: 'Mexico' },
  { code: 'AR', dial: '+54', name: 'Argentina' },
  { code: 'CO', dial: '+57', name: 'Colombia' },
  { code: 'CL', dial: '+56', name: 'Chile' },
  { code: 'QA', dial: '+974', name: 'Qatar' },
  { code: 'KW', dial: '+965', name: 'Kuwait' },
  { code: 'BH', dial: '+973', name: 'Bahrain' },
  { code: 'OM', dial: '+968', name: 'Oman' },
];

export const DEFAULT_COUNTRY_DIAL_CODE = COUNTRY_DIAL_CODES[0].dial;

/** ISO 3166-1 alpha-2 code → flag emoji (e.g. IN → 🇮🇳). */
export function countryCodeToFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getDialCodeForCountry(countryCode: string): string {
  return COUNTRY_DIAL_CODES.find((country) => country.code === countryCode)?.dial ?? '+91';
}

export function getPhoneDigits(localNumber: string): string {
  return localNumber.replace(/\D/g, '');
}

export function isTenDigitPhone(localNumber: string): boolean {
  return /^\d{10}$/.test(getPhoneDigits(localNumber));
}

export function formatPhoneWithDialCode(dialCode: string, localNumber: string): string {
  const digits = getPhoneDigits(localNumber);
  return `${dialCode} ${digits}`.trim();
}
