import { ApiScope } from '@/src/types/notion'
import { getPostsAndPieces } from '../notion/getBlogData'

// 🟢 统计博客数据的逻辑，必须从 getBlogData 拿数据
export default async function getBlogStats() {
  const { posts, pieces } = await getPostsAndPieces(ApiScope.Archive)
  
  return {
    postCount: posts.length,
    pieceCount: pieces.length,
    // 如果以后需要更多统计，在这里加
  }
}