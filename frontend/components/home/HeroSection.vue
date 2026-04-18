<template>
  <view class="hero-section">
    <view class="page-container">
      <!-- 简化的角落装饰 - 修改为中式云纹感 -->
      <view class="corner-decoration top-left"></view>
      <view class="corner-decoration top-right"></view>
      <view class="corner-decoration bottom-left"></view>
      <view class="corner-decoration bottom-right"></view>
      
      <!-- 标题区域 -->
      <view class="title-area">
        <view class="title-wrapper">
          <text class="main-title ink-pressed" :class="{ 'visible': animationState.title }">中华古建筑导览</text>
          <!-- 精致朱砂印章 -->
          <view class="seal-decor brush-border-ink" :class="{ 'visible': animationState.seal }" @click="onGoToAbout">古建</view>
        </view>
        
        <text class="subtitle" :class="{ 'visible': animationState.subtitle }">探索千年文明，感受建筑之美</text>
        <text class="description" :class="{ 'visible': animationState.description }">
          从宫殿庙宇到园林民居，从古城墙到古桥梁，让我们一起穿越时空，领略中国古代建筑的辉煌与魅力
        </text>
        
        <!-- 统计信息 - 重新设计为窗棂风格 -->
        <view class="hero-stats" :class="{ 'visible': animationState.statCards }">
          <view class="stat-item window-frame">
            <text class="stat-number">17</text>
            <text class="stat-label">处古建</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item window-frame">
            <text class="stat-number">4</text>
            <text class="stat-label">大分类</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item window-frame">
            <text class="stat-number">AI</text>
            <text class="stat-label">智能导览</text>
          </view>
        </view>
        
        <!-- 中式分隔线 -->
        <view class="hero-divider" :class="{ 'visible': animationState.divider }">
          <view class="window-divider">
            <view class="window-pattern"></view>
          </view>
        </view>
      </view>
      
      <!-- 入口按钮 -->
       <view class="hero-buttons">
        <!-- 主按钮组 - 统一样式 -->
        <view class="main-actions">
          <button class="hero-btn primary ink-ripple" :class="{ 'visible': animationState.btn1 }" @click="onGoToMap">
            <view class="btn-icon-wrapper">
              <TraditionalIcon name="map" size="32" />
            </view>
            <text class="btn-text">查看古建筑名录</text>
          </button>
          <button class="hero-btn secondary ink-ripple" :class="{ 'visible': animationState.btn2 }" @click="onGoToChat">
            <view class="btn-icon-wrapper">
              <TraditionalIcon name="chat" size="32" />
            </view>
            <text class="btn-text">开始 AI 导览</text>
          </button>
        </view>
        
        <!-- 分类快捷入口 -->
        <view class="category-shortcuts" :class="{ 'visible': animationState.categoryShortcuts }">
          <view class="category-item tap-feedback" @click="onGoToCategory('palace')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="palace" size="40" />
            </view>
            <text class="category-text">宫殿</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('garden')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="garden" size="40" />
            </view>
            <text class="category-text">园林</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('bridge')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="bridge" size="40" />
            </view>
            <text class="category-text">桥梁</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('defense')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="defense" size="40" />
            </view>
            <text class="category-text">城防</text>
          </view>
        </view>

        <!-- 工具栏 - 收藏和设置并排 -->
        <view class="toolbar" :class="{ 'visible': animationState.categoryShortcuts }">
          <view class="toolbar-item tap-feedback" @click="onGoToFavorites">
            <view class="toolbar-icon-wrapper">
              <TraditionalIcon name="favorites" size="32" />
              <view v-if="favoriteCount > 0" class="toolbar-badge">{{ favoriteCount }}</view>
            </view>
            <text class="toolbar-text">我的收藏</text>
          </view>
          <view class="toolbar-divider"></view>
          <view class="toolbar-item tap-feedback" @click="onGoToSettings">
            <view class="toolbar-icon-wrapper">
              <TraditionalIcon name="settings" size="32" />
            </view>
            <text class="toolbar-text">设置</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'HeroSection',
  components: {
    TraditionalIcon
  },
  props: {
    animationState: {
      type: Object,
      default: () => ({
        seal: false,
        title: false,
        subtitle: false,
        description: false,
        divider: false,
        btn1: false,
        btn2: false,
        statCards: false,
        categoryShortcuts: false
      })
    },
    favoriteCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    onGoToAbout() {
      uni.navigateTo({ url: "/pages/about/about" });
    },
    onGoToMap() {
      this.$emit('go-to-map');
    },
    onGoToChat() {
      this.$emit('go-to-chat');
    },
    onGoToCategory(category) {
      this.$emit('go-to-category', category);
    },
    onGoToFavorites() {
      this.$emit('go-to-favorites');
    },
    onGoToSettings() {
      this.$emit('go-to-settings');
    }
  }
}
</script>

