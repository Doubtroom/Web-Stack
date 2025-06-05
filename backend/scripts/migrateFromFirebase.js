import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import mongoose from 'mongoose';
import Questions from '../models/Questions.js';
import Answers from '../models/Answers.js';
import Comments from '../models/Comments.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Firebase configuration
const firebaseConfig = {
    // Your Firebase config here
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Helper function to transform timestamp to Date
const transformTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    return new Date(timestamp);
};

// Migrate Users
const migrateUsers = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];

        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            // Generate a random password for each user
            
            users.push({
                firebaseId: doc.id,  // Store Firebase ID in a separate field
                email: data.email,
                password: "FIREBASE", // Set a temporary password
                displayName: data.name,
                photoURL: data.photoURL || '',
                photoId:"",
                isVerified: true,
                branch: data.branch,
                studyType: data.studyType,
                phone: data.phone || null,
                gender: data.gender,
                role: data.role,
                collegeName: data.collegeName,
                dob: data.dob,
                createdAt: transformTimestamp(data.createdAt),
                provider: data.provider || 'email'
            });
        }

        if (users.length > 0) {
            // Insert users one by one to handle errors better
            for (const user of users) {
                try {
                    await User.create(user);
                    console.log(`Migrated user: ${user.email}`);
                } catch (error) {
                    console.error(`Error migrating user ${user.email}:`, error.message);
                }
            }
            console.log(`Migration completed for ${users.length} users`);
        }
    } catch (error) {
        console.error('Error migrating users:', error);
    }
};

// Migrate Questions
const migrateQuestions = async () => {
    try {
        const questionsSnapshot = await getDocs(collection(db, 'questions'));
        const questions = [];

        for (const doc of questionsSnapshot.docs) {
            const data = doc.data();
            questions.push({
                firebaseId: doc.id,
                text: data.text,
                topic: data.topic,
                branch: data.branch,
                collegeName: data.collegeName,
                photoUrl:data.photo==null?'':data.photo,
                photoId:'',
                firebasePostedBy: data.postedBy,
                noOfAnswers: data.noOfAnswers || 0,
                createdAt: transformTimestamp(data.createdAt),
                updatedAt: transformTimestamp(data.updatedAt)
            });
        }
        // console.log(questions)

        if (questions.length > 0) {
            await Questions.insertMany(questions);
            console.log(`Migrated ${questions.length} questions`);
        }
    } catch (error) {
        console.error('Error migrating questions:', error);
    }
};

// Migrate Answers
const migrateAnswers = async () => {
    try {
        const answersSnapshot = await getDocs(collection(db, 'answers'));
        const answers = [];

        for (const doc of answersSnapshot.docs) {
            const data = doc.data();
            answers.push({
                firebaseId: doc.id,
                text: data.text==null?'':data.text,
                firebaseQuestionId: data.questionId,
                photoUrl: data.photo==null?'':data.photo,
                photoId: data.photoId || '',
                firebasePostedBy: data.postedBy,
                createdAt: transformTimestamp(data.createdAt)
            });
        }

        if (answers.length > 0) {
            await Answers.insertMany(answers);
            console.log(`Migrated ${answers.length} answers`);
        }
    } catch (error) {
        console.error('Error migrating answers:', error);
    }
};

// Migrate Comments
const migrateComments = async () => {
    try {
        const commentsSnapshot = await getDocs(collection(db, 'comments'));
        const comments = [];

        for (const doc of commentsSnapshot.docs) {
            const data = doc.data();
            comments.push({
                firebaseId: doc.id,
                text: data.text,
                firebaseAnswerId: data.answerId,
                firebasePostedBy: data.postedBy,
                createdAt: transformTimestamp(data.createdAt),
            });
        }

        if (comments.length > 0) {
            await Comments.insertMany(comments);
            console.log(`Migrated ${comments.length} comments`);
        }
    } catch (error) {
        console.error('Error migrating comments:', error);
    }
};

// Main migration function
const migrateData = async () => {
    try {
        console.log('Starting migration...');
        
        // Clear existing data (optional)
        // await Questions.deleteMany({});
        // await Answers.deleteMany({});
        // await Comments.deleteMany({});
        // await User.deleteMany({});

        // Run migrations
        // await migrateQuestions();
        // await migrateAnswers();
        await migrateComments();
        // await migrateUsers();

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

// Run migration
migrateData(); 