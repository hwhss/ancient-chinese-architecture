<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <text class="header-title">素材详情</text>
    </view>

    <!-- 素材展示区域 -->
    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>

      <!-- 错误提示 -->
      <view v-else-if="error" class="error">
        <text>{{ error }}</text>
      </view>

      <!-- 图片素材 -->
      <view v-else-if="material.type === 'image'" class="material-wrapper">
        <image
          class="material-image"
          :src="material.url"
          mode="widthFix"
          @error="onImageError"
        />
        <view class="material-info">
          <text class="material-title">{{ materialTitle }}</text>
          <text class="material-source">来源：{{ material.source || '未知' }}</text>
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
          <text class="material-source">来源：{{ material.source || '未知' }}</text>
        </view>
      </view>

      <!-- 占位展示 -->
      <view v-else class="placeholder">
        <view class="placeholder-icon">🏯</view>
        <text class="placeholder-text">素材ID: {{ materialId }}</text>
        <text class="placeholder-sub">此处将展示古建筑的实景图或动画视频</text>
      </view>
    </view>
  </view>
</template>

<script>
// 素材ID到名称的映射
const materialNames = {
  'gugong_01': '太和殿',
  'gugong_02': '乾清宫',
  'gugong_03': '中和殿',
  'gugong_04': '保和殿',
  'gugong_05': '养心殿',
  'gugong_06': '御花园',
  'gugong_07': '午门',
  'gugong_08': '天安门',
};

export default {
  data() {
    return {
      materialId: '',
      material: {
        url: '',
        type: '',
        source: ''
      },
      loading: false,
      error: null,
      apiBaseUrl: 'http://localhost:3000'
    };
  },

  computed: {
    materialTitle() {
      return materialNames[this.materialId] || '古建筑素材';
    }
  },

  onLoad(options) {
    this.materialId = options.materialId || '';
    if (this.materialId) {
      this.loadMaterial();
    }
  },

  methods: {
    async loadMaterial() {
      this.loading = true;
      this.error = null;

      try {
        const response = await uni.request({
          url: `${this.apiBaseUrl}/api/material`,
          method: 'GET',
          data: { materialId: this.materialId }
        });

        const result = response.data;

        if (result.code === 200) {
          this.material = result.data;
        } else {
          // 使用占位数据
          this.setPlaceholderData();
        }
      } catch (error) {
        console.error('加载素材失败:', error);
        // 接口不通时使用占位数据
        this.setPlaceholderData();
      } finally {
        this.loading = false;
      }
    },

    setPlaceholderData() {
      // 模拟数据，实际项目中会从服务器获取
      const mockData = {
        'gugong_01': {
          url: 'https://picsum.photos/800/600?random=1',
          type: 'image',
          source: '故宫博物院官网'
        },
        'gugong_02': {
          url: 'https://picsum.photos/800/600?random=2',
          type: 'image',
          source: '故宫博物院官网'
        },
        'gugong_03': {
          url: 'https://picsum.photos/800/600?random=3',
          type: 'image',
          source: '故宫博物院官网'
        }
      };

      this.material = mockData[this.materialId] || {
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 100)}`,
        type: 'image',
        source: '示例图片'
      };
    },

    onImageError() {
      this.error = '图片加载失败';
    },

    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  padding: 40rpx 30rpx 30rpx;
}

.back-btn {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  border: none;
  margin-right: 20rpx;
}

.header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  margin-right: 100rpx;
}

.content {
  padding: 30rpx;
}

.loading, .error {
  text-align: center;
  padding: 100rpx 40rpx;
}

.error {
  color: #ff4d4f;
}

.material-wrapper {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
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
  padding: 30rpx;
}

.material-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.material-source {
  display: block;
  font-size: 26rpx;
  color: #666;
}

.placeholder {
  text-align: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 20rpx;
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.placeholder-sub {
  display: block;
  font-size: 26rpx;
  color: #999;
}
</style>
