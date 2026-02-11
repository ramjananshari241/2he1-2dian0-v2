import { Page, Title } from '@/src/types/blog'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { formatPages } from '../blog/format/page'
import { getPages } from './getBlogData'
import { getDatabaseIcon, getDatabaseTitle } from './getDatabase'

// 🟢 彻底废除 Map 缓存。不管内存里有没有，每次都强行去 Notion 抓取。
export async function getCachedNavFooter(): Promise<any> {
  console.log('--- [ISR 触发] 正在实时抓取 Notion 导航数据 ---')
  
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