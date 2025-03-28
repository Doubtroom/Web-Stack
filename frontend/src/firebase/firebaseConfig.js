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

export default app