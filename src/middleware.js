import { NextResponse } from 'next/server';

export function middleware(request) {
  const authToken = request.cookies.get('auth_token');

  // Protéger la route /post-ad
  if (request.nextUrl.pathname === '/post-ad' && !authToken) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/post-ad']
}; 