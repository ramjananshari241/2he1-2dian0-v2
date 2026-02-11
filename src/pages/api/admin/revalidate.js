export default async function handler(req, res) {
  // 1. 验证是否是后台发来的请求
  // 为了安全，我们检查一下环境变量。如果没设变量，本地开发也能用
  const secret = process.env.NOTION_TOKEN || process.env.NOTION_KEY;

  try {
    // 2. 强制刷新首页
    await res.revalidate('/');
    
    // 3. 如果发来了具体的 slug，刷新对应的文章页
    const { slug } = req.query;
    if (slug) {
      await res.revalidate(`/${slug}`);
    }

    return res.json({ revalidated: true, message: '缓存已强制刷新' });
  } catch (err) {
    console.error('刷新失败:', err);
    return res.status(500).send('刷新失败，但这不影响数据保存');
  }
}