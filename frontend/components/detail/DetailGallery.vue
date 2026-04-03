<template>
  <view>
    <!-- 图片素材 -->
    <view v-if="material.type === 'image'" class="material-wrapper">
      <image
        v-if="hasImage"
        class="material-image"
        :src="material.url"
        mode="widthFix"
        lazy-load="true"
        @error="$emit('image-error')"
      />
      <view v-else class="material-empty">
        <view class="material-empty-icon">🏛️</view>
        <text class="material-empty-title">后端未下发图片</text>
        <text class="material-empty-subtitle">{{ emptyStateText }}</text>
        <text v-if="material.assetVerification && !material.assetVerification.verified" class="material-empty-detail">
          校验结果：{{ material.assetVerification.reason || 'asset_name_mismatch' }}
        </text>
      </view>
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
  },
  computed: {
    hasImage() {
      return Boolean(String(this.material.url || '').trim());
    },
    emptyStateText() {
      if (this.material.assetVerification && this.material.assetVerification.verified === false) {
        return '图片已被后端拦截，请检查命名或映射规则';
      }
      return '当前素材暂未下发可用图片';
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

.material-empty {
  min-height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(180deg, #fffaf3 0%, #f7efe2 100%);
}

.material-empty-icon {
  font-size: 84rpx;
  margin-bottom: 20rpx;
}

.material-empty-title {
  display: block;
  font-size: 32rpx;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 12rpx;
}

.material-empty-subtitle,
.material-empty-detail {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 1.7;
}

.material-empty-detail {
  margin-top: 10rpx;
  color: var(--warning);
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
