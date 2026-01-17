import { ContentType, Post } from '@/src/types/blog'

export type FilterPublishedPostsOptions = {
  posts: Post[]
  includedPostTypes?: string[]
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

      // 4. 类型分流逻辑
      if (includedPostTypes && includedPostTypes.length > 0) {
        // 情况 A：指定了类型 (例如 ['Announcement'])
        // @ts-ignore: 忽略 ContentType 枚举匹配检查，直接对比字符串
        if (!post.type || !includedPostTypes.includes(post.type)) {
          return false
        }
      } else {
        // 情况 B：默认行为，只返回 'Post'
        // @ts-ignore
        if (post.type !== 'Post') {
           return false
        }
      }

      // 5. 搜索关键词过滤 (如果有)
      if (search && search.length > 0) {
        // 🚨 修复点：这里改成了 post.excerpt
        const searchContent = `${post.title} ${post.excerpt || ''} ${post.tags ? post.tags.join(' ') : ''}`
        if (!searchContent.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
      }

      // 6. 标签过滤 (如果有)
      if (tag) {
        if (!post.tags || !post.tags.map(t => t.name).includes(tag)) return false
      }

      // 7. 分类过滤 (如果有)
      if (category) {
        if (!post.category || post.category.name !== category) return false
      }

      return true
    })
    // 按时间倒序排列 (新的在前)
    .sort((a, b) => {
      const dateA = new Date(a.date?.created).getTime()
      const dateB = new Date(b.date?.created).getTime()
      return dateB - dateA
    })
}
