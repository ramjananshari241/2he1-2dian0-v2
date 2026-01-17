import { ContentType, Post } from '@/src/types/blog'

export type FilterPublishedPostsOptions = {
  posts: Post[]
  includedPostTypes?: string[] // ✨ 新增：允许传入 ['Post'] 或 ['Announcement']
  search?: string
  category?: string
  tag?: string
}

/**
 * 本地数据过滤器
 * 用于将从 API 获取的大量混合数据，按类型筛选分流
 */
export const filterPublishedPosts = ({
  posts,
  includedPostTypes,
  search,
  category,
  tag,
}: FilterPublishedPostsOptions) => {
  if (!posts || !posts.length) {
    return []
  }

  return posts
    .filter((post) => {
      // 1. 基础合法性检查
      if (!post || !post.id) return false
      
      // 2. 状态检查：只显示 Published
      if (post.status !== 'Published') return false

      // 3. 日期检查：排除未来发布的文章
      if (post.date && post.date.created) {
        const createdDate = new Date(post.date.created)
        if (createdDate > new Date()) return false
      }

      // 4. ✨ 核心修改：类型分流逻辑
      if (includedPostTypes && includedPostTypes.length > 0) {
        // 情况 A：如果在 index.tsx 里指定了类型 (例如 ['Announcement'])
        // 那么必须匹配该类型才保留
        if (!post.type || !includedPostTypes.includes(post.type)) {
          return false
        }
      } else {
        // 情况 B：如果没有指定类型 (默认行为)
        // 为了防止公告混入普通文章列表，默认只返回 'Post'
        if (post.type !== 'Post') {
           return false
        }
      }

      // 5. 搜索关键词过滤 (如果有)
      if (search && search.length > 0) {
        const searchContent = `${post.title} ${post.summary} ${post.tags.join(' ')}`
        if (!searchContent.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
      }

      // 6. 标签过滤 (如果有)
      if (tag) {
        if (!post.tags || !post.tags.includes(tag)) return false
      }

      // 7. 分类过滤 (如果有)
      if (category) {
        if (!post.category || post.category !== category) return false
      }

      return true
    })
    // 按时间倒序排列 (新的在前)
    .sort((a, b) => {
      const dateA = new Date(a.date?.created || a.createdTime).getTime()
      const dateB = new Date(b.date?.created || b.createdTime).getTime()
      return dateB - dateA
    })
}
