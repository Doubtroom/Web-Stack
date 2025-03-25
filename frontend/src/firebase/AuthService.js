import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { initializeApp } from "firebase/app";
import config from "../config/config.js";

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId:config.firebaseProjectId ,
  storageBucket:config.firebaseBucketId ,
  messagingSenderId:config.firebaseSenderId ,
  appId:config.firebaseAppId ,
  measurementId:config.firebaseMeasurementId ,
};

const app = initializeApp(firebaseConfig);
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
    console.log(firebaseConfig)
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
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return null;
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

  getCurrentUser() {
    return this.auth.currentUser;
  }

}


const authService = new AuthService();
export default authService;
