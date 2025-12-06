# 快速部署指南

## 🚀 5 分钟快速部署

### 第一步：准备代码

1. **修改配置**
   
   编辑 `functions/[[path]].js` 文件的第 6 行：
   
   ```javascript
   const EMBY_SERVER = 'https://your-emby-server.com:8096';
   ```
   
   改为你的 Emby 服务器实际地址，例如：
   - `https://emby.example.com:8096`
   - `http://192.168.1.100:8096`
   - `https://emby.mydomain.com`

### 第二步：上传到 Git

选择以下任一方式：

#### 方式 A：使用 GitHub（推荐）

```bash
cd emby-proxy-pages

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Emby proxy"

# 在 GitHub 创建新仓库后，关联并推送
git remote add origin https://github.com/你的用户名/emby-proxy.git
git branch -M main
git push -u origin main
```

#### 方式 B：使用 GitLab

```bash
# 类似 GitHub，只需修改 remote URL
git remote add origin https://gitlab.com/你的用户名/emby-proxy.git
git push -u origin main
```

### 第三步：在 Cloudflare 部署

1. **登录 Cloudflare**
   - 访问：https://dash.cloudflare.com
   - 如果没有账号，免费注册一个

2. **进入 Pages**
   - 左侧菜单选择 **Workers & Pages**
   - 点击 **Create application**
   - 选择 **Pages** 标签
   - 点击 **Connect to Git**

3. **连接 Git 仓库**
   - 选择 GitHub 或 GitLab
   - 授权 Cloudflare 访问你的仓库
   - 选择 `emby-proxy` 仓库

4. **配置构建设置**
   ```
   Project name: emby-proxy（或自定义名称）
   Production branch: main
   Framework preset: None
   Build command: (留空)
   Build output directory: public
   ```

5. **开始部署**
   - 点击 **Save and Deploy**
   - 等待 1-2 分钟部署完成

6. **获取访问地址**
   - 部署成功后会显示：`https://emby-proxy.pages.dev`
   - 这就是你的反代地址！

### 第四步：配置 Emby 客户端

#### Web 客户端
直接在浏览器访问：`https://emby-proxy.pages.dev`

#### 移动端 / 桌面端
1. 打开 Emby 客户端
2. 添加服务器
3. 服务器地址填写：`https://emby-proxy.pages.dev`
4. 输入用户名和密码登录

## 🎨 绑定自定义域名（可选）

如果你有自己的域名，可以绑定：

1. 在 Cloudflare Pages 项目中
2. 点击 **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入域名，例如：`emby.yourdomain.com`
5. 按照提示添加 DNS 记录
6. 等待 SSL 证书自动配置（约 5 分钟）

完成后可以使用：`https://emby.yourdomain.com`

## 🔄 更新代码

修改配置或代码后：

```bash
git add .
git commit -m "Update configuration"
git push
```

Cloudflare Pages 会自动检测到更新并重新部署。

## 🧪 本地测试（可选）

如果想在本地测试：

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev

# 访问 http://localhost:8788
```

## ✅ 验证部署

### 1. 检查服务状态
访问：`https://your-project.pages.dev`

应该看到配置页面，显示"✅ 服务运行中"

### 2. 测试 API 连接
访问：`https://your-project.pages.dev/System/Info/Public`

应该返回 Emby 服务器的公开信息（JSON 格式）

### 3. 测试视频播放
在 Emby 客户端中播放一个视频，检查：
- 是否能正常加载
- 是否能拖动进度条
- 播放速度是否正常

### 4. 检查缓存状态
打开浏览器开发者工具（F12）→ Network

播放视频时查看请求的 Response Headers：
```
CF-Cache-Status: HIT    ← 命中缓存（第二次访问）
CF-Cache-Status: MISS   ← 未命中缓存（第一次访问）
CF-Ray: xxx-xxx         ← Cloudflare 节点信息
```

## 🐛 常见问题

### Q1: 部署后访问 404
**原因**：构建配置错误

**解决**：
1. 进入 Pages 项目设置
2. Settings → Builds & deployments
3. 确认 Build output directory 是 `public`
4. 重新部署

### Q2: 无法连接到 Emby 服务器
**原因**：服务器地址配置错误或服务器不可访问

**解决**：
1. 检查 `functions/[[path]].js` 中的 `EMBY_SERVER` 配置
2. 确保 Emby 服务器可以从公网访问
3. 测试命令：
   ```bash
   curl -I https://your-emby-server.com:8096/System/Info/Public
   ```

### Q3: 视频播放很慢
**原因**：源服务器带宽不足或未命中缓存

**解决**：
1. 检查 Response Headers 中的 `CF-Cache-Status`
2. 第二次播放同一视频应该更快（缓存生效）
3. 考虑在 Emby 中启用转码降低码率

### Q4: 登录失败
**原因**：Cookie 或认证信息未正确传递

**解决**：
1. 确保代码中保留了 `cookie` 和 `authorization` 请求头
2. 检查 Emby 服务器的网络设置
3. 尝试在 Emby 中添加代理白名单

## 📊 监控和日志

### 查看实时日志
```bash
npm run tail
```

或在 Cloudflare Dashboard：
- 进入 Pages 项目
- Functions → Real-time Logs

### 查看分析数据
- 进入 Pages 项目
- Analytics 标签
- 查看请求量、带宽使用等

## 🎉 完成！

现在你的 Emby 反代服务已经成功部署在 Cloudflare Pages 上了！

享受高速的流媒体体验吧 🚀
