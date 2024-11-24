import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Use runtime configuration instead of environment variables
const firebaseConfig = window.RUNTIME_CONFIG.firebase;

// Log config for debugging (excluding sensitive data)
console.log('Firebase initialization with:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set language
auth.useDeviceLanguage();

console.log('Firebase initialized successfully');

export { auth };
export default app;
