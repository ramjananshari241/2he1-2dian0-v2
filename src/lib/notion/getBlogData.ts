import { ApiScope } from '@/src/types/notion'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getAll } from './getDatabase'

// 🟢 确保这里没有任何全局变量（如 let allPosts）

export const getPageBySlug = async (slug: string) => {
  const pages = await getPages()
  return (
    pages.find(
      (page) =>
        page.properties['slug']?.type === 'rich_text' &&
        page.properties['slug']?.rich_text[0]?.plain_text === slug
    ) ?? (null as unknown as PageObjectResponse)
  )
}

export const getPages = async () => {
  const objects = await getAll(ApiScope.Page)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type']?.select?.name === 'Page'
  )
}

export const getPosts = async (scope: ApiScope.Home | ApiScope.Archive | ApiScope.Draft) => {
  const objects = await getAll(scope)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type']?.select?.name === 'Post'
  )
}

export const getWidgets = async () => {
  const objects = await getAll(ApiScope.Home)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type']?.select?.name === 'Widget'
  )
}