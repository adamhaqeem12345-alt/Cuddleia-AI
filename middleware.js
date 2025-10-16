import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { rateLimiter } from './lib/security'

export default withAuth(
  function middleware(req) {
    // Rate limiting for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const ip = req.ip ?? '127.0.0.1'
      
      try {
        rateLimiter.consume(`api_${ip}`, 1)
      } catch (rateLimitError) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes
        if (
          req.nextUrl.pathname.startsWith('/auth') ||
          req.nextUrl.pathname.startsWith('/api/health') ||
          req.nextUrl.pathname === '/'
        ) {
          return true
        }

        // Protected routes require auth
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/api/:path*',
    '/auth/:path*'
  ]
}
