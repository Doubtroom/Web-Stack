import admin from "firebase-admin";
import serviceAccount from "./doubt-room-6679c-firebase-adminsdk-fbsvc-04328facac.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authAdmin = admin.auth();
export default authAdmin;
