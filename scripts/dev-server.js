#!/usr/bin/env node

/**
 * UMA开发服务器
 * 提供本地开发环境和概念预览
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const CONCEPTS_DIR = path.join(__dirname, '..', 'CONCEPTS');

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 创建服务器
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // 默认页面
  if (pathname === '/') {
    pathname = '/README.md';
  }

  // 构建文件路径
  let filePath = path.join(__dirname, '..', pathname);

  // 安全性检查：防止目录遍历
  if (!filePath.startsWith(path.join(__dirname, '..'))) {
    res.writeHead(403);
    res.end('Access forbidden');
    return;
  }

  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 文件不存在，尝试作为概念查找
      if (pathname.startsWith('/concepts/')) {
        const conceptId = pathname.split('/').pop();
        const conceptFile = path.join(CONCEPTS_DIR, `${conceptId}.md`);

        fs.readFile(conceptFile, 'utf8', (err, data) => {
          if (err) {
            serve404(res);
          } else {
            serveMarkdown(res, data, conceptId);
          }
        });
      } else {
        serve404(res);
      }
      return;
    }

    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // 读取文件
    fs.readFile(filePath, (err, content) => {
      if (err) {
        serve500(res, err);
        return;
      }
      
      // 特殊处理Markdown文件
      if (ext === '.md') {
        serveMarkdown(res, content.toString(), path.basename(filePath));
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

// 服务Markdown文件（转换为简单HTML）
function serveMarkdown(res, markdown, filename) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UMA - ${filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
    }
    .content {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1, h2, h3, h4 {
      color: #2d3748;
      margin-top: 2rem;
    }
    h1 {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    code {
      background: #f7fafc;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }
    pre {
      background: #1a202c;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #cbd5e0;
      padding-left: 1rem;
      margin-left: 0;
      color: #4a5568;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background: #edf2f7;
    }
    .footer {
      text-align: center;
      margin-top: 3rem;
      color: #718096;
      font-size: 0.9rem;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: #4299e1;
      text-decoration: none;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/5.1.0/marked.min.js"></script>
  <script>hljs.highlightAll();</script>
</head>
<body>
  <div class="header">
    <a href="/" class="back-link">← 返回首页</a>
    <h1>泛在媒体艺术 (UMA)</h1>
    <p>概念预览: ${filename}</p>
  </div>
  <div class="content" id="content">
    <!-- Markdown内容将通过JavaScript渲染 -->
  </div>
  <div class="footer">
    <p>UMA开发服务器 | 本页面为自动生成的预览</p>
    <p>正式文档请访问项目GitHub仓库</p>
  </div>
  <script>
    // 渲染Markdown
    const markdownContent = ${JSON.stringify(markdown)};
    document.getElementById('content').innerHTML = marked.parse(markdownContent);
    
    // 为所有链接添加target="_blank"
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  </script>
</body>
</html>
`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(html);
}

// 404错误处理
function serve404(res) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>404 Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 50px;
      background: #f8f9fa;
      color: #333;
    }
    h1 {
      color: #e53e3e;
    }
    a {
      color: #4299e1;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>404 - 概念未找到</h1>
  <p>您请求的UMA概念不存在或路径错误。</p>
  <p><a href="/">返回首页</a></p>
</body>
</html>
`;
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(html);
}

// 500错误处理
function serve500(res, error) {
  console.error('Server error:', error);
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>500 Server Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 50px;
      background: #f8f9fa;
      color: #333;
    }
    h1 {
      color: #e53e3e;
    }
    a {
      color: #4299e1;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    pre {
      text-align: left;
      max-width: 600px;
      margin: 20px auto;
      padding: 10px;
      background: #f1f1f1;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>500 - 服务器错误</h1>
  <p>处理请求时发生错误。</p>
  <pre>${error.message}</pre>
  <p><a href="/">返回首页</a></p>
</body>
</html>
`;
  res.writeHead(500, { 'Content-Type': 'text/html' });
  res.end(html);
}

// 启动服务器
server.listen(PORT, () => {
  console.log(`
🎨 泛在媒体艺术 (UMA) 开发服务器已启动！

访问地址: http://localhost:${PORT}

可用端点:

/ 项目首页 (README.md)
/concepts/{id} 概念预览 (如 /concepts/UMA-001)
/MANIFESTO.md 宣言文档
/EXAMPLES/ 示例项目

按 Ctrl+C 停止服务器
`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n\n👋 正在关闭UMA开发服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});
