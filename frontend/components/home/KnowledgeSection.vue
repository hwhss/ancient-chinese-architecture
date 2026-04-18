<template>
  <view class="section-knowledge" :class="{ 'visible': visible }">
    <view class="page-container">
      <view class="section-header">
        <view class="title-with-icon">
          <TraditionalIcon name="palace" size="44" style="color: var(--secondary)" />
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
            class="knowledge-item card-ink"
            :class="{ 'active': activeIndex === index }"
            @click="onItemClick(item)"
          >
            <view class="knowledge-icon-wrapper">
              <TraditionalIcon :name="getIconForTitle(item.title)" size="52" />
            </view>
            <view class="knowledge-content">
              <text class="knowledge-title ink-pressed">{{ item.title }}</text>
              <text class="knowledge-brief">{{ item.text }}</text>
            </view>
            <view class="knowledge-footer">
              <text class="knowledge-category">{{ getCategoryForTitle(item.title) }}</text>
              <view class="read-more">
                <text class="read-text">研读</text>
                <TraditionalIcon name="arrow-right" size="18" />
              </view>
            </view>
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
        const itemWidth = uni.upx2px(280 + 24); 
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
  padding: 60rpx 0 40rpx;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.section-knowledge.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 32rpx;
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

.knowledge-scroll {
  width: 100%;
  white-space: nowrap;
}

.knowledge-list {
  display: inline-flex;
  padding: 16rpx 32rpx 20rpx;
  gap: 24rpx;
}

.knowledge-item {
  width: 280rpx;
  background: var(--bg-card);
  border-radius: 12rpx;
  padding: 32rpx 24rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8rpx 24rpx rgba(44, 30, 19, 0.06);
  border: 1rpx solid var(--border);
}

.knowledge-item.active {
  transform: translateY(-6rpx);
  box-shadow: 0 16rpx 40rpx rgba(44, 30, 19, 0.12);
  border-color: var(--secondary);
}

.knowledge-icon-wrapper {
  color: var(--secondary);
  margin-bottom: 20rpx;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.knowledge-item:hover .knowledge-icon-wrapper {
  transform: scale(1.1);
  opacity: 1;
  color: var(--primary);
}

.knowledge-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 12rpx;
  display: block;
  font-family: 'TsangerJinKai', serif;
  white-space: normal;
  letter-spacing: 1rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,1), 0 2rpx 4rpx rgba(0,0,0,0.08);
}

.knowledge-brief {
  font-size: 22rpx;
  color: var(--text-tertiary);
  line-height: 1.6;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 24rpx;
  height: 100rpx;
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.knowledge-category {
  font-size: 18rpx;
  color: var(--secondary);
  background: var(--bg-secondary);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-weight: 500;
  border: 1rpx solid var(--border);
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: var(--primary);
  transition: all 0.2s ease;
}

.read-more:hover {
  transform: translateX(4rpx);
}

.read-text {
  font-size: 22rpx;
  font-weight: 600;
}

/* 进度条 */
.scroll-indicator-wrapper {
  padding: 0 80rpx;
  margin-top: 16rpx;
}

.scroll-indicator-bg {
  height: 3rpx;
  background: var(--border);
  border-radius: 2rpx;
  overflow: hidden;
}

.scroll-indicator-bar {
  height: 100%;
  background: var(--secondary);
  transition: width 0.3s ease;
}

/* 响应式适配 */
@media (min-width: 768px) {
  .section-knowledge {
    padding: 80rpx 0;
  }
  
  .section-header {
    padding: 0 40rpx;
  }
  
  .section-title {
    font-size: 48rpx;
  }
  
  .knowledge-list {
    padding: 20rpx 40rpx 48rpx;
    gap: 28rpx;
  }
  
  .knowledge-item {
    width: 300rpx;
    padding: 36rpx 28rpx;
  }
  
  .knowledge-title {
    font-size: 32rpx;
  }
}
</style>
