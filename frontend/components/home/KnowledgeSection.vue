<template>
  <view class="section-knowledge" :class="{ 'visible': visible }">
    <view class="section-header">
      <view class="title-with-icon">
        <TraditionalIcon name="palace" size="48" style="color: var(--secondary)" />
        <text class="section-title">古建小课堂</text>
      </view>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>

    <scroll-view class="knowledge-scroll" scroll-x show-scrollbar="false" @scroll="onKnowledgeScroll">
      <view class="knowledge-list">
        <view 
          v-for="(item, index) in items" 
          :key="index" 
          class="knowledge-item rice-paper brush-border-ink card-ink"
          :class="{ 'active': activeIndex === index }"
          @click="onItemClick(item)"
        >
          <view class="knowledge-icon-wrapper">
            <TraditionalIcon :name="getIconForTitle(item.title)" size="64" />
          </view>
          <view class="knowledge-content">
            <text class="knowledge-title ink-pressed">{{ item.title }}</text>
            <text class="knowledge-brief">{{ item.text }}</text>
          </view>
          <view class="knowledge-footer">
            <text class="knowledge-category">{{ getCategoryForTitle(item.title) }}</text>
            <view class="read-more">
              <text class="read-text">研读</text>
              <TraditionalIcon name="arrow-right" size="20" />
            </view>
          </view>
          <!-- 装饰性元素 -->
          <view class="item-seal">{{ getCategoryForTitle(item.title).substring(0, 1) }}</view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 滚动指示器 -->
    <view class="scroll-indicator-wrapper">
      <view class="scroll-indicator-bg">
        <view class="scroll-indicator-bar" :style="{ width: knowledgeScrollProgress + '%' }"></view>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'KnowledgeSection',
  components: {
    TraditionalIcon
  },
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
      activeIndex: 0,
      knowledgeScrollProgress: 10
    };
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
        if (this.knowledgeScrollProgress < 10) this.knowledgeScrollProgress = 10;
        
        // 更新激活索引
        const itemWidth = uni.upx2px(320 + 32); 
        this.activeIndex = Math.round(scrollLeft / itemWidth);
      }
    },
    onItemClick(item) {
      this.$emit('go-to-knowledge', item);
    },
    getIconForTitle(title) {
      const icons = {
        '斗拱': 'palace',
        '榫卯': 'garden',
        '飞檐': 'defense',
        '瓦当': 'tower',
        '台基': 'palace'
      };
      return icons[title] || 'palace';
    },
    getCategoryForTitle(title) {
      const categories = {
        '斗拱': '构件',
        '榫卯': '结构',
        '飞檐': '形制',
        '瓦当': '装饰',
        '台基': '基座'
      };
      return categories[title] || '百科';
    }
  }
}
</script>

<style scoped>
.section-knowledge {
  padding: 80rpx 0;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
  overflow: hidden;
}

.section-knowledge.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  padding: 0 40rpx;
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
  width: 140rpx;
  height: 4rpx;
  background: var(--secondary);
  opacity: 0.3;
}

.knowledge-scroll {
  width: 100%;
  white-space: nowrap;
}

.knowledge-list {
  display: inline-flex;
  padding: 20rpx 40rpx 60rpx;
  gap: 32rpx;
}

.knowledge-item {
  width: 320rpx;
  background: var(--bg-card);
  border-radius: 8rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10rpx 30rpx rgba(44, 30, 19, 0.08);
  border: 1rpx solid var(--border);
}

.knowledge-item.active {
  transform: translateY(-10rpx) scale(1.02);
  box-shadow: 0 20rpx 50rpx rgba(44, 30, 19, 0.15);
  border-color: var(--secondary);
}

.knowledge-icon-wrapper {
  color: var(--secondary);
  margin-bottom: 24rpx;
  opacity: 0.8;
}

.knowledge-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  display: block;
  font-family: 'TsangerJinKai', serif;
  white-space: normal;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.knowledge-brief {
  font-size: 24rpx;
  color: var(--text-tertiary);
  line-height: 1.6;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 32rpx;
  height: 115rpx;
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.knowledge-category {
  font-size: 20rpx;
  color: var(--secondary);
  background: var(--bg-secondary);
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: var(--primary);
}

.read-text {
  font-size: 24rpx;
  font-weight: bold;
}

.item-seal {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 18rpx;
  color: var(--primary);
  border: 1rpx solid var(--primary);
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  border-radius: 2rpx;
  transform: rotate(15deg);
}

/* 进度条 */
.scroll-indicator-wrapper {
  padding: 0 100rpx;
  margin-top: 20rpx;
}

.scroll-indicator-bg {
  height: 4rpx;
  background: var(--border);
  border-radius: 2rpx;
  overflow: hidden;
}

.scroll-indicator-bar {
  height: 100%;
  background: var(--secondary);
  transition: width 0.3s ease;
}
</style>
