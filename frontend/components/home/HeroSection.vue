<template>
  <view class="hero-section rice-paper">
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
        <button class="hero-btn primary ink-ripple brush-border-ink" :class="{ 'visible': animationState.btn1 }" @click="onGoToMap">
          <TraditionalIcon name="map" size="36" />
          <text class="btn-text">查看古建筑名录</text>
        </button>
        <button class="hero-btn secondary ink-ripple" :class="{ 'visible': animationState.btn2 }" @click="onGoToChat">
          <TraditionalIcon name="chat" size="36" />
          <text class="btn-text">开始 AI 导览</text>
        </button>
        
        <!-- 按钮下方的分类快捷入口 -->
        <view class="category-shortcuts" :class="{ 'visible': animationState.categoryShortcuts }">
          <view class="category-item tap-feedback" @click="onGoToCategory('palace')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="palace" size="48" />
            </view>
            <text class="category-text">宫殿</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('garden')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="garden" size="48" />
            </view>
            <text class="category-text">园林</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('bridge')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="bridge" size="48" />
            </view>
            <text class="category-text">桥梁</text>
          </view>
          <view class="category-item tap-feedback" @click="onGoToCategory('defense')">
            <view class="category-icon-wrapper">
              <TraditionalIcon name="defense" size="48" />
            </view>
            <text class="category-text">城防</text>
          </view>
        </view>

        <!-- 我的收藏快捷入口 -->
        <view class="favorites-shortcut-wrapper" :class="{ 'visible': animationState.categoryShortcuts }">
          <view class="favorites-shortcut card-ink" @click="onGoToFavorites">
            <view class="favorites-icon-wrapper">
              <TraditionalIcon name="favorites" size="46" />
              <view v-if="favoriteCount > 0" class="favorites-badge">{{ favoriteCount }}</view>
            </view>
            <view class="favorites-info">
              <text class="favorites-title">我的收藏</text>
              <text class="favorites-count">{{ favoriteCount }} 处古建</text>
            </view>
            <view class="favorites-arrow-wrapper">
              <TraditionalIcon name="arrow-right" size="24" />
            </view>
          </view>
        </view>

        <!-- 设置入口 -->
        <view class="settings-shortcut-wrapper" :class="{ 'visible': animationState.categoryShortcuts }">
          <view class="settings-shortcut card-ink" @click="onGoToSettings">
            <view class="settings-icon-wrapper">
              <TraditionalIcon name="settings" size="40" />
            </view>
            <view class="settings-info">
              <text class="settings-title">设置</text>
              <text class="settings-desc">主题、偏好设置</text>
            </view>
            <view class="settings-arrow-wrapper">
              <TraditionalIcon name="arrow-right" size="24" />
            </view>
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
  padding: 100rpx 40rpx 80rpx;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-primary);
}

/* 简化的角落装饰 - 云纹感 */
.corner-decoration {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
  border: 4rpx solid var(--secondary);
}

.corner-decoration.top-left {
  top: 40rpx;
  left: 40rpx;
  border-right: none;
  border-bottom: none;
  border-radius: 40rpx 0 0 0;
}

.corner-decoration.top-right {
  top: 40rpx;
  right: 40rpx;
  border-left: none;
  border-bottom: none;
  border-radius: 0 40rpx 0 0;
}

.corner-decoration.bottom-left {
  bottom: 40rpx;
  left: 40rpx;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 40rpx;
}

.corner-decoration.bottom-right {
  bottom: 40rpx;
  right: 40rpx;
  border-left: none;
  border-top: none;
  border-radius: 0 0 40rpx 0;
}

/* 标题区域 */
.title-area {
  text-align: center;
  max-width: 800rpx;
  margin: 0 auto 40rpx;
  position: relative;
  z-index: 2;
}

.title-wrapper {
  position: relative;
  display: inline-block;
}

.main-title {
  display: block;
  font-size: 88rpx;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: 16rpx;
  margin-bottom: 24rpx;
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
  top: -30rpx;
  right: -80rpx;
  width: 100rpx;
  height: 100rpx;
  background: var(--primary);
  color: #fff8e6;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 6rpx 16rpx rgba(166, 49, 49, 0.3);
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
  font-size: 40rpx;
  color: var(--text-secondary);
  margin-bottom: 28rpx;
  letter-spacing: 5rpx;
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
  font-size: 30rpx;
  color: var(--text-tertiary);
  line-height: 1.8;
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
  margin-top: 32rpx;
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
  height: 20rpx;
  position: relative;
  display: flex;
  justify-content: center;
}

