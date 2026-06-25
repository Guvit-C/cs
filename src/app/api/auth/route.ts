import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('--- LOGIN ATTEMPT ---');
    console.log('Expected: [' + adminPassword + ']', 'Length:', adminPassword?.length);
    console.log('Got:      [' + password + ']', 'Length:', password?.length);
    if (password === adminPassword) {
      // Set an HTTP-only cookie that expires in 1 year
      const cookieStore = await cookies();
      cookieStore.set('session_token', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
