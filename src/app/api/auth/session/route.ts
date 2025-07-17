import {auth} from 'firebase-admin';
import {customInitApp} from '@/lib/firebase-admin';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

customInitApp();

export async function POST(request: NextRequest, response: NextResponse) {
  const authorization = request.headers.get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(idToken);

    if (decodedToken) {
      const expiresIn = 60 * 60 * 24 * 5 * 1000;
      const sessionCookie = await auth().createSessionCookie(idToken, {
        expiresIn,
      });
      const options = {
        name: 'firebase-session',
        value: sessionCookie,
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
      };

      cookies().set(options);
    }
  }

  return NextResponse.json({}, {status: 200});
}
