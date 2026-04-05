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
        <view class="chart-tab-icon" v-if="tab.icon">
          <TraditionalIcon :name="tab.icon" size="28" :color="activeChartTab === tab.key ? '#fff' : 'var(--secondary)'" />
        </view>
        <text class="chart-tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <!-- 图表容器 -->
    <view class="chart-display-area">
      <!-- 分类分布饼图 -->
      <view v-if="activeChartTab === 'category'" class="chart-wrapper">
        <view class="chart-title-bar">
          <view class="chart-title-left">
            <TraditionalIcon name="palace" size="32" color="var(--primary)" />
            <text class="chart-title-text ink-pressed">建筑类型分布</text>
          </view>
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
          <view class="chart-title-left">
            <TraditionalIcon name="map" size="32" color="var(--primary)" />
            <text class="chart-title-text ink-pressed">地理位置分布</text>
          </view>
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
import TraditionalIcon from "../shared/TraditionalIcon.vue";

export default {
  components: { 
    VisualChart,
    TraditionalIcon
  },
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
  border-radius: 40rpx;
  border: 2rpx solid #e8dec3;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.chart-tab:hover:not(.active) {
  background: linear-gradient(135deg, #f9f5e8 0%, #f2ead3 100%);
  border-color: #725a3d;
  transform: translateY(-1rpx) scale(1.02);
  box-shadow: 0 4rpx 12rpx rgba(114, 90, 61, 0.15);
}

.chart-tab:active:not(.active) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2rpx 6rpx rgba(114, 90, 61, 0.1);
}

.chart-tab.active {
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  border-color: #7a1d1d;
  box-shadow: 
    0 6rpx 18rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transform: scale(1);
}

.chart-tab.active:hover {
  background: linear-gradient(135deg, #b73c3c 0%, #8a2626 100%);
  transform: translateY(-1rpx) scale(1.01);
  box-shadow: 
    0 8rpx 24rpx rgba(166, 49, 49, 0.45),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
}

.chart-tab.active:active {
  transform: translateY(0) scale(0.99);
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
}

.chart-tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
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

.chart-title-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.chart-title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
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
