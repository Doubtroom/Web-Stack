import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  deleteUser,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import axios from "axios";
import app from './firebaseConfig.js'

const API_URL = import.meta.env.VITE_API_URL;

const googleProvider = new GoogleAuthProvider();

class AuthService {
  auth

  constructor() {
    this.auth = getAuth(app);
  }
  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      const user = result.user;
      
      // Store user data in localStorage
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign up was cancelled. Please try again if you want to continue.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error("Another sign in attempt is in progress. Please wait.");
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error("Pop-up was blocked by your browser. Please allow pop-ups for this site.");
      } else {
        throw new Error(error.message || "Failed to sign in with Google");
      }
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw error;
    }
  }

  async sendOtp(email) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      return response.data.message;
    } catch (error) {
      throw error.response?.data?.message || "Error sending OTP";
    }
  }
  
  async verifyOtp(email, otp) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      return response.data.message;
    } catch (error) {
      throw error.response?.data?.message || "OTP verification failed";
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async deleteUserByEmail(email) {
    try {
        const response = await axios.post(`${API_URL}/api/admin/delete-user`, { email });
        return response.data.message;
    } catch (error) {
      console.error("Error deleting user by email:", error.response?.data?.error || error.message);
      throw new Error(error.response?.data?.error || "Error deleting user.");
    }
  }

  async checkEmailExists(email) {
    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, email);
      return methods;
    } catch (error) {
      console.error("Error checking email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      console.error("Error in AuthService :: sendPasswordResetEmail()", error);
      return { success: false, error };
    }
  }

  async sendEmailVerification(user) {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error("Error in AuthService :: sendEmailVerification()", error);
    }
  }
}

const authService = new AuthService();
export default authService;