.window-pattern {
  width: 120rpx;
  height: 6rpx;
  background: var(--secondary);
  border-radius: 4rpx;
  position: relative;
}

.window-pattern::after,
.window-pattern::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid var(--secondary);
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: -24rpx;
}

.window-pattern::after {
  right: -24rpx;
}

/* Hero 按钮 */
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 520rpx;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-btn {
  height: 100rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  transform: translateZ(0) translateY(0);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  position: relative;
  overflow: visible;
  will-change: transform, box-shadow;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.hero-btn.visible {
  opacity: 1;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  color: #fff8e6;
  box-shadow: 
    0 8rpx 24rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.hero-btn.primary:hover {
  background: linear-gradient(135deg, #c24d4d 0%, #922828 100%);
  transform: translateY(-6rpx) scale(1.08);
  box-shadow: 
    0 20rpx 48rpx rgba(166, 49, 49, 0.5),
    0 12rpx 28rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
  z-index: 100;
}

.hero-btn.primary:active {
  transform: translateY(-3rpx) scale(1.03);
  box-shadow: 
    0 12rpx 32rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.18);
}

.hero-btn.secondary {
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  color: #725a3d;
  border: 3rpx solid #725a3d;
  box-shadow: 
    0 6rpx 18rpx rgba(114, 90, 61, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.hero-btn.secondary:hover {
  background: linear-gradient(135deg, #f9f5e8 0%, #f2ead3 100%);
  border-color: #a63131;
  color: #a63131;
  border-width: 4rpx;
  transform: translateY(-6rpx) scale(1.08);
  box-shadow: 
    0 16rpx 40rpx rgba(114, 90, 61, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
  z-index: 100;
}

.hero-btn.secondary:active {
  transform: translateY(-3rpx) scale(1.03);
  box-shadow: 
    0 10rpx 24rpx rgba(114, 90, 61, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.75);
}

.btn-text {
  font-weight: 700;
  letter-spacing: 4rpx;
  transition: all 0.25s ease;
}

.hero-btn:hover .btn-text {
  letter-spacing: 8rpx;
  font-weight: 800;
}

/* Hero 统计信息 */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
  margin-top: 40rpx;
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
  gap: 6rpx;
  padding: 12rpx 20rpx;
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
  font-size: 40rpx;
  font-weight: bold;
  color: var(--primary);
  line-height: 1;
  font-family: 'TsangerJinKai', serif;
}

.stat-label {
  font-size: 20rpx;
  color: var(--text-tertiary);
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: var(--border);
  opacity: 0.5;
}

/* 分类快捷入口 - 增强悬停效果 */
.category-shortcuts {
  display: flex;
  justify-content: space-between;
  margin-top: 32rpx;
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
  gap: 12rpx;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  padding: 12rpx;
  border-radius: 28rpx;
  position: relative;
  z-index: 1;
}

.category-item:hover {
  transform: translateY(-10rpx) scale(1.08);
  z-index: 100;
}

.category-item:active {
  transform: translateY(-4rpx) scale(1.03);
}

.category-icon-wrapper {
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  padding: 24rpx;
  border-radius: 50%;
  color: #725a3d;
  border: 3rpx solid #e8dec3;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 6rpx 16rpx rgba(114, 90, 61, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.category-item:hover .category-icon-wrapper {
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  color: #fff8e6;
  border-color: #a63131;
  border-width: 4rpx;
  box-shadow: 
    0 12rpx 32rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.15);
}

.category-item:active .category-icon-wrapper {
  transform: scale(1.1);
  box-shadow: 
    0 8rpx 20rpx rgba(166, 49, 49, 0.25),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
}

.category-text {
  font-size: 24rpx;
  color: #725a3d;
  font-weight: 600;
  transition: all 0.25s ease;
}

.category-item:hover .category-text {
  color: #a63131;
  font-weight: 800;
  font-size: 26rpx;
  transform: scale(1.05);
}

/* ========== 我的收藏快捷入口 - 增强悬停效果 ========== */
.favorites-shortcut-wrapper {
  margin: 50rpx auto 0;
  max-width: 520rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.25s ease;
}

.favorites-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.favorites-shortcut {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 40rpx 48rpx;
  background: linear-gradient(135deg, #fffef9 0%, #f9f5e8 100%);
  border-radius: 28rpx;
  border: 3rpx solid #e8dec3;
  box-shadow: 
    0 8rpx 24rpx rgba(114, 90, 61, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.favorites-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 10rpx;
  background: linear-gradient(180deg, #d49c4d 0%, #a63131 100%);
  border-radius: 28rpx 0 0 28rpx;
  z-index: -1;
}

.favorites-shortcut:hover {
  transform: translateY(-6rpx) scale(1.04);
  border-color: #a63131;
  border-width: 4rpx;
  box-shadow: 
    0 16rpx 44rpx rgba(114, 90, 61, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.85);
  z-index: 100;
}

.favorites-shortcut:active {
  transform: translateY(-3rpx) scale(1.02);
  box-shadow: 
    0 10rpx 28rpx rgba(114, 90, 61, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.75);
}

.favorites-icon-wrapper {
  position: relative;
  color: #d49c4d;
  transition: all 0.25s ease;
}

.favorites-shortcut:hover .favorites-icon-wrapper {
  color: #a63131;
  transform: scale(1.15);
}

.favorites-badge {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  min-width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  font-size: 20rpx;
  color: #fff8e6;
  font-weight: 800;
  border: 3rpx solid #fff8e6;
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.favorites-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.favorites-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #2c1e13;
  font-family: 'TsangerJinKai', serif;
  transition: color 0.25s ease;
}

.favorites-shortcut:hover .favorites-title {
  color: #a63131;
  transform: scale(1.05);
}

.favorites-count {
  font-size: 26rpx;
  color: #725a3d;
  transition: color 0.25s ease;
  font-weight: 600;
}

.favorites-shortcut:hover .favorites-count {
  color: #5a4a3a;
  font-weight: 700;
}

.favorites-arrow-wrapper {
  color: #8b7355;
  opacity: 0.6;
  transition: all 0.25s ease;
}

.favorites-shortcut:hover .favorites-arrow-wrapper {
  color: #a63131;
  opacity: 1;
  transform: translateX(8rpx) scale(1.2);
}

/* ========== 设置快捷入口 - 增强悬停效果 ========== */
.settings-shortcut-wrapper {
  margin: 24rpx auto 0;
  max-width: 520rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.25s ease;
}

.settings-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.settings-shortcut {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 32rpx 40rpx;
  background: linear-gradient(135deg, #f2ead3 0%, #ebe4d0 100%);
  border-radius: 28rpx;
  border: 3rpx solid #c2b095;
  box-shadow: 
    0 6rpx 18rpx rgba(114, 90, 61, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.7);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: visible;
  opacity: 0.92;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  z-index: 1;
}

.settings-shortcut:hover {
  opacity: 1;
  transform: translateY(-5rpx) scale(1.03);
  border-color: #725a3d;
  border-width: 4rpx;
  background: linear-gradient(135deg, #f5efe0 0%, #eee8d4 100%);
  box-shadow: 
    0 12rpx 32rpx rgba(114, 90, 61, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.75);
  z-index: 100;
}

.settings-shortcut:active {
  transform: translateY(-2rpx) scale(1.01);
  box-shadow: 
    0 6rpx 16rpx rgba(114, 90, 61, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.7);
}

.settings-icon-wrapper {
  color: #725a3d;
  transition: all 0.25s ease;
}

.settings-shortcut:hover .settings-icon-wrapper {
  color: #a63131;
  transform: rotate(90deg) scale(1.18);
}

.settings-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.settings-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #5a4a3a;
  font-family: 'TsangerJinKai', serif;
  transition: color 0.25s ease;
}

.settings-shortcut:hover .settings-title {
  color: #2c1e13;
  transform: scale(1.05);
}

.settings-desc {
  font-size: 24rpx;
  color: #8b7355;
  transition: color 0.25s ease;
  font-weight: 500;
}

.settings-shortcut:hover .settings-desc {
  color: #725a3d;
  font-weight: 600;
}

.settings-arrow-wrapper {
  color: #a89070;
  opacity: 0.55;
  transition: all 0.25s ease;
}

.settings-shortcut:hover .settings-arrow-wrapper {
  color: #725a3d;
  opacity: 1;
  transform: translateX(8rpx) scale(1.2);
}

.brush-border-ink::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1rpx solid var(--text-primary);
  opacity: 0.1;
  mask-image: radial-gradient(circle, black 50%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, black 50%, transparent 100%);
}
</style>
