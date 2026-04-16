<template>
  <view class="section-daily" :class="{ 'visible': visible }">
    <view class="page-container">
      <view class="section-header">
        <view class="title-with-icon">
          <TraditionalIcon name="favorites" size="44" style="color: var(--primary)" />
          <text class="section-title">每日一建</text>
        </view>
        <text class="section-subtitle">{{ todayDate }}</text>
        <view class="window-divider">
          <view class="window-pattern"></view>
        </view>
      </view>

      <view v-if="building" class="daily-card-wrapper">
        <view class="daily-card rice-paper card-ink" @click="onCardClick">
          <!-- 整体背景图片 -->
          <view v-if="hasImage" class="daily-image-bg" :style="{ backgroundImage: 'url(' + building.image + ')' }">
            <view class="daily-overlay"></view>
          </view>
          <view v-else class="daily-image-bg daily-image-empty">
            <TraditionalIcon name="palace" size="72" style="opacity: 0.4" />
            <text class="daily-image-empty-text">古迹寻踪中...</text>
            <view class="daily-overlay"></view>
          </view>
          
          <view class="daily-badge">
            <text class="badge-text">今日推荐</text>
          </view>

          <!-- 覆盖内容 -->
          <view class="daily-content-section" :class="{ compact: !hasDescription }">
            <view class="daily-content">
              <!-- 标题区 -->
              <view class="daily-header">
                <view class="daily-title-wrapper">
                  <text class="daily-name ink-pressed">{{ building.name }}</text>
                  <view class="daily-location">
                    <TraditionalIcon name="location" size="22" />
                    <text class="location-text">{{ building.location }}</text>
                  </view>
                </view>
                <view class="daily-dynasty-badge">
                  <text class="dynasty-text">{{ building.dynasty }}</text>
                </view>
              </view>

              <!-- 分隔线 -->
              <view v-if="hasDescription" class="daily-divider"></view>

              <!-- 描述 -->
              <text v-if="hasDescription" class="daily-desc">{{ building.description }}</text>

              <!-- 标签 -->
              <view class="daily-tags">
                <text v-for="tag in building.tags" :key="tag" class="daily-tag">{{ tag }}</text>
              </view>

              <!-- 底部操作区 -->
              <view class="daily-footer">
                <view class="daily-action-btn">
                  <TraditionalIcon name="view" size="26" />
                  <text class="action-text">查看详情</text>
                </view>
                <view class="daily-actions-right">
                  <view class="daily-favorite-btn tap-feedback" @click.stop="onToggleFavorite">
                    <text class="favorite-icon" :class="{ 'active': isFavorite }">
                      <TraditionalIcon name="favorites" size="28" :style="{ color: isFavorite ? 'var(--primary)' : 'rgba(255,255,255,0.8)' }" />
                    </text>
                    <text class="favorite-text" :class="{ 'active': isFavorite }">
                      {{ isFavorite ? '已收藏' : '收藏' }}
                    </text>
                  </view>
                  <view class="daily-share-btn tap-feedback" @click.stop="onShare">
                    <TraditionalIcon name="share" size="24" />
                    <text class="share-text">分享</text>
                  </view>
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
    },
    hasDescription() {
      const text = String((this.building && this.building.description) || '').trim();
      return Boolean(text) && text !== '暂无简介' && text !== '暂无介绍';
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
  padding: 60rpx 32rpx;
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
  margin-bottom: 40rpx;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 4rpx;
}

.section-subtitle {
  font-size: 22rpx;
  color: var(--text-tertiary);
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
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

.daily-card-wrapper {
  display: flex;
  justify-content: center;
}

/* 卡片主体 - 优化尺寸 */
.daily-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  max-width: 720rpx;
  min-height: 720rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(44, 30, 19, 0.12);
  border: 1rpx solid var(--border);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 28rpx 72rpx rgba(44, 30, 19, 0.18);
}

.daily-card:active {
  transform: translateY(-2rpx);
}

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

.daily-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  color: var(--text-muted);
}

.daily-image-empty-text {
  font-size: 24rpx;
  margin-top: 16rpx;
  opacity: 0.6;
}

.daily-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg, 
    rgba(44, 30, 19, 0.1) 0%, 
    rgba(44, 30, 19, 0.3) 50%, 
    rgba(44, 30, 19, 0.85) 100%
  );
  pointer-events: none;
}

.daily-badge {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  background: var(--primary);
  padding: 8rpx 20rpx;
  border-radius: 4rpx;
  z-index: 3;
  box-shadow: 0 4rpx 12rpx rgba(166, 49, 49, 0.3);
}

.badge-text {
  font-size: 18rpx;
  color: #fff8e6;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.daily-content-section {
  position: relative;
  z-index: 2;
  padding: 24rpx 28rpx 20rpx;
}

.daily-content-section.compact {
  padding-top: 16rpx;
  padding-bottom: 14rpx;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.daily-title-wrapper {
  flex: 1;
}

.daily-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 4rpx;
  margin-bottom: 6rpx;
  display: block;
  font-family: 'TsangerJinKai', serif;
}

.ink-pressed {
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

.daily-location {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: rgba(255, 255, 255, 0.85);
}

.location-text {
  font-size: 22rpx;
}

.daily-dynasty-badge {
  background: rgba(166, 49, 49, 0.9);
  padding: 6rpx 16rpx;
  border-radius: 4rpx;
  border: 1rpx solid rgba(255, 248, 230, 0.2);
  margin-left: 16rpx;
}

.dynasty-text {
  font-size: 20rpx;
  color: #fff8e6;
  font-weight: 600;
}

.daily-divider {
  width: 48rpx;
  height: 3rpx;
  background: var(--warning);
  margin: 10rpx 0 12rpx;
  opacity: 0.8;
}

.daily-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.daily-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.daily-tag {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  padding: 4rpx 14rpx;
  border-radius: 4rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.daily-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.15);
}

.daily-action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: var(--primary);
  color: #fff8e6;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
  transition: all 0.2s ease;
}

.daily-action-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2rpx);
}

.action-text {
  font-size: 22rpx;
}

.daily-actions-right {
  display: flex;
  gap: 20rpx;
}

.daily-favorite-btn,
.daily-share-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
  padding: 8rpx 12rpx;
  border-radius: 20rpx;
  transition: all 0.2s ease;
}

.daily-favorite-btn:hover,
.daily-share-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.favorite-text {
  transition: color 0.2s ease;
}

.favorite-text.active {
  color: var(--warning);
}

/* 响应式适配 */
@media (min-width: 768px) {
  .section-daily {
    padding: 80rpx 40rpx;
  }
  
  .section-title {
    font-size: 48rpx;
  }
  
  .daily-card {
    min-height: 800rpx;
  }
  
  .daily-name {
    font-size: 48rpx;
  }
}
</style>
