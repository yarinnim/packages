/**
 * Replaces placeholders in a template string with values from data.
 * @param template - String containing {key} placeholders
 * @param data - Object mapping keys to replacement values
 * @returns Template with placeholders replaced
 * @example replacePlaceholder('Hello {name}', { name: 'World' }) // 'Hello World'
 */
export const replacePlaceholder = (template: string, data: Record<string, string>) => template
  .replace(/{(\w+)}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match
  ));

/**
 * Checks if the input string is a valid email address.
 * @param input - String to validate
 * @returns True if input matches common email format, false otherwise
 * @example isEmail('user@example.com') // true
 * @example isEmail('invalid') // false
 */
export const isEmail = (input: string): boolean => {
  if (typeof input !== 'string' || input.length === 0) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(input.trim());
};

/**
 * Checks if the input string is a valid international phone number (E.164-style).
 * Accepts optional + prefix and common formatting (spaces, hyphens, parentheses).
 * @param input - String to validate
 * @returns True if input has 10–15 digits with optional leading +, false otherwise
 * @example isPhoneNumber('+1 555 123 4567') // true
 * @example isPhoneNumber('+44 20 7123 4567') // true
 * @example isPhoneNumber('invalid') // false
 */
export const isPhoneNumber = (input: string): boolean => {
  if (typeof input !== 'string' || input.length === 0) return false;
  const digits = input.trim().replace(/[\s\-().]/g, '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};
