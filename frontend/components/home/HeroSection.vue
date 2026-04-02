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
        <text class="main-title" :class="{ 'visible': visible }">中华古建筑导览</text>
        <!-- 精致朱砂印章 -->
        <view class="seal-decor" :class="{ 'visible': visible }" @click="onSealClick">古建</view>
      </view>
      
      <text class="subtitle" :class="{ 'visible': visible }">探索千年文明，感受建筑之美</text>
      <text class="description" :class="{ 'visible': visible }">
        从宫殿庙宇到园林民居，从古城墙到古桥梁，让我们一起穿越时空，领略中国古代建筑的辉煌与魅力
      </text>
      
      <!-- 统计信息 -->
      <view class="hero-stats" :class="{ 'visible': visible }">
        <view class="stat-item" v-for="(stat, index) in stats" :key="index">
          <text class="stat-number">{{ stat.number }}</text>
          <text class="stat-label">{{ stat.label }}</text>
        </view>
      </view>
      
      <!-- 中式分隔线 -->
      <view class="hero-divider" :class="{ 'visible': visible }">
        <view class="window-divider">
          <view class="window-pattern"></view>
        </view>
      </view>
    </view>
    
    <!-- 入口按钮 -->
    <view class="hero-buttons">
      <ActionButton
        v-for="(btn, index) in buttons"
        :key="index"
        :type="btn.type"
        :text="btn.text"
        :icon="btn.icon"
        :class="{ 'visible': visible }"
        @click="btn.action"
      />
      
      <!-- 按钮下方的分类快捷入口 -->
      <view class="category-shortcuts" :class="{ 'visible': visible }">
        <view 
          class="category-item tap-feedback" 
          v-for="(cat, index) in categories" 
          :key="index"
          @click="cat.action"
        >
          <text class="category-icon">{{ cat.icon }}</text>
          <text class="category-text">{{ cat.name }}</text>
        </view>
      </view>

      <!-- 我的收藏快捷入口 -->
      <view class="favorites-shortcut-wrapper" :class="{ 'visible': visible }">
        <view class="favorites-shortcut card-ink" @click="onFavoritesClick">
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
      <view class="settings-shortcut-wrapper" :class="{ 'visible': visible }">
        <view class="settings-shortcut card-ink" @click="onSettingsClick">
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
import ActionButton from '../ui/ActionButton.vue'

export default {
  name: 'HeroSection',
  components: { ActionButton },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    favoriteCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['goToMap', 'goToChat', 'goToCategory', 'goToFavorites', 'goToSettings', 'goToAbout'],
  setup(props, { emit }) {
    const stats = [
      { number: '17', label: '处古建' },
      { number: '4', label: '大分类' },
      { number: 'AI', label: '智能导览' }
    ]

    const buttons = [
      { type: 'primary', text: '查看古建筑名录', icon: '📋', action: () => emit('goToMap') },
      { type: 'secondary', text: '开始 AI 导览', icon: '🤖', action: () => emit('goToChat') }
    ]

    const categories = [
      { name: '宫殿', icon: '🏯', action: () => emit('goToCategory', 'palace') },
      { name: '园林', icon: '🌳', action: () => emit('goToCategory', 'garden') },
      { name: '桥梁', icon: '🌉', action: () => emit('goToCategory', 'bridge') },
      { name: '城防', icon: '🏰', action: () => emit('goToCategory', 'defense') }
    ]

    const onSealClick = () => emit('goToAbout')
    const onFavoritesClick = () => emit('goToFavorites')
    const onSettingsClick = () => emit('goToSettings')

    return {
      stats,
      buttons,
      categories,
      onSealClick,
      onFavoritesClick,
      onSettingsClick
    }
  }
}
</script>

<style scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  position: relative;
}

/* 角落装饰 */
.corner-decoration {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border: 3rpx solid rgba(200, 37, 6, 0.3);
}

.corner-decoration.top-left {
  top: 40rpx;
  left: 40rpx;
  border-right: none;
  border-bottom: none;
}

