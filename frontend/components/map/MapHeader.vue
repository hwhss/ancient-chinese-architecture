<template>
  <view class="header">
    <view class="header-decoration top"></view>
    <view class="header-content">
      <text class="title">🏯 中华古建筑名录</text>
      <text class="subtitle">精选十七处代表性古建筑</text>
    </view>
    <!-- 视图切换按钮 -->
    <view class="view-toggle">
      <view 
        class="toggle-btn tap-feedback" 
        :class="{ active: currentView === 'list' }"
        @click="switchView('list')"
      >
        <text class="toggle-icon">📋</text>
        <text class="toggle-text">列表</text>
      </view>
      <view 
        class="toggle-btn tap-feedback" 
        :class="{ active: currentView === 'map' }"
        @click="switchView('map')"
      >
        <text class="toggle-icon">🗺️</text>
        <text class="toggle-text">地图</text>
      </view>
    </view>
    <view class="header-decoration bottom"></view>
  </view>
</template>

<script>
export default {
  props: {
    currentView: {
      type: String,
      default: "list"
    }
  },
  methods: {
    switchView(view) {
      this.$emit("switch-view", view);
    }
  }
};
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.header-content {
  flex: 1;
}

.header-decoration {
  height: 2rpx;
  width: 50%;
  margin: 12rpx auto;
  background: rgba(255, 255, 255, 0.3);
}

.header-decoration.top {
  margin-top: 0;
  margin-bottom: 16rpx;
}

.header-decoration.bottom {
  margin-bottom: 0;
  margin-top: 16rpx;
}

.title {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  margin-bottom: 8rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.subtitle {
  display: block;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.view-toggle {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 20rpx;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 32rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  transition: all 0.3s;
  border: 2rpx solid transparent;
}

.toggle-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: var(--secondary);
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  transform: translateY(-2rpx);
}

.toggle-icon {
  font-size: 28rpx;
}
</style>
