# 前端性能优化文档

本文档详细说明了前端性能优化的实现方案和使用方法。

## 一、代码分割（Code Splitting）

### 1.1 Webpack配置

在 `vue.config.js` 中配置了代码分割策略：

```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        name: 'chunk-vendors',
        test: /[\\/]node_modules[\\/]/,
        priority: 10,
        chunks: 'initial'
      },
      common: {
        name: 'chunk-common',
        minChunks: 2,
        priority: 5,
        chunks: 'initial',
        reuseExistingChunk: true
      }
    }
  }
}
```

### 1.2 分包配置

在 `manifest.json` 中启用了分包功能：

```json
{
  "app-plus": {
    "optimization": {
      "subPackages": true
    }
  },
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    }
  }
}
```

### 1.3 页面分包策略

- **主包**：首页、地图页（核心页面）
- **package-detail**：详情页、3D浏览页
- **package-user**：收藏页、设置页
- **package-other**：AI导览页、开发设置页

## 二、资源压缩

### 2.1 JavaScript压缩

生产环境自动启用Terser插件压缩JS代码。

### 2.2 CSS压缩

```javascript
css: {
  extract: process.env.NODE_ENV === 'production',
  sourceMap: false
}
```

### 2.3 Gzip压缩

```javascript
config.plugin('compression').use(require('compression-webpack-plugin'), [{
  algorithm: 'gzip',
  test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i,
  threshold: 10240,
  minRatio: 0.8
}]);
```

### 2.4 图片优化

```javascript
config.module
  .rule('images')
  .use('url-loader')
  .tap(options => ({
    ...options,
    limit: 8192, // 8KB以下转为base64
    fallback: {
      loader: 'file-loader',
      options: {
        name: 'static/img/[name].[hash:8].[ext]'
      }
    }
  }));
```

## 三、缓存策略

### 3.1 内存缓存 + 本地存储

在 `utils/cache.js` 中实现了双层缓存机制：

```javascript
// 内存缓存（快速访问）
const memoryCache = new Map();

// 本地存储缓存（持久化）
uni.setStorage({ key, data });
```

### 3.2 缓存时间配置

```javascript
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,        // 默认5分钟
  BUILDINGS: 10 * 60 * 1000,         // 建筑列表：10分钟
  BUILDING_DETAIL: 30 * 60 * 1000,   // 建筑详情：30分钟
  VISUALIZATION: 5 * 60 * 1000,      // 可视化数据：5分钟
  SEARCH: 2 * 60 * 1000,             // 搜索结果：2分钟
  USER_DATA: 60 * 1000               // 用户数据：1分钟
};
```

### 3.3 使用带缓存的API

```javascript
import { getBuildings, getBuildingById } from "../../services/apiWithCache.js";

// 自动使用缓存
const buildings = await getBuildings();

// 强制刷新
const freshData = await getBuildings({}, true);
```

## 四、HTTP缓存策略

### 4.1 请求去重

```javascript
import { deduplicatedRequest } from "../../utils/httpCache.js";

// 相同请求会共享结果
const result = await deduplicatedRequest(
  () => fetchData(),
  '/api/buildings',
  params
);
```

### 4.2 智能缓存请求

```javascript
import { smartCachedRequest } from "../../utils/httpCache.js";

const data = await smartCachedRequest(
  () => fetchData(),
  {
    url: '/api/buildings',
    method: 'GET',
    cacheKey: 'buildings',
    ttl: 10 * 60 * 1000
  }
);
```

### 4.3 缓存策略模式

- **Cache First**: 优先使用缓存，后台更新
- **Network First**: 优先使用网络，失败时回退到缓存
- **Cache Only**: 仅使用缓存
- **Network Only**: 仅使用网络

```javascript
import { 
  cacheFirstStrategy, 
  networkFirstStrategy 
} from "../../utils/httpCache.js";

// 缓存优先
const data = await cacheFirstStrategy(fetchFn, 'cache-key', ttl);

// 网络优先
const data = await networkFirstStrategy(fetchFn, 'cache-key', ttl);
```

## 五、懒加载优化

### 5.1 图片懒加载

在 `main.js` 中注册了全局懒加载指令：

```vue
<template>
  <!-- 图片懒加载 -->
  <image v-lazy="imageUrl" />
  
  <!-- 背景图懒加载 -->
  <view v-lazy="bgImageUrl"></view>
</template>
```

### 5.2 组件懒加载

```javascript
import { lazyLoadComponent, preloadComponent } from "../../utils/lazyLoad.js";

// 懒加载组件
const LazyComponent = lazyLoadComponent('./components/LazyComponent.vue');

// 预加载组件
preloadComponent('./components/HeavyComponent.vue');
```

### 5.3 虚拟列表

