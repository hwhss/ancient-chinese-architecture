<template>
  <view class="section-daily" :class="{ 'visible': visible }">
    <view class="section-header">
      <view class="daily-header-left">
        <view class="title-with-icon">
          <TraditionalIcon name="favorites" size="48" style="color: var(--primary)" />
          <text class="section-title">每日一建</text>
        </view>
        <view class="daily-date-tag">
          <text class="daily-date">{{ todayDate }}</text>
        </view>
      </view>
      <view class="window-divider">
        <view class="window-pattern"></view>
      </view>
    </view>

    <view v-if="building" class="daily-card-wrapper">
      <view class="daily-card rice-paper brush-border-ink card-ink" @click="onCardClick">
        <!-- 整体背景图片 -->
        <view v-if="hasImage" class="daily-image-bg" :style="{ backgroundImage: 'url(' + building.image + ')' }">
          <view class="daily-overlay"></view>
        </view>
        <view v-else class="daily-image-bg daily-image-empty">
          <TraditionalIcon name="palace" size="80" style="opacity: 0.5" />
          <text class="daily-image-empty-text">古迹寻踪中...</text>
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
                <text class="daily-name ink-pressed">{{ building.name }}</text>
                <view class="daily-location">
                  <TraditionalIcon name="location" size="24" />
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
                <TraditionalIcon name="view" size="28" />
                <text class="action-text">查看详情</text>
              </view>
              <view class="daily-actions-right">
                <view class="daily-favorite-btn tap-feedback" @click.stop="onToggleFavorite">
                  <text class="favorite-icon" :class="{ 'active': isFavorite }">
                    <TraditionalIcon name="favorites" size="32" :style="{ color: isFavorite ? 'var(--primary)' : 'rgba(255,255,255,0.7)' }" />
                  </text>
                  <text class="favorite-text" :class="{ 'active': isFavorite }">
                    {{ isFavorite ? '已收藏' : '收藏' }}
                  </text>
                </view>
                <view class="daily-share-btn tap-feedback" @click.stop="onShare">
                  <TraditionalIcon name="share" size="26" />
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
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'DailyBuilding',
  components: {
    TraditionalIcon
  },
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
  computed: {
    hasImage() {
      return Boolean(String((this.building && this.building.image) || '').trim());
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
  padding: 80rpx 40rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
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

.daily-header-left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.daily-date-tag {
  background: var(--bg-secondary);
  padding: 8rpx 32rpx;
  border-radius: 4rpx;
  border: 1rpx solid var(--border);
}

.daily-date {
  font-size: 24rpx;
  color: var(--text-tertiary);
  font-weight: 500;
  letter-spacing: 2rpx;
}

.window-divider {
  width: 100%;
  height: 20rpx;
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 24rpx;
}

.window-pattern {
  width: 160rpx;
  height: 4rpx;
  background: var(--secondary);
  opacity: 0.3;
  position: relative;
}

/* 卡片主体 */
.daily-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 700rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 30rpx 80rpx rgba(44, 30, 19, 0.15);
  border: 1rpx solid var(--border);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-card:active {
  transform: translateY(-8rpx) scale(1.01);
  box-shadow: 0 40rpx 100rpx rgba(44, 30, 19, 0.2);
}

.daily-image-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.daily-card:hover .daily-image-bg {
  transform: scale(1.1);
}

.daily-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(44,30,19,0.1) 0%, rgba(44,30,19,0.4) 50%, rgba(44,30,19,0.9) 100%);
  pointer-events: none;
}

/* 图片装饰角落 */
.image-corner {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid rgba(255, 248, 230, 0.4);
  z-index: 3;
}

.image-corner.top-left { top: 24rpx; left: 24rpx; border-right: none; border-bottom: none; }
.image-corner.top-right { top: 24rpx; right: 24rpx; border-left: none; border-bottom: none; }
.image-corner.bottom-left { bottom: 24rpx; left: 24rpx; border-right: none; border-top: none; }
.image-corner.bottom-right { bottom: 24rpx; right: 24rpx; border-left: none; border-top: none; }

.daily-badge {
  position: absolute;
  top: 30rpx;
  left: 30rpx;
  background: var(--primary);
  padding: 10rpx 24rpx;
  border-radius: 4rpx;
  z-index: 3;
  transform: rotate(-2deg);
  box-shadow: 0 4rpx 12rpx rgba(166, 49, 49, 0.3);
}

.badge-text {
  font-size: 20rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

.daily-content-section {
  position: relative;
  z-index: 2;
  padding: 48rpx;
}

.daily-name {
  font-size: 56rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 8rpx;
  margin-bottom: 12rpx;
  display: block;
  font-family: 'TsangerJinKai', serif;
}

.ink-pressed {
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.5);
}

.location-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.daily-dynasty-badge {
  background: var(--primary);
  padding: 8rpx 20rpx;
  border-radius: 4rpx;
  border: 1rpx solid rgba(255,248,230,0.2);
}

.dynasty-text {
  font-size: 22rpx;
  color: #fff8e6;
  font-weight: bold;
}

.daily-divider {
  width: 60rpx;
  height: 4rpx;
  background: var(--warning);
  margin: 24rpx 0;
}

.daily-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin-bottom: 24rpx;
}

.daily-tag {
  font-size: 22rpx;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  padding: 6rpx 20rpx;
  border-radius: 4rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  margin-right: 12rpx;
}

.daily-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.daily-action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 40rpx;
  background: var(--primary);
  color: #fff8e6;
  border-radius: 4rpx;
}

.action-text {
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
}

.daily-actions-right {
  display: flex;
  gap: 24rpx;
}

.daily-favorite-btn, .daily-share-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #ffffff;
  font-size: 26rpx;
}

.favorite-text.active {
  color: var(--warning);
}
</style>
