import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. 排除静态资源 (防止图标、CSS等触发登录框)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.') // 排除 favicon.ico 等文件
  ) {
    return NextResponse.next()
  }

  // 2. 🟢 核心修复：只拦截 /admin 开头的路径
  // 如果当前路径不是 /admin 开头，直接放行，绝不弹窗
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 3. 进入 Admin 区域的鉴权逻辑
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    const validUser = process.env.AUTH_USER || 'admin'
    const validPass = process.env.AUTH_PASS || '123456'

    if (user === validUser && pwd === validPass) {
      return NextResponse.next()
    }
  }

  // 4. 验证失败
  return new NextResponse(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

// 这里的 matcher 仅作为辅助，逻辑全靠上面的 if 判断
export const config = {
  matcher: ['/:path*'], // 匹配所有路径，由内部逻辑决定是否拦截
}