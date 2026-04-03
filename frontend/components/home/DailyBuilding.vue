<template>
  <view class="section-daily" :class="{ 'visible': visible }">
    <view class="section-header">
      <view class="daily-header-left">
        <text class="section-title">📅 每日一建</text>
        <text class="daily-date">{{ todayDate }}</text>
      </view>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>

    <view v-if="building" class="daily-card-wrapper">
      <view class="daily-card card-ink" @click="onCardClick">
        <!-- 整体背景图片 -->
        <view class="daily-image-bg" :style="{ backgroundImage: 'url(' + building.image + ')' }">
          <view class="daily-overlay"></view>
        </view>
        
        <view class="daily-badge">
          <text class="badge-text">今日推荐</text>
        </view>
        
        <!-- 装饰性角落 -->
        <view class="image-corner top-left"></view>
        <view class="image-corner top-right"></view>
        <view class="image-corner bottom-left"></view>
        <view class="image-corner bottom-right"></view>

        <!-- 覆盖内容 -->
        <view class="daily-content-section">
          <view class="daily-content">
            <!-- 标题区 -->
            <view class="daily-header">
              <view class="daily-title-wrapper">
                <text class="daily-name">{{ building.name }}</text>
                <view class="daily-location">
                  <text class="location-icon">📍</text>
                  <text class="location-text">{{ building.location }}</text>
                </view>
              </view>
              <view class="daily-dynasty-badge">
                <text class="dynasty-text">{{ building.dynasty }}</text>
              </view>
            </view>

            <!-- 分隔线 -->
            <view class="daily-divider"></view>

            <!-- 描述 -->
            <text class="daily-desc">{{ building.description }}</text>

            <!-- 标签 -->
            <view class="daily-tags">
              <text v-for="tag in building.tags" :key="tag" class="daily-tag">{{ tag }}</text>
            </view>

            <!-- 底部操作区 -->
            <view class="daily-footer">
              <view class="daily-action-btn ink-ripple">
                <text class="action-icon">👁️</text>
                <text class="action-text">查看详情</text>
              </view>
              <view class="daily-actions-right">
                <view class="daily-favorite-btn tap-feedback" @click.stop="onToggleFavorite">
                  <text class="favorite-icon" :class="{ 'active': isFavorite }">
                    {{ isFavorite ? '★' : '☆' }}
                  </text>
                  <text class="favorite-text" :class="{ 'active': isFavorite }">
                    {{ isFavorite ? '已收藏' : '收藏' }}
                  </text>
                </view>
                <view class="daily-share-btn tap-feedback" @click.stop="onShare">
                  <text class="share-icon">📤</text>
                  <text class="share-text">分享</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DailyBuilding',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    building: {
      type: Object,
      default: () => null
    },
    todayDate: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onCardClick() {
      this.$emit('go-to-detail', this.building);
    },
    onToggleFavorite() {
      this.$emit('toggle-favorite', this.building);
    },
    onShare() {
      this.$emit('share', this.building);
    }
  }
}
</script>

<style scoped>
.section-daily {
  padding: 60rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
  background: linear-gradient(180deg, transparent 0%, rgba(200, 37, 6, 0.03) 50%, transparent 100%);
}

.section-daily.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.section-title {
  font-size: 56rpx;
  font-weight: bold;
  color: #3c2a1d;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 6rpx;
}

.daily-header-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.daily-date {
  font-size: 26rpx;
  color: #8b7355;
  font-weight: 500;
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  border: 2rpx solid #e8b860;
  box-shadow: 0 4rpx 12rpx rgba(232, 184, 96, 0.2);
}

.window-divider {
  width: 100%;
  height: 20rpx;
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
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

/* 卡片容器 */
.daily-card-wrapper {
  max-width: 800rpx;
  margin: 0 auto;
}

/* 卡片主体 */
.daily-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 600rpx;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 
    0 20rpx 60rpx rgba(139, 69, 19, 0.2),
    0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  border: 2rpx solid #e8d8c8;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-card:active {
  transform: translateY(-6rpx);
  box-shadow: 
    0 28rpx 80rpx rgba(139, 69, 19, 0.25),
    0 12rpx 32rpx rgba(139, 69, 19, 0.18);
}

