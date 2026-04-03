<template>
  <view class="section-preview" :class="{ 'visible': visible }">
    <view class="section-header">
      <text class="section-title">精选古建</text>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>

    <view class="preview-cards-grid">
      <view 
        v-for="(building, index) in buildings" 
        :key="building.id"
        class="preview-card card-ink" 
        :class="{ 'visible': visibleCards[index] }"
        @click="onGoToDetail(building)"
      >
        <view class="card-image" :style="{ backgroundImage: 'url(' + building.image + ')' }"></view>
        <view class="card-info">
          <text class="card-name">{{ building.name }}</text>
          <text class="card-desc">{{ building.description }}</text>
          <view class="card-tags">
            <text v-for="tag in building.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PreviewSection',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    visibleCards: {
      type: Array,
      default: () => []
    },
    buildings: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onGoToDetail(building) {
      this.$emit('go-to-detail', building);
    }
  }
}
</script>

<style scoped>
.section-preview {
  padding: 60rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-preview.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  text-align: center;
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--secondary);
  letter-spacing: 8rpx;
  display: block;
  margin-bottom: 16rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.window-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
}

.window-pattern {
  width: 200rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent);
  position: relative;
}

.window-pattern::before,
.window-pattern::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: var(--secondary);
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: 0;
}

.window-pattern::after {
  right: 0;
}

/* 精选古建卡片 - 响应式网格 */
.preview-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

@media (min-width: 768px) {
  .preview-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .preview-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 轻量化卡片设计 */
.preview-card {
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

.preview-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.12);
}

.preview-card:active {
  transform: translateY(-2px);
}

/* 统一图片比例 4:3 */
.card-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-card:hover .card-image {
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
  transition: all 0.25s ease;
}

.card-tag:hover {
  background: rgba(139, 69, 19, 0.15);
}
</style>
