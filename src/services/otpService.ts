/**
 * OTP Service
 * Handles OTP sending and verification API calls
 * 
 * Backend API endpoints expected:
 * - POST /api/auth/send-otp - Send OTP to phone number
 * - POST /api/auth/verify-otp - Verify OTP for login
 * - POST /api/auth/signup-verify-otp - Verify OTP for signup
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  expiresIn?: number; // seconds
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    role: string;
  };
  token?: string; // JWT token if using token-based auth
}

/**
 * Send OTP to the provided phone number
 */
export const sendOTP = async (phone: string): Promise<SendOTPResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send OTP' }));
      throw new Error(error.message || 'Failed to send OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for login
 */
export const verifyOTPForLogin = async (
  phone: string,
  otp: string
): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'OTP verification failed' }));
      throw new Error(error.message || 'OTP verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP for signup
 */
export const verifyOTPForSignup = async (
  phone: string,
  name: string,
  otp: string
): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup-verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, name, otp }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'OTP verification failed' }));
      throw new Error(error.message || 'OTP verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Format phone number (basic formatting)
 * You can enhance this with a library like libphonenumber-js
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add + prefix if not present and has country code
  if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`;
  }
  
  return phone;
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Basic validation - at least 10 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

