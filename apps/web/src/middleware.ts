import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    // Add custom logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes
        if (req.nextUrl.pathname.startsWith('/api/')) {
          // Allow auth endpoints
          if (req.nextUrl.pathname.startsWith('/api/auth/')) {
            return true;
          }
          // Allow payment webhooks
          if (req.nextUrl.pathname === '/api/subscription/webhook') {
            return true;
          }
          // Allow test endpoints
          if (req.nextUrl.pathname.startsWith('/api/test-')) {
            return true;
          }
          // Require auth for other API routes
          return !!token;
        }
        
        // Protect app routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        // Protect story generator route
        if (req.nextUrl.pathname.startsWith('/create-story/generator')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/billing/:path*',
    '/create-story/generator',
  ],
};