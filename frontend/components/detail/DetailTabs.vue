<template>
  <view class="tab-bar">
    <view
      v-for="tab in visibleTabs"
      :key="tab.key"
      class="tab-item tap-feedback"
      :class="{ active: activeTab === tab.key }"
      @click="$emit('switch-tab', tab.key)"
    >
      <text class="tab-text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "DetailTabs",
  props: {
    visibleTabs: {
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: "basic"
    }
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  margin-top: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid var(--bg-tertiary);
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-item.active {
  background: var(--secondary);
}

.tab-text {
  font-size: 26rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: var(--bg-primary);
  font-weight: 600;
}
</style>
