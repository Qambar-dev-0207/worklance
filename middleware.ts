import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/jobs',
  '/hackathons',
  '/hr-database',
  '/interview-prep',
  '/resume-builder',
  '/resume',
  '/profile',
];

function isSessionValid(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false; // Expired session
    }
    return Boolean(payload.userId || payload.email);
  } catch (e) {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get('worklance_token')?.value;
  const hasValidSession = isSessionValid(token);

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If attempting to access a protected page without an active session
  if (isProtected && !hasValidSession) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    const response = NextResponse.redirect(loginUrl);
    // Clear any invalid/expired token cookie
    if (token) {
      response.cookies.set('worklance_token', '', { path: '/', maxAge: 0 });
    }
    return response;
  }

  // If already logged in and visiting login or register, redirect to /jobs
  if ((pathname === '/login' || pathname === '/register') && hasValidSession) {
    const destination = req.nextUrl.searchParams.get('redirect') || '/jobs';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/jobs',
    '/jobs/:path*',
    '/hackathons',
    '/hackathons/:path*',
    '/hr-database',
    '/hr-database/:path*',
    '/interview-prep',
    '/interview-prep/:path*',
    '/resume-builder',
    '/resume-builder/:path*',
    '/resume',
    '/resume/:path*',
    '/profile',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