```javascript
import { calculateVirtualList } from "../../utils/lazyLoad.js";

const { 
  startIndex, 
  endIndex, 
  offsetY, 
  visibleItems 
} = calculateVirtualList(
  items, 
  scrollTop, 
  containerHeight, 
  itemHeight
);
```

## 六、性能监控

### 6.1 页面加载时间监控

```javascript
import { recordPageLoad } from "../../utils/performance.js";

// 记录页面加载时间
recordPageLoad('home', loadTime);
```

### 6.2 API性能监控

```javascript
import { recordApiCall } from "../../utils/performance.js";

// 记录API调用性能
recordApiCall('getBuildings', duration, success);
```

### 6.3 获取性能报告

```javascript
import { 
  getPerformanceReport, 
  printPerformanceReport 
} from "../../utils/performance.js";

// 获取报告
const report = getPerformanceReport();

// 打印到控制台
printPerformanceReport();
```

## 七、节流与防抖

### 7.1 节流（Throttle）

```javascript
import { throttle } from "../../utils/lazyLoad.js";

// 创建节流函数
const throttledFn = throttle(fn, 100);

// 在组件中使用
this.throttledOnScroll = throttle(this.onScroll.bind(this), 100);
```

### 7.2 防抖（Debounce）

```javascript
import { debounce } from "../../utils/lazyLoad.js";

// 创建防抖函数
const debouncedFn = debounce(fn, 300);
```

## 八、字体优化

### 8.1 系统字体栈

```javascript
import { systemFontStack } from "../../utils/fontLoader.js";

// 使用系统字体栈
font-family: ${systemFontStack.chinese};
```

### 8.2 字体子集

```javascript
import { fontSubsets, generateSubsetFontCSS } from "../../utils/fontLoader.js";

// 生成字体子集CSS
const css = generateSubsetFontCSS('CustomFont', fontSubsets.architecture.chars);
```

### 8.3 字体加载优化

```javascript
import { loadFont, preloadFont } from "../../utils/fontLoader.js";

// 预加载字体
preloadFont('/fonts/custom-font.woff2');

// 动态加载字体
await loadFont('CustomFont', '/fonts/custom-font.woff2');
```

## 九、网络优化

### 9.1 网络状态检测

```javascript
import { getNetworkStatus } from "../../utils/httpCache.js";

const status = getNetworkStatus();
// { effectiveType: '4g', downlink: 10, rtt: 50, saveData: false }
```

### 9.2 根据网络状态调整策略

```javascript
import { getOptimizedRequestConfig } from "../../utils/httpCache.js";

const config = getOptimizedRequestConfig();
// { timeout: 10000, retryCount: 1, enableCache: true, imageQuality: 'high' }
```

### 9.3 请求重试

```javascript
import { retryRequest } from "../../utils/httpCache.js";

const result = await retryRequest(fetchFn, 3, 1000);
```

## 十、使用建议

### 10.1 API调用最佳实践

```javascript
// 推荐：使用带缓存的API
import { getBuildings } from "../../services/apiWithCache.js";

async loadData() {
  try {
    // 自动使用缓存
    const data = await getBuildings();
    
    // 下拉刷新时强制更新
    const freshData = await getBuildings({}, true);
  } catch (error) {
    console.error(error);
  }
}
```

### 10.2 滚动事件优化

```javascript
import { throttle } from "../../utils/lazyLoad.js";

export default {
  onLoad() {
    // 初始化节流函数
    this.throttledOnScroll = throttle(this.onScroll.bind(this), 100);
  },
  
  methods: {
    handleScroll(e) {
      // 使用节流的滚动处理
      this.throttledOnScroll(e);
    }
  }
}
```

### 10.3 性能监控集成

```javascript
import { 
  recordPageLoad, 
  recordApiCall,
  startPeriodicReporting 
} from "../../utils/performance.js";

export default {
  mounted() {
    this._pageLoadStart = Date.now();
  },
  
  onReady() {
    const loadTime = Date.now() - this._pageLoadStart;
    recordPageLoad('pageName', loadTime);
  }
}

// 启动定期性能报告
startPeriodicReporting(60000); // 每分钟报告一次
```

## 十一、验证清单

- [ ] 代码分割配置正确，分包加载正常
- [ ] 资源压缩生效，文件体积减小
- [ ] 缓存功能正常工作，重复请求使用缓存
- [ ] 懒加载图片正常显示
- [ ] 滚动事件节流生效，不卡顿
- [ ] 性能监控数据正常收集
- [ ] 多端兼容性测试通过（H5、小程序、App）

## 十二、注意事项

1. **缓存清理**：定期调用 `cleanExpiredCache()` 清理过期缓存
2. **内存管理**：大列表使用虚拟列表，避免内存溢出
3. **网络容错**：弱网环境下使用重试机制和降级策略
4. **兼容性**：部分API在小程序环境有差异，使用条件编译
5. **监控告警**：关注性能报告中的慢页面和慢API，及时优化
