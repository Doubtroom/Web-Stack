import app from './firebaseConfig';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

class UserService {
    constructor() {
        this.db = getFirestore(app);
    }

    async saveUserProfile(userId, userData) {
        try {
            const userRef = doc(this.db, 'users', userId);
            await setDoc(userRef, {
                name: userData.displayName || '',
                branch: userData.branch,
                studyType: userData.studyType,
                phone: userData.phone,
                gender: userData.gender,
                role: userData.role,
                collegeName: userData.collegeName,
                createdAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }
}

export default new UserService(); 