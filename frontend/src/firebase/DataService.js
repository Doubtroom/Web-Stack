import app from './firebaseConfig';
import { getFirestore, collection, addDoc, getDoc, getDocs, doc } from 'firebase/firestore';
import { storage } from '../appwrite/appwriteConfig';
import { ID } from 'appwrite';
import config from '../config/config';

class DataService {
  constructor(collectionName) {
    const db = getFirestore(app);
    this.collectionRef = collection(db, collectionName);
  }

  async uploadImage(file) {
    try {
      const response = await storage.createFile(
        config.appwriteBucketId,
        ID.unique(),
        file 
        );

      const fileUrl = storage.getFileView(config.appwriteBucketId, response.$id);
      
      return fileUrl;
    } catch (error) {
      console.error('Error uploading image: ', error);
      throw error;
    }
  }

  async addQuestion(data) {
    try {
      let photoUrl = null;
      if (data.image) {
        photoUrl = await this.uploadImage(data.image);
      }

      const questionData = {
        text: data.question,
        topic: data.topic,
        branch: data.branch,
        photo: photoUrl,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(this.collectionRef, questionData);
      console.log('Question added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding question: ', error);
      throw error;
    }
  }

  async addDocument(data) {
    try {
      const docRef = await addDoc(this.collectionRef, data);
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  }

  async getDocumentById(docId) {
    try {
      const docRef = doc(this.collectionRef, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
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
      throw error;
    }
  }
}

export default DataService;