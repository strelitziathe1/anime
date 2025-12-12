/**
 * Security Utilities
 * Implements CSRF protection, input validation, and secure API calls
 */

/**
 * Get CSRF token from meta tag or cookie
 */
export const getCSRFToken = (): string | null => {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  }

  // Try to get from cookie
  const match = document.cookie.match(/csrf-token=([^;]*)/);
  return match ? match[1] : null;
};

/**
 * Make a secure API call with CSRF token
 */
export const secureApiCall = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const csrfToken = getCSRFToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: number;
  suggestions: string[];
} => {
  const suggestions: string[] = [];
  let strength = 0;

  if (password.length >= 8) strength++;
  else suggestions.push('Password should be at least 8 characters long');

  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  else suggestions.push('Password should contain both uppercase and lowercase letters');

  if (/\d/.test(password)) strength++;
  else suggestions.push('Password should contain numbers');

  if (/[^a-zA-Z\d]/.test(password)) strength++;
  else suggestions.push('Password should contain special characters');

  return {
    isValid: strength >= 4,
    strength,
    suggestions,
  };
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Check for rate limiting headers in response
 */
export const checkRateLimit = (response: Response): {
  isRateLimited: boolean;
  remaining: number;
  resetTime: number;
} => {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10);
  const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10);

  return {
    isRateLimited: response.status === 429,
    remaining,
    resetTime,
  };
};

/**
 * Generate a random nonce for inline scripts
 */
export const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Hash a string using SHA-256 (for client-side use only)
 */
export const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Create a secure session and clear on tab close
 */
export const setupSecureSession = () => {
  // Clear sensitive data when page unloads
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive session data
    sessionStorage.clear();
  });

  // Detect tab closing and logout
  let isClosing = false;
  window.addEventListener('beforeunload', () => {
    isClosing = true;
  });

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      // Tab hidden
      sessionStorage.setItem('tabHidden', 'true');
    } else {
      // Tab visible again
      sessionStorage.removeItem('tabHidden');
    }
  });
};
