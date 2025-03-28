import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import app from './firebaseConfig.js'

const API_URL = "http://localhost:5000";


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
      console.log("User logged out");
    } catch (error) {
      throw error;
    }
  }

  async sendOtp (email){
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      return response.data.message;
    } catch (error) {
      throw error.response.data.message || "Error sending OTP";
    }
  }
  
  async verifyOtp(email, otp){
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      return response.data.message;
    } catch (error) {
      throw error.response.data.message || "OTP verification failed";
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

}


const authService = new AuthService();
export default authService;