<style scoped>
/* Hero 区 */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx 60rpx;
  position: relative;
  overflow: visible;
  background: transparent;
}

/* 简化的角落装饰 - 云纹感 */
.corner-decoration {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
  border: 3rpx solid var(--secondary);
}

.corner-decoration.top-left {
  top: 32rpx;
  left: 32rpx;
  border-right: none;
  border-bottom: none;
  border-radius: 30rpx 0 0 0;
}

.corner-decoration.top-right {
  top: 32rpx;
  right: 32rpx;
  border-left: none;
  border-bottom: none;
  border-radius: 0 30rpx 0 0;
}

.corner-decoration.bottom-left {
  bottom: 32rpx;
  left: 32rpx;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 30rpx;
}

.corner-decoration.bottom-right {
  bottom: 32rpx;
  right: 32rpx;
  border-left: none;
  border-top: none;
  border-radius: 0 0 30rpx 0;
}

/* 标题区域 */
.title-area {
  text-align: center;
  max-width: 720rpx;
  margin: 0 auto 32rpx;
  position: relative;
  z-index: 2;
}

.title-wrapper {
  position: relative;
  display: inline-block;
}

.main-title {
  display: block;
  font-size: 72rpx;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 12rpx;
  margin-bottom: 20rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'TsangerJinKai', serif;
  will-change: transform, opacity;
}

/* 墨按效果 (Ink Pressed) */
.ink-pressed {
  text-shadow: 
    0.5rpx 0.5rpx 0px rgba(255,255,255,0.4),
    -0.5rpx -0.5rpx 1rpx rgba(0,0,0,0.2),
    0 4rpx 8rpx rgba(44, 30, 19, 0.1);
}

