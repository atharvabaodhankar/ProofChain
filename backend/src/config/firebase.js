const admin = require('firebase-admin');

let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp) {
    try {
      // In production, use service account key file or environment variables
      // For development, you can use the Firebase Admin SDK with service account
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message);
      // For development, you might want to continue without Firebase
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Continuing without Firebase in development mode');
      } else {
        throw error;
      }
    }
  }
  return firebaseApp;
};

const verifyFirebaseToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      }
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  admin
};