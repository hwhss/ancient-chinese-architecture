<template>
  <view class="section-header">
    <text class="section-title">{{ title }}</text>
    <text v-if="subtitle" class="section-subtitle">{{ subtitle }}</text>
    <view class="window-divider">
      <view class="window-pattern"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  emits: []
}
</script>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #3c2a1d;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
  display: block;
}

.section-subtitle {
  font-size: 26rpx;
  color: #8b7355;
  margin-bottom: 20rpx;
  display: block;
}

.window-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.window-divider::before,
.window-divider::after {
  content: '';
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #d4a574, transparent);
  max-width: 120rpx;
}

.window-pattern {
  width: 40rpx;
  height: 16rpx;
  background: 
    linear-gradient(90deg, transparent 45%, #d4a574 45%, #d4a574 55%, transparent 55%),
    linear-gradient(0deg, transparent 45%, #d4a574 45%, #d4a574 55%, transparent 55%);
  margin: 0 20rpx;
  opacity: 0.6;
}
</style>
