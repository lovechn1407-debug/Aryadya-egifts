import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Identify domains
  const isCreatorSubdomain = hostname.startsWith('creator.');
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  // 1. Redirect users trying to access /creator on the main domain
  if (url.pathname.startsWith('/creator')) {
    // If not local and not on the subdomain, redirect to the new subdomain
    if (!isCreatorSubdomain && !isLocalhost) {
      // Remove '/creator' from path, e.g., /creator/dashboard -> /dashboard
      const newPath = url.pathname.replace(/^\/creator/, '') || '/';
      const redirectUrl = new URL(`https://creator.aradhyagifts.in${newPath}`);
      redirectUrl.search = url.search;
      return NextResponse.redirect(redirectUrl, 308); // 308 Permanent Redirect
    }
  }

  // 2. Route subdomain traffic internally to the /creator folder
  if (isCreatorSubdomain) {
    if (url.pathname.startsWith('/creator')) {
      // If the URL explicitly contains /creator on the subdomain, redirect to strip it
      const newPath = url.pathname.replace(/^\/creator/, '') || '/';
      const redirectUrl = new URL(`https://creator.aradhyagifts.in${newPath}`);
      redirectUrl.search = url.search;
      return NextResponse.redirect(redirectUrl, 308);
    } else {
      // Rewrite clean URL to internal folder
      url.pathname = `/creator${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on paths that aren't static files, assets, or API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
