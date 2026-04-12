<template>
  <view>
    <!-- 图片素材 -->
    <view v-if="material.type === 'image'" class="material-wrapper">
      <view class="gallery-container">
        <!-- 主图 Swiper -->
        <swiper
          v-if="hasImage"
          class="material-swiper"
          :style="{ height: swiperHeight + 'px' }"
          :current="currentIndex"
          :circular="imageList.length > 1"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(imgSrc, index) in imageList" :key="index">
            <view class="swiper-image-box">
              <image
                class="material-image"
                :src="imgSrc"
                mode="widthFix"
                lazy-load="true"
                @load="(e) => onImageLoad(e, index)"
                @error="$emit('image-error')"
                @click="previewImage(index)"
              />
            </view>
          </swiper-item>
        </swiper>

        <!-- 装饰性元素 -->
        <view class="gallery-decor-top"></view>
        <view class="gallery-decor-bottom"></view>

        <!-- 分页显示 -->
        <view v-if="imageList.length > 1" class="gallery-pagination">
          <text class="pagination-main">{{ currentIndex + 1 }}</text>
          <text class="pagination-divider">/</text>
          <text class="pagination-total">{{ imageList.length }}</text>
        </view>

        <!-- 显式的左右切换按钮 -->
        <view v-if="imageList.length > 1" class="gallery-nav prev" @click.stop="prevImage">
          <text class="nav-icon">‹</text>
        </view>
        <view v-if="imageList.length > 1" class="gallery-nav next" @click.stop="nextImage">
          <text class="nav-icon">›</text>
        </view>
      </view>

      <!-- 缩略图导航栏 -->
      <scroll-view 
        v-if="imageList.length > 1" 
        class="thumbnail-bar" 
        scroll-x 
        :scroll-into-view="'thumb-' + Math.max(0, currentIndex - 2)"
        scroll-with-animation
      >
        <view class="thumbnail-list">
          <view 
            v-for="(imgSrc, index) in imageList" 
            :key="index"
            :id="'thumb-' + index"
            class="thumbnail-item"
            :class="{ active: currentIndex === index }"
            @click="currentIndex = index"
          >
            <image :src="imgSrc" mode="aspectFill" class="thumbnail-image" />
            <view class="thumbnail-border"></view>
          </view>
        </view>
      </scroll-view>

      <view v-if="!hasImage" class="material-empty">
        <view class="material-empty-icon">🏛️</view>
        <text class="material-empty-title">后端未下发图片</text>
        <text class="material-empty-subtitle">{{ emptyStateText }}</text>
        <text v-if="material.assetVerification && !material.assetVerification.verified" class="material-empty-detail">
          校验结果：{{ material.assetVerification.reason || 'asset_name_mismatch' }}
        </text>
      </view>

      <view class="material-info">
        <view class="title-section">
          <view class="red-line"></view>
          <text class="material-title">{{ materialTitle }}</text>
        </view>
        <text class="material-source">参考素材来源：{{ material.source || "开发者本地库" }}</text>
        <text v-if="materialNotice" class="material-notice">{{ materialNotice }}</text>
      </view>
    </view>

    <!-- 视频素材 -->
    <view v-else-if="material.type === 'video'" class="material-wrapper">
      <video
        class="material-video"
        :src="material.url"
        controls
        poster="/static/video-poster.png"
      />
      <view class="material-info">
        <text class="material-title">{{ materialTitle }}</text>
        <text class="material-source">参考素材来源：{{ material.source || "未知" }}</text>
        <text v-if="materialNotice" class="material-notice">{{ materialNotice }}</text>
      </view>
    </view>

    <!-- 占位展示 -->
    <view v-else class="placeholder-section">
      <view class="placeholder-icon">🏯</view>
      <text class="placeholder-text">素材ID: {{ materialId }}</text>
      <text class="placeholder-sub">暂无素材，已展示建筑文字详情</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "DetailGallery",
  props: {
    material: {
      type: Object,
      default: () => ({})
    },
    materialTitle: {
      type: String,
      default: ""
    },
    materialNotice: {
      type: String,
      default: ""
    },
    materialId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      swiperHeight: 250, // 默认高度暂定 250px，会在图片加载后重新计算
      currentIndex: 0
    };
  },
  computed: {
    imageList() {
      if (this.material.images && this.material.images.length > 0) {
        return this.material.images;
      }
      if (this.material.url) {
        return [this.material.url];
      }
      return [];
    },
    hasImage() {
      return this.imageList.length > 0;
    },
    emptyStateText() {
      if (this.material.assetVerification && this.material.assetVerification.verified === false) {
        return '图片已被后端拦截，请检查命名或映射规则';
      }
      return '当前素材暂未下发可用图片';
    }
  },
  methods: {
    onSwiperChange(e) {
      const next = Number(e && e.detail && e.detail.current);
      if (Number.isFinite(next) && next >= 0) {
        this.currentIndex = next;
      }
    },
    prevImage() {
      if (this.imageList.length <= 1) return;
      this.currentIndex = (this.currentIndex - 1 + this.imageList.length) % this.imageList.length;
    },
    nextImage() {
      if (this.imageList.length <= 1) return;
      this.currentIndex = (this.currentIndex + 1) % this.imageList.length;
    },
    onImageLoad(e, index) {
      if (index === 0) {
        try {
          const sysInfo = uni.getSystemInfoSync();
          const windowWidth = sysInfo.windowWidth;
          // .content 容器 padding 为 30rpx，总计 60rpx
          const paddingPx = (60 / 750) * windowWidth;
          const containerWidth = windowWidth - paddingPx;
          
          const originalWidth = e.detail.width || 1;
          const originalHeight = e.detail.height || 1;
          
          const calculatedHeight = containerWidth * (originalHeight / originalWidth);
          // 限制高度
          this.swiperHeight = Math.max(150, Math.min(calculatedHeight, sysInfo.windowHeight * 0.8));
        } catch (err) {
          console.warn('计算图片高度失败', err);
        }
      }
    },
    previewImage(index) {
      uni.previewImage({
        urls: this.imageList,
        current: index
      });
    }
  },
  watch: {
    imageList: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.currentIndex = 0;
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.material-wrapper {
  background: var(--bg-card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(44, 30, 19, 0.08);
  border: 1rpx solid rgba(139, 115, 85, 0.2);
  margin-bottom: 30rpx;
}

.gallery-container {
  position: relative;
  background: #000;
  overflow: hidden;
}

.gallery-decor-top,
.gallery-decor-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  z-index: 10;
  opacity: 0.6;
}

.gallery-decor-top { top: 0; }
.gallery-decor-bottom { bottom: 0; }

.swiper-image-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
}

