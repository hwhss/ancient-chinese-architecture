<template>
  <view class="section-features" :class="{ 'visible': visible }">
    <view class="page-container">
      <view class="section-header">
        <view class="title-with-icon">
          <TraditionalIcon name="defense" size="44" style="color: var(--secondary)" />
          <text class="section-title">古建特色</text>
        </view>
        <view class="window-divider">
          <view class="window-pattern"></view>
        </view>
      </view>
      
      <view class="features-grid">
        <view v-for="(feature, index) in localFeatures" :key="index" class="feature-card rice-paper card-ink">
          <view class="feature-icon-wrapper">
            <TraditionalIcon :name="feature.icon" size="56" />
          </view>
          <view class="feature-info">
            <text class="feature-title ink-pressed">{{ feature.title }}</text>
            <text class="feature-desc">{{ feature.desc }}</text>
          </view>
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
  padding: 60rpx 32rpx;
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

/* 项目亮点 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
  }
}

.feature-card {
  background: var(--bg-card);
  border-radius: 12rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(44, 30, 19, 0.06);
  border: 1rpx solid var(--border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 16rpx 40rpx rgba(44, 30, 19, 0.12);
  border-color: var(--secondary);
}

.feature-icon-wrapper {
  color: var(--primary);
  margin-bottom: 16rpx;
  opacity: 0.85;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1);
  opacity: 1;
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 2rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.08);
}

.feature-desc {
  font-size: 22rpx;
  color: var(--text-tertiary);
  line-height: 1.5;
  letter-spacing: 1rpx;
}

/* 响应式适配 */
@media (min-width: 768px) {
  .section-features {
    padding: 80rpx 40rpx;
  }
  
  .section-title {
    font-size: 48rpx;
  }
  
  .feature-title {
    font-size: 32rpx;
  }
}
</style>
