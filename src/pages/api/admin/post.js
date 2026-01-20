import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

// === 1. 强力解析器：还原你旧后台的强大格式转换功能 ===
function parseLinesToChildren(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // A. 尝试识别 Markdown 图片/链接语法: ![alt](url)
    const mdMatch = trimmed.match(/^!\[.*?\]\((.*?)\)$/) || trimmed.match(/^\[.*?\]\((.*?)\)$/);
    let potentialUrl = mdMatch ? mdMatch[1] : trimmed;

    // B. 清洗 URL (去除多余参数，根据你旧项目的逻辑)
    // 简单清洗：匹配 http 开头直到空格
    const urlMatch = potentialUrl.match(/https?:\/\/[^\s)\]"]+/);
    const cleanUrl = urlMatch ? urlMatch[0] : null;

    // C. 判断是否为媒体链接 (图片/视频)
    if (cleanUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl)) {
      const isVideo = /\.(mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl);
      if (isVideo) {
        blocks.push({ 
          object: 'block', type: 'video', 
          video: { type: 'external', external: { url: cleanUrl } } 
        });
      } else {
        blocks.push({ 
          object: 'block', type: 'image', 
          image: { type: 'external', external: { url: cleanUrl } } 
        });
      }
      continue; // 识别为媒体后，跳过后续文本处理
    }

    // D. 标题识别
    if (trimmed.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: trimmed.replace('# ', '') } }] } });
      continue;
    } 

    // E. 注释块 (反引号包裹)
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) {
       const content = trimmed.slice(1, -1);
       blocks.push({ 
           object: 'block', type: 'paragraph', 
           paragraph: { rich_text: [{ text: { content: content }, annotations: { code: true, color: 'red' } }] } 
       });
       continue;
    }

    // F. 普通文本
    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed } }] } });
  }
  return blocks;
}

// === 2. 积木转换器 (包含 Lock 逻辑) ===
function mdToBlocks(markdown) {
  if (!markdown) return [];
  const rawChunks = markdown.split(/\n{2,}/); // 按空行分段
  const blocks = [];
  
  let mergedChunks = [];
  let buffer = "";
  let isLocking = false;

  // 处理 :::lock 包裹逻辑
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

  // 转换每一段
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
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET: 获取详情 (预览/回显) ===
    if (req.method === 'GET') {
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      const mdString = n2m.toMarkdownString(mdblocks);
      const p = page.properties;

      let rawBlocks = [];
      try {
        const blocksRes = await notion.blocks.children.list({ block_id: id });
        rawBlocks = blocksRes.results;
      } catch (e) {}

      return res.status(200).json({
        success: true,
        post: {
          id: page.id,
          title: p.title?.title?.[0]?.plain_text || '无标题',
          slug: p.slug?.rich_text?.[0]?.plain_text || '',
          excerpt: p.excerpt?.rich_text?.[0]?.plain_text || '',
          category: p.category?.select?.name || '',
          tags: (p.tags?.multi_select || []).map(t => t.name).join(','),
          status: p.status?.status?.name || p.status?.select?.name || 'Published',
          type: p.type?.select?.name || 'Post',
          date: p.date?.date?.start || '',
          cover: p.cover?.url || p.cover?.file?.url || p.cover?.external?.url || '',
          content: mdString.parent || '',
          rawBlocks: rawBlocks
        }
      });
    }

    // === POST: 核心保存逻辑 ===
    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const { id, title, content, slug, excerpt, category, tags, status, date, type, cover } = body;
      
      // 1. 生成新积木
      const newBlocks = mdToBlocks(content);

      // 2. 准备属性
      const props = {};
      props["title"] = { title: [{ text: { content: title || "无标题" } }] };
      if (slug) props["slug"] = { rich_text: [{ text: { content: slug } }] };
      props["excerpt"] = { rich_text: [{ text: { content: excerpt || "" } }] };
      if (category) props["category"] = { select: { name: category } };
      
      if (tags) {
        const tagList = tags.split(',').filter(t => t.trim()).map(t => ({ name: t.trim() }));
        if (tagList.length > 0) props["tags"] = { multi_select: tagList };
      }
      props["status"] = { status: { name: status || "Published" } };
      props["type"] = { select: { name: type || "Post" } };
      if (date) props["date"] = { date: { start: date } };
      if (cover && cover.startsWith('http')) props["cover"] = { url: cover };

      if (id) {
        // === 场景 A：更新现有文章 ===
        // 1. 先更新属性 (标题、状态等)
        await notion.pages.update({ page_id: id, properties: props });
        
        // 2. 【关键恢复】清空旧内容！
        // Notion 不支持“修改”块，只能“先删再加”。
        const children = await notion.blocks.children.list({ block_id: id });
        if (children.results.length > 0) {
            // 并发删除所有旧块
            await Promise.all(children.results.map(b => notion.blocks.delete({ block_id: b.id })));
        }
        
        // 3. 【关键恢复】写入新内容
        // Notion API 限制每次最多追加 100 个块，这里按 10 个一批稳健写入
        for (let i = 0; i < newBlocks.length; i += 10) {
          await notion.blocks.children.append({ block_id: id, children: newBlocks.slice(i, i + 10) });
          // 小睡一下，防止触发 API 速率限制
          if (i + 10 < newBlocks.length) await sleep(200);
        }

      } else {
        // === 场景 B：创建新文章 ===
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: props,
          children: newBlocks.slice(0, 50) // 新建时直接带入积木
        });
      }

      return res.status(200).json({ success: true });
    }

    // === DELETE ===
    if (req.method === 'DELETE') {
      await notion.pages.update({ page_id: id, archived: true });
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}