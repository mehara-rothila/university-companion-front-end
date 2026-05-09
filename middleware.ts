import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/signup') ||
                     req.nextUrl.pathname.startsWith('/forgot-password') ||
                     req.nextUrl.pathname.startsWith('/reset-password')

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup', 
    '/forgot-password',
    '/reset-password',
    '/privacy',
    '/help'
  ]
  
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith('/auth/') ||
    req.nextUrl.pathname.startsWith('/test-login')
  )

  // If user is authenticated (NextAuth cookie) and tries to access auth pages, redirect to dashboard
  const hasNextAuthCookie = req.cookies.has('next-auth.session-token') || req.cookies.has('__Secure-next-auth.session-token')
  if (isAuthPage && hasNextAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // NOTE: Local auth users are validated client-side via AuthGuard.tsx.
  // This middleware only handles NextAuth OAuth session redirects.
  // We do NOT block local auth users here because their token is in localStorage,
  // which middleware cannot access. Rely on AuthGuard for comprehensive protection.

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}