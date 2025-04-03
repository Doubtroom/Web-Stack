import app from './firebaseConfig';
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, query, where, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { storage } from '../appwrite/appwriteConfig';
import { ID } from 'appwrite';
import config from '../config/config';

class DataService {
  constructor(collectionName) {
    const db = getFirestore(app);
    this.collectionRef = collection(db, collectionName);
    this.db = db;
  }

  async uploadImage(file) {
    try {
      const fileId = ID.unique();
      const response = await storage.createFile(
        config.appwriteBucketId,
        fileId,
        file 
      );

      const fileUrl = storage.getFileView(config.appwriteBucketId, response.$id);
      
      return {
        url: fileUrl,
        fileId: response.$id
      };
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    }
  }

  async deleteImage(fileId) {
    try {
      if (!fileId) return; // Skip if no fileId provided
      await storage.deleteFile(config.appwriteBucketId, fileId);
    } catch (error) {
      // If the file doesn't exist, we can consider it as already deleted
      if (error.code === 404) {
        console.log('File already deleted or not found');
        return;
      }
      console.error('Error deleting image: ', error);
      throw error;
    }
  }

  async addQuestion(data) {
    try {
      const questionData = {
        text: data.question,
        topic: data.topic,  
        branch: data.branch,
        photo: data.photo || null,
        photoId: data.photoId || null,
        collegeName: data.collegeName,
        postedBy: data.postedBy,
        createdAt: new Date().toISOString(),
        answers: 0
      };

      const docRef = await addDoc(this.collectionRef, questionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding question: ', error);
      throw error;
    }
  }

  async addDocument(data) {
    try {
      const docRef = await addDoc(this.collectionRef, data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  }

  async updateDocument(docId, data) {
    try {
      const docRef = doc(this.collectionRef, docId);
      await updateDoc(docRef, data);
      return docId;
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  }

  async deleteDocument(docId) {
    try {
      const docRef = doc(this.collectionRef, docId);
      await deleteDoc(docRef);
      return docId;
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  }

  async getDocumentById(docId) {
    try {
      const docRef = doc(this.collectionRef, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      if (error.code === 'unavailable' || error.code === 'failed-precondition') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const docRef = doc(this.collectionRef, docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
          }
        } catch (retryError) {
          console.error('Error on retry: ', retryError);
        }
      }
      throw error;
    }
  }

  async getAllDocuments() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return documents;
    } catch (error) {
      console.error('Error getting documents: ', error);
      // Check if it's a connection error
      if (error.code === 'unavailable' || error.code === 'failed-precondition') {
        // Retry once after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const querySnapshot = await getDocs(this.collectionRef);
          const documents = [];
          querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          return documents;
        } catch (retryError) {
          console.error('Error on retry: ', retryError);
        }
      }
      throw error;
    }
  }

  async getUserData(uid) {
    try {
      const docRef = doc(this.collectionRef, uid);
      const res = await getDoc(docRef);
      return res.data();
    } catch (error) {
      console.error("Error from getUserData::authService", error);
      throw error;
    }
  }

  async getAnswersByQuestionId(questionId) {
    try {
      const answersCollection = collection(this.db, 'answers');
      const q = query(answersCollection, where('questionId', '==', questionId));
      const querySnapshot = await getDocs(q);
      const answers = [];
      querySnapshot.forEach((doc) => {
        answers.push({ id: doc.id, ...doc.data() });
      });
      return answers;
    } catch (error) {
      console.error('Error getting answers: ', error);
      // Check if it's a connection error
      if (error.code === 'unavailable' || error.code === 'failed-precondition') {
        // Retry once after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const answersCollection = collection(this.db, 'answers');
          const q = query(answersCollection, where('questionId', '==', questionId));
          const querySnapshot = await getDocs(q);
          const answers = [];
          querySnapshot.forEach((doc) => {
            answers.push({ id: doc.id, ...doc.data() });
          });
          return answers;
        } catch (retryError) {
          console.error('Error on retry: ', retryError);
        }
      }
      throw error;
    }
  }

  async getCommentsByAnswerId(answerId) {
    try {
      const commentsRef = collection(this.db, 'comments');
      const q = query(commentsRef, where('answerId', '==', answerId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      // If the error is due to missing index, return empty array
      if (error.code === 'failed-precondition') {
        console.log('Index is still building, returning empty array');
        return [];
      }
      throw error;
    }
  }

  async searchQuestions(searchTerm) {
    try {
      const questionsRef = collection(this.db, 'questions');
      const q = query(
        questionsRef,
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      // Filter questions based on search term
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(question => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (question.question && question.question.toLowerCase().includes(searchLower)) ||
            (question.topic && question.topic.toLowerCase().includes(searchLower)) ||
            (question.branch && question.branch.toLowerCase().includes(searchLower))
          );
        });
    } catch (error) {
      console.error('Error searching questions:', error);
      throw error;
    }
  }

  async searchAnswers(searchTerm) {
    try {
      const answersRef = collection(this.db, 'answers');
      const q = query(
        answersRef,
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(answer => 
          answer.text?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
      console.error('Error searching answers:', error);
      throw error;
    }
  }

  async searchComments(searchTerm) {
    try {
      const commentsRef = collection(this.db, 'comments');
      const q = query(
        commentsRef,
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(comment => 
          comment.text?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } catch (error) {
      console.error('Error searching comments:', error);
      throw error;
    }
  }

  async deleteAllFiles(){
    try {
      const files = await storage.listFiles(config.appwriteBucketId);
      
      for (const file of files.files) {
          await storage.deleteFile(config.appwriteBucketId, file.$id);
          console.log(`Deleted file: ${file.$id}`);
      }

      console.log("All files deleted successfully!");
  } catch (error) {
      console.error("Error deleting files:", error);
  }
  }
}

export default DataService;