<template>
  <view class="optimized-image-container">
    <!-- 低质量占位图 -->
    <image
      v-if="showPlaceholder"
      class="image-placeholder"
      :src="placeholder"
      :mode="mode"
      lazy-load
    />
    
    <!-- 主图片 -->
    <image
      class="optimized-image"
      :class="{ 'loaded': isLoaded, 'error': hasError }"
      :src="currentSrc"
      :mode="mode"
      :lazy-load="lazyLoad"
      :show-menu-by-longpress="showMenuByLongpress"
      @load="onLoad"
      @error="onError"
    />
    
    <!-- 加载指示器 -->
    <view v-if="!isLoaded && !hasError" class="loading-overlay">
      <view class="loading-spinner"></view>
    </view>
    
    <!-- 错误重试 -->
    <view v-if="hasError" class="error-overlay" @click="retry">
      <view class="error-icon">🖼️</view>
      <text class="error-text">加载失败，点击重试</text>
    </view>
  </view>
</template>

<script>
// 默认占位图（SVG 低质量占位）
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCBmaWxsPSIjZjJlYWQzIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIvPjx0ZXh0IGZpbGw9IiM5ZDc1NWIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y+R5biD5Zu+54mHPC90ZXh0Pjwvc3ZnPg==';

export default {
  name: 'OptimizedImage',
  props: {
    // 图片源地址
    src: {
      type: String,
      required: true
    },
    // 图片显示模式
    mode: {
      type: String,
      default: 'aspectFill'
    },
    // 宽度
    width: {
      type: [String, Number],
      default: '100%'
    },
    // 高度
    height: {
      type: [String, Number],
      default: 'auto'
    },
    // 占位图
    placeholder: {
      type: String,
      default: DEFAULT_PLACEHOLDER
    },
    // 是否懒加载
    lazyLoad: {
      type: Boolean,
      default: true
    },
    // 是否启用长按菜单
    showMenuByLongpress: {
      type: Boolean,
      default: false
    },
    // 目标宽度（用于生成优化链接）
    targetWidth: {
      type: Number,
      default: 400
    },
    // 目标高度
    targetHeight: {
      type: Number,
      default: 300
    },
    // 图片质量（1-100）
    quality: {
      type: Number,
      default: 80,
      validator: (v) => v >= 1 && v <= 100
    },
    // 输出格式
    format: {
      type: String,
      default: 'webp',
      validator: (v) => ['webp', 'jpg', 'png'].includes(v)
    }
  },
  data() {
    return {
      isLoaded: false,
      hasError: false,
      retryCount: 0,
      maxRetries: 3,
      currentSrc: ''
    };
  },
  computed: {
    // 是否显示占位图
    showPlaceholder() {
      return !this.isLoaded && !this.hasError;
    },
    // 优化后的图片地址
    optimizedSrc() {
      return this.getOptimizedImageUrl(this.src);
    }
  },
  watch: {
    src: {
      immediate: true,
      handler(newSrc) {
        if (newSrc) {
          this.resetState();
          this.currentSrc = this.optimizedSrc;
        }
      }
    }
  },
  methods: {
    // 重置状态
    resetState() {
      this.isLoaded = false;
      this.hasError = false;
      this.retryCount = 0;
    },
    // 获取优化后的图片URL
    getOptimizedImageUrl(originalUrl) {
      if (!originalUrl) return '';
      
      // 处理七牛云图片
      if (this.isQiniuUrl(originalUrl)) {
        return this.getQiniuOptimizedUrl(originalUrl);
      }
      
      // 处理其他CDN图片（可扩展）
      return originalUrl;
    },
    // 判断是否是七牛云URL
    isQiniuUrl(url) {
      return url.includes('qiniudn.com') || 
             url.includes('qbox.me') ||
             url.includes('clouddn.com');
    },
    // 生成七牛云优化URL
    getQiniuOptimizedUrl(url) {
      const params = [];
      
      // 格式转换
      if (this.format) {
        params.push(`format/${this.format}`);
      }
      
      // 质量设置
      if (this.quality) {
        params.push(`quality/${this.quality}`);
      }
      
      // 尺寸裁剪
      if (this.targetWidth && this.targetHeight) {
        params.push(`imageView2/0/w/${this.targetWidth}/h/${this.targetHeight}`);
      } else if (this.targetWidth) {
        params.push(`imageView2/2/w/${this.targetWidth}`);
      } else if (this.targetHeight) {
        params.push(`imageView2/2/h/${this.targetHeight}`);
      }
      
      if (params.length === 0) return url;
      
      // 拼接参数
      const separator = url.includes('?') ? '&' : '?';
      return url + separator + params.join('/');
    },
    // 图片加载成功
    onLoad(e) {
      this.isLoaded = true;
      this.hasError = false;
      this.$emit('load', e);
    },
    // 图片加载失败
    onError(e) {
      this.$emit('error', e);
      
      // 尝试重试
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => {
          this.currentSrc = this.optimizedSrc + (this.optimizedSrc.includes('?') ? '&' : '?') + '_t=' + Date.now();
        }, 1000 * this.retryCount);
      } else {
        this.hasError = true;
        this.isLoaded = false;
      }
    },
    // 手动重试
    retry() {
      this.retryCount = 0;
      this.hasError = false;
      this.isLoaded = false;
      this.currentSrc = this.optimizedSrc + (this.optimizedSrc.includes('?') ? '&' : '?') + '_t=' + Date.now();
    }
  }
};
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  background: var(--bg-secondary, #e8dec3);
}

.optimized-image-container,
.optimized-image,
.image-placeholder {
  width: 100%;
  height: 100%;
  display: block;
}

/* 占位图 */
.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  filter: blur(8rpx);
  transform: scale(1.1);
  transition: opacity 0.3s ease;
}

/* 主图片 */
.optimized-image {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.optimized-image.loaded {
  opacity: 1;
}

.optimized-image.error {
  display: none;
}

/* 加载遮罩 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  background: rgba(248, 244, 233, 0.8);
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid var(--border, #d4c4a8);
  border-top-color: var(--primary, #a63131);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误遮罩 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 4;
  background: rgba(248, 244, 233, 0.95);
  cursor: pointer;
  transition: background 0.2s ease;
}

.error-overlay:active {
  background: rgba(232, 222, 195, 0.95);
}

.error-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.error-text {
  font-size: 24rpx;
  color: var(--text-secondary, #5a4a3a);
  text-align: center;
}
</style>
