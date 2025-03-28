const config={
    firebaseApiKey:String(import.meta.env.VITE_FIREBASE_API_KEY),
    firebaseAuthDomain:String(import.meta.env.VITE_AUTH_DOMIAN),
    firebaseProjectId:String(import.meta.env.VITE_PROJECT_ID),
    firebaseBucketId:String(import.meta.env.VITE_STORAGE_BUCKET),
    firebaseSenderId:String(import.meta.env.VITE_MESSAGING_SENDER_ID),
    firebaseAppId:String(import.meta.env.VITE_APP_ID),
    firebaseMeasurementId:String(import.meta.env.VITE_MEASUREMENT_ID),
    appwriteBucketId:String(import.meta.env.VITE_APPWRITE_BUCKET_ID)
}

export default config