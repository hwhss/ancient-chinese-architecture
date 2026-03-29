/**
 * Markdown 解析器 - 轻量级实现
 * 支持：标题、加粗、斜体、列表、代码块、引用、分隔线
 */

// 解析Markdown文本为富文本节点数组
export function parseMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return [{ type: 'text', content: text || '' }];
  }

  const nodes = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 代码块 ```code```
    if (line.trim().startsWith('```')) {
      const codeBlock = parseCodeBlock(lines, i);
      nodes.push(codeBlock.node);
      i = codeBlock.nextIndex;
      continue;
    }

    // 引用块 > text
    if (line.trim().startsWith('>')) {
      const quoteBlock = parseQuoteBlock(lines, i);
      nodes.push(quoteBlock.node);
      i = quoteBlock.nextIndex;
      continue;
    }

    // 分隔线 --- 或 ***
    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      nodes.push({ type: 'divider' });
      i++;
      continue;
    }

    // 标题 # ## ###
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = parseInline(headingMatch[2]);
      nodes.push({ type: 'heading', level, content });
      i++;
      continue;
    }

    // 无序列表 - 或 *
    if (/^[\-\*]\s+/.test(line.trim())) {
      const listBlock = parseList(lines, i, 'unordered');
      nodes.push(listBlock.node);
      i = listBlock.nextIndex;
      continue;
    }

    // 有序列表 1. 2.
    if (/^\d+\.\s+/.test(line.trim())) {
      const listBlock = parseList(lines, i, 'ordered');
      nodes.push(listBlock.node);
      i = listBlock.nextIndex;
      continue;
    }

    // 普通段落
    if (line.trim()) {
      const content = parseInline(line);
      nodes.push({ type: 'paragraph', content });
    }

    i++;
  }

  return nodes;
}

// 解析行内元素（加粗、斜体、行内代码、链接）
function parseInline(text) {
  const nodes = [];
  let remaining = text;

  // 正则表达式匹配各种行内格式
  const patterns = [
    { type: 'bold-italic', regex: /\*\*\*(.+?)\*\*\*/g }, // ***bold+italic***
    { type: 'bold', regex: /\*\*(.+?)\*\*/g },           // **bold**
    { type: 'italic', regex: /\*(.+?)\*/g },             // *italic*
    { type: 'code', regex: /`(.+?)`/g },                 // `code`
    { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/g }, // [text](url)
    { type: 'strikethrough', regex: /~~(.+?)~~/g },      // ~~strikethrough~~
  ];

  while (remaining) {
    let earliestMatch = null;
    let earliestPattern = null;

    // 找到最早出现的匹配
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source);
      const match = regex.exec(remaining);
      if (match && (!earliestMatch || match.index < earliestMatch.index)) {
        earliestMatch = match;
        earliestPattern = pattern;
      }
    }

    if (earliestMatch) {
      // 添加匹配前的普通文本
      if (earliestMatch.index > 0) {
        nodes.push({
          type: 'text',
          content: remaining.slice(0, earliestMatch.index)
        });
      }

      // 添加格式化节点
      switch (earliestPattern.type) {
        case 'bold-italic':
          nodes.push({
            type: 'text',
            bold: true,
            italic: true,
            content: parseInline(earliestMatch[1])
          });
          break;
        case 'bold':
          nodes.push({
            type: 'text',
            bold: true,
            content: parseInline(earliestMatch[1])
          });
          break;
        case 'italic':
          nodes.push({
            type: 'text',
            italic: true,
            content: parseInline(earliestMatch[1])
          });
          break;
        case 'code':
          nodes.push({
            type: 'inline-code',
            content: earliestMatch[1]
          });
          break;
        case 'link':
          nodes.push({
            type: 'link',
            text: earliestMatch[1],
            url: earliestMatch[2]
          });
          break;
        case 'strikethrough':
          nodes.push({
            type: 'text',
            strikethrough: true,
            content: earliestMatch[1]
          });
          break;
      }

      remaining = remaining.slice(earliestMatch.index + earliestMatch[0].length);
    } else {
      // 没有更多匹配，添加剩余文本
      if (remaining) {
        nodes.push({ type: 'text', content: remaining });
      }
      break;
    }
  }

  return nodes;
}

// 解析代码块
function parseCodeBlock(lines, startIndex) {
  const firstLine = lines[startIndex];
  const langMatch = firstLine.match(/```(\w*)/);
  const language = langMatch ? langMatch[1] : '';

  let code = '';
  let i = startIndex + 1;

  while (i < lines.length && !lines[i].trim().startsWith('```')) {
    code += lines[i] + '\n';
    i++;
  }

  return {
    node: {
      type: 'code-block',
      language,
      content: code.trim()
    },
    nextIndex: i + 1
  };
}

// 解析引用块
function parseQuoteBlock(lines, startIndex) {
  const items = [];
  let i = startIndex;

  while (i < lines.length && lines[i].trim().startsWith('>')) {
    const content = lines[i].trim().substring(1).trim();
    if (content) {
      items.push(parseInline(content));
    }
    i++;
  }

  return {
    node: {
      type: 'quote',
      content: items
    },
    nextIndex: i
  };
}

