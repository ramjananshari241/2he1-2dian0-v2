import { CachedNav, Page, Title } from '@/src/types/blog'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { formatPages } from '../blog/format/page'
import { getPages } from './getBlogData'
import { getDatabaseIcon, getDatabaseTitle } from './getDatabase'
import CONFIG from '@/blog.config'

const cache = new Map<string, { data: any, expire: number }>()

export async function getCachedNavFooter(): Promise<{
  navPages: Page[]
  siteTitle: Title
  logo: DatabaseObjectResponse['icon']
}> {
  const cacheKey = 'nav'
  const now = Date.now()
  const cached = cache.get(cacheKey)

  // 🟢 核心修复：如果缓存存在且未超过配置的 revalidate 时间，才返回缓存
  if (cached && cached.expire > now) {
    return cached.data
  }

  // 否则，强行连通 Notion 抓取新数据
  const pages = await getPages()
  const formattedPages = formatPages(pages)
  const databaseTitle = await getDatabaseTitle()
  const databaseIcon = await getDatabaseIcon()

  const title = {
    text: databaseTitle[0].plain_text,
    color: databaseTitle[0].annotations.color,
    slug: '/',
  }

  const data = {
    navPages: formattedPages,
    siteTitle: title,
    logo: databaseIcon,
  }

  // 更新内存缓存，并设置 10秒 后的有效期
  cache.set(cacheKey, { 
    data, 
    expire: now + (CONFIG.NEXT_REVALIDATE_SECONDS * 1000) 
  })

  return data
}