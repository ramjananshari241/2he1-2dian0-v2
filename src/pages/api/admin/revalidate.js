// ✅ 纯 JS 版本，消灭红字报错
export default async function handler(req, res) {
  // 1. 验证权限：检查 URL 里的 secret 是否匹配你的 Notion Key
  // 建议直接对比你 Vercel 里的环境变量，或者写死
  const secret = req.query.secret;
  const validSecret = process.env.NOTION_KEY || process.env.NOTION_TOKEN || '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';

  if (secret !== validSecret) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // 2. 强制引爆首页缓存
    await res.revalidate('/');
    
    // 3. 如果有具体的文章 slug，也引爆它的缓存
    const slug = req.query.slug;
    if (slug) {
      await res.revalidate(`/${slug}`);
      // 兼容某些主题可能带斜杠或不带斜杠的情况
      try { await res.revalidate(`/post/${slug}`); } catch(e) {}
    }

    return res.json({ revalidated: true, message: '前台缓存已强行更新' });
  } catch (err) {
    console.error('刷新失败:', err);
    return res.status(500).send('Error revalidating');
  }
}