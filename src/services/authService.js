import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

/**
 * Authentication Service
 * Handles Firebase Authentication and Backend Auth Integration
 */

class AuthService {
  constructor() {
    this.googleProvider = new GoogleAuthProvider();
  }

  // ============= FIREBASE AUTH METHODS =============

  /**
   * Register new user with email and password
   */
  async register(email, password, userData) {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Register in backend with user data
      const response = await api.post('/auth/register', {
        firebaseUid: user.uid,
        email: user.email,
        ...userData
      });

      return {
        user,
        backendUser: response.data,
        needsEmailVerification: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          user,
          needsEmailVerification: true,
          message: 'Please verify your email before signing in'
        };
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Verify with backend and get user data
      const response = await api.post('/auth/verify-token', {
        idToken
      });

      return {
        user,
        backendUser: response.data,
        needsEmailVerification: false
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Check if user exists in backend, if not register
      const response = await api.post('/auth/google', {
        idToken,
        displayName: user.displayName,
        photoURL: user.photoURL
      });

      return {
        user,
        backendUser: response.data,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Setup phone authentication (for 2FA)
   */
  setupPhoneAuth(phoneNumber, recaptchaContainerId) {
    try {
      // Create RecaptchaVerifier
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          recaptchaContainerId,
          {
            size: 'invisible',
            callback: () => {
              console.log('Recaptcha verified');
            }
          }
        );
      }

      // Send verification code
      return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    } catch (error) {
      console.error('Phone auth setup error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify phone number with SMS code
   */
  async verifyPhoneCode(confirmationResult, code) {
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      console.error('Phone verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Link phone number to existing account (for 2FA)
   */
  async linkPhoneNumber(phoneNumber, verificationCode) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      const credential = PhoneAuthProvider.credential(
        window.confirmationResult.verificationId,
        verificationCode
      );

      const result = await linkWithCredential(user, credential);
      
      // Update backend
      await api.post('/auth/link-phone', {
        phoneNumber: result.user.phoneNumber
      });

      return result.user;
    } catch (error) {
      console.error('Phone linking error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await signOut(auth);
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update password (requires recent authentication)
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No user signed in');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(displayName, photoURL) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      await updateProfile(user, { displayName, photoURL });
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user signed in');

      await sendEmailVerification(user);
      return { message: 'Verification email sent' };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user's ID token
   */
  async getIdToken(forceRefresh = false) {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      return await user.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Get ID token error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!auth.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  // ============= BACKEND AUTH METHODS =============

  /**
   * Verify Firebase token with backend
   */
  async verifyTokenWithBackend(idToken) {
    try {
      const response = await api.post('/auth/verify-token', { idToken });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  /**
   * Complete user registration on backend
   */
  async completeRegistration(userData) {
    try {
      const response = await api.post('/auth/complete-registration', userData);
      return response.data;
    } catch (error) {
      console.error('Complete registration error:', error);
      throw error;
    }
  }

  /**
   * Refresh backend session
   */
  async refreshSession() {
    try {
      const idToken = await this.getIdToken(true);
      const response = await api.post('/auth/refresh', { idToken });
      return response.data;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  }

  // ============= ERROR HANDLING =============

  /**
   * Handle Firebase auth errors
   */
  handleAuthError(error) {
    const errorCode = error.code;
    let message = error.message;

    switch (errorCode) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operation not allowed';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Use at least 6 characters';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed';
        break;
      case 'auth/cancelled-popup-request':
        message = 'Sign-in was cancelled';
        break;
      case 'auth/requires-recent-login':
        message = 'Please sign in again to continue';
        break;
      default:
        message = error.message || 'Authentication error occurred';
    }

    return {
      code: errorCode,
      message,
      originalError: error
    };
  }
}

// Export singleton instance
export default new AuthService();