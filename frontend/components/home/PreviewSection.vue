<template>
  <view class="section-preview" :class="{ 'visible': visible }">
    <view class="page-container" style="overflow: visible;">
      <view class="section-header">
        <view class="title-with-icon">
          <TraditionalIcon name="garden" size="44" style="color: var(--secondary)" />
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
          class="preview-card card-ink" 
          :class="{ 'visible': visibleCards[index] }"
          @click="onGoToDetail(building)"
        >
          <view v-if="hasImage(building)" class="card-image" :style="{ backgroundImage: 'url(' + building.image + ')' }">
            <view class="card-overlay"></view>
          </view>
          <view v-else class="card-image card-image-empty">
            <TraditionalIcon name="palace" size="44" style="opacity: 0.3" />
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
  padding: 60rpx 32rpx;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
  overflow: visible;
}

.section-preview.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 4rpx;
}

.window-divider {
  width: 100%;
  height: 16rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.window-pattern {
  width: 120rpx;
  height: 3rpx;
  background: var(--secondary);
  opacity: 0.3;
  position: relative;
}

.window-pattern::before,
.window-pattern::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid var(--secondary);
  transform: translateY(-50%) rotate(45deg);
  opacity: 0.5;
}

.window-pattern::before {
  left: -16rpx;
}

.window-pattern::after {
  right: -16rpx;
}

/* 精选古建卡片 - 响应式网格 */
.preview-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  width: 100%;
  overflow: visible;
}

@media (min-width: 768px) {
  .preview-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
  }
}

@media (min-width: 1024px) {
  .preview-cards-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24rpx;
  }
}

/* 轻量化卡片设计 */
.preview-card {
  background: var(--bg-card);
  border-radius: 12rpx;
  overflow: visible;
  box-shadow: 0 8rpx 24rpx rgba(44, 30, 19, 0.08);
  border: 1rpx solid var(--border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 1;
  transform: translateY(0);
  display: flex;
  flex-direction: column;
}

.preview-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.preview-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 16rpx 40rpx rgba(44, 30, 19, 0.12);
  border-color: var(--secondary);
}

.preview-card:active {
  transform: translateY(-2rpx);
}

/* 统一图片比例 4:3 */
.card-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border-radius: 12rpx 12rpx 0 0;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(44, 30, 19, 0.3) 100%);
  pointer-events: none;
}

.card-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
}

.card-image-empty-text {
  font-size: 20rpx;
  color: var(--text-muted);
  margin-top: 8rpx;
}

.preview-card:hover .card-image {
  transform: scale(1.05);
}

.card-info {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex-shrink: 0;
  min-height: auto;
}

.card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
  line-height: 1.4;
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 1rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.08);
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
  margin-top: 4rpx;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 18rpx;
  color: var(--secondary);
  background: var(--bg-secondary);
  padding: 2rpx 10rpx;
  border-radius: 4rpx;
  font-weight: 500;
  border: 1rpx solid var(--border);
}

/* 响应式适配 */
@media (min-width: 768px) {
  .section-preview {
    padding: 80rpx 40rpx;
  }
  
  .section-title {
    font-size: 48rpx;
  }
  
  .card-name {
    font-size: 30rpx;
  }
}
</style>
