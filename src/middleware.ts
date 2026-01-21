import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔒 双重保险：只有路径以 /admin 开头才进行拦截
  // 如果当前访问的不是 admin 页面，直接放行，绝不弹窗
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // --- 以下是 Admin 区域的验证逻辑 ---
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // 读取环境变量
    const validUser = process.env.AUTH_USER || 'admin'
    const validPass = process.env.AUTH_PASS || '123456'

    if (user === validUser && pwd === validPass) {
      return NextResponse.next()
    }
  }

  // 验证失败：返回 401
  return new NextResponse(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

// ⚠️ 关键配置：告诉 Next.js 只拦截 /admin 下的路径
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}