import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/signup') ||
                       req.nextUrl.pathname.startsWith('/forgot-password') ||
                       req.nextUrl.pathname.startsWith('/reset-password')
    
    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not authenticated and tries to access protected pages, redirect to login
    if (!isAuthPage && !isAuth && req.nextUrl.pathname !== '/') {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
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

        // Allow access to public routes
        if (isPublicRoute) return true

        // For all other routes, user must be authenticated
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}