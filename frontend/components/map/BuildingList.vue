<template>
  <view class="building-grid">
    <view v-if="loading" class="state-box">
      <text class="state-text">正在加载古建筑名录...</text>
    </view>
    <view v-else-if="error" class="state-box">
      <text class="state-text error-text">{{ error }}</text>
    </view>
    <view v-else-if="buildings.length === 0" class="state-box">
      <text class="empty-icon">🏛️</text>
      <text class="state-text">没有找到对应的古建哦，试试换个关键词吧</text>
    </view>
    <view
      v-for="(building, index) in buildings"
      :key="building.id"
      class="building-card preview-card card-ink"
      :class="{ 'visible': visibleCards[index] }"
      @click="$emit('go-to-detail', building)"
    >
      <view v-if="hasRenderableImage(building)" class="card-image-wrap">
        <view v-if="!isLoaded(building)" class="card-image-loading">
          <text class="card-image-loading-icon">🏛️</text>
          <text class="card-image-loading-text">缩略图加载中...</text>
        </view>
        <image
          class="card-image"
          :class="{ 'is-loaded': isLoaded(building), 'is-hidden': !isLoaded(building) }"
          :src="getImageUrl(building)"
          mode="aspectFill"
          lazy-load="true"
          @load="onImageLoad(building)"
          @error="onImageError(building)"
        />
      </view>
      <view v-else class="card-image-wrap card-image-empty">
        <text class="card-image-empty-icon">🏛️</text>
        <text class="card-image-empty-text">暂无图片</text>
      </view>
      <view class="card-info">
        <text class="card-name">{{ building.name }}</text>
        <text class="card-desc">{{ building.description || building.overviewSummary || '暂无简介' }}</text>
        <view class="card-tags">
          <text v-for="tag in (building.tags || []).slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    buildings: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    error: String,
    visibleCards: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loadedMap: {},
      errorMap: {}
    };
  },
  watch: {
    buildings: {
      handler() {
        this.loadedMap = {};
        this.errorMap = {};
      },
      deep: false
    }
  },
  methods: {
    getImageUrl(building) {
      if (!building) {
        return '';
      }
      return String(building.image || building.coverImage || building.originalImage || '').trim();
    },
    hasImage(building) {
      return Boolean(this.getImageUrl(building));
    },
    hasRenderableImage(building) {
      return this.hasImage(building) && !this.isError(building);
    },
    getImageKey(building) {
      return String((building && building.id) || 'unknown');
    },
    onImageLoad(building) {
      const key = this.getImageKey(building);
      this.$set(this.loadedMap, key, true);
      this.$set(this.errorMap, key, false);
    },
    onImageError(building) {
      const key = this.getImageKey(building);
      this.$set(this.errorMap, key, true);
      this.$set(this.loadedMap, key, false);
    },
    isLoaded(building) {
      return Boolean(this.loadedMap[this.getImageKey(building)]);
    },
    isError(building) {
      return Boolean(this.errorMap[this.getImageKey(building)]);
    }
  }
}
</script>

<style scoped>
.building-grid {
  padding: 24rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  position: relative;
  z-index: 2;
}

@media (min-width: 768px) {
  .building-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .building-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.state-box {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 20rpx;
  border: 2rpx solid var(--bg-tertiary);
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.state-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.8;
}

.error-text {
  color: var(--error);
}

.building-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(139, 69, 19, 0.08);
  border: 1rpx solid rgba(139, 69, 19, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px);
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.12);
}

.building-card:active {
  transform: translateY(-2px);
}

.card-image-wrap {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: linear-gradient(135deg, #f6e8d0 0%, #efdfc7 50%, #f6e8d0 100%);
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  opacity: 1;
}

.card-image.is-loaded {
  opacity: 1;
}

.card-image.is-hidden {
  opacity: 0;
}

.card-image-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 25%, rgba(255, 255, 255, 0.22) 50%, rgba(255, 255, 255, 0.06) 75%);
  background-size: 200% 100%;
  animation: loadingShimmer 1.2s linear infinite;
}

.card-image-loading-icon {
  font-size: 34rpx;
}

.card-image-loading-text {
  display: none;
}

@keyframes loadingShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.card-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #faf3e6 0%, #ead9c0 100%);
}

.card-image-empty-icon {
  font-size: 34rpx;
  margin-bottom: 8rpx;
}

.card-image-empty-text {
  font-size: 18rpx;
  color: var(--text-secondary);
}

.building-card:hover .card-image {
  transform: scale(1.04);
}

.card-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.card-desc {
  font-size: 22rpx;
  color: var(--text-tertiary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 20rpx;
  color: var(--secondary);
  background: rgba(139, 69, 19, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-tag:hover {
  background: rgba(196, 30, 58, 0.18);
  color: var(--primary-dark);
}
</style>
