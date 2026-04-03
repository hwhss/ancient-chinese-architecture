<template>
  <view class="section-features" :class="{ 'visible': visible }">
    <view class="section-header">
      <text class="section-title">我们的特色</text>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>
    
    <view class="features-grid">
      <view class="feature-card card-ink">
        <view class="feature-icon">
          <svg viewBox="0 0 64 64" class="svg-icon">
            <path d="M32 8 L48 16 L48 48 L32 56 L16 48 L16 16 Z" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M32 16 L40 20 L40 40 L32 44 L24 40 L24 20 Z" fill="none" stroke="currentColor" stroke-width="2"/>
          </svg>
        </view>
        <text class="feature-title">17 处古建全覆盖</text>
        <text class="feature-desc">从明清皇家宫殿到客家民居，跨越千年的17处代表性古建精华，带你走遍大江南北</text>
      </view>
      
      <view class="feature-card card-ink">
        <view class="feature-icon">
          <svg viewBox="0 0 64 64" class="svg-icon">
            <circle cx="32" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M20 48 Q32 32 44 48" fill="none" stroke="currentColor" stroke-width="3"/>
            <circle cx="32" cy="24" r="4" fill="currentColor"/>
          </svg>
        </view>
        <text class="feature-title">AI 智能导览</text>
        <text class="feature-desc">基于大模型的智能问答，不管是古建历史还是构造细节，你想问的都能秒速解答</text>
      </view>
      
      <view class="feature-card card-ink">
        <view class="feature-icon">
          <svg viewBox="0 0 64 64" class="svg-icon">
            <rect x="12" y="12" width="40" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
            <rect x="12" y="24" width="40" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
            <rect x="12" y="36" width="30" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
          </svg>
        </view>
        <text class="feature-title">分类快速浏览</text>
        <text class="feature-desc">宫殿/园林/桥梁/城防四大分类，一键筛选，快速定位你感兴趣的古建</text>
      </view>
      
      <view class="feature-card card-ink">
        <view class="feature-icon">
          <svg viewBox="0 0 64 64" class="svg-icon">
            <path d="M12 48 L24 24 L32 32 L40 24 L52 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <circle cx="24" cy="20" r="2" fill="currentColor"/>
            <circle cx="40" cy="20" r="2" fill="currentColor"/>
          </svg>
        </view>
        <text class="feature-title">沉浸式体验</text>
        <text class="feature-desc">全新的新中式UI与动效，滚动渐入+悬浮交互，给你身临其境的探索体验</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FeaturesSection',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.section-features {
  padding: 60rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-features.visible {
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
  color: #8b4513;
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
  background: linear-gradient(90deg, transparent, #8b4513, transparent);
  position: relative;
}

.window-pattern::before,
.window-pattern::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #8b4513;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: 0;
}

.window-pattern::after {
  right: 0;
}

/* 项目亮点 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28rpx;
}

.feature-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 28rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.18);
}

.feature-icon {
  font-size: 64rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-icon {
  width: 64rpx;
  height: 64rpx;
  color: #c41e3a;
}

.feature-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 14rpx;
  letter-spacing: 2rpx;
}

.feature-desc {
  display: block;
  font-size: 28rpx;
  color: #8b7355;
  line-height: 1.7;
  letter-spacing: 1rpx;
}
</style>