// 解析列表
function parseList(lines, startIndex, listType) {
  const items = [];
  let i = startIndex;

  const unorderedRegex = /^[\-\*]\s+/;
  const orderedRegex = /^\d+\.\s+/;

  while (i < lines.length) {
    const line = lines[i];
    const isUnordered = unorderedRegex.test(line.trim());
    const isOrdered = orderedRegex.test(line.trim());

    if ((listType === 'unordered' && isUnordered) ||
        (listType === 'ordered' && isOrdered)) {
      const content = line.trim().replace(listType === 'unordered' ? unorderedRegex : orderedRegex, '');
      items.push(parseInline(content));
      i++;
    } else if (line.trim() === '' || line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\.\s+/.test(line.trim())) {
      // 空行或新列表项，结束当前列表
      break;
    } else {
      // 列表项的续行
      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        // 将续行添加到最后一项
        if (Array.isArray(lastItem)) {
          lastItem.push({ type: 'text', content: ' ' + line.trim() });
        }
      }
      i++;
    }
  }

  return {
    node: {
      type: 'list',
      listType,
      items
    },
    nextIndex: i
  };
}

// 将解析后的节点渲染为HTML字符串（用于rich-text组件）
export function renderToHtml(nodes) {
  if (!Array.isArray(nodes)) return '';

  return nodes.map(node => renderNode(node)).join('');
}

function renderNode(node) {
  if (!node) return '';

  switch (node.type) {
    case 'heading':
      const tag = `h${node.level}`;
      const content = renderInlineArray(node.content);
      return `<${tag} style="margin: 16px 0 12px; color: #c82506; font-weight: bold; font-size: ${getHeadingSize(node.level)};">${content}</${tag}>`;

    case 'paragraph':
      return `<p style="margin: 12px 0; line-height: 1.8; color: #2d2d2d;">${renderInlineArray(node.content)}</p>`;

    case 'list':
      const listTag = node.listType === 'ordered' ? 'ol' : 'ul';
      const listStyle = node.listType === 'ordered' ? 'list-style-type: decimal;' : 'list-style-type: disc;';
      const items = node.items.map(item =>
        `<li style="margin: 8px 0; line-height: 1.6; color: #2d2d2d;">${renderInlineArray(item)}</li>`
      ).join('');
      return `<${listTag} style="margin: 12px 0; padding-left: 24px; ${listStyle}">${items}</${listTag}>`;

    case 'code-block':
      return `<pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; border: 1px solid #e0e0e0;"><code style="font-family: monospace; font-size: 14px; color: #333; line-height: 1.5;">${escapeHtml(node.content)}</code></pre>`;

    case 'quote':
      const quoteContent = node.content.map(item => `<p style="margin: 8px 0;">${renderInlineArray(item)}</p>`).join('');
      return `<blockquote style="border-left: 4px solid #c82506; padding: 12px 16px; margin: 12px 0; background: #faf6ed; color: #666; font-style: italic;">${quoteContent}</blockquote>`;

    case 'divider':
      return `<hr style="border: none; border-top: 1px solid #e8d8c8; margin: 20px 0;" />`;

    case 'text':
      return renderInline(node);

    default:
      return '';
  }
}

function renderInlineArray(content) {
  if (Array.isArray(content)) {
    return content.map(item => renderInline(item)).join('');
  }
  return renderInline(content);
}

function renderInline(node) {
  if (typeof node === 'string') {
    return escapeHtml(node);
  }

  if (!node || !node.type) return '';

  let content = '';

  if (Array.isArray(node.content)) {
    content = node.content.map(item => renderInline(item)).join('');
  } else if (typeof node.content === 'string') {
    content = escapeHtml(node.content);
  }

  // 应用样式
  let style = '';
  if (node.bold) style += 'font-weight: bold;';
  if (node.italic) style += 'font-style: italic;';
  if (node.strikethrough) style += 'text-decoration: line-through;';

  if (style) {
    return `<span style="${style}">${content}</span>`;
  }

  switch (node.type) {
    case 'inline-code':
      return `<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #c82506;">${escapeHtml(node.content)}</code>`;

    case 'link':
      return `<a href="${node.url}" style="color: #c82506; text-decoration: underline;">${escapeHtml(node.text)}</a>`;

    case 'text':
    default:
      return content;
  }
}

function getHeadingSize(level) {
  const sizes = {
    1: '24px',
    2: '22px',
    3: '20px',
    4: '18px',
    5: '16px',
    6: '14px'
  };
  return sizes[level] || '16px';
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 简单的Markdown检测 - 检查文本是否包含Markdown语法
export function containsMarkdown(text) {
  if (!text) return false;
  const markdownPatterns = [
    /#{1,6}\s+/,           // 标题
    /\*\*.+?\*\*/,         // 加粗
    /\*.+?\*/,             // 斜体
    /`.+?`/,               // 行内代码
    /```[\s\S]*?```/,      // 代码块
    /^[\-\*]\s+/m,         // 无序列表
    /^\d+\.\s+/m,          // 有序列表
    /^>.+/m,               // 引用
    /\[.+?\]\(.+?\)/,      // 链接
    /^(---|\*\*\*|___)\s*$/m // 分隔线
  ];
  return markdownPatterns.some(pattern => pattern.test(text));
}

// 导出默认对象
export default {
  parseMarkdown,
  renderToHtml,
  containsMarkdown
};
