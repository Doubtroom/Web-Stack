import { Client, Storage } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
    .setProject('67e69c16002d92d38655');        // Replace with your Appwrite project ID

const storage = new Storage(client);

export { storage }; 