.main-title.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 精致朱砂印章 */
.seal-decor {
  position: absolute;
  top: -20rpx;
  right: -70rpx;
  width: 80rpx;
  height: 80rpx;
  background: var(--primary);
  color: #fff8e6;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 12rpx rgba(166, 49, 49, 0.3);
  transform: rotate(-12deg);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.seal-decor.visible {
  opacity: 0.9;
}

.subtitle {
  display: block;
  font-size: 36rpx;
  color: var(--text-secondary);
  margin-bottom: 20rpx;
  letter-spacing: 4rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'TsangerJinKai', serif;
  will-change: transform, opacity;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.description {
  display: block;
  font-size: 28rpx;
  color: var(--text-tertiary);
  line-height: 1.7;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
}

.description.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hero分隔线 */
.hero-divider {
  margin-top: 24rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
}

.hero-divider.visible {
  opacity: 1;
  transform: translateY(0);
}

.window-divider {
  width: 100%;
  height: 16rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.window-pattern {
  width: 100rpx;
  height: 4rpx;
  background: var(--secondary);
  border-radius: 2rpx;
  position: relative;
  opacity: 0.4;
}

.window-pattern::after,
.window-pattern::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid var(--secondary);
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: -20rpx;
}

.window-pattern::after {
  right: -20rpx;
}

/* Hero 按钮区域 */
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 560rpx;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* 主按钮组 - 统一尺寸和布局 */
.main-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.hero-btn {
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transform: translateZ(0) translateY(0);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  position: relative;
  overflow: hidden;
  will-change: transform, box-shadow;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.hero-btn.visible {
  opacity: 1;
}

.btn-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;
}

.btn-text {
  font-weight: 600;
  letter-spacing: 2rpx;
  transition: all 0.25s ease;
}

/* Primary 按钮 - 故宫红 */
.hero-btn.primary {
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  color: #fff8e6;
  box-shadow: 
    0 6rpx 20rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
}

.hero-btn.primary:hover {
  background: linear-gradient(135deg, #b83a3a 0%, #8a2424 100%);
  transform: translateY(-3rpx);
  box-shadow: 
    0 12rpx 32rpx rgba(166, 49, 49, 0.45),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.hero-btn.primary:active {
  transform: translateY(-1rpx);
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
}

/* Secondary 按钮 - 统一风格 */
.hero-btn.secondary {
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  color: var(--text-primary);
  border: 2rpx solid var(--secondary);
  box-shadow: 
    0 4rpx 16rpx rgba(114, 90, 61, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.hero-btn.secondary:hover {
  background: linear-gradient(135deg, #f9f5e8 0%, #f2ead3 100%);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-3rpx);
  box-shadow: 
    0 10rpx 28rpx rgba(114, 90, 61, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
}

.hero-btn.secondary:active {
  transform: translateY(-1rpx);
  box-shadow: 
    0 4rpx 12rpx rgba(114, 90, 61, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.75);
}

.hero-btn:hover .btn-icon-wrapper {
  transform: scale(1.1);
}

/* Hero 统计信息 */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  margin-top: 32rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: 10rpx 16rpx;
  border: 1rpx solid transparent;
  transition: all 0.4s ease;
}

.window-frame {
  position: relative;
}

.window-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1rpx solid var(--secondary);
  opacity: 0.1;
  pointer-events: none;
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--primary);
  line-height: 1;
  font-family: 'TsangerJinKai', serif;
}

.stat-label {
  font-size: 18rpx;
  color: var(--text-tertiary);
  letter-spacing: 1rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: var(--border);
  opacity: 0.5;
}

/* 分类快捷入口 - 优化布局 */
.category-shortcuts {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
  padding: 0 8rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.25s ease;
}

.category-shortcuts.visible {
  opacity: 1;
  transform: translateY(0);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 8rpx 12rpx;
  border-radius: 16rpx;
  position: relative;
  z-index: 1;
}

.category-item:hover {
  transform: translateY(-4rpx);
  z-index: 100;
}

.category-item:active {
  transform: translateY(-2rpx);
}

.category-icon-wrapper {
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  padding: 16rpx;
  border-radius: 50%;
  color: var(--secondary);
  border: 2rpx solid var(--border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4rpx 12rpx rgba(114, 90, 61, 0.1),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.category-item:hover .category-icon-wrapper {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff8e6;
  border-color: var(--primary);
  box-shadow: 
    0 8rpx 20rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.category-item:active .category-icon-wrapper {
  transform: scale(1.05);
}

.category-text {
  font-size: 22rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.25s ease;
}

.category-item:hover .category-text {
  color: var(--primary);
  font-weight: 600;
}

/* 工具栏 - 收藏和设置并排 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-top: 16rpx;
  padding: 16rpx 24rpx;
  background: var(--bg-card);
  border-radius: 40rpx;
  border: 1rpx solid var(--border);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.25s ease;
}

.toolbar.visible {
  opacity: 1;
  transform: translateY(0);
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.toolbar-item:hover {
  background: rgba(166, 49, 49, 0.08);
}

.toolbar-item:active {
  background: rgba(166, 49, 49, 0.12);
}

.toolbar-icon-wrapper {
  position: relative;
  color: var(--secondary);
  transition: all 0.2s ease;
}

.toolbar-item:hover .toolbar-icon-wrapper {
  color: var(--primary);
  transform: scale(1.1);
}

.toolbar-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 28rpx;
  height: 28rpx;
  background: var(--primary);
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
  font-size: 16rpx;
  color: #fff8e6;
  font-weight: 700;
  border: 2rpx solid var(--bg-card);
}

.toolbar-text {
  font-size: 24rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.2s ease;
}

.toolbar-item:hover .toolbar-text {
  color: var(--primary);
}

.toolbar-divider {
  width: 1rpx;
  height: 24rpx;
  background: var(--border);
  opacity: 0.6;
}

/* 响应式适配 */
@media (min-width: 768px) {
  .hero-section {
    padding: 100rpx 40rpx 80rpx;
  }
  
  .main-title {
    font-size: 88rpx;
    letter-spacing: 16rpx;
  }
  
  .subtitle {
    font-size: 40rpx;
  }
  
  .description {
    font-size: 30rpx;
  }
  
  .hero-buttons {
    max-width: 480rpx;
  }
  
  .category-shortcuts {
    padding: 0 16rpx;
  }
}
</style>
