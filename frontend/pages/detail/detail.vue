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
// 素材ID到名称的映射 - 20个代表性古建筑
const materialNames = {
  // 皇宫
  'gugong_01': '太和殿',
  'gugong_02': '乾清宫',
  'gugong_03': '中和殿',
  'gugong_04': '保和殿',
  'gugong_05': '养心殿',
  'gugong_06': '御花园',
  'gugong_07': '午门',
  'gugong_08': '天安门',
  'shenyang_01': '沈阳故宫大政殿',
  // 桥梁
  'zhaozhou_01': '赵州桥',
  'lugou_01': '卢沟桥',
  'guangji_01': '广济桥',
  // 园林
  'zhuozheng_01': '拙政园',
  'yiheyuan_01': '颐和园',
  // 城防
  'xian_01': '西安城墙',
  'nanjing_01': '南京城墙',
  // 民居
  'tulou_01': '福建土楼',
  'qiaojia_01': '乔家大院',
  'pingyao_01': '平遥古城',
  'lijiang_01': '丽江古城',
  // 楼阁
  'yueyang_01': '岳阳楼',
  'kongmiao_01': '曲阜孔庙',
  // 水利
  'dujiangyan_01': '都江堰',
  'kanerjing_01': '坎儿井',
};

export default {
  data() {
    return {
      materialId: '',
      materialName: '',
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
      return this.materialName || materialNames[this.materialId] || '古建筑素材';
    }
  },

  onLoad(options) {
    this.materialId = options.materialId || '';
    this.materialName = options.name ? decodeURIComponent(options.name) : '';
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
      // 模拟数据，为每个建筑ID生成对应的图片
      const randomNum = parseInt(this.materialId.replace(/\D/g, '')) || Math.floor(Math.random() * 100);
      this.material = {
        url: `https://picsum.photos/800/600?random=${randomNum}`,
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
