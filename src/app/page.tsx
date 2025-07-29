
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from 'firebase-admin';
import { customInitApp } from '@/lib/firebase-admin';
import HomePageClient from './HomePageClient';

// Initialize Firebase Admin SDK
customInitApp();

const verifySessionCookie = async (sessionCookie: string | undefined) => {
  if (!sessionCookie) {
    return false;
  }
  try {
    await auth().verifySessionCookie(sessionCookie, true);
    return true;
  } catch (error) {
    console.error('Session cookie verification failed:', error);
    return false;
  }
};

export default async function HomePage() {
  const sessionCookie = cookies().get('firebase-session')?.value;
  const isValidSession = await verifySessionCookie(sessionCookie);

  if (!isValidSession) {
    redirect('/login');
  }

  return <HomePageClient />;
}
