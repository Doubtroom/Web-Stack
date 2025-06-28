import mongoose from 'mongoose'
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// MongoDB Configuration
const mongoConfig = {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/migration-db',
    options: {
        dbName: "migration-db"
    }
};

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

// MongoDB Connection Function
const connectMongoDB = async () => {
    try {
        await mongoose.connect(mongoConfig.uri, mongoConfig.options);
        console.log('Connected to MongoDB');
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Export configurations and connections
export {
    mongoConfig,
    firebaseConfig,
    firebaseApp,
    firestore,
    connectMongoDB
};