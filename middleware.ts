import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/library', '/schedule']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Define public routes
  const publicRoutes = ['/', '/api', '/favicon.ico']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Define auth routes
  const isAuthRoute = pathname.startsWith('/auth')

  // Redirect unauthenticated users from protected routes to signin
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/auth/signin', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated && pathname !== '/auth/signout') {
    const dashboardUrl = new URL('/dashboard', req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Allow public routes to proceed
  return NextResponse.next()
})

// Configure matcher to exclude API routes, static files, and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API routes)
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
