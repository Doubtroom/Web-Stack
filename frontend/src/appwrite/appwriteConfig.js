import { Client, Storage } from 'appwrite';
import config from '../config/config';

const client = new Client()
    .setEndpoint(config.appwriteEndpoint) 
    .setProject(config.appwriteProjectId)

const storage = new Storage(client);

export { storage }; 
