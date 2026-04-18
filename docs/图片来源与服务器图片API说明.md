# 图片来源与服务器图片 API 说明

## 1. 这份文档解决什么问题

这个项目里，前端可以本地运行，也可以部署到服务器；图片来源则由后端统一决定。

你在设置页里看到的“图片来源”，本质上是一个“路由开关”。它决定的是：前端把请求发给后端后，后端最终按哪种规则生成图片地址。

当前设置页有三档：

1. 服务器映射：前端告诉后端“由服务器决定图片来源”，后端再按自己的配置返回本地静态图或对象存储图。
2. 本地存储：后端把建筑 ID 映射到本地静态图片路径。
3. 对象存储：后端把图片 key 生成七牛签名 URL，前端直接访问该 URL。

如果你希望“本地前端 + 服务器图片”，正确做法是：

1. 前端把 API 地址指向服务器后端。
2. 后端按当前配置返回图片 URL。
3. 前端只消费后端返回的 image / coverImage / originalImage / url 字段，不自己拼图片路径。

---

## 2. 两个容易混淆的概念

### 2.1 API 地址

API 地址决定前端请求发到哪里，例如：

    http://localhost:9527

或：

    https://your-domain.com

这个地址在前端的开发设置里配置，保存后会写入本地缓存 API_BASE_URL。

### 2.2 图片来源模式

图片来源模式决定后端怎么生成图片 URL。当前支持：

1. server：交给后端配置决定。
2. local：本地静态资源。
3. object：对象存储（七牛）。

这个模式会通过前端请求头 X-Image-Source 传给后端；如果前端没传，后端会回退到环境变量 IMAGE_SOURCE_MODE。

规则是：

1. 传 `server` 时，后端忽略前端指定的具体存储类型，直接按 `IMAGE_SOURCE_MODE` 选择。
2. 传 `local` 时，后端强制走本地映射。
3. 传 `object` 时，后端强制走对象存储签名 URL。

当前为了避免错配，服务器映射和本地存储都优先使用映射表；命中不到映射时，后端不会自动补一张无关图片。

---

## 3. 前端是怎么拿到图片的

前端请求不是直接取图片文件，而是先调后端 API，再从返回数据里拿图片地址。

### 3.1 请求层

前端统一通过 [frontend/services/api.js](../frontend/services/api.js) 发请求，会自动带上：

1. API 基地址。
2. 请求头 X-Image-Source。

### 3.2 设置页

设置页里的“图片来源”只负责切换当前模式：

1. 服务器映射（后端决定）
2. 对象存储（七牛）
3. 本地存储

它会把选择保存到本地缓存，后续请求都会带上这个选择。

### 3.3 业务接口返回的图片字段

建筑列表和详情通常返回这些字段：

1. image
2. coverImage
3. originalImage

素材接口返回这些字段：

1. url
2. images

前端组件一般会直接使用这些字段，不会再去二次拼接图片路径。

---

## 4. 后端在不同模式下怎么处理

### 4.1 服务器映射模式

当 X-Image-Source=server 时，后端不会直接把它当作一个固定存储类型，而是继续读取 IMAGE_SOURCE_MODE：

1. 如果 IMAGE_SOURCE_MODE=local，就走本地存储模式。
2. 如果 IMAGE_SOURCE_MODE=object，就走对象存储模式。

这个模式适合“前端只想说图片来自后端，具体细节由服务器统一决定”的场景。

在当前实现里，服务器映射不会再用随机占位图兜底；如果映射表没有对应图片，接口会返回空图，让前端明确展示“暂无图片”。

### 4.2 本地存储模式

当 IMAGE_SOURCE_MODE=local，或者前端请求头 X-Image-Source=local 时，后端会：

1. 通过建筑 ID 去本地映射表查找图片相对路径。
2. 如果配置了 LOCAL_ASSET_DIR，就去该目录下寻找更合适的本地图片。
3. 如果配置了 LOCAL_ASSET_BASE_URL，就把相对路径拼成可访问的完整 URL。

这个模式同样以映射表为准，不再补无关图。

对应实现位置：

1. [backend/src/config/localImageMap.js](../backend/src/config/localImageMap.js)
2. [backend/src/services/buildingService.js](../backend/src/services/buildingService.js)
3. [backend/src/services/materialService.js](../backend/src/services/materialService.js)

### 4.3 对象存储模式

当 IMAGE_SOURCE_MODE=object，或者前端请求头 X-Image-Source=object 时，后端会：

1. 把图片 key 交给七牛签名逻辑处理。
2. 生成可直接访问的签名 URL。
3. 对列表页图片做缩略图优化，对详情页图片做更高质量输出。

如果七牛桶是私有桶，后端会返回带过期时间的签名地址；如果是公开桶，则直接返回公开 URL。

对应实现位置：

1. [backend/src/services/qiniuService.js](../backend/src/services/qiniuService.js)
2. [backend/src/services/buildingService.js](../backend/src/services/buildingService.js)
3. [backend/src/services/materialService.js](../backend/src/services/materialService.js)

---

## 5. 服务器侧实际返回哪些图片 API

如果你说的“服务器 API 获得图片”，那真正会返回图片地址的接口主要是下面这些：

1. GET /api/buildings
2. GET /api/buildings/:id
3. GET /api/material?materialId=xxx
4. GET /api/materials

另外还有两个和签名链路相关的接口：

