<template>
  <view
    class="building-card"
    :class="{ 'visible': visible }"
    @click="handleClick"
  >
    <view class="card-image-wrapper">
      <view
        v-if="hasImage"
        class="card-image"
        :style="{ backgroundImage: 'url(' + building.image + ')' }"
      ></view>
      <view v-else class="card-image card-image-empty">
        <text class="card-image-empty-icon">🏛️</text>
        <text class="card-image-empty-text">后端未下发图片</text>
      </view>
      <view class="card-image-overlay"></view>
    </view>
    <view class="card-content">
      <text class="card-name">{{ building.name }}</text>
      <text class="card-desc">{{ truncatedDesc }}</text>
      <view class="card-tags" v-if="building.tags && building.tags.length">
        <text 
          v-for="(tag, index) in displayTags" 
          :key="index" 
          class="card-tag"
        >{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BuildingCard',
  props: {
    building: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    maxDescLength: {
      type: Number,
      default: 40
    },
    maxTags: {
      type: Number,
      default: 2
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const hasImage = computed(() => Boolean(String(props.building.image || '').trim()))

    const truncatedDesc = computed(() => {
      const desc = props.building.description || ''
      if (desc.length <= props.maxDescLength) return desc
      return desc.substring(0, props.maxDescLength) + '...'
    })

    const displayTags = computed(() => {
      if (!props.building.tags) return []
      return props.building.tags.slice(0, props.maxTags)
    })

    const handleClick = () => {
      emit('click', props.building)
    }

    return {
      hasImage,
      truncatedDesc,
      displayTags,
      handleClick
    }
  }
}
</script>

<style scoped>
.building-card {
  background: linear-gradient(145deg, #fffef9 0%, #faf6ed 50%, #f5efe0 100%);
  border-radius: var(--radius-lg);
  overflow: visible;
  border: 2rpx solid rgba(232, 222, 195, 0.8);
  box-shadow:
    var(--shadow-md),
    0 1rpx 4rpx rgba(114, 90, 61, 0.04),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  transition:
    transform var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-slow) var(--ease-out),
    border-color var(--duration-slow) ease,
    background var(--duration-slow) ease;
  opacity: 0;
  transform: translateY(var(--space-6));
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
  z-index: 1;
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:hover {
  transform: var(--hover-lift) scale(1.04);
  background: linear-gradient(145deg, #fffcf5 0%, #fef9ed 50%, #fdf5e6 100%);
  box-shadow:
    var(--shadow-xl),
    0 8rpx 24rpx rgba(166, 49, 49, 0.12),
    0 2rpx 8rpx rgba(114, 90, 61, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 1);
  border-color: rgba(200, 160, 100, 0.6);
  border-width: 2rpx;
  z-index: 100;
}

.building-card:active {
  transform: translateY(-2rpx) scale(1.01);
  box-shadow:
    var(--shadow-lg),
    0 2rpx 8rpx rgba(166, 49, 49, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
  transition-duration: var(--duration-fast);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              filter 0.35s ease;
  will-change: transform;
}

.building-card:hover .card-image {
  transform: scale(1.08);
  filter: saturate(1.15) brightness(1.03);
}

.card-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top,
    rgba(44, 30, 19, 0.5) 0%,
    rgba(44, 30, 19, 0.25) 40%,
    transparent 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease, height 0.35s ease;
}

.building-card:hover .card-image-overlay {
  opacity: 1;
  height: 70%;
}

.card-content {
  padding: var(--space-6) var(--space-6) var(--space-6);
  position: relative;
  z-index: 2;
  transition: transform var(--duration-slow) ease;
}

.building-card:hover .card-content {
  transform: translateY(-2rpx);
}

.card-name {
  font-size: var(--text-lg);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  display: block;
  transition:
    color var(--duration-slow) ease,
    letter-spacing var(--duration-slow) ease,
    text-shadow var(--duration-slow) ease;
  letter-spacing: 1.5rpx;
  line-height: var(--leading-tight);
}

.building-card:hover .card-name {
  color: var(--primary);
  letter-spacing: 3rpx;
  text-shadow: 0 2rpx 10rpx rgba(166, 49, 49, 0.18);
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-4);
  display: block;
  transition:
    color var(--duration-slow) ease,
    opacity var(--duration-slow) ease;
}

.building-card:hover .card-desc {
  color: #4a3a2a;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.card-tag {
  font-size: var(--text-xs);
  color: var(--secondary);
  background: linear-gradient(135deg, rgba(250, 245, 235, 0.95) 0%, rgba(240, 232, 215, 0.95) 100%);
  padding: 7rpx 16rpx;
  border-radius: var(--radius-full);
  border: 1.5rpx solid rgba(220, 210, 190, 0.7);
  transition:
    all var(--duration-slow) var(--ease-out),
    background var(--duration-slow) ease;
  font-weight: 600;
}

.building-card:hover .card-tag {
  background: linear-gradient(135deg, rgba(255, 250, 238, 1) 0%, rgba(248, 240, 224, 1) 100%);
  border-color: rgba(180, 140, 80, 0.55);
  color: #8b6914;
  transform: translateY(-1rpx);
  box-shadow: 0 3rpx 10rpx rgba(139, 105, 20, 0.12);
}

/* 光泽扫过效果 */
.building-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    105deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 45%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.15) 55%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 10;
  transition: left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition-delay: 0.1s;
}

.building-card:hover::before {
  left: 150%;
}

/* 底部渐变高光条 */
.building-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 70%;
  height: 3rpx;
  background: linear-gradient(90deg, transparent, #c8a060, #a63131, #c8a060, transparent);
  border-radius: 0 0 20rpx 20rpx;
  pointer-events: none;
  z-index: 5;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0.8;
}

.building-card:hover::after {
  transform: translateX(-50%) scaleX(1);
}

/* 无障碍：减少动画 */
@media (prefers-reduced-motion: reduce) {
  .building-card,
  .building-card::before,
  .building-card::after,
  .card-image,
  .card-content,
  .card-name,
  .card-desc,
  .card-tag,
  .card-image-overlay {
    transition: none !important;
  }

  .building-card:hover {
    transform: none !important;
  }

  .building-card:hover .card-image {
    transform: none !important;
    filter: none !important;
  }

  .building-card:hover::before {
    display: none;
  }

  .building-card:hover::after {
    transform: translateX(-50%) scaleX(1) !important;
  }
}

/* 仅在支持悬停的设备上启用完整效果 */
@media (hover: hover) and (pointer: fine) {
  .building-card:hover {
    /* 完整悬停效果 */
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .building-card {
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .building-card:active {
    transform: scale(0.98);
    box-shadow:
      0 4rpx 12rpx rgba(114, 90, 61, 0.12),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  }

  .building-card::before,
  .building-card::after {
    display: none;
  }
}
</style>
