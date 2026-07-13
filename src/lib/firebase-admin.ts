export async function getFirebaseAdmin() {
  try {
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");
    const { getDatabase } = await import("firebase-admin/database");

    const apps = getApps();
    let app;

    if (!apps.length) {
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
          // If no credentials configured, log and return null
          console.warn("No Firebase Service Account credentials found in environment variables.");
          return null;
        }
      }
    } else {
      app = apps[0];
    }

    return {
      adminAuth: getAuth(app),
      adminDatabase: getDatabase(app)
    };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}