1. GET /api/assets/signed
2. GET /api/assets/refresh

接口路由位置在 [backend/src/routes/index.js](../backend/src/routes/index.js)。

### 5.1 建筑列表接口

/api/buildings 会返回建筑摘要数组。每项通常带有：

1. image：列表缩略图。
2. coverImage：列表封面图。
3. originalImage：原图或更大图。

### 5.2 建筑详情接口

/api/buildings/:id 会返回单个建筑详情。图片通常放在 image 字段里。

### 5.3 素材接口

/api/material?materialId=xxx 会返回：

1. url：主图片地址。
2. images：图片数组。

这个接口最适合做详情页图片展示。

### 5.4 签名链路接口

3D 资源和私有资源通过签名链路返回：

1. /api/assets/signed：校验 token 后 302 到真实资源。
2. /api/assets/refresh：在过期前刷新 token。

---

## 6. 服务器需要做哪些事情

### 6.1 最小可用配置

如果你只是想先让本地前端连服务器后端，并从服务器拿图，至少要准备这些：

    NODE_ENV=production
    PORT=9527
    PUBLIC_BASE_URL=https://your-domain.com
    CORS_ORIGIN=https://your-frontend-domain.com

然后按图片模式补充一套：

#### 服务器映射模式

    X-Image-Source=server

服务器会继续按 IMAGE_SOURCE_MODE 决定最终返回本地图还是对象存储图。

#### 本地存储模式

    IMAGE_SOURCE_MODE=local
    LOCAL_ASSET_BASE_URL=https://your-domain.com/assets
    LOCAL_ASSET_DIR=/srv/ancient-assets

#### 对象存储模式

    IMAGE_SOURCE_MODE=object
    QINIU_ACCESS_KEY=...
    QINIU_SECRET_KEY=...
    QINIU_BUCKET=...
    QINIU_DOMAIN=...
    QINIU_USE_HTTPS=true
    QINIU_PRIVATE_BUCKET=true

### 6.2 如果图片放在服务器本地

服务器要做的事是把本地图片目录暴露成可访问的静态路径，常见做法有两种：

1. 用 Nginx 直接挂载 /assets。
2. 用 Node 服务器额外挂静态目录。

后端会根据 LOCAL_ASSET_BASE_URL 拼出最终 URL，所以这个 base URL 必须是真实可访问的地址。

### 6.3 如果图片放对象存储

服务器要做的事是保证七牛配置完整，并让后端能正常生成签名 URL：

1. 配置 AccessKey / SecretKey / Bucket / Domain。
2. 私有桶时打开 QINIU_PRIVATE_BUCKET=true。
3. 让前端拿到的图片 URL 直接指向七牛。

### 6.4 反向代理要点

如果你用 Nginx 代理后端，建议确保这些头能透传：

1. Host
2. X-Forwarded-For
3. X-Forwarded-Proto

这样后端生成的签名地址、刷新地址、资源地址才不会出现协议或域名错乱。

---

## 7. 推荐的三种部署方式

### 7.1 本地前端 + 远程后端 + 对象存储

这是最省事的线上联调方式。

1. 前端本地运行。
2. API_BASE_URL 指向服务器后端。
3. 图片来源设置为对象存储。
4. 后端返回七牛签名 URL。

适合：图片资源已经在七牛上，或者你希望统一走对象存储。

### 7.2 本地前端 + 远程后端 + 服务器本地图片

适合：图片已经部署在服务器磁盘上，暂时不想上对象存储。

1. 前端本地运行。
2. API_BASE_URL 指向服务器后端。
3. 图片来源设置为本地存储。
4. 后端把本地相对路径拼成服务器静态 URL。

适合：你想先简单上线，后面再迁移到对象存储。

### 7.3 前端和后端都部署到同一台服务器

适合：你想把部署关系尽量简化。

1. 前端和后端同域或同主机。
2. 前端请求后端 API。
3. 后端返回同域图片地址或七牛地址。

适合：减少跨域和路径配置问题。

---

## 8. 你当前这个项目里，实际该怎么配

如果你的目标是“前端本地跑，图片从服务器拿”，建议按这个顺序做：

1. 先把后端部署到服务器并确认 /api/health 正常。
2. 把前端开发设置里的 API 地址改成服务器地址。
3. 在设置页里把图片来源选成“本地存储”或“对象存储”。
4. 如果选本地存储，就确保服务器的 LOCAL_ASSET_BASE_URL 能访问图片。
5. 如果选对象存储，就确保七牛配置完整并能签名。

简单记忆就是：

1. API 地址决定“问谁要数据”。
2. 图片来源决定“后端用什么方式给图”。

---

## 9. 联调检查清单

1. 访问 /api/health，确认后端可用。
2. 访问 /api/buildings，确认返回的 image / coverImage 可直接打开。
3. 访问 /api/material?materialId=taihe_dian，确认 url 和 images 正常。
4. 在设置页切换“本地存储 / 对象存储”，刷新后再观察图片是否变化。
5. 如果是私有桶，确认签名 URL 过期后能通过 /api/assets/refresh 刷新。

---

## 10. 一句话结论

前端本地运行没问题，图片也完全可以来自服务器；关键不是前端在哪跑，而是后端在什么模式下返回图片 URL。

如果你要的是“统一由服务器处理图片映射”，那就把服务器的图片模式、静态目录、七牛配置和 API 基地址一起配好，前端只负责选模式和消费接口。
