import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, where, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: 'user' | 'admin';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Email/Password
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  // Google Sign-in
  signInWithGoogle: () => Promise<boolean>;
  // Phone + Password (OTP only for verification during signup)
  loginWithPhone: (phone: string, password: string) => Promise<boolean>;
  signupWithPhone: (phone: string, name: string, password: string, otp: string) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<boolean>;
  // Forget Password
  forgetPassword: (phone: string) => Promise<boolean>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<boolean>;
  // Update Profile
  updateUserProfile: (updates: { name?: string; email?: string; phone?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  // Logout
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store recaptcha verifier and confirmation result
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        const userObj: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || userData?.email || undefined,
          // Get phone from Firestore first (for phone signups), then fallback to Firebase Auth phoneNumber
          phone: userData?.phone || firebaseUser.phoneNumber || undefined,
          name: userData?.name || firebaseUser.displayName || 'User',
          role: userData?.role || 'user',
          photoURL: firebaseUser.photoURL || userData?.photoURL || undefined,
        };

        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize recaptcha verifier
  const initializeRecaptcha = (): RecaptchaVerifier => {
    // Clean up existing verifier if any
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore cleanup errors
      }
      recaptchaVerifier = null;
    }

    // Remove any existing container to ensure clean state
    const existingContainer = document.getElementById('recaptcha-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create a new container - must be in DOM and accessible for invisible reCAPTCHA
    const container = document.createElement('div');
    container.id = 'recaptcha-container';
    // For invisible reCAPTCHA, container should exist but can be hidden
    // Using a more standard approach that Firebase recognizes
    container.style.cssText = 'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(container);

    // Create new verifier with proper configuration
    try {
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          // Response expired - need to re-verify
          console.log('reCAPTCHA expired');
          if (recaptchaVerifier) {
            try {
              recaptchaVerifier.clear();
            } catch (e) {
              // Ignore cleanup errors
            }
            recaptchaVerifier = null;
          }
        },
      });
    } catch (error: any) {
      console.error('reCAPTCHA initialization error:', error);
      // Clean up container on error
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifier = null;
      }
      throw new Error('Failed to initialize phone verification. Please refresh the page and try again.');
    }

    return recaptchaVerifier;
  };

  // Email/Password Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  // Email/Password Signup
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  // Google Sign-in
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create user document for new users
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update existing user document
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            photoURL: firebaseUser.photoURL,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      return true;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle unauthorized domain error specifically
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        throw new Error(
          `This domain (${currentDomain}) is not authorized for Google Sign-In. ` +
          `Please add it to Firebase Console → Authentication → Settings → Authorized domains. ` +
          `Or contact the administrator to fix this issue.`
        );
      }
      
      // Handle other common errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      }
      
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
      }
      
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  // Send OTP to phone
  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      // Format phone number (ensure it starts with +)
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

      // Validate phone number format (should be E.164 format)
      if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
        throw new Error('Invalid phone number format. Please include country code (e.g., +91 for India)');
      }

      // Clean up any existing verifier first
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifier = null;
      }

      // Remove any existing container
      const existingContainer = document.getElementById('recaptcha-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize recaptcha
      const verifier = initializeRecaptcha();

      // Wait for reCAPTCHA to be ready - invisible reCAPTCHA needs time to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send OTP
      confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);

      return true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Clean up recaptcha on error
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        recaptchaVerifier = null;
      }
      
      // Provide user-friendly error messages
      if (error.code === 'auth/invalid-app-credential') {
        const errorMsg = `Phone authentication configuration error. Please ensure:
1. 'localhost' is added to Authorized domains in Firebase Console (Authentication → Settings → Authorized domains)
2. Your API key is not restricted in Google Cloud Console
3. Phone Authentication is enabled in Firebase Console

For detailed steps, see FIREBASE_PHONE_AUTH_FIX.md`;
        console.error(errorMsg);
        throw new Error('Phone authentication is not properly configured. Please check the browser console for detailed instructions.');
      } else if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please include country code (e.g., +91 for India).');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.code === 'auth/quota-exceeded') {
        throw new Error('SMS quota exceeded. Please try again later or contact support.');
      }
      
      throw new Error(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  // Login with Phone + Password
  const loginWithPhone = async (phone: string, password: string): Promise<boolean> => {
    try {
      // Format phone number
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Find user by phone in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No account found with this phone number');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // Get the email associated with this phone (we store it during signup)
      if (!userData.email) {
        throw new Error('Account not properly set up. Please contact support.');
      }
      
      // Login with email and password
      await signInWithEmailAndPassword(auth, userData.email, password);
      
      return true;
    } catch (error: any) {
      console.error('Phone login error:', error);
      throw new Error(error.message || 'Invalid phone number or password');
    }
  };

  // Signup with Phone OTP + Password
  const signupWithPhone = async (phone: string, name: string, password: string, otp: string): Promise<boolean> => {
    try {
      if (!confirmationResult) {
        throw new Error('OTP not sent. Please send OTP first.');
      }

      // Verify OTP
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const formattedPhone = firebaseUser.phoneNumber || phone;

      // Create email account using phone number (for Firebase Auth)
      // Format: phone_1234567890@handycraft.temp
      const email = `phone_${formattedPhone.replace(/\D/g, '')}@handycraft.temp`;
      
      // Check if email already exists
      try {
        // Try to create account with email/password
        const emailCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile
        await updateProfile(emailCredential.user, { displayName: name });
        
        // Sign out from phone auth and sign in with email
        await signOut(auth);
        await signInWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', emailCredential.user.uid), {
          name,
          phone: formattedPhone,
          email, // Store the temp email for login
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (emailError: any) {
        // If email already exists, just update the user
        if (emailError.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, email, password);
          const currentUser = auth.currentUser;
          if (currentUser) {
            await updateProfile(currentUser, { displayName: name });
            await setDoc(
              doc(db, 'users', currentUser.uid),
              {
                name,
                phone: formattedPhone,
                email,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        } else {
          throw emailError;
        }
      }

      // Clean up
      confirmationResult = null;
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }

      return true;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error.message || 'Invalid OTP or failed to create account');
    }
  };

  // Forget Password - Send OTP to phone
  const forgetPassword = async (phone: string): Promise<boolean> => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Find user by phone
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No account found with this phone number');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.email) {
        throw new Error('Account not properly set up. Please contact support.');
      }
      
      // Send password reset email (Firebase will handle this)
      await sendPasswordResetEmail(auth, userData.email);
      
      // Also send OTP for verification
      await sendOTP(formattedPhone);
      
      return true;
    } catch (error: any) {
      console.error('Forget password error:', error);
      throw new Error(error.message || 'Failed to send reset instructions');
    }
  };

  // Reset Password with OTP verification
  const resetPassword = async (phone: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      if (!confirmationResult) {
        throw new Error('OTP not sent. Please request password reset first.');
      }

      // Verify OTP
      await confirmationResult.confirm(otp);
      
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // Find user by phone
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', formattedPhone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('No account found with this phone number');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.email) {
        throw new Error('Account not properly set up.');
      }
      
      // Sign in with email to update password
      // Note: In production, you'd use Firebase Admin SDK to update password
      // For now, we'll use the email link method
      // User needs to click the email link to reset password
      throw new Error('Please check your email for password reset link. OTP verified successfully.');
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  // Update User Profile
  const updateUserProfile = async (updates: { name?: string; email?: string; phone?: string }): Promise<void> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update Firebase Auth profile
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
      }

      // Update Firestore
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };
      
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;

      await setDoc(
        doc(db, 'users', currentUser.uid),
        updateData,
        { merge: true }
      );

      // Refresh user data from Firestore to update the state
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      const userObj: User = {
        id: currentUser.uid,
        email: currentUser.email || userData?.email || undefined,
        phone: userData?.phone || currentUser.phoneNumber || undefined,
        name: userData?.name || currentUser.displayName || 'User',
        role: userData?.role || 'user',
        photoURL: currentUser.photoURL || userData?.photoURL || undefined,
      };

      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('User not authenticated');
      }

      // Verify current password by attempting to sign in
      await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);
      
      // Note: Firebase doesn't provide a direct way to change password in client SDK
      // User needs to use sendPasswordResetEmail or we need Firebase Admin SDK
      // For now, we'll use the email method
      await sendPasswordResetEmail(auth, currentUser.email);
      throw new Error('Password reset email sent. Please check your email to set a new password.');
    } catch (error: any) {
      console.error('Change password error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Current password is incorrect');
      }
      throw new Error(error.message || 'Failed to change password');
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('wishlist');
      
      // Clean up recaptcha
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }
      confirmationResult = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        signInWithGoogle,
        loginWithPhone,
        signupWithPhone,
        sendOTP,
        forgetPassword,
        resetPassword,
        updateUserProfile,
        changePassword,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
