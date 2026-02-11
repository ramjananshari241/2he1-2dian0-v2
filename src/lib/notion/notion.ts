import { Client } from '@notionhq/client'

// 🟢 彻底禁用 Notion SDK 的任何内部缓存
// 确保每次调用都是一个全新的、干净的请求
export const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
  // 强制不使用任何 Agent 缓存
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      next: { revalidate: 0 } // 告知 Next.js 这里的底层 fetch 不要缓存
    } as any)
  }
})

export const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID || ''