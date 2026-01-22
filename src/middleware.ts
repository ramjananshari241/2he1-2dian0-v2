import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 拦截 /admin 和 /admin/xxx
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      const [user, pwd] = atob(authValue).split(':')

      // 默认值用于防止环境变量未配置时无法登录，上线后请务必在 Vercel 设置变量
      const validUser = process.env.AUTH_USER || 'admin'
      const validPass = process.env.AUTH_PASS || '123456'

      if (user === validUser && pwd === validPass) {
        return NextResponse.next()
      }
    }

    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}