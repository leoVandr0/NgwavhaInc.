// Simple server-side password policy validation
// Enforces: minimum length, uppercase, lowercase, number, and special character
export function validatePassword(password) {
  const errors = [];
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 12) errors.push('Password must be at least 12 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must include an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must include a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must include a number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must include a special character');
  }
  return { isValid: errors.length === 0, errors };
}

export default { validatePassword };
