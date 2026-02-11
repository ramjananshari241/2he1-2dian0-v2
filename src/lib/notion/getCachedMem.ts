import { Page, Title } from '@/src/types/blog'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { formatPages } from '../blog/format/page'
import { getPages } from './getBlogData'
import { getDatabaseIcon, getDatabaseTitle } from './getDatabase'

// 🟢 彻底移除全局 Map 缓存，让 Vercel ISR 接管缓存逻辑
export async function getCachedNavFooter(): Promise<{
  navPages: Page[]
  siteTitle: Title
  logo: DatabaseObjectResponse['icon']
}> {
  // 直接抓取，不再读取内存变量
  const pages = await getPages()
  const formattedPages = formatPages(pages)
  const databaseTitle = await getDatabaseTitle()
  const databaseIcon = await getDatabaseIcon()

  const title = {
    text: databaseTitle[0].plain_text,
    color: databaseTitle[0].annotations.color,
    slug: '/',
  }

  return {
    navPages: formattedPages,
    siteTitle: title,
    logo: databaseIcon ?? null,
  }
}