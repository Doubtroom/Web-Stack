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
            // Validate userId
            if (!userId || typeof userId !== 'string') {
                console.error('Invalid userId:', userId);
                throw new Error('Invalid user ID provided');
            }

            const userRef = doc(this.db, 'users', userId);
            
            // Ensure all fields are properly formatted
            const formattedData = {
                name: userData?.displayName || userData?.name || '',
                branch: userData?.branch || '',
                studyType: userData?.studyType || '',
                phone: userData?.phone || null,
                gender: userData?.gender || '',
                role: userData?.role || '',
                collegeName: userData?.collegeName || '',
                dob: userData?.dob || null,
                createdAt: new Date().toISOString(),
                email: userData?.email || ''
            };

            // Validate and format the date if it exists
            if (formattedData.dob) {
                try {
                    // Ensure the date is in a valid format
                    const date = new Date(formattedData.dob);
                    if (isNaN(date.getTime())) {
                        formattedData.dob = null;
                    } else {
                        formattedData.dob = date.toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.warn('Invalid date format, setting to null:', error);
                    formattedData.dob = null;
                }
            }

            await setDoc(userRef, formattedData);
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    }
}

export default new UserService(); 