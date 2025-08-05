// src/services/firebase.js - CON PERSISTENCIA MEJORADA
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Tu configuración de Firebase (NO CAMBIES ESTO)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore (la base de datos)
export const db = getFirestore(app);

// Inicializar Firebase Auth
export const auth = getAuth(app);

// Configurar persistencia mejorada
const configurarPersistencia = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('✅ Persistencia de autenticación configurada correctamente');
  } catch (error) {
    console.error('❌ Error configurando persistencia:', error);
  }
};

// Ejecutar configuración inmediatamente
configurarPersistencia();

export default app;