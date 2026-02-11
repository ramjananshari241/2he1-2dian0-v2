// ... (保留文件开头的所有 import 和 状态机逻辑 mdToBlocks/parseLinesToChildren) ...
// ⚠️ 请确保保留你 v2.0 版本中已经修好的加密块解析逻辑！

export default async function handler(req, res) {
  const { id } = req.query;
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET 获取详情部分保持不变 ===
    if (req.method === 'GET') {
       /* ...这里保留你 v2.0 已经修好的读取和翻译逻辑... */
    }

    // === POST 保存逻辑 (加入强制刷新指令) ===
    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const { id, title, content, slug, excerpt, category, tags, status, date, type, cover } = body;
      const newBlocks = mdToBlocks(content);

      // ...这里保留你之前的 props 构造代码...

      if (id) {
        // 更新 Notion
        await notion.pages.update({ page_id: id, properties: props });
        const children = await notion.blocks.children.list({ block_id: id });
        if (children.results.length > 0) {
            const chunks = [];
            for (let i = 0; i < children.results.length; i += 3) chunks.push(children.results.slice(i, i + 3));
            for (const chunk of chunks) await Promise.all(chunk.map(b => notion.blocks.delete({ block_id: b.id })));
        }
        for (let i = 0; i < newBlocks.length; i += 100) {
          await notion.blocks.children.append({ block_id: id, children: newBlocks.slice(i, i + 100) });
          if (i + 100 < newBlocks.length) await new Promise(r => setTimeout(r, 100));
        }

        // 🟢【核心新增】：保存成功后，告诉 Vercel 强制刷新这个 slug 的网页
        try {
           const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://${req.headers.host}`;
           await fetch(`${baseUrl}/api/admin/revalidate?slug=${slug}`);
           console.log(`已成功强制刷新页面: /${slug}`);
        } catch (e) {
           console.error("主动刷新指令发送失败", e);
        }

      } else {
        // 创建新文章
        await notion.pages.create({ parent: { database_id: databaseId }, properties: props, children: newBlocks.slice(0, 100) });
        // 新文章创建后，也强制刷新一下首页
        try {
           const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://${req.headers.host}`;
           await fetch(`${baseUrl}/api/admin/revalidate`);
        } catch (e) {}
      }

      return res.status(200).json({ success: true });
    }

    // === DELETE 部分保持不变 ===

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}