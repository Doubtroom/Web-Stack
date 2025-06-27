import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Get the users collection
            const usersCollection = mongoose.connection.collection('users');
            
            // Count total users
            const totalUsers = await usersCollection.countDocuments();
            console.log('Total users:', totalUsers);
            
            // Count users with firebaseId
            const firebaseUsers = await usersCollection.countDocuments({ firebaseId: { $ne: null } });
            console.log('Users with firebaseId:', firebaseUsers);
            
            // Count users without firebaseId
            const nonFirebaseUsers = await usersCollection.countDocuments({ firebaseId: null });
            console.log('Users without firebaseId:', nonFirebaseUsers);
            
            // Close the connection
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Error checking users:', error);
            await mongoose.connection.close();
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    }); 