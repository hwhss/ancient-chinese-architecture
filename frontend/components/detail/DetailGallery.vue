<template>
  <view>
    <!-- 图片素材 -->
    <view v-if="material.type === 'image'" class="material-wrapper">
      <image
        class="material-image"
        :src="material.url"
        mode="widthFix"
        lazy-load="true"
        @error="$emit('image-error')"
      />
      <view class="material-info">
        <text class="material-title">{{ materialTitle }}</text>
        <text class="material-source">参考素材来源：{{ material.source || "未知" }}</text>
        <text v-if="materialNotice" class="material-notice">{{ materialNotice }}</text>
      </view>
    </view>

    <!-- 视频素材 -->
    <view v-else-if="material.type === 'video'" class="material-wrapper">
      <video
        class="material-video"
        :src="material.url"
        controls
        poster="/static/video-poster.png"
      />
      <view class="material-info">
        <text class="material-title">{{ materialTitle }}</text>
        <text class="material-source">参考素材来源：{{ material.source || "未知" }}</text>
        <text v-if="materialNotice" class="material-notice">{{ materialNotice }}</text>
      </view>
    </view>

    <!-- 占位展示 -->
    <view v-else class="placeholder-section">
      <view class="placeholder-icon">🏯</view>
      <text class="placeholder-text">素材ID: {{ materialId }}</text>
      <text class="placeholder-sub">暂无素材，已展示建筑文字详情</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "DetailGallery",
  props: {
    material: {
      type: Object,
      default: () => ({})
    },
    materialTitle: {
      type: String,
      default: ""
    },
    materialNotice: {
      type: String,
      default: ""
    },
    materialId: {
      type: String,
      default: ""
    }
  }
}
</script>

<style scoped>
.material-wrapper {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.12),
    0 2rpx 8rpx rgba(139, 69, 19, 0.06);
  border: 2rpx solid var(--bg-tertiary);
  margin-bottom: 20rpx;
}

.material-image {
  width: 100%;
  display: block;
}

.material-video {
  width: 100%;
  height: 400rpx;
}

.material-info {
  padding: 32rpx;
}

.material-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
}

.material-source {
  display: block;
  font-size: 26rpx;
  color: var(--text-tertiary);
  margin-bottom: 12rpx;
}

.material-notice {
  display: block;
  font-size: 24rpx;
  color: var(--error);
  padding: 16rpx 20rpx;
  background: rgba(184, 84, 80, 0.08);
  border-radius: 12rpx;
  border-left: 4rpx solid var(--error);
}

.placeholder-section {
  text-align: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid var(--bg-tertiary);
  box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.08);
  margin-bottom: 20rpx;
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(139, 69, 19, 0.15));
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: var(--text-primary);
  margin-bottom: 20rpx;
  font-weight: 500;
}

.placeholder-sub {
  display: block;
  font-size: 26rpx;
  color: #8b735c;
}
</style>
