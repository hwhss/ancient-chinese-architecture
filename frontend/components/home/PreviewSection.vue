<template>
  <view class="section-preview" :class="{ 'visible': visible }">
    <view class="page-container">
      <view class="section-header">
        <view class="title-with-icon">
          <TraditionalIcon name="garden" size="48" style="color: var(--secondary)" />
          <text class="section-title">精选古建</text>
        </view>
        <view class="window-divider">
          <view class="window-pattern"></view>
        </view>
      </view>

      <view class="preview-cards-grid">
        <view 
          v-for="(building, index) in buildings" 
          :key="building.id"
          class="preview-card rice-paper brush-border-ink card-ink" 
          :class="{ 'visible': visibleCards[index] }"
          @click="onGoToDetail(building)"
        >
          <view v-if="hasImage(building)" class="card-image" :style="{ backgroundImage: 'url(' + building.image + ')' }">
            <view class="card-overlay"></view>
          </view>
          <view v-else class="card-image card-image-empty">
            <TraditionalIcon name="palace" size="48" style="opacity: 0.3" />
            <text class="card-image-empty-text">寻古中...</text>
            <view class="card-overlay"></view>
          </view>
          <view class="card-info">
            <text class="card-name ink-pressed">{{ building.name }}</text>
            <text class="card-desc">{{ building.description }}</text>
            <view class="card-tags">
              <text v-for="tag in building.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'PreviewSection',
  components: {
    TraditionalIcon
  },
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
    hasImage(building) {
      return Boolean(String((building && building.image) || '').trim());
    },
    onGoToDetail(building) {
      this.$emit('go-to-detail', building);
    }
  }
}
</script>

<style scoped>
.section-preview {
  padding: 80rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-preview.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 6rpx;
}

.window-divider {
  width: 100%;
  height: 20rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.window-pattern {
  width: 180rpx;
  height: 4rpx;
  background: var(--secondary);
  opacity: 0.3;
}

/* 精选古建卡片 - 响应式网格 */
.preview-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

@media (min-width: 768px) {
  .preview-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .preview-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 40rpx;
  }
}

/* 轻量化卡片设计 */
.preview-card {
  background: var(--bg-card);
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(44, 30, 19, 0.08);
  border: 1rpx solid var(--border);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px);
}

.preview-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.preview-card:active {
  transform: translateY(-4rpx) scale(1.01);
  box-shadow: 0 20rpx 50rpx rgba(44, 30, 19, 0.15);
  border-color: var(--secondary);
}

/* 统一图片比例 4:3 */
.card-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(44, 30, 19, 0.4) 100%);
  pointer-events: none;
}

.card-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.card-image-empty-text {
  font-size: 20rpx;
  color: var(--text-tertiary);
  margin-top: 12rpx;
}

.preview-card:active .card-image {
  transform: scale(1.08);
}

.card-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-name {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1.4;
  font-family: 'TsangerJinKai', serif;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.card-desc {
  font-size: 24rpx;
  color: var(--text-tertiary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 76rpx;
}

.card-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 20rpx;
  color: var(--secondary);
  background: var(--bg-secondary);
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-weight: 500;
  border: 1rpx solid var(--border);
}
</style>
