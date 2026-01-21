import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

// ==========================================
// 1. 强力解析器 (后端版)
// ==========================================
function parseLinesToChildren(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // A. 媒体识别 (正则清洗)
    const mdMatch = trimmed.match(/^!\[.*?\]\((.*?)\)$/) || trimmed.match(/^\[.*?\]\((.*?)\)$/);
    let potentialUrl = mdMatch ? mdMatch[1] : trimmed;
    // 尝试提取纯 URL
    const urlMatch = potentialUrl.match(/https?:\/\/[^\s)\]"]+/);
    const cleanUrl = urlMatch ? urlMatch[0] : null;

    if (cleanUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl)) {
      const isVideo = /\.(mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl);
      if (isVideo) {
        blocks.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: cleanUrl } } });
      } else {
        blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: cleanUrl } } });
      }
      continue;
    }

    // B. 标题
    if (trimmed.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: trimmed.replace('# ', '') } }] } });
      continue;
    } 

    // C. 注释块 (反引号包裹 -> 红色代码样式)
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) {
       const content = trimmed.slice(1, -1);
       blocks.push({ 
           object: 'block', type: 'paragraph', 
           paragraph: { rich_text: [{ text: { content: content }, annotations: { code: true, color: 'red' } }] } 
       });
       continue;
    }

    // D. 普通文本
    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed } }] } });
  }
  return blocks;
}

// ==========================================
// 2. 状态机转换器 (核心修复：防止加密块炸裂)
// ==========================================
function mdToBlocks(markdown) {
  if (!markdown) return [];
  const rawChunks = markdown.split(/\n{2,}/);
  const blocks = [];
  
  let mergedChunks = [];
  let buffer = "";
  let isLocking = false;

  // --- 状态机循环 ---
  for (let chunk of rawChunks) {
    const t = chunk.trim();
    if (!t) continue;

    if (!isLocking && t.startsWith(':::lock')) {
      if (t.endsWith(':::')) {
        mergedChunks.push(t);
      } else {
        isLocking = true;
        buffer = t;
      }
    } else if (isLocking) {
      buffer += "\n\n" + t;
      if (t.endsWith(':::')) {
        isLocking = false;
        mergedChunks.push(buffer);
        buffer = "";
      }
    } else {
      mergedChunks.push(t);
    }
  }
  if (buffer) mergedChunks.push(buffer);

  // --- 生成 Block ---
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

// ==========================================
// API Handler
// ==========================================
export default async function handler(req, res) {
  const { id } = req.query;
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET: 获取详情 ===
    if (req.method === 'GET') {
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      const mdString = n2m.toMarkdownString(mdblocks);
      const p = page.properties;

      let rawBlocks = [];
      try { const blocksRes = await notion.blocks.children.list({ block_id: id }); rawBlocks = blocksRes.results; } catch (e) {}

      // 回显处理：把 Notion 的 callout 还原回 :::lock
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

      const cleanContent = n2m.toMarkdownString(mdblocks).parent.trim();

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
          content: cleanContent,
          rawBlocks: rawBlocks
        }
      });
    }

    // === POST: 保存/创建 ===
    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const { id, title, content, slug, excerpt, category, tags, status, date, type, cover } = body;
      const newBlocks = mdToBlocks(content);
      
      const props = {};
      props["title"] = { title: [{ text: { content: title || "无标题" } }] };
      if (slug) props["slug"] = { rich_text: [{ text: { content: slug } }] };
      props["excerpt"] = { rich_text: [{ text: { content: excerpt || "" } }] };
      if (category) props["category"] = { select: { name: category } };
      
      if (tags) {
        const tagList = tags.split(',').filter(t => t.trim()).map(t => ({ name: t.trim() }));
        if (tagList.length > 0) props["tags"] = { multi_select: tagList };
      }
      // status 兼容性处理
      props["status"] = { status: { name: status || "Published" } };
      // 备用：如果你的数据库 status 是 select 类型，请解开下一行注释，注释上一行
      // props["status"] = { select: { name: status || "Published" } };

      props["type"] = { select: { name: type || "Post" } };
      if (date) props["date"] = { date: { start: date } };
      if (cover && cover.startsWith('http')) props["cover"] = { url: cover };

      if (id) {
        // 1. 更新属性
        await notion.pages.update({ page_id: id, properties: props });
        
        // 2. 极速清空旧块 (并发删除)
        const children = await notion.blocks.children.list({ block_id: id });
        if (children.results.length > 0) {
            // 每 3 个一组并发删除，平衡速度与 API 限制
            const chunks = [];
            for (let i = 0; i < children.results.length; i += 3) {
                chunks.push(children.results.slice(i, i + 3));
            }
            for (const chunk of chunks) {
                await Promise.all(chunk.map(b => notion.blocks.delete({ block_id: b.id })));
            }
        }
        
        // 3. 极速写入新块 (100个一批)
        for (let i = 0; i < newBlocks.length; i += 100) {
          await notion.blocks.children.append({ 
            block_id: id, 
            children: newBlocks.slice(i, i + 100) 
          });
          // 仅在还有下一批时微停，否则全速
          if (i + 100 < newBlocks.length) await sleep(100); 
        }

      } else {
        // 创建
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: props,
          children: newBlocks.slice(0, 100)
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