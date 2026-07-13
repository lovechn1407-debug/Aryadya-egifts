import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

const apps = getApps();
let app;

if (!apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
      });
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
          databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
        });
      } else {
        // Fallback to application default credentials if available
        app = initializeApp({
          databaseURL: "https://aradhya-egifts-default-rtdb.firebaseio.com"
        });
      }
    }
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
  }
} else {
  app = apps[0];
}

export const adminAuth = getAuth(app);
export const adminDatabase = getDatabase(app);
