<template>
  <view class="skeleton-container" :class="{ 'fade-out': !loading }">
    <!-- 骨架屏头部 -->
    <view v-if="type === 'home'" class="skeleton-home">
      <!-- Hero区域骨架 -->
      <view class="skeleton-hero">
        <view class="skeleton-title skeleton"></view>
        <view class="skeleton-subtitle skeleton"></view>
        <view class="skeleton-stats">
          <view v-for="i in 3" :key="i" class="skeleton-stat skeleton"></view>
        </view>
      </view>
      
      <!-- 精选古建卡片骨架 -->
      <view class="skeleton-section">
        <view class="skeleton-section-title skeleton"></view>
        <view class="skeleton-cards">
          <view v-for="i in cardCount" :key="i" class="skeleton-card">
            <view class="skeleton-card-image skeleton"></view>
            <view class="skeleton-card-title skeleton"></view>
            <view class="skeleton-card-desc skeleton"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 地图页骨架 -->
    <view v-else-if="type === 'map'" class="skeleton-map">
      <!-- 搜索框骨架 -->
      <view class="skeleton-search skeleton"></view>
      
      <!-- 筛选标签骨架 -->
      <view class="skeleton-filters">
        <view v-for="i in 6" :key="i" class="skeleton-filter skeleton"></view>
      </view>
      
      <!-- 列表骨架 -->
      <view class="skeleton-list">
        <view v-for="i in listCount" :key="i" class="skeleton-list-item">
          <view class="skeleton-item-image skeleton"></view>
          <view class="skeleton-item-content">
            <view class="skeleton-item-title skeleton"></view>
            <view class="skeleton-item-desc skeleton"></view>
            <view class="skeleton-item-tags">
              <view v-for="j in 3" :key="j" class="skeleton-tag skeleton"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 通用卡片骨架 -->
    <view v-else-if="type === 'cards'" class="skeleton-cards-only">
      <view v-for="i in cardCount" :key="i" class="skeleton-card">
        <view class="skeleton-card-image skeleton"></view>
        <view class="skeleton-card-title skeleton"></view>
        <view class="skeleton-card-desc skeleton"></view>
      </view>
    </view>
    
    <!-- 列表骨架 -->
    <view v-else-if="type === 'list'" class="skeleton-list-only">
      <view v-for="i in listCount" :key="i" class="skeleton-list-item">
        <view class="skeleton-item-image skeleton"></view>
        <view class="skeleton-item-content">
          <view class="skeleton-item-title skeleton"></view>
          <view class="skeleton-item-desc skeleton"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SkeletonScreen',
  props: {
    // 骨架屏类型: home, map, cards, list
    type: {
      type: String,
      default: 'cards'
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: true
    },
    // 卡片数量
    cardCount: {
      type: Number,
      default: 4
    },
    // 列表项数量
    listCount: {
      type: Number,
      default: 6
    }
  }
}
</script>

<style scoped>
.skeleton-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #faf6ed 0%, #f7f1e6 100%);
  transition: opacity 0.3s ease;
}

.skeleton-container.fade-out {
  opacity: 0;
  pointer-events: none;
}

/* ========== 首页骨架屏 ========== */
.skeleton-home {
  padding: 20rpx;
}

.skeleton-hero {
  padding: 60rpx 40rpx;
  margin-bottom: 40rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 16rpx;
}

.skeleton-title {
  width: 60%;
  height: 48rpx;
  margin: 0 auto 20rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.3);
}

.skeleton-subtitle {
  width: 80%;
  height: 32rpx;
  margin: 0 auto 40rpx;
  border-radius: 6rpx;
  background: rgba(255, 255, 255, 0.2);
}

.skeleton-stats {
  display: flex;
  justify-content: center;
  gap: 40rpx;
}

.skeleton-stat {
  width: 120rpx;
  height: 80rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.25);
}

.skeleton-section {
  padding: 20rpx;
}

.skeleton-section-title {
  width: 200rpx;
  height: 40rpx;
  margin-bottom: 30rpx;
  border-radius: 8rpx;
}

.skeleton-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.skeleton-card {
  flex: 1;
  min-width: 300rpx;
  max-width: calc(50% - 10rpx);
  background: #fffef9;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e8d8c8;
}

.skeleton-card-image {
  width: 100%;
  height: 200rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.skeleton-card-title {
  width: 80%;
  height: 32rpx;
  border-radius: 6rpx;
  margin-bottom: 12rpx;
}

.skeleton-card-desc {
  width: 100%;
  height: 24rpx;
  border-radius: 4rpx;
}

/* ========== 地图页骨架屏 ========== */
.skeleton-map {
  padding: 20rpx;
}

.skeleton-search {
  width: 100%;
  height: 80rpx;
  border-radius: 40rpx;
  margin-bottom: 20rpx;
}

.skeleton-filters {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  overflow-x: auto;
}

.skeleton-filter {
  flex-shrink: 0;
  width: 120rpx;
  height: 56rpx;
  border-radius: 28rpx;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.skeleton-list-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background: #fffef9;
  border-radius: 16rpx;
  border: 1rpx solid #e8d8c8;
}

.skeleton-item-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.skeleton-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.skeleton-item-title {
  width: 70%;
  height: 36rpx;
  border-radius: 6rpx;
}

.skeleton-item-desc {
  width: 100%;
  height: 24rpx;
  border-radius: 4rpx;
}

.skeleton-item-tags {
  display: flex;
  gap: 12rpx;
  margin-top: auto;
}

.skeleton-tag {
  width: 80rpx;
  height: 36rpx;
  border-radius: 18rpx;
}

/* ========== 通用骨架屏 ========== */
.skeleton-cards-only {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 20rpx;
}

.skeleton-list-only {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 20rpx;
}

/* 骨架屏动画 - 使用全局定义的skeleton类 */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0e6d3 25%,
    var(--bg-tertiary) 50%,
    #f0e6d3 75%
  );
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s ease-in-out infinite;
}

@keyframes skeletonLoading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