.material-swiper {
  width: 100%;
  transition: height 0.3s ease;
}

.material-image {
  width: 100%;
  display: block;
}

.gallery-pagination {
  position: absolute;
  right: 30rpx;
  bottom: 30rpx;
  background: rgba(0, 0, 0, 0.5);
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  z-index: 20;
}

.pagination-main {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.pagination-divider {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20rpx;
}

.pagination-total {
  color: rgba(255, 255, 255, 0.8);
  font-size: 24rpx;
}

/* 左右导航按钮 */
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  border-radius: 50%;
  margin: 0 20rpx;
  transition: all 0.2s ease;
}

.gallery-nav:active {
  background: rgba(166, 49, 49, 0.6);
  transform: translateY(-50%) scale(0.9);
}

.gallery-nav.prev { left: 0; }
.gallery-nav.next { right: 0; }

.nav-icon {
  color: #fff;
  font-size: 48rpx;
  font-weight: 300;
}

/* 缩略图样式 */
.thumbnail-bar {
  background: var(--bg-card);
  padding: 30rpx 0;
  border-bottom: 1rpx solid rgba(139, 115, 85, 0.1);
}

.thumbnail-list {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
}

.thumbnail-item {
  position: relative;
  flex-shrink: 0;
  width: 130rpx;
  height: 130rpx;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #f0f0f0;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  filter: grayscale(40%);
  transition: all 0.3s ease;
}

.thumbnail-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 4rpx solid transparent;
  border-radius: 12rpx;
  z-index: 5;
}

.thumbnail-item.active {
  transform: scale(1.05);
}

.thumbnail-item.active .thumbnail-image {
  filter: grayscale(0%);
}

.thumbnail-item.active .thumbnail-border {
  border-color: var(--primary);
  box-shadow: inset 0 0 10rpx rgba(166, 49, 49, 0.3);
}

.material-info {
  padding: 30rpx;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.red-line {
  width: 8rpx;
  height: 40rpx;
  background: var(--primary);
  border-radius: 4rpx;
}

.material-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 2rpx;
}

.material-source {
  display: block;
  font-size: 24rpx;
  color: var(--text-tertiary);
  margin-bottom: 20rpx;
  font-style: italic;
}

.material-notice {
  display: block;
  font-size: 24rpx;
  color: var(--primary);
  padding: 20rpx;
  background: rgba(166, 49, 49, 0.05);
  border-radius: 12rpx;
  border: 1rpx dashed var(--primary);
}

/* 其他样式保持 */
.material-empty {
  min-height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
}

.material-empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.material-empty-title { font-size: 32rpx; color: var(--text-primary); font-weight: 600; }
.material-empty-subtitle { font-size: 24rpx; color: var(--text-secondary); }

.material-video {
  width: 100%;
  height: 450rpx;
  background: #000;
}

.placeholder-section {
  text-align: center;
  padding: 80rpx 40rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  border: 1rpx solid rgba(139, 115, 85, 0.2);
}

.placeholder-icon { font-size: 100rpx; margin-bottom: 20rpx; }
.placeholder-text { font-size: 30rpx; color: var(--text-primary); }
</style>
