import { jwtDecode } from 'jwt-decode'
import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  { path: '/', whenAuthenticated: 'redirect' },
  { path: '/forgot-password', whenAuthenticated: 'redirect' },
  { path: '/reset-password', whenAuthenticated: 'redirect' },
  { path: '/confirm-send-email', whenAuthenticated: 'redirect' },
] as const

const adminRoutes = ['/services-types', '/agents'] as const

const REDIRECT_WHEN_NOT_LOGGED_IN = '/'

interface JWTTokenProps {
  role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
  exp: number
  canAccessDashboard?: boolean
  canAccessServices?: boolean
  canAccessFinancial?: boolean
}

function getResolvedPermissions(token: JWTTokenProps) {
  if (token.role === 'ADMIN') {
    return {
      canAccessDashboard: true,
      canAccessServices: true,
      canAccessFinancial: true,
    }
  }

  return {
    canAccessDashboard: token.canAccessDashboard ?? true,
    canAccessServices: token.canAccessServices ?? true,
    canAccessFinancial: token.canAccessFinancial ?? false,
  }
}

function getFallbackPrivateRoute(token: JWTTokenProps) {
  const permissions = getResolvedPermissions(token)

  if (permissions.canAccessDashboard) return '/dashboard'
  if (permissions.canAccessServices) return '/services'
  if (permissions.canAccessFinancial) return '/financial'

  return '/'
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find(route => route.path === path)

  let token: JWTTokenProps | null = null

  const authToken = request.cookies.get('@lexhub-auth')

  if (authToken) {
    token = jwtDecode(authToken.value)

    if (token && token.exp * 1000 < Date.now()) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = REDIRECT_WHEN_NOT_LOGGED_IN

      const response = NextResponse.redirect(redirectUrl)
      response.cookies.delete('@lexhub-auth')
      return response
    }
  }

  if (!authToken && publicRoute) return NextResponse.next()

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_LOGGED_IN
    return NextResponse.redirect(redirectUrl)
  }

  if (authToken && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = token ? getFallbackPrivateRoute(token) : '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  if (authToken && token) {
    if (adminRoutes.some(route => path.startsWith(route)) && token.role !== 'ADMIN') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = getFallbackPrivateRoute(token)
      return NextResponse.redirect(redirectUrl)
    }

    const permissions = getResolvedPermissions(token)

    if (path.startsWith('/dashboard') && !permissions.canAccessDashboard) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = getFallbackPrivateRoute(token)
      return NextResponse.redirect(redirectUrl)
    }

    if (path.startsWith('/services') && !path.startsWith('/services-types') && !permissions.canAccessServices) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = getFallbackPrivateRoute(token)
      return NextResponse.redirect(redirectUrl)
    }

    if (path.startsWith('/financial') && !permissions.canAccessFinancial) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = getFallbackPrivateRoute(token)
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (authToken && !publicRoute) {
    const response = NextResponse.next()

    response.cookies.set('@lexhub-auth', authToken.value, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|fonts|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
