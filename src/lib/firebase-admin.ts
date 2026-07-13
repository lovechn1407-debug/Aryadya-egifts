import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
      });
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
          databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
        });
      } else {
        // Fallback to application default credentials if available
        admin.initializeApp({
          databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
        });
      }
    }
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
}

export const adminAuth = admin.auth();
export const adminDatabase = admin.database();
export default admin;
