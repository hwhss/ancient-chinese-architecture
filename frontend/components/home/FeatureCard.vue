<template>
  <view class="feature-card card-ink" :class="{ 'visible': visible }">
    <view class="feature-icon">
      <slot name="icon">
        <text v-if="icon" class="feature-icon-text">{{ icon }}</text>
      </slot>
    </view>
    <text class="feature-title">{{ title }}</text>
    <text class="feature-desc">{{ description }}</text>
  </view>
</template>

<script>
export default {
  name: 'FeatureCard',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: []
}
</script>

<style scoped>
.feature-card {
  background: linear-gradient(135deg, #fff 0%, #faf6ed 100%);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  border: 1rpx solid var(--bg-tertiary);
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(30rpx);
}

.feature-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:active {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%);
  border-radius: 16rpx;
}

.feature-icon-text {
  font-size: 40rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  display: block;
}

.feature-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  display: block;
}

/* 卡片水墨效果 */
.card-ink {
  position: relative;
  overflow: hidden;
}

.card-ink::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(200, 37, 6, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
  pointer-events: none;
}
</style>
