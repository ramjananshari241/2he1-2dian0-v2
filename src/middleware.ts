import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 虽然 config.matcher 做了限制，这里再做一次双重检查会更安全
  if (pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization')

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1]
      // 解码 Base64
      const [user, pwd] = atob(authValue).split(':')

      // 读取 Vercel 环境变量 (加 || '' 防止 TS 报错 undefined)
      const validUser = process.env.AUTH_USER || 'admin'
      const validPass = process.env.AUTH_PASS || '123456'

      if (user === validUser && pwd === validPass) {
        return NextResponse.next()
      }
    }

    // 验证失败：返回 401 状态码，Body 设置为 null
    return new NextResponse(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

// ✅ 关键配置：只拦截 /admin 下的所有路径
export const config = {
  matcher: '/admin/:path*',
}