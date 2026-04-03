<template>
  <view class="hero-section">
    <!-- 简化的角落装饰 -->
    <view class="corner-decoration top-left"></view>
    <view class="corner-decoration top-right"></view>
    <view class="corner-decoration bottom-left"></view>
    <view class="corner-decoration bottom-right"></view>
    
    <!-- 标题区域 -->
    <view class="title-area">
      <view class="title-wrapper">
        <text class="main-title" :class="{ 'visible': animationState.title }">中华古建筑导览</text>
        <!-- 精致朱砂印章 -->
        <view class="seal-decor" :class="{ 'visible': animationState.seal }" @click="onGoToAbout">古建</view>
      </view>
      
      <text class="subtitle" :class="{ 'visible': animationState.subtitle }">探索千年文明，感受建筑之美</text>
      <text class="description" :class="{ 'visible': animationState.description }">
        从宫殿庙宇到园林民居，从古城墙到古桥梁，让我们一起穿越时空，领略中国古代建筑的辉煌与魅力
      </text>
      
      <!-- 统计信息 - 移到标题下方 -->
      <view class="hero-stats" :class="{ 'visible': animationState.statCards }">
        <view class="stat-item">
          <text class="stat-number">17</text>
          <text class="stat-label">处古建</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">4</text>
          <text class="stat-label">大分类</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
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
      <button class="hero-btn primary ink-ripple" :class="{ 'visible': animationState.btn1 }" @click="onGoToMap">
        <text class="btn-icon">📋</text>
        <text class="btn-text">查看古建筑名录</text>
      </button>
      <button class="hero-btn secondary ink-ripple" :class="{ 'visible': animationState.btn2 }" @click="onGoToChat">
        <text class="btn-icon">🤖</text>
        <text class="btn-text">开始 AI 导览</text>
      </button>
      
      <!-- 按钮下方的分类快捷入口 -->
      <view class="category-shortcuts" :class="{ 'visible': animationState.categoryShortcuts }">
        <view class="category-item tap-feedback" @click="onGoToCategory('palace')">
          <text class="category-icon">🏯</text>
          <text class="category-text">宫殿</text>
        </view>
        <view class="category-item tap-feedback" @click="onGoToCategory('garden')">
          <text class="category-icon">🌳</text>
          <text class="category-text">园林</text>
        </view>
        <view class="category-item tap-feedback" @click="onGoToCategory('bridge')">
          <text class="category-icon">🌉</text>
          <text class="category-text">桥梁</text>
        </view>
        <view class="category-item tap-feedback" @click="onGoToCategory('defense')">
          <text class="category-icon">🏰</text>
          <text class="category-text">城防</text>
        </view>
      </view>

      <!-- 我的收藏快捷入口 -->
      <view class="favorites-shortcut-wrapper" :class="{ 'visible': animationState.categoryShortcuts }">
        <view class="favorites-shortcut card-ink" @click="onGoToFavorites">
          <view class="favorites-icon-wrapper">
            <text class="favorites-icon">⭐</text>
            <view v-if="favoriteCount > 0" class="favorites-badge">{{ favoriteCount }}</view>
          </view>
          <view class="favorites-info">
            <text class="favorites-title">我的收藏</text>
            <text class="favorites-count">{{ favoriteCount }} 处古建</text>
          </view>
          <view class="favorites-arrow-wrapper">
            <text class="favorites-arrow">→</text>
          </view>
        </view>
      </view>

      <!-- 设置入口 -->
      <view class="settings-shortcut-wrapper" :class="{ 'visible': animationState.categoryShortcuts }">
        <view class="settings-shortcut card-ink" @click="onGoToSettings">
          <view class="settings-icon-wrapper">
            <text class="settings-icon">⚙️</text>
          </view>
          <view class="settings-info">
            <text class="settings-title">设置</text>
            <text class="settings-desc">主题、偏好设置</text>
          </view>
          <view class="settings-arrow-wrapper">
            <text class="settings-arrow">→</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HeroSection',
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
}

/* 简化的角落装饰 */
.corner-decoration {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
  border: 2rpx solid #8b4513;
}

.corner-decoration.top-left {
  top: 30rpx;
  left: 30rpx;
  border-right: none;
  border-bottom: none;
}

.corner-decoration.top-right {
  top: 30rpx;
  right: 30rpx;
  border-left: none;
  border-bottom: none;
}