/* 整体背景图片 */
.daily-image-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.daily-card:hover .daily-image-bg {
  transform: scale(1.05);
}

/* 图片渐变遮罩，使文字更清晰 */
.daily-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%);
  pointer-events: none;
}

/* 图片装饰角落 - 更精致 */
.image-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 248, 230, 0.5);
  z-index: 3;
  transition: all 0.3s ease;
}

.daily-card:hover .image-corner {
  border-color: rgba(255, 248, 230, 0.9);
  width: 50rpx;
  height: 50rpx;
}

.image-corner.top-left {
  top: 20rpx;
  left: 20rpx;
  border-right: none;
  border-bottom: none;
}

.image-corner.top-right {
  top: 20rpx;
  right: 20rpx;
  border-left: none;
  border-bottom: none;
}

.image-corner.bottom-left {
  bottom: 20rpx;
  left: 20rpx;
  border-right: none;
  border-top: none;
}

.image-corner.bottom-right {
  bottom: 20rpx;
  right: 20rpx;
  border-left: none;
  border-top: none;
}

/* 今日推荐徽章 */
.daily-badge {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  box-shadow: 0 6rpx 20rpx rgba(200, 37, 6, 0.4);
  z-index: 3;
  transform: rotate(-3deg);
}

.badge-text {
  font-size: 22rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

/* 覆盖内容区域 */
.daily-content-section {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  padding: 40rpx;
  margin-top: auto; /* 推到底部 */
}

.daily-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 头部区域 */
.daily-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 4rpx;
}

.daily-title-wrapper {
  flex: 1;
}

.daily-name {
  font-size: 52rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 8rpx;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.2;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.5);
}

.daily-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location-icon {
  font-size: 24rpx;
}

.location-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.5);
}

/* 朝代徽章 */
.daily-dynasty-badge {
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.9) 0%, rgba(168, 28, 7, 0.9) 100%);
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
  backdrop-filter: blur(4rpx);
}

.dynasty-text {
  font-size: 24rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

/* 分隔线 */
.daily-divider {
  width: 100%;
  height: 2rpx;
  background: linear-gradient(90deg, rgba(255,255,255,0.4) 0%, transparent 80%);
  margin: 8rpx 0;
}

/* 描述文字 */
.daily-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-align: justify;
  max-height: 96rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.6);
}

/* 标签 */
.daily-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 8rpx;
}

.daily-tag {
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4rpx);
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.3);
}

/* 底部操作区 */
.daily-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid rgba(255, 255, 255, 0.2);
}

.daily-action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 32rpx;
  background: linear-gradient(145deg, #e84a38 0%, #c82506 50%, #a81c07 100%);
  border-radius: 32rpx;
  box-shadow:
    0 6rpx 18rpx rgba(200, 37, 6, 0.35),
    0 2rpx 6rpx rgba(200, 37, 6, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.daily-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.daily-action-btn:hover::before {
  left: 100%;
}

.daily-action-btn:hover {
  transform: translateY(-3rpx);
  box-shadow:
    0 10rpx 28rpx rgba(200, 37, 6, 0.4),
    0 4rpx 10rpx rgba(200, 37, 6, 0.25);
}

.daily-action-btn:active {
  transform: translateY(-1rpx) scale(0.97);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.3);
}

.action-icon {
  font-size: 28rpx;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
}

.action-text {
  font-size: 28rpx;
  color: #fff8e6;
  font-weight: 600;
  letter-spacing: 4rpx;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.daily-actions-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.daily-favorite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-favorite-btn:hover {
  transform: translateY(-2rpx);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.daily-favorite-btn:active {
  transform: translateY(-1rpx) scale(0.97);
}

.favorite-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.2));
}

.favorite-icon.active {
  color: #ff4d4f;
  filter: drop-shadow(0 2rpx 4rpx rgba(255, 77, 79, 0.4));
  animation: favoritePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes favoritePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.favorite-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-text.active {
  color: #ff4d4f;
  font-weight: 600;
}

.daily-share-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-share-btn:hover {
  transform: translateY(-2rpx);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.daily-share-btn:active {
  transform: translateY(-1rpx) scale(0.97);
}

.share-icon {
  font-size: 26rpx;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.2));
}

.share-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}
</style>
