# 动态反代 - Cloudflare Pages Functions

基于 Cloudflare Pages Functions 的动态反代服务，支持通过 URL 路径指定目标网站，专为流媒体优化。

## 🚀 特性

- ✅ **动态 URL 反代**：无需修改代码，通过 URL 指定目标网站
- ✅ 完整的流媒体支持（视频/音频）
- ✅ Range 请求支持（断点续传）
- ✅ 7 天 CDN 缓存
- ✅ 完整的 CORS 支持
- ✅ 自动识别媒体文件
- ✅ Git 自动部署
- ✅ 完全免费

## 📦 部署步骤

### 方法 1：通过 Cloudflare Dashboard（推荐）

1. **Fork 或上传代码到 Git 仓库**
   - GitHub / GitLab / Bitbucket 均可

2. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com
   - 进入 **Pages** 页面

3. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权并选择你的仓库

4. **配置构建设置**
   ```
   Framework preset: None
   Build command: (留空)
   Build output directory: public
   ```

5. **部署完成**
   - 等待部署完成（约 1-2 分钟）
   - 部署成功后会得到：`https://your-project.pages.dev`
   - 可以绑定自定义域名

6. **开始使用**
   - 无需修改代码！
   - 直接通过 URL 指定要代理的网站

### 方法 2：通过 Wrangler CLI

1. **安装依赖**
   ```bash
   npm install
   ```

2. **本地测试**
   ```bash
   npm run dev
   ```
   访问：http://localhost:8788

3. **部署到 Cloudflare**
   ```bash
   npm run deploy
   ```

## 🔧 使用说明

### 基本用法

通过 URL 路径指定要代理的目标网站：

```
https://your-domain.pages.dev/https://target-website.com
```

### Emby 使用示例

假设你的 Pages 域名是 `proxy.pages.dev`，Emby 服务器是 `emby.example.com:8096`：

**访问方式：**
```
https://proxy.pages.dev/https://emby.example.com:8096
```

**在 Emby 客户端中配置：**
- 服务器地址：`https://proxy.pages.dev/https://emby.example.com:8096`
- 输入用户名和密码登录

### 其他网站示例

代理任意网站：
```
https://proxy.pages.dev/https://example.com
https://proxy.pages.dev/http://192.168.1.100:8080
```

## 📱 客户端配置

### Emby Web 客户端
直接访问：`https://your-domain.pages.dev/https://your-emby-server.com:8096`

### Emby 移动端/桌面端
服务器地址设置为：`https://your-domain.pages.dev/https://your-emby-server.com:8096`

### Emby for Android TV / iOS
服务器地址：`https://your-domain.pages.dev/https://your-emby-server.com:8096`

## 🎯 性能优化

### 缓存策略
- **流媒体文件**：7 天 CDN 缓存
- **API 请求**：1 小时缓存
- **静态资源**：自动缓存

### 支持的文件格式
- 视频：mp4, mkv, avi, mov, m4v, ts, webm
- 音频：mp3, aac, flac, wav
- 流媒体：m3u8, mpd (HLS/DASH)

### Range 请求支持
完整支持 HTTP Range 请求，可以：
- 拖动视频进度条
- 断点续传
- 多线程下载

## 🔍 故障排查

### 1. 无法访问目标网站
**检查项**：
- ✅ URL 格式是否正确（必须包含 `http://` 或 `https://`）
- ✅ 目标服务器是否可以从公网访问
- ✅ 防火墙是否开放端口
- ✅ SSL 证书是否有效（如果使用 HTTPS）

**测试方法**：
```bash
# 测试目标网站是否可访问
curl -I https://your-target-server.com

# 测试代理是否工作
curl -I https://your-domain.pages.dev/https://your-target-server.com
```

### 2. 视频播放卡顿
**可能原因**：
- Emby 源服务器带宽不足
- 视频文件过大（>100MB 可能受限）
- 未命中 CDN 缓存

**解决方法**：
- 检查 Response Headers 中的 `CF-Cache-Status`
- 如果是 `MISS`，第二次访问应该是 `HIT`
- 考虑使用转码降低码率

### 3. 登录失败
**检查项**：
- ✅ Cookie 是否正确传递
- ✅ CORS 头是否正确设置
- ✅ Emby 服务器是否允许代理访问

### 4. 查看日志
在 Cloudflare Dashboard 中：
- 进入你的 Pages 项目
- Functions → Real-time Logs
- 查看实时请求日志

或使用 CLI：
```bash
npm run tail
```

## 📊 性能对比

| 方案 | 速度 | 优点 | 缺点 |
|------|------|------|------|
| **Worker** | 1-2 MB/s | 简单 | CPU 限制严格 |
| **Pages Functions** | 5-10 MB/s | 更稳定 | 需要 Git 部署 |
| **直接 CDN** | 10-50 MB/s | 最快 | 需要公网 IP |

## 🔐 安全建议

1. **不要在代码中硬编码 API Key**
   - 使用环境变量
   - 或在客户端输入

2. **限制访问来源**（可选）
   ```javascript
   // 在 onRequest 函数开头添加
   const allowedOrigins = ['https://your-domain.com'];
   const origin = request.headers.get('Origin');
   if (origin && !allowedOrigins.includes(origin)) {
     return new Response('Forbidden', { status: 403 });
   }
   ```

3. **启用 Emby 的访问控制**
   - 在 Emby 设置中配置允许的代理地址

## 📝 更新日志

### v1.0.0 (2024-12-06)
- ✅ 初始版本
- ✅ 完整的流媒体支持
- ✅ Range 请求支持
- ✅ CORS 支持
- ✅ 自动缓存优化

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Functions 文档](https://developers.cloudflare.com/pages/functions/)
- [Emby 官网](https://emby.media/)

---

**注意**：此项目仅供学习交流使用，请遵守相关法律法规和服务条款。
