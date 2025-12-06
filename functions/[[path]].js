// Cloudflare Pages Functions - 动态反代
// 优化版本，专为流媒体设计
// 支持通过 URL 路径动态指定目标网站

export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    
    // 如果访问根路径，返回配置页面
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(getConfigPage(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    
    // 从路径中提取目标 URL
    // 格式: https://your-domain.pages.dev/https://target-site.com/path
    let targetUrlStr = url.pathname.substring(1); // 移除开头的 /
    targetUrlStr = decodeURIComponent(targetUrlStr);
    
    // 确保目标 URL 带有协议
    if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
      targetUrlStr = url.protocol + '//' + targetUrlStr;
    }
    
    // 保留查询参数
    if (url.search) {
      targetUrlStr += url.search;
    }
    
    console.log(`[Proxy] ${request.method} ${targetUrlStr}`);
    
    // 复制请求头，保留所有 Emby 需要的头部
    const headers = new Headers();
    
    // 关键请求头列表
    const preserveHeaders = [
      'range',
      'if-range',
      'if-modified-since',
      'if-none-match',
      'accept',
      'accept-encoding',
      'accept-language',
      'user-agent',
      'x-emby-token',
      'x-emby-authorization',
      'x-emby-client',
      'x-emby-device-name',
      'x-emby-device-id',
      'authorization',
      'cookie',
      'content-type'
    ];
    
    preserveHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    });
    
    // 设置 Host 头为目标服务器
    const targetHost = new URL(targetUrlStr).host;
    headers.set('Host', targetHost);
    
    // 判断是否为流媒体请求
    const isMediaRequest = 
      targetUrlStr.includes('/Videos/') ||
      targetUrlStr.includes('/video/') ||
      targetUrlStr.includes('/stream') ||
      targetUrlStr.match(/\.(mp4|mkv|avi|mov|m4v|ts|m3u8|mpd|webm)$/i);
    
    // 创建请求配置
    const fetchOptions = {
      method: request.method,
      headers: headers,
      redirect: 'manual'
    };
    
    // 对于 POST/PUT/PATCH 请求，传递 body
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      fetchOptions.body = request.body;
    }
    
    // 对于流媒体请求，使用更激进的缓存策略
    if (isMediaRequest) {
      fetchOptions.cf = {
        cacheTtl: 604800, // 7 天
        cacheEverything: true,
        polish: 'off',
        minify: { javascript: false, css: false, html: false }
      };
    } else {
      // 其他请求使用标准缓存
      fetchOptions.cf = {
        cacheTtl: 3600, // 1 小时
        cacheEverything: false
      };
    }
    
    // 发起请求
    const response = await fetch(targetUrlStr, fetchOptions);
    
    // 创建新的响应头
    const responseHeaders = new Headers(response.headers);
    
    // 添加 CORS 支持
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Expose-Headers', '*');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    
    // 对于流媒体响应，优化缓存头
    const contentType = response.headers.get('content-type') || '';
    if (isMediaRequest || contentType.includes('video/') || contentType.includes('audio/')) {
      responseHeaders.set('Cache-Control', 'public, max-age=604800, immutable');
      
      // 确保支持 Range 请求
      if (!responseHeaders.has('Accept-Ranges')) {
        responseHeaders.set('Accept-Ranges', 'bytes');
      }
      
      console.log(`[Media] Streaming ${url.pathname}, Range: ${request.headers.get('range') || 'full'}`);
    }
    
    // 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (location) {
        // 将重定向 URL 也通过代理
        let newLocation;
        if (location.startsWith('http')) {
          // 绝对路径，包装到代理 URL 中
          newLocation = `${url.origin}/${encodeURIComponent(location)}`;
        } else {
          // 相对路径，拼接到目标服务器
          const targetOrigin = new URL(targetUrlStr).origin;
          const absoluteLocation = `${targetOrigin}${location.startsWith('/') ? '' : '/'}${location}`;
          newLocation = `${url.origin}/${encodeURIComponent(absoluteLocation)}`;
        }
        responseHeaders.set('Location', newLocation);
      }
    }
    
    // 返回响应（流式传输）
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('[Error]', error);
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 配置页面 HTML
function getConfigPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emby Proxy - Cloudflare Pages</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    
    .status {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .status-title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 8px;
    }
    
    .status-text {
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .info-section {
      margin-bottom: 25px;
    }
    
    .info-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    
    .info-title::before {
      content: "→";
      margin-right: 8px;
      color: #667eea;
      font-weight: bold;
    }
    
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      overflow-x: auto;
      margin-top: 8px;
    }
    
    .highlight {
      color: #fbbf24;
      font-weight: 600;
    }
    
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .warning-title {
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }
    
    .warning-text {
      color: #78350f;
      font-size: 14px;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }
    
    @media (max-width: 640px) {
      .container {
        padding: 25px;
      }
      
      h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 Emby Proxy</h1>
    <p class="subtitle">Cloudflare Pages Functions 反代服务</p>
    
    <div class="status">
      <div class="status-title">✅ 服务运行中</div>
      <div class="status-text">
        此代理服务已成功部署在 Cloudflare Pages 上，支持动态反代任意网站。
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-title">使用方法</div>
      <div class="status-text">
        通过 URL 路径指定要代理的目标网站：
      </div>
      <div class="code-block">
        <span class="highlight">https://your-domain.pages.dev/https://target-site.com</span>
      </div>
      <div class="status-text" style="margin-top: 10px;">
        示例：代理 Emby 服务器
      </div>
      <div class="code-block">
        <span class="highlight">https://your-domain.pages.dev/https://emby.example.com:8096</span>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-title">Emby 客户端配置</div>
      <div class="status-text">
        在 Emby 客户端中，服务器地址填写：<br>
        <code>https://your-domain.pages.dev/https://your-emby-server.com:8096</code>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-title">性能优化</div>
      <div class="status-text">
        • 流媒体文件缓存 7 天<br>
        • 支持 Range 请求（断点续传）<br>
        • 完整的 CORS 支持<br>
        • 自动识别视频/音频文件
      </div>
    </div>
    
    <div class="warning">
      <div class="warning-title">⚠️ 重要提示</div>
      <div class="warning-text">
        此服务可以代理任意网站，请合理使用。目标网站必须可以从公网访问。
      </div>
    </div>
    
    <div class="footer">
      Powered by Cloudflare Pages Functions
    </div>
  </div>
</body>
</html>`;
}
