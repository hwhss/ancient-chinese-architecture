<template>
  <view class="section-knowledge" :class="{ 'visible': visible }">
    <view class="section-header">
      <text class="section-title">古建小知识</text>
      <text class="section-subtitle">探索中国传统建筑的奥秘</text>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>
    
    <scroll-view 
      class="knowledge-scroll" 
      scroll-x 
      show-scrollbar="false"
      @scroll="onKnowledgeScroll"
    >
      <view 
        v-for="(item, index) in items" 
        :key="index"
        class="knowledge-card-horizontal"
        :class="{ 'visible': visible }"
        :style="{ 'transition-delay': index * 0.1 + 's' }"
      >
        <view class="knowledge-number">{{ String(index + 1).padStart(2, '0') }}</view>
        <view class="knowledge-content">
          <text class="knowledge-card-title">{{ item.title }}</text>
          <text class="knowledge-card-text">{{ item.text }}</text>
        </view>
        <view class="knowledge-accent"></view>
      </view>
    </scroll-view>
    
    <!-- 滑动指示器 -->
    <view class="scroll-indicator">
      <view class="indicator-line">
        <view class="indicator-progress" :style="{ width: knowledgeScrollProgress + '%' }"></view>
      </view>
      <text class="indicator-text">左右滑动查看更多</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'KnowledgeSection',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      knowledgeScrollProgress: 0
    }
  },
  methods: {
    onKnowledgeScroll(e) {
      const scrollLeft = e.detail.scrollLeft;
      const scrollWidth = e.detail.scrollWidth;
      
      const sysInfo = uni.getSystemInfoSync();
      const windowWidth = sysInfo.windowWidth;

      if (scrollWidth > windowWidth) {
        this.knowledgeScrollProgress = (scrollLeft / (scrollWidth - windowWidth)) * 100;
        if (this.knowledgeScrollProgress > 100) this.knowledgeScrollProgress = 100;
        if (this.knowledgeScrollProgress < 0) this.knowledgeScrollProgress = 0;
      }
    }
  }
}
</script>

<style scoped>
.section-knowledge {
  padding: 60rpx 40rpx;
  padding-top: 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-knowledge.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 12rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.section-subtitle {
  display: block;
  font-size: 26rpx;
  color: var(--text-tertiary);
}

.window-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
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

.knowledge-scroll {
  white-space: nowrap;
  padding: 0 30rpx 20rpx;
}

.knowledge-card-horizontal {
  display: inline-block;
  width: 560rpx;
  margin-right: 24rpx;
  background: linear-gradient(135deg, #fff 0%, var(--bg-primary) 100%);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  border-left: 6rpx solid var(--primary);
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  vertical-align: top;
}

.knowledge-card-horizontal.visible {
  opacity: 1;
  transform: translateX(0);
}

.knowledge-card-horizontal:last-child {
  margin-right: 60rpx;
}

.knowledge-number {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  font-size: 48rpx;
  font-weight: bold;
  color: rgba(196, 30, 58, 0.15);
  font-family: 'ZCOOL XiaoWei', serif;
  line-height: 1;
}

.knowledge-content {
  position: relative;
  z-index: 1;
}

.knowledge-card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.knowledge-card-text {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: normal;
}

.knowledge-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  opacity: 0.3;
}

/* 滑动指示器 */
.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32rpx;
  gap: 16rpx;
}

.indicator-line {
  width: 120rpx;
  height: 4rpx;
  background: var(--bg-tertiary);
  border-radius: 2rpx;
  overflow: hidden;
}

.indicator-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 2rpx;
  transition: width 0.1s ease;
}

.indicator-text {
  font-size: 22rpx;
  color: var(--text-muted);
}
</style>