.corner-decoration.bottom-left {
  bottom: 30rpx;
  left: 30rpx;
  border-right: none;
  border-top: none;
}

.corner-decoration.bottom-right {
  bottom: 30rpx;
  right: 30rpx;
  border-left: none;
  border-top: none;
}

/* 标题区域 */
.title-area {
  text-align: center;
  max-width: 600rpx;
  margin-bottom: 40rpx;
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
  color: #7a3c10;
  letter-spacing: 16rpx;
  margin-bottom: 24rpx;
  text-shadow: 0 2rpx 8rpx rgba(196, 30, 58, 0.25), 0 1rpx 4rpx rgba(139, 69, 19, 0.15);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'ZCOOL XiaoWei', serif;
  will-change: transform, opacity;
}

.main-title.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 精致朱砂印章（放大） */
.seal-decor {
  position: absolute;
  top: -30rpx;
  right: -80rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff8e6;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 6rpx 16rpx rgba(139, 0, 0, 0.35);
  transform: rotate(-12deg);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  border: 3rpx solid rgba(255, 248, 230, 0.2);
}

.seal-decor.visible {
  opacity: 0.95;
}

.subtitle {
  display: block;
  font-size: 40rpx;
  color: #5a4a3a;
  margin-bottom: 28rpx;
  letter-spacing: 5rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: 'ZCOOL XiaoWei', serif;
  will-change: transform, opacity;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.description {
  display: block;
  font-size: 30rpx;
  color: #6b5a4a;
  line-height: 1.8;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: #c41e3a;
  border-radius: 4rpx;
  position: relative;
}

.window-pattern::after,
.window-pattern::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 20rpx;
  height: 20rpx;
  border: 4rpx solid #c41e3a;
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: -20rpx;
}

.window-pattern::after {
  right: -20rpx;
}

/* Hero 按钮 */
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 480rpx;
  position: relative;
  z-index: 2;
}

.hero-btn {
  height: 100rpx;
  border-radius: 50rpx;
  font-size: 30rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transform: translateZ(0) translateY(0);
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  opacity: 0;
  position: relative;
  overflow: hidden;
  will-change: transform, box-shadow;
}

.hero-btn.visible {
  opacity: 1;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff8e6;
  box-shadow: 0 8rpx 24rpx rgba(139, 0, 0, 0.4);
}

.hero-btn.secondary {
  background: #fff;
  color: #8b4513;
  border: 3rpx solid #8b4513;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);
}

.hero-btn:hover {
  transform: translateY(-6px);
}

.hero-btn.primary:hover {
  box-shadow: 0 12rpx 32rpx rgba(139, 0, 0, 0.5);
}

.hero-btn.secondary:hover {
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.3);
}

.hero-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-weight: 500;
  letter-spacing: 4rpx;
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
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #c41e3a;
  line-height: 1;
  font-family: 'ZCOOL XiaoWei', serif;
}

.stat-label {
  font-size: 22rpx;
  color: #8b7355;
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: linear-gradient(180deg, transparent, #dcc8b0, transparent);
}

/* 分类快捷入口 */
.category-shortcuts {
  display: flex;
  justify-content: space-between;
  margin-top: 32rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
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
}

.category-icon {
  font-size: 48rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.08);
  border: 2rpx solid #e8d8c8;
}

.category-text {
  font-size: 24rpx;
  color: #6b5643;
  font-weight: 500;
}

/* ========== 我的收藏快捷入口 ========== */
.favorites-shortcut-wrapper {
  margin-top: 50rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.favorites-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.favorites-shortcut {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 36rpx 44rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 50%, #f5ede0 100%);
  border-radius: 28rpx;
  border: 2rpx solid #e8d8c8;
  box-shadow:
    0 12rpx 40rpx rgba(139, 69, 19, 0.1),
    0 4rpx 12rpx rgba(139, 69, 19, 0.05),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.favorites-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5rpx;
  background: linear-gradient(90deg, #c82506 0%, #e8b860 30%, #e8b860 70%, #c82506 100%);
  opacity: 0.9;
}

.favorites-shortcut::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.favorites-shortcut:hover {
  transform: translateY(-3rpx);
  box-shadow:
    0 20rpx 48rpx rgba(139, 69, 19, 0.14),
    0 6rpx 16rpx rgba(139, 69, 19, 0.06);
}

.favorites-shortcut:hover::after {
  left: 100%;
}

.favorites-shortcut:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.1);
}

