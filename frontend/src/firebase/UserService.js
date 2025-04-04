import app from './firebaseConfig';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

class UserService {
    constructor() {
        this.db = getFirestore(app);
        this.auth = getAuth(app);
    }

    checkAuth() {
        const user = this.auth.currentUser;
        if (!user) {
            throw new Error('User must be authenticated to perform this operation');
        }
        return user;
    }

    async saveUserProfile(userId, userData) {
        this.checkAuth();
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
                createdAt: new Date().toISOString(),
                email:userData.email
            });
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }
}

export default new UserService(); 