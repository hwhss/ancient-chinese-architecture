<template>
  <view class="tab-content">
    <!-- 基础信息 Tab -->
    <view v-if="activeTab === 'basic'" class="detail-card">
      <view class="detail-header">
        <text class="detail-title">建筑详情</text>
        <view
          class="detail-favorite-btn tap-feedback"
          :class="{ 'active': isFavorite }"
          @click="$emit('toggle-favorite')"
        >
          <text class="detail-favorite-icon">{{ isFavorite ? '★' : '☆' }}</text>
          <text class="detail-favorite-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
      <view class="detail-row">
        <text class="detail-label">名称</text>
        <text class="detail-value">{{ materialTitle }}</text>
      </view>
      <view class="detail-row">
        <text class="detail-label">分类</text>
        <text class="detail-value">{{ categoryText }}</text>
      </view>
      <view class="detail-row">
        <text class="detail-label">位置</text>
        <text class="detail-value">{{ building.location || "暂无" }}</text>
      </view>
      <view class="detail-row detail-col">
        <text class="detail-label">简介</text>
        <text class="detail-value wrap">{{ building.description || "暂无介绍" }}</text>
      </view>
      <view v-if="building.tags && building.tags.length" class="tag-list">
        <text v-for="tag in building.tags" :key="tag" class="tag-item">{{ tag }}</text>
      </view>

      <view class="action-row">
        <button class="action-btn ink-ripple" @click="$emit('go-to-viewer')">进入3D导览</button>
      </view>
    </view>

    <!-- 结构解析 Tab -->
    <view v-if="activeTab === 'infographic' && visualizationData.infographic" class="detail-card">
      <view class="detail-header">
        <text class="detail-title">结构解析</text>
      </view>
      <InfoGraphic
        :nodes="visualizationData.infographic.nodes"
        :edges="visualizationData.infographic.edges"
        :layout="visualizationData.infographic.layout"
        @node-click="$emit('node-click', $event)"
      />
    </view>

    <!-- 动态演示 Tab -->
    <view v-if="activeTab === 'animation' && visualizationData.animationId" class="detail-card">
      <view class="detail-header">
        <text class="detail-title">动态演示</text>
      </view>
      <LottieAnimation
        :animation-id="visualizationData.animationId"
        :loop="true"
        :autoplay="true"
      />
    </view>

    <!-- 数据概览 Tab -->
    <view v-if="activeTab === 'chart'" class="detail-card">
      <view class="detail-header">
        <text class="detail-title">建筑特征雷达图</text>
      </view>

      <!-- #ifdef H5 -->
      <view class="chart-wrapper">
        <VisualChart
          type="radar"
          :data="radarChartData"
          :height="400"
          @click="$emit('chart-click', $event)"
        />
      </view>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <view class="chart-fallback">
        <view class="fallback-content">
          <text class="fallback-icon">📊</text>
          <text class="fallback-text">雷达图请在 H5 环境下查看</text>
          <view class="feature-list">
            <view v-for="(item, index) in radarFeatures" :key="index" class="feature-item">
              <text class="feature-name">{{ item.name }}</text>
              <view class="feature-bar">
                <view class="feature-progress" :style="{ width: item.value + '%' }"></view>
              </view>
              <text class="feature-value">{{ item.value }}</text>
            </view>
          </view>
        </view>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script>
import InfoGraphic from "../../components/InfoGraphic.vue";
import LottieAnimation from "../../components/LottieAnimation.vue";
import VisualChart from "../../components/VisualChart.vue";

export default {
  name: "DetailContent",
  components: {
    InfoGraphic,
    LottieAnimation,
    VisualChart
  },
  props: {
    activeTab: {
      type: String,
      default: "basic"
    },
    building: {
      type: Object,
      default: () => ({})
    },
    materialTitle: {
      type: String,
      default: ""
    },
    categoryText: {
      type: String,
      default: ""
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    visualizationData: {
      type: Object,
      default: () => ({})
    },
    radarChartData: {
      type: Object,
      default: () => ({})
    },
    radarFeatures: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.tab-content {
  margin-top: 20rpx;
}

.detail-card {
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid var(--bg-tertiary);
  padding: 32rpx;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.1),
    0 2rpx 8rpx rgba(139, 69, 19, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0e6d8;
}

.detail-title {
  font-size: 36rpx;
  color: var(--text-primary);
  font-weight: bold;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
}

/* 图表区域样式 */
.chart-wrapper {
  padding: 20rpx;
  background: #faf6ed;
  border-radius: 16rpx;
  border: 1rpx solid var(--bg-tertiary);
}

.chart-fallback {
  padding: 40rpx;
  background: #faf6ed;
  border-radius: 16rpx;
  border: 1rpx solid var(--bg-tertiary);
}

.fallback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.fallback-icon {
  font-size: 64rpx;
}

.fallback-text {
  font-size: 28rpx;
  color: var(--text-tertiary);
}

.feature-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.feature-name {
  width: 140rpx;
  font-size: 26rpx;
  color: var(--text-primary);
  flex-shrink: 0;
}

.feature-bar {
  flex: 1;
  height: 16rpx;
  background: var(--bg-tertiary);
  border-radius: 8rpx;
  overflow: hidden;
}

.feature-progress {
  height: 100%;
  background: linear-gradient(90deg, #c82506 0%, #e84a38 100%);
  border-radius: 8rpx;
  transition: width 0.8s ease;
}

.feature-value {
  width: 60rpx;
  font-size: 24rpx;
  color: #c82506;
  font-weight: bold;
  text-align: right;
}

.detail-favorite-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 28rpx;
  background: linear-gradient(145deg, #fff 0%, #faf6ed 100%);
  border: 2rpx solid #e0d0c0;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-favorite-btn.active {
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 100%);
  border-color: var(--warning);
  box-shadow: 0 6rpx 18rpx rgba(232, 184, 96, 0.25);
}

.detail-favorite-btn:active {
  transform: scale(0.96);
}

.detail-favorite-icon {
  font-size: 32rpx;
  color: #d0c8c0;
  transition: all 0.3s ease;
}

.detail-favorite-btn.active .detail-favorite-icon {
  color: #c82506;
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 37, 6, 0.3));
  animation: favoritePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.detail-favorite-text {
  font-size: 26rpx;
  color: var(--text-tertiary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.detail-favorite-btn.active .detail-favorite-text {
  color: #c82506;
  font-weight: 600;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(139, 69, 19, 0.1);
  position: relative;
}

.detail-row::after {
  content: '';
  position: absolute;
  bottom: -1rpx;
  left: 0;
  right: 0;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 69, 19, 0.3) 20%,
    rgba(139, 69, 19, 0.5) 50%,
    rgba(139, 69, 19, 0.3) 80%,
    transparent 100%
  );
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-row.detail-col {
  display: block;
}

.detail-label {
  width: 120rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  color: #8b735c;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: var(--text-primary);
  line-height: 1.7;
}

.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0e6d8;
}

.tag-item {
  padding: 10rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e0d4c0;
  background: linear-gradient(145deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  font-size: 24rpx;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.25s ease;
}

.tag-item:hover {
  background: linear-gradient(145deg, #f5e6c8 0%, #f0dcc0 100%);
  border-color: var(--warning);
}

.action-row {
  margin-top: 32rpx;
}

.action-btn {
  width: 100%;
  border: none;
  background: linear-gradient(145deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  padding: 24rpx 0;
  font-weight: 600;
  letter-spacing: 6rpx;
  box-shadow:
    0 8rpx 24rpx rgba(196, 30, 58, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 12rpx 32rpx rgba(196, 30, 58, 0.45);
}
</style>
