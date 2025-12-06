# 使用指南

## 🎯 基本概念

这是一个**动态反代服务**，通过 URL 路径指定要代理的目标网站，无需修改代码。

## 📝 URL 格式

```
https://your-domain.pages.dev/[目标网站完整URL]
```

### 示例

| 目标网站 | 代理 URL |
|---------|---------|
| `https://example.com` | `https://your-domain.pages.dev/https://example.com` |
| `http://192.168.1.100:8080` | `https://your-domain.pages.dev/http://192.168.1.100:8080` |
| `https://emby.example.com:8096` | `https://your-domain.pages.dev/https://emby.example.com:8096` |

## 🎬 Emby 完整配置指南

### 场景 1：你的 Emby 服务器地址

假设你的 Emby 服务器是：
- 地址：`https://emby.luxrealm.com`
- 或：`http://192.168.1.100:8096`

### 场景 2：你的 Pages 域名

部署后得到的域名：
- `https://dolemby.kinobu.me`（如果绑定了自定义域名）
- 或：`https://your-project.pages.dev`（默认域名）

### 场景 3：拼接完整代理 URL

将两者拼接：
```
https://dolemby.kinobu.me/https://emby.luxrealm.com
```

### 场景 4：在 Emby 客户端中使用

#### Web 浏览器
直接访问：
```
https://dolemby.kinobu.me/https://emby.luxrealm.com
```

#### 移动端 App（iOS/Android）
1. 打开 Emby App
2. 点击"添加服务器"
3. 服务器地址填写：
   ```
   https://dolemby.kinobu.me/https://emby.luxrealm.com
   ```
4. 输入用户名和密码
5. 登录

#### 桌面端（Windows/Mac/Linux）
1. 打开 Emby 客户端
2. 设置 → 服务器
3. 服务器地址：
   ```
   https://dolemby.kinobu.me/https://emby.luxrealm.com
   ```

#### 电视端（Android TV/Apple TV）
1. 打开 Emby TV App
2. 添加服务器
3. 手动输入地址：
   ```
   https://dolemby.kinobu.me/https://emby.luxrealm.com
   ```

## 🔄 实际使用流程

### 步骤 1：确认你的信息

- [ ] Emby 服务器地址：`_________________`
- [ ] Pages 域名：`_________________`

### 步骤 2：拼接 URL

```
[Pages域名]/[Emby服务器地址]
```

例如：
```
https://dolemby.kinobu.me/https://emby.luxrealm.com
```

### 步骤 3：测试连接

在浏览器中访问拼接后的 URL，应该能看到 Emby 登录页面。

### 步骤 4：配置客户端

在所有 Emby 客户端中使用这个拼接后的 URL 作为服务器地址。

## 🌐 其他使用场景

### 代理其他网站

这个服务不仅可以代理 Emby，还可以代理任何网站：

```
# 代理 Google
https://your-domain.pages.dev/https://www.google.com

# 代理本地服务
https://your-domain.pages.dev/http://localhost:3000

# 代理内网服务（需要服务器能访问）
https://your-domain.pages.dev/http://192.168.1.100:8080
```

### 注意事项

1. **目标网站必须可以从公网访问**
   - Cloudflare 服务器需要能够访问目标网站
   - 内网地址（192.168.x.x）无法直接访问，除非有公网映射

2. **HTTPS vs HTTP**
   - 如果目标网站是 HTTPS，URL 中必须写 `https://`
   - 如果是 HTTP，写 `http://`

3. **端口号**
   - 如果有非标准端口，必须包含在 URL 中
   - 例如：`https://example.com:8096`

## 🎨 高级用法

### 绑定自定义域名

1. 在 Cloudflare Pages 项目中
2. Custom domains → Set up a custom domain
3. 输入你的域名（如 `emby.yourdomain.com`）
4. 添加 DNS 记录
5. 等待 SSL 证书生成

完成后可以使用：
```
https://emby.yourdomain.com/https://emby-server.com:8096
```

### 多个 Emby 服务器

如果你有多个 Emby 服务器，可以用同一个代理：

```
# 服务器 1
https://your-domain.pages.dev/https://emby1.example.com

# 服务器 2
https://your-domain.pages.dev/https://emby2.example.com

# 服务器 3
https://your-domain.pages.dev/http://192.168.1.100:8096
```

## 📊 性能说明

### 速度对比

| 访问方式 | 预期速度 | 说明 |
|---------|---------|------|
| 直接访问 | 最快 | 无代理开销 |
| Pages Functions | 5-10 MB/s | 有代理处理，但比 Worker 快 |
| Worker | 1-2 MB/s | CPU 限制严格 |

### 缓存机制

- **首次访问**：从源服务器获取，速度取决于源服务器
- **第二次访问**：从 CDN 缓存获取，速度极快
- **缓存时间**：流媒体文件缓存 7 天

## ❓ 常见问题

### Q: URL 太长怎么办？
A: 可以使用短链接服务，或者绑定自定义域名使 URL 更短。

### Q: 可以代理需要登录的网站吗？
A: 可以，Cookie 和认证信息会正确传递。

### Q: 支持 WebSocket 吗？
A: 支持，Emby 的实时通知功能可以正常工作。

### Q: 有流量限制吗？
A: Cloudflare Pages 免费版无流量限制，但有请求数限制（100,000/天）。

### Q: 可以用于生产环境吗？
A: 可以，但建议：
- 绑定自定义域名
- 监控使用量
- 准备备用方案

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Emby 官网](https://emby.media/)
- [项目 GitHub](https://github.com/your-repo)
