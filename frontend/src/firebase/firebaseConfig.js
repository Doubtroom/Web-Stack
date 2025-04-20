import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import config from "../config/config.js";

// for local testing
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseBucketId,
    messagingSenderId: config.firebaseSenderId,
    appId: config.firebaseAppId,
    measurementId: config.firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);

// Initialize App Check
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(config.recaptchaSitekey),
    isTokenAutoRefreshEnabled: true,
});

export default app;