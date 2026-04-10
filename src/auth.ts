import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'

interface JWTTokenProps {
  sub: string
  role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
  canAccessDashboard?: boolean
  canAccessServices?: boolean
  canAccessFinancial?: boolean
  subsecaoScope?: string | null
}

export async function getAuthTokenPayload() {
  const cookieStore = await cookies()
  const token = cookieStore.get('@lexhub-auth')?.value

  if (!token) return null

  return jwtDecode<JWTTokenProps>(String(token))
}

export async function checkAdminStatus() {
  const payload = await getAuthTokenPayload()
  return payload?.role === 'ADMIN'
}

export async function getMenuPermissions() {
  const payload = await getAuthTokenPayload()

  if (!payload) {
    return {
      canAccessDashboard: false,
      canAccessServices: false,
      canAccessFinancial: false,
      role: null,
    }
  }

  if (payload.role === 'ADMIN') {
    return {
      canAccessDashboard: true,
      canAccessServices: true,
      canAccessFinancial: true,
      role: payload.role,
    }
  }

  return {
    canAccessDashboard: payload.canAccessDashboard ?? false,
    canAccessServices: payload.canAccessServices ?? false,
    canAccessFinancial: payload.canAccessFinancial ?? false,
    role: payload.role,
  }
}

export async function getIsAgentAuthenticated() {
  const payload = await getAuthTokenPayload()
  return payload?.sub ?? false
}
