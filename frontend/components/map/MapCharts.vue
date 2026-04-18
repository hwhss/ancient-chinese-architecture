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
  padding: var(--space-6) var(--space-5);
  margin: var(--space-5);
  background: linear-gradient(
    135deg,
    rgba(249, 245, 232, 0.95) 0%,
    rgba(242, 234, 211, 0.92) 100%
  );
  border-radius: var(--radius-xl);
  border: 2rpx solid var(--border);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: visible;
}

.charts-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--secondary) 20%,
    var(--primary) 50%,
    var(--secondary) 80%,
    transparent 100%
  );
  opacity: 0.25;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
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
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(249, 245, 232, 0.95) 100%
  );
  border-radius: var(--radius-full);
  border: 2rpx solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.chart-tab:hover:not(.active) {
  background: linear-gradient(
    135deg,
    var(--bg-card) 0%,
    var(--bg-primary) 100%
  );
  border-color: var(--secondary);
  transform: translateY(-2rpx) scale(1.02);
  box-shadow: var(--shadow-md);
}

.chart-tab:active:not(.active) {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-sm);
}

.chart-tab.active {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  border-color: var(--primary-dark);
  box-shadow:
    var(--shadow-primary),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transform: scale(1);
}

.chart-tab.active:hover {
  background: linear-gradient(
    135deg,
    var(--primary-light) 0%,
    #8a2626 100%
  );
  transform: translateY(-2rpx) scale(1.01);
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
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    var(--bg-card) 100%
  );
  border-radius: var(--radius-lg);
  border: 1rpx solid var(--border);
  overflow: hidden;
}

.chart-wrapper {
  padding: 0;
}

.chart-title-bar {
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(
    135deg,
    rgba(250, 246, 237, 0.98) 0%,
    rgba(245, 239, 224, 0.95) 100%
  );
  border-bottom: 1rpx solid var(--border-light);
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
