import type { ServiceAccount } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

function getEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return process.env[key];
}

const serviceAccountKey = getEnv('FIREBASE_SERVICE_ACCOUNT_KEY');

if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined');
}

let serviceAccount: ServiceAccount;

try {
  // Check if the key is a path to a file (local dev usually)
  // or a JSON string (deployment envs like Coolify)
  if (serviceAccountKey.startsWith('{')) {
    serviceAccount = JSON.parse(serviceAccountKey);
  } else {
    // We can't verify file existence easily in client-builds, but this code runs on server.
    // However, dynamic imports of JSON outside the build graph can be tricky in some bundlers.
    // For now, in Node adapter, we just assume it's a relative path if not JSON.
    // BUT: In pure ESM/Astro, reading files dynamically can be hard.
    // SAFEST BET: Read the file content if it behaves like a file path, or easier:
    // Require user to pass content in ENV for prod, file for dev logic is tricky without 'fs'.

    // Actually, for simplicity in Astro Node adapter:
    // We will use standard 'fs' to read it if it's a file path.
    const fs = await import('fs');
    const path = await import('path');

    // Resolve relative to CWD (project root usually)
    const keyPath = path.resolve(process.cwd(), serviceAccountKey);
    const fileContent = fs.readFileSync(keyPath, 'utf-8');
    serviceAccount = JSON.parse(fileContent);
  }
} catch (error) {
  console.error('FAILED to load Firebase Service Account Key:', error);
  throw new Error('Invalid Firebase Service Account configuration.');
}

const firebaseConfig = {
  credential: cert(serviceAccount),
  databaseURL: getEnv('FIREBASE_DATABASE_URL'),
};

// Singleton pattern to avoid re-initialization errors in dev (HMR)
const apps = getApps();
const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];

export const db = getDatabase(app);
