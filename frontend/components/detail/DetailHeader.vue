<template>
  <view class="header">
    <button class="back-btn" @click="$emit('go-back')">← 返回</button>
    <text class="header-title">古建筑详情</text>
    <view class="header-actions">
      <view class="share-btn-header tap-feedback" @click="$emit('open-share-card')">
        <text class="share-icon-header">📤</text>
        <text class="share-label-header">分享</text>
      </view>
      <view
        class="favorite-btn tap-feedback"
        :class="{ 'active': isFavorite }"
        @click="$emit('toggle-favorite')"
      >
        <text class="favorite-icon">{{ isFavorite ? '★' : '☆' }}</text>
        <text class="favorite-label">{{ isFavorite ? '已收藏' : '收藏' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "DetailHeader",
  props: {
    isFavorite: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.3);
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.96);
}

.header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.share-btn-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-btn-header:active {
  transform: scale(0.95);
  background: rgba(232, 184, 96, 0.2);
  border-color: rgba(255, 200, 100, 0.5);
}

.share-icon-header {
  font-size: 28rpx;
}

.share-label-header {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-btn.active {
  background: rgba(200, 37, 6, 0.2);
  border-color: rgba(255, 200, 100, 0.6);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.favorite-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-icon {
  color: #ffd700;
  filter: drop-shadow(0 2rpx 4rpx rgba(255, 215, 0, 0.4));
}

.favorite-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-label {
  color: #ffd700;
}
</style>
