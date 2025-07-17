import {initializeApp, getApp, getApps, App} from 'firebase-admin/app';
import {credential} from 'firebase-admin';

const serviceKey = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

const appName = 'firebase-frameworks';
const app =
  getApps().find(app => app?.name === appName) ||
  initializeApp(
    {
      credential: credential.cert(serviceKey),
    },
    appName
  );

export const customInitApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  const newApp = initializeApp({
    credential: credential.cert(serviceKey),
  });

  return newApp;
};

export const adminDb = getFirestore(app);
import {getFirestore} from 'firebase-admin/firestore';
