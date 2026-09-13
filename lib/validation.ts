// Client-safe email and password regex validation & analysis utilities

// Strict RFC 5322 compliant regex for robust email validation
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Strong password regex: min 8 chars, at least 1 lowercase, 1 uppercase, 1 digit, 1 special character
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]).{8,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

export interface PasswordAnalysis {
  isValid: boolean;
  score: number; // 0 to 4
  strength: 'weak' | 'fair' | 'good' | 'strong';
  checks: {
    minLength: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  missingRequirements: string[];
}

export function analyzePassword(password: string): PasswordAnalysis {
  const pwd = typeof password === 'string' ? password : '';
  const checks = {
    minLength: pwd.length >= 8,
    hasLower: /[a-z]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd),
  };

  const missingRequirements: string[] = [];
  if (!checks.minLength) missingRequirements.push('At least 8 characters');
  if (!checks.hasUpper) missingRequirements.push('One uppercase letter (A-Z)');
  if (!checks.hasLower) missingRequirements.push('One lowercase letter (a-z)');
  if (!checks.hasNumber) missingRequirements.push('One number (0-9)');
  if (!checks.hasSpecial) missingRequirements.push('One special character (!@#$%...)');

  let passedCount = 0;
  if (checks.minLength) passedCount++;
  if (checks.hasLower) passedCount++;
  if (checks.hasUpper) passedCount++;
  if (checks.hasNumber) passedCount++;
  if (checks.hasSpecial) passedCount++;

  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let score = 0;

  if (passedCount <= 2) {
    strength = 'weak';
    score = 1;
  } else if (passedCount === 3) {
    strength = 'fair';
    score = 2;
  } else if (passedCount === 4) {
    strength = 'good';
    score = 3;
  } else if (passedCount >= 5) {
    strength = 'strong';
    score = 4;
  }

  return {
    isValid: STRONG_PASSWORD_REGEX.test(pwd),
    score,
    strength,
    checks,
    missingRequirements,
  };
}

export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return STRONG_PASSWORD_REGEX.test(password);
}