.corner-decoration.top-right {
  top: 40rpx;
  right: 40rpx;
  border-left: none;
  border-bottom: none;
}

.corner-decoration.bottom-left {
  bottom: 40rpx;
  left: 40rpx;
  border-right: none;
  border-top: none;
}

.corner-decoration.bottom-right {
  bottom: 40rpx;
  right: 40rpx;
  border-left: none;
  border-top: none;
}

/* 标题区域 */
.title-area {
  text-align: center;
  margin-bottom: 60rpx;
}

.title-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 30rpx;
}

.main-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #3c2a1d;
  letter-spacing: 8rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-title.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 朱砂印章 */
.seal-decor {
  position: absolute;
  right: -80rpx;
  top: -20rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #c82506 0%, #8b0000 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
  box-shadow: 0 4rpx 16rpx rgba(200, 37, 6, 0.3);
  transform: rotate(12deg) scale(0);
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
}

.seal-decor.visible {
  transform: rotate(12deg) scale(1);
}

.subtitle {
  font-size: 32rpx;
  color: #6b5643;
  letter-spacing: 6rpx;
  margin-bottom: 24rpx;
  display: block;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.description {
  font-size: 26rpx;
  color: #8b7355;
  line-height: 1.8;
  max-width: 600rpx;
  margin: 0 auto 40rpx;
  display: block;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;
}

.description.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 统计信息 */
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  margin-bottom: 40rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s;
}

.hero-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #c82506;
  display: block;
}

.stat-label {
  font-size: 22rpx;
  color: #8b7355;
  margin-top: 8rpx;
  display: block;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: linear-gradient(180deg, transparent, #d4a574, transparent);
}

/* 分隔线 */
.hero-divider {
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s;
}

.hero-divider.visible {
  opacity: 1;
}

.window-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}

.window-divider::before,
.window-divider::after {
  content: '';
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #d4a574, transparent);
  max-width: 200rpx;
}

.window-pattern {
  width: 60rpx;
  height: 24rpx;
  background: 
    linear-gradient(90deg, transparent 45%, #d4a574 45%, #d4a574 55%, transparent 55%),
    linear-gradient(0deg, transparent 45%, #d4a574 45%, #d4a574 55%, transparent 55%);
  margin: 0 30rpx;
  opacity: 0.6;
}

/* 按钮区域 */
.hero-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  width: 100%;
  max-width: 600rpx;
}

/* 分类快捷入口 */
.category-shortcuts {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 40rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1s;
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
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
  transition: all 0.3s ease;
}

.category-icon {
  font-size: 40rpx;
}

.category-text {
  font-size: 24rpx;
  color: #3c2a1d;
}

/* 收藏和设置入口 */
.favorites-shortcut-wrapper,
.settings-shortcut-wrapper {
  width: 100%;
  margin-top: 20rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.2s;
}

.favorites-shortcut-wrapper.visible,
.settings-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.favorites-shortcut,
.settings-shortcut {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: linear-gradient(135deg, #fff 0%, #faf6ed 100%);
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
}

.favorites-icon-wrapper,
.settings-icon-wrapper {
  position: relative;
  margin-right: 20rpx;
}

.favorites-icon,
.settings-icon {
  font-size: 40rpx;
}

.favorites-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #c82506;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.favorites-info,
.settings-info {
  flex: 1;
}

.favorites-title,
.settings-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3c2a1d;
  display: block;
}

.favorites-count,
.settings-desc {
  font-size: 24rpx;
  color: #8b7355;
  margin-top: 4rpx;
  display: block;
}

.favorites-arrow-wrapper,
.settings-arrow-wrapper {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 37, 6, 0.1);
  border-radius: 50%;
}

.favorites-arrow,
.settings-arrow {
  font-size: 28rpx;
  color: #c82506;
}

/* 卡片水墨效果 */
.card-ink {
  position: relative;
  overflow: hidden;
}

.card-ink::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(200, 37, 6, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

/* 点击反馈 */
.tap-feedback:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