.favorites-icon-wrapper {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 50%, #f0dcc0 100%);
  border-radius: 50%;
  border: 3rpx solid #e8b860;
  box-shadow:
    0 6rpx 16rpx rgba(232, 184, 96, 0.3),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.favorites-shortcut:hover .favorites-icon-wrapper {
  transform: scale(1.06) rotate(3deg);
  box-shadow:
    0 10rpx 24rpx rgba(232, 184, 96, 0.4),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.favorites-icon {
  font-size: 46rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 37, 6, 0.2));
  transition: transform 0.3s ease;
}

.favorites-shortcut:hover .favorites-icon {
  transform: scale(1.12);
}

.favorites-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  box-shadow:
    0 3rpx 10rpx rgba(200, 37, 6, 0.4),
    0 0 0 2rpx #fffef9;
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.favorites-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 4rpx 0;
}

.favorites-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #3c2a1d;
  letter-spacing: 8rpx;
  font-family: 'ZCOOL XiaoWei', serif;
  line-height: 1.2;
}

.favorites-count {
  font-size: 26rpx;
  color: #a08060;
  font-weight: 500;
  letter-spacing: 2rpx;
}

.favorites-arrow-wrapper {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.1) 0%, rgba(232, 184, 96, 0.1) 100%);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(200, 37, 6, 0.15);
}

.favorites-shortcut:hover .favorites-arrow-wrapper {
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.18) 0%, rgba(232, 184, 96, 0.18) 100%);
  border-color: rgba(200, 37, 6, 0.25);
}

.favorites-arrow {
  font-size: 28rpx;
  color: #c82506;
  font-weight: bold;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.favorites-shortcut:hover .favorites-arrow {
  transform: translateX(4rpx);
  opacity: 1;
}

.favorites-shortcut:active .favorites-arrow {
  transform: translateX(8rpx);
}

/* ========== 设置快捷入口 ========== */
.settings-shortcut-wrapper {
  margin-top: 24rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.settings-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.settings-shortcut {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 28rpx 36rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
  border-radius: 24rpx;
  border: 2rpx solid #ced4da;
  box-shadow:
    0 12rpx 36rpx rgba(108, 117, 125, 0.12),
    0 4rpx 12rpx rgba(108, 117, 125, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.settings-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #6c757d 0%, #adb5bd 50%, #6c757d 100%);
  opacity: 0.8;
}

.settings-shortcut::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.settings-shortcut:hover::after {
  left: 100%;
}

.settings-shortcut:hover {
  transform: translateY(-4rpx);
  box-shadow:
    0 20rpx 48rpx rgba(108, 117, 125, 0.16),
    0 8rpx 20rpx rgba(108, 117, 125, 0.08);
}

.settings-shortcut:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(108, 117, 125, 0.1);
}

.settings-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff 0%, #f1f3f4 50%, #e8eaed 100%);
  border-radius: 50%;
  border: 2rpx solid #dadce0;
  box-shadow:
    0 4rpx 12rpx rgba(108, 117, 125, 0.15),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.settings-shortcut:hover .settings-icon-wrapper {
  transform: scale(1.08) rotate(10deg);
  box-shadow:
    0 8rpx 20rpx rgba(108, 117, 125, 0.2),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.settings-icon {
  font-size: 40rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(108, 117, 125, 0.2));
  transition: transform 0.3s ease;
}

.settings-shortcut:hover .settings-icon {
  transform: scale(1.15) rotate(-10deg);
}

.settings-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.settings-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #495057;
  letter-spacing: 4rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.settings-desc {
  font-size: 24rpx;
  color: #6c757d;
}

.settings-arrow-wrapper {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(173, 181, 189, 0.1) 100%);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(108, 117, 125, 0.15);
}

.settings-shortcut:hover .settings-arrow-wrapper {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.15) 0%, rgba(173, 181, 189, 0.15) 100%);
  border-color: rgba(108, 117, 125, 0.25);
}

.settings-arrow {
  font-size: 28rpx;
  color: #6c757d;
  font-weight: bold;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.settings-shortcut:hover .settings-arrow {
  transform: translateX(4rpx);
  opacity: 1;
}
</style>
