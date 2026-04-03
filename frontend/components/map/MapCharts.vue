<template>
  <view class="charts-section" v-if="hasData">
    <!-- 图表切换标签 -->
    <view class="charts-tabs">
      <view
        v-for="tab in chartTabs"
        :key="tab.key"
        class="chart-tab tap-feedback"
        :class="{ active: activeChartTab === tab.key }"
        @click="$emit('switch-chart-tab', tab.key)"
      >
        <text class="chart-tab-icon">{{ tab.icon }}</text>
        <text class="chart-tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 图表容器 -->
    <view class="chart-display-area">
      <!-- 分类分布饼图 -->
      <view v-if="activeChartTab === 'category'" class="chart-wrapper">
        <view class="chart-title-bar">
          <text class="chart-title-text">🏛️ 建筑类型分布</text>
        </view>
        <!-- #ifdef H5 -->
        <VisualChart
          type="pie"
          :data="categoryChartData"
          :height="260"
          @click="$emit('category-chart-click', $event)"
        />
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <view class="chart-fallback-simple">
          <text class="fallback-text">请在 H5 环境下查看图表</text>
        </view>
        <!-- #endif -->
      </view>

      <!-- 地理位置散点图 -->
      <view v-if="activeChartTab === 'geo'" class="chart-wrapper">
        <view class="chart-title-bar">
          <text class="chart-title-text">📍 地理位置分布</text>
          <text class="chart-subtitle">共 {{ dataCount }} 处古建筑</text>
        </view>
        <!-- #ifdef H5 -->
        <VisualChart
          type="scatter"
          :data="geoChartData"
          :height="320"
          @click="$emit('chart-click', $event)"
        />
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <view class="chart-fallback-simple">
          <text class="fallback-text">请在 H5 环境下查看图表</text>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script>
import VisualChart from "../VisualChart.vue";

export default {
  components: { VisualChart },
  props: {
    hasData: Boolean,
    activeChartTab: String,
    chartTabs: Array,
    categoryChartData: Object,
    geoChartData: Object,
    dataCount: Number
  }
}
</script>

<style scoped>
.charts-section {
  padding: 24rpx 20rpx;
  margin: 20rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 20rpx;
  border: 2rpx solid var(--bg-tertiary);
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
}

.charts-tabs {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.chart-tab {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 1rpx solid var(--bg-tertiary);
  transition: all 0.3s ease;
}

.chart-tab:active {
  transform: scale(0.96);
}

.chart-tab.active {
  background: linear-gradient(135deg, #c82506 0%, var(--primary-dark) 100%);
  border-color: #c82506;
  box-shadow: 0 3rpx 10rpx rgba(200, 37, 6, 0.3);
}

.chart-tab-icon {
  font-size: 24rpx;
}

.chart-tab-text {
  font-size: 24rpx;
  color: var(--text-secondary);
  font-weight: 500;
}

.chart-tab.active .chart-tab-text {
  color: #fff;
}

.chart-display-area {
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid var(--bg-tertiary);
  overflow: hidden;
}

.chart-wrapper {
  padding: 0;
}

.chart-title-bar {
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #faf6ed 0%, #f5efe0 100%);
  border-bottom: 1rpx solid var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title-text {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 2rpx;
}

.chart-subtitle {
  font-size: 22rpx;
  color: var(--text-tertiary);
  font-weight: 400;
}

.chart-fallback-simple {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260rpx;
  background: #faf6ed;
}

.chart-fallback-simple .fallback-text {
  font-size: 26rpx;
  color: var(--text-tertiary);
}

@media (min-width: 768px) {
  .charts-tabs {
    gap: 24rpx;
  }

  .chart-tab {
    padding: 14rpx 28rpx;
  }

  .chart-tab-text {
    font-size: 26rpx;
  }
}
</style>
