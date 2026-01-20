import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

// 初始化 Notion 客户端
const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

// 辅助函数：解析文本行为 Block 结构
function parseLinesToChildren(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 1. 媒体识别
    const mediaMatch = trimmed.match(/(?:!|)?\[.*?\]\((.*?)\)/);
    if (mediaMatch) {
      let url = mediaMatch[1].trim();
      const safeUrl = url.includes('%') ? url : encodeURI(url);
      const isVideo = url.match(/\.(mp4|mov|webm|ogg|mkv)(\?|$)/i);
      if (isVideo) {
        blocks.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: safeUrl } } });
      } else {
        blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: safeUrl } } });
      }
      continue;
    }

    // 2. 标题
    if (trimmed.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: trimmed.replace('# ', '') } }] } });
      continue;
    } 

    // 3. 注释块
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) {
       const content = trimmed.slice(1, -1);
       blocks.push({ 
           object: 'block', type: 'paragraph', 
           paragraph: { rich_text: [{ text: { content: content }, annotations: { code: true, color: 'red' } }] } 
       });
       continue;
    }

    // 4. 普通文本
    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed } }] } });
  }
  return blocks;
}

// 辅助函数：Markdown 转 Blocks (包含 Lock 逻辑)
function mdToBlocks(markdown) {
  const rawChunks = markdown.split(/\n{2,}/);
  const blocks = [];
  let mergedChunks = [];
  let buffer = "";
  let isLocking = false;

  for (let chunk of rawChunks) {
    const t = chunk.trim();
    if (!t) continue;
    if (!isLocking && t.startsWith(':::lock')) {
      if (t.endsWith(':::')) mergedChunks.push(t);
      else { isLocking = true; buffer = t; }
    } else if (isLocking) {
      buffer += "\n\n" + t;
      if (t.endsWith(':::')) { isLocking = false; mergedChunks.push(buffer); buffer = ""; }
    } else { mergedChunks.push(t); }
  }
  if (buffer) mergedChunks.push(buffer);

  for (let content of mergedChunks) {
    if (content.startsWith(':::lock')) {
        const firstLineEnd = content.indexOf('\n');
        const header = content.substring(0, firstLineEnd > -1 ? firstLineEnd : content.length);
        let pwd = header.replace(':::lock', '').replace(/[>*\s🔒]/g, '').trim(); 
        const body = content.replace(/^:::lock.*?\n/, '').replace(/\n:::$/, '').trim();
        blocks.push({ 
            object: 'block', type: 'callout', 
            callout: { 
                rich_text: [{ text: { content: `LOCK:${pwd}` }, annotations: { bold: true } }], 
                icon: { type: "emoji", emoji: "🔒" }, color: "gray_background", 
                children: [ { object: 'block', type: 'divider', divider: {} }, ...parseLinesToChildren(body) ] 
            } 
        });
    } else {
        blocks.push(...parseLinesToChildren(content));
    }
  }
  return blocks;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req, res) {
  const { id } = req.query;
  const dbId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET: 获取文章详情 ===
    if (req.method === 'GET') {
      if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      
      let rawBlocks = [];
      try { 
        const blocksRes = await notion.blocks.children.list({ block_id: id }); 
        rawBlocks = blocksRes.results; 
      } catch (e) {}

      // 修正：处理 Lock 块的回显
      mdblocks.forEach(b => {
        if (b.type === 'callout' && b.parent.includes('LOCK:')) {
          const pwdMatch = b.parent.match(/LOCK:(.*?)(\n|$)/);
          const pwd = pwdMatch ? pwdMatch[1].trim() : ''; 
          const parts = b.parent.split('---');
          let body = parts.length > 1 ? parts.slice(1).join('---') : parts[0].replace(/LOCK:.*\n?/, '');
          body = body.replace(/^>[ \t]*/gm, '').trim(); 
          b.parent = `:::lock ${pwd}\n\n${body}\n\n:::`; 
        }
      });

      const mdStringObj = n2m.toMarkdownString(mdblocks);
      const cleanContent = mdStringObj.parent.trim();
      const p = page.properties;

      return res.status(200).json({
        success: true,
        post: { // 注意：前端使用的是 post 字段
          title: p.title?.title?.[0]?.plain_text || '',
          slug: p.slug?.rich_text?.[0]?.plain_text || '',
          excerpt: p.excerpt?.rich_text?.[0]?.plain_text || '',
          category: p.category?.select?.name || '',
          tags: p.tags?.multi_select?.map(t => t.name).join(',') || '',
          cover: p.cover?.url || '',
          status: p.status?.status?.name || p.status?.select?.name || 'Published', // 兼容 select 和 status 类型
          date: p.date?.date?.start || '',
          type: p.type?.select?.name || 'Post',
          content: cleanContent,
          rawBlocks: rawBlocks
        }
      });
    }

    // === POST: 保存或创建 ===
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, title, content, slug, excerpt, category, tags, cover, status, date, type } = body;
      const newBlocks = mdToBlocks(content);
      
      const props = {
        "title": { title: [{ text: { content: title } }] },
        "slug": { rich_text: [{ text: { content: slug } }] },
        "excerpt": { rich_text: [{ text: { content: excerpt || "" } }] },
        "category": category ? { select: { name: category } } : { select: null },
        "tags": { multi_select: (tags || "").split(',').filter(t => t.trim()).map(t => ({ name: t.trim() })) },
        "status": { select: { name: status } }, // 这里的 status 属性名可能需要根据你 Notion 实际类型改为 "status": { status: { name: status } }
        "date": date ? { date: { start: date } } : null,
        "type": { select: { name: type || "Post" } }
      };
      // 只有当有封面链接时才更新，防止报错
      if (cover && cover.startsWith('http')) {
          props["cover"] = { url: cover };
      }

      if (id) {
        // 更新模式：先更属性，再换内容
        await notion.pages.update({ page_id: id, properties: props });
        // 清空旧块 (Notion API 限制，只能通过删除旧块实现“更新内容”)
        const children = await notion.blocks.children.list({ block_id: id });
        // 并发删除提高速度
        await Promise.all(children.results.map(b => notion.blocks.delete({ block_id: b.id })));
        
        // 写入新块
        for (let i = 0; i < newBlocks.length; i += 10) {
          await notion.blocks.children.append({ block_id: id, children: newBlocks.slice(i, i + 10) });
          // 小休眠防止 API 限流
          if (i + 10 < newBlocks.length) await sleep(200);
        }
      } else {
        // 创建模式
        await notion.pages.create({ 
          parent: { database_id: dbId }, 
          properties: props, 
          children: newBlocks.slice(0, 50) 
        });
      }
      return res.status(200).json({ success: true });
    }

    // === DELETE: 删除 ===
    if (req.method === 'DELETE') {
      if(!id) return res.status(400).json({ success: false });
      await notion.pages.update({ page_id: id, archived: true });
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}