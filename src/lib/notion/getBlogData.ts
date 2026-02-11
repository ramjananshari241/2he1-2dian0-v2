import { ApiScope } from '@/src/types/notion'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getAll } from './getDatabase'

// 🟢 物理移除所有变量缓存，强制函数执行时直接去查数据库
export const getPageBySlug = async (slug: string) => {
  const objects = await getAll(ApiScope.Page)
  const page = objects.find(
    (object) =>
      object.properties['slug']?.type === 'rich_text' &&
      object.properties['slug']?.rich_text[0]?.plain_text === slug
  )
  return page as PageObjectResponse
}

export const getPages = async () => {
  const objects = await getAll(ApiScope.Page)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type'].select?.name === 'Page'
  )
}

export const getPosts = async (scope: ApiScope.Home | ApiScope.Archive | ApiScope.Draft) => {
  const objects = await getAll(scope)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type'].select?.name === 'Post'
  )
}

export const getPostsAndPieces = async (scope: ApiScope.Home | ApiScope.Archive | ApiScope.Draft) => {
  const objects = await getAll(scope)
  return {
    posts: objects.filter(item => item.properties['type']?.type === 'select' && item.properties['type'].select?.name === 'Post'),
    pieces: objects.filter(item => item.properties['type']?.type === 'select' && item.properties['type'].select?.name === 'Piece')
  }
}

export const getWidgets = async () => {
  const objects = await getAll(ApiScope.Home)
  return objects.filter(
    (object) =>
      object.properties['type']?.type === 'select' &&
      object.properties['type'].select?.name === 'Widget'
  )
}