import { CachedNav, Page, Title } from '@/src/types/blog'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { formatPages } from '../blog/format/page'
import { getPages } from './getBlogData'
import { getDatabaseIcon, getDatabaseTitle } from './getDatabase'
import CONFIG from '@/blog.config'

const cache = new Map<string, CachedNav>()

export async function getCachedNavFooter(cacheTimeInSeconds = CONFIG.NEXT_REVALIDATE_SECONDS): Promise<{
  navPages: Page[]
  siteTitle: Title
  logo: DatabaseObjectResponse['icon']
}> {
  const cacheKey = 'nav'
  const now = Date.now()

  // 🟢 核心修复：即时检测缓存是否过期
  if (cache.has(cacheKey)) {
    const cachedNav = cache.get(cacheKey)
    // 如果没过期，直接返回
    if (cachedNav && cachedNav.ttl > now) {
      return {
        navPages: cachedNav.navPages,
        siteTitle: cachedNav.siteTitle,
        logo: cachedNav.logo ?? null,
      }
    }
    // 如果已过期，删除它
    cache.delete(cacheKey)
  }

  // 🟢 缓存不存在或已过期，重新从 Notion 抓取
  const pages = await getPages()
  const formattedPages = formatPages(pages)
  const databaseTitle = await getDatabaseTitle()
  const databaseIcon = await getDatabaseIcon()

  const title = {
    text: databaseTitle[0].plain_text,
    color: databaseTitle[0].annotations.color,
    slug: '/',
  }

  const cachedNav: CachedNav = {
    navPages: formattedPages,
    siteTitle: title,
    logo: databaseIcon,
    ttl: now + cacheTimeInSeconds * 1000, // 设置新的过期时间
  }

  try {
    cache.set(cacheKey, cachedNav)
  } catch (err) {
    console.error('Error caching nav', err)
  }

  return {
    navPages: cachedNav.navPages,
    siteTitle: cachedNav.siteTitle,
    logo: cachedNav.logo ?? null,
  }
}