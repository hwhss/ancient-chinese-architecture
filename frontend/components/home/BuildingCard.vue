<template>
  <view 
    class="building-card card-ink" 
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
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  border-radius: 24rpx;
  overflow: hidden;
  border: 2rpx solid #e8dec3;
  box-shadow: 
    0 6rpx 20rpx rgba(114, 90, 61, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30rpx);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:hover {
  transform: translateY(-20rpx) scale(1.12);
  box-shadow: 
    0 36rpx 72rpx rgba(114, 90, 61, 0.5),
    0 20rpx 44rpx rgba(166, 49, 49, 0.4),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.98);
  border-color: #a63131;
  border-width: 5rpx;
}

.building-card:active {
  transform: translateY(-6rpx) scale(1.03);
  box-shadow: 
    0 12rpx 32rpx rgba(114, 90, 61, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
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
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.building-card:hover .card-image {
  transform: scale(1.32);
}

.card-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75%;
  background: linear-gradient(to top, rgba(44, 30, 19, 0.65), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.building-card:hover .card-image-overlay {
  opacity: 1;
}

.card-content {
  padding: 28rpx;
  position: relative;
  z-index: 2;
  transition: transform 0.25s ease;
}

.building-card:hover .card-content {
  transform: translateY(-4rpx);
}

.card-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #2c1e13;
  margin-bottom: 12rpx;
  display: block;
  transition: color 0.25s ease;
  letter-spacing: 1.5rpx;
}

.building-card:hover .card-name {
  color: #a63131;
  transform: scale(1.12);
  letter-spacing: 4.5rpx;
  text-shadow: 0 3rpx 12rpx rgba(166, 49, 49, 0.3);
}

.card-desc {
  font-size: 25rpx;
  color: #5a4a3a;
  line-height: 1.65;
  margin-bottom: 18rpx;
  display: block;
  transition: color 0.25s ease;
}

.building-card:hover .card-desc {
  color: #4a3a2a;
  font-weight: 500;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.card-tag {
  font-size: 22rpx;
  color: #725a3d;
  background: linear-gradient(135deg, rgba(249, 245, 232, 0.95) 0%, rgba(242, 234, 211, 0.95) 100%);
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  border: 2rpx solid #e8dec3;
  transition: all 0.25s ease;
  font-weight: 600;
}

.building-card:hover .card-tag {
  background: linear-gradient(135deg, rgba(242, 234, 211, 1) 0%, rgba(232, 222, 195, 1) 100%);
  border-color: #a63131;
  color: #a63131;
  transform: scale(1.18);
  font-weight: 800;
  box-shadow: 0 6rpx 16rpx rgba(166, 49, 49, 0.3);
}

/* 卡片水墨效果 */
.card-ink {
  position: relative;
}

.card-ink::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(166, 49, 49, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(114, 90, 61, 0.08) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.building-card:hover .card-ink::before {
  opacity: 1;
}

/* 卡片高亮边框效果 */
.card-ink::after {
  content: '';
  position: absolute;
  top: -3rpx;
  left: -3rpx;
  right: -3rpx;
  bottom: -3rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #a63131 0%, #d49c4d 35%, #a63131 70%, #725a3d 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: -1;
}

.building-card:hover .card-ink::after {
  opacity: 0.9;
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .building-card,
  .card-image,
  .card-content,
  .card-name,
  .card-desc,
  .card-tag,
  .card-image-overlay,
  .card-ink::before,
  .card-ink::after {
    transition: none;
  }
  
  .building-card:hover {
    transform: none;
  }
  
  .building-card:hover .card-image {
    transform: none;
  }
}

/* 仅在支持悬停的设备上启用效果 */
@media (hover: hover) {
  .building-card:hover {
    /* 悬停效果已定义 */
  }
}

/* 触摸设备优化 */
@media (hover: none) {
  .building-card:active {
    transform: scale(0.97);
    box-shadow: 0 6rpx 16rpx rgba(114, 90, 61, 0.2);
  }
}
</style>
