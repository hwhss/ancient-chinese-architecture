<template>
  <view class="section-features" :class="{ 'visible': visible }">
    <view class="section-header">
      <view class="title-with-icon">
        <TraditionalIcon name="defense" size="48" style="color: var(--secondary)" />
        <text class="section-title">古建特色</text>
      </view>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>
    
    <view class="features-grid">
      <view v-for="(feature, index) in localFeatures" :key="index" class="feature-card rice-paper brush-border-ink">
        <view class="feature-icon-wrapper">
          <TraditionalIcon :name="feature.icon" size="64" />
        </view>
        <view class="feature-info">
          <text class="feature-title ink-pressed">{{ feature.title }}</text>
          <text class="feature-desc">{{ feature.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'FeaturesSection',
  components: {
    TraditionalIcon
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localFeatures: [
        { 
          icon: "palace", 
          title: "十七处精选", 
          desc: "横跨数百年的精选古建，从皇家园林至民间居所，尽览中华建筑之美。" 
        },
        { 
          icon: "chat", 
          title: "AI 智启迪", 
          desc: "传统建筑百科知识，辅助智能导览，随时为您解答每一处营造法式。" 
        },
        { 
          icon: "map", 
          title: "地理寻脉", 
          desc: "地理维度的古建分类与搜索，一键跨越山河，寻访历史的真实纹路。" 
        },
        { 
          icon: "garden", 
          title: "沉浸雅致", 
          desc: "新中式审美与动效交互，传统纸墨韵味，为您打造顶级的文化探索之旅。" 
        }
      ]
    };
  }
}
</script>

<style scoped>
.section-features {
  padding: 80rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-features.visible {
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

/* 项目亮点 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32rpx;
}

.feature-card {
  background: var(--bg-card);
  border-radius: 8rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  box-shadow: 0 10rpx 30rpx rgba(44, 30, 19, 0.08);
  border: 1rpx solid var(--border);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-8rpx);
  box-shadow: 0 20rpx 50rpx rgba(44, 30, 19, 0.15);
  border-color: var(--secondary);
}

.feature-icon-wrapper {
  color: var(--primary);
  margin-bottom: 24rpx;
  opacity: 0.8;
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.feature-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 2rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.feature-desc {
  font-size: 24rpx;
  color: var(--text-tertiary);
  line-height: 1.6;
  letter-spacing: 1rpx;
}
</style>
