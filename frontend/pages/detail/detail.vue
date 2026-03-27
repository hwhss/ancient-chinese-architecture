<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <text class="header-title">古建筑详情</text>
      <view class="placeholder"></view>
    </view>

    <!-- 素材展示区域 -->
    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading" class="loading">
        <text>正在加载...</text>
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
          lazy-load="true"
          @error="onImageError"
        />
        <view class="material-info">
          <text class="material-title">{{ materialTitle }}</text>
          <text class="material-source"
            >参考素材来源：{{ material.source || "未知" }}</text
          >
          <text v-if="materialNotice" class="material-notice">{{
            materialNotice
          }}</text>
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
          <text class="material-source"
            >参考素材来源：{{ material.source || "未知" }}</text
          >
          <text v-if="materialNotice" class="material-notice">{{
            materialNotice
          }}</text>
        </view>
      </view>

      <!-- 占位展示 -->
      <view v-else class="placeholder">
        <view class="placeholder-icon">🏯</view>
        <text class="placeholder-text">素材ID: {{ materialId }}</text>
        <text class="placeholder-sub">暂无素材，已展示建筑文字详情</text>
      </view>

      <view v-if="!loading && !error" class="detail-card">
        <text class="detail-title">建筑详情</text>
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
          <text class="detail-value wrap">{{
            building.description || "暂无介绍"
          }}</text>
        </view>
        <view v-if="building.tags && building.tags.length" class="tag-list">
          <text v-for="tag in building.tags" :key="tag" class="tag-item">{{
            tag
          }}</text>
        </view>

        <view class="action-row">
          <button class="action-btn" @click="goToViewer">进入3D导览</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBuildingById, getMaterialById } from "../../services/api";

// 素材ID到名称的映射 - 静态常量
const MATERIAL_NAMES = {
  // 皇宫
  gugong_01: "太和殿",
  gugong_02: "乾清宫",
  gugong_03: "中和殿",
  gugong_04: "保和殿",
  gugong_05: "养心殿",
  gugong_06: "御花园",
  gugong_07: "午门",
  gugong_08: "天安门",
  shenyang_01: "沈阳故宫大政殿",
  // 桥梁
  zhaozhou_01: "赵州桥",
  lugou_01: "卢沟桥",
  guangji_01: "广济桥",
  // 园林
  zhuozheng_01: "拙政园",
  yiheyuan_01: "颐和园",
  // 城防
  xian_01: "西安城墙",
  nanjing_01: "南京城墙",
  // 民居
  tulou_01: "福建土楼",
  qiaojia_01: "乔家大院",
  pingyao_01: "平遥古城",
  lijiang_01: "丽江古城",
  // 楼阁
  yueyang_01: "岳阳楼",
  kongmiao_01: "曲阜孔庙",
  // 水利
  dujiangyan_01: "都江堰",
  kanerjing_01: "坎儿井",
};

export default {
  data() {
    return {
      materialId: "",
      materialName: "",
      building: {
        id: "",
        name: "",
        category: "",
        location: "",
        description: "",
        tags: [],
      },
      material: {
        url: "",
        type: "",
        source: "",
      },
      materialNotice: "",
      loading: false,
      error: null,
    };
  },

  computed: {
    materialTitle() {
      return (
        this.materialName ||
        this.building.name ||
        MATERIAL_NAMES[this.materialId] ||
        "古建筑素材"
      );
    },

    categoryText() {
      const map = {
        palace: "皇宫",
        bridge: "桥梁",
        garden: "园林",
        defense: "城防",
        residence: "民居",
        tower: "楼阁",
        water: "水利",
      };
      return map[this.building.category] || "未分类";
    },
  },

  onLoad(options) {
    this.materialId = options.materialId || "";
    this.materialName = options.name ? decodeURIComponent(options.name) : "";
    if (this.materialId) {
      this.loadDetailData();
    } else {
      this.error = "缺少素材ID";
    }
  },

  methods: {
    async loadDetailData() {
      this.loading = true;
      this.error = null;
      this.materialNotice = "";

      await Promise.allSettled([this.loadBuilding(), this.loadMaterial()]);

      if (!this.building || !this.building.id) {
        this.error = "未找到建筑详情";
      }

      this.loading = false;
    },

    async loadBuilding() {
      try {
        this.building = await getBuildingById(this.materialId);
      } catch (error) {
        console.error("加载建筑详情失败:", error);
        this.error = error.message || "建筑详情加载失败";
      }
    },

    async loadMaterial() {
      try {
        this.material = await getMaterialById(this.materialId);
      } catch (error) {
        console.error("加载素材失败:", error);
        this.setPlaceholderData();
        this.materialNotice = "当前素材暂不可用，已展示示例图";
      }
    },

    setPlaceholderData() {
      // 模拟数据，为每个建筑ID生成对应的图片
      const randomNum =
        parseInt(this.materialId.replace(/\D/g, "")) ||
        Math.floor(Math.random() * 100);
      this.material = {
        url: `https://picsum.photos/800/600?random=${randomNum}`,
        type: "image",
        source: "示例图片",
      };
    },

    onImageError() {
      this.error = "图片加载失败";
    },

    goBack() {
      uni.navigateBack();
    },

    goToViewer() {
      const name = encodeURIComponent(this.materialTitle || "");
      uni.navigateTo({
        url: `/pages/viewer/viewer?materialId=${this.materialId}&name=${name}`,
      });
    },
  },
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f4e9;
}

.header {
  display: flex;
  align-items: center;
  background: #8b4513;
  padding: 30rpx 30rpx 40rpx;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  border: none;
  margin-right: 20rpx;
  transform: translateZ(0);
  transition: all 0.2s;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.95);
}

.header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  margin-right: 120rpx;
}

.placeholder {
  width: 100rpx;
}

.content {
  padding: 30rpx;
}

.loading,
.error {
  text-align: center;
  padding: 100rpx 40rpx;
  font-size: 32rpx;
  color: #6b5643;
}

.error {
  color: #b85450;
}

.material-wrapper {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.12);
  border: 1rpx solid #e8dcc8;
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
  color: #3c2a1d;
  margin-bottom: 16rpx;
}

.material-source {
  display: block;
  font-size: 26rpx;
  color: #6b5643;
}

.material-notice {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #b85450;
}

.detail-card {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e8dcc8;
  padding: 24rpx;
}

.detail-title {
  display: block;
  font-size: 32rpx;
  color: #3c2a1d;
  font-weight: bold;
  margin-bottom: 18rpx;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.detail-row.detail-col {
  display: block;
}

.detail-label {
  width: 120rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #8b735c;
}

.detail-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #3c2a1d;
  line-height: 1.6;
}

.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 12rpx;
}

.tag-item {
  padding: 6rpx 14rpx;
  border-radius: 20rpx;
  border: 1rpx solid #d9c8b0;
  background: #f8f4e9;
  font-size: 22rpx;
  color: #6b5643;
}

.action-row {
  margin-top: 20rpx;
}

.action-btn {
  width: 100%;
  border: 1rpx solid #8b4513;
  background: #8b4513;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  padding: 14rpx 0;
}

.action-btn:active {
  opacity: 0.92;
}

.material-location {
  display: block;
  font-size: 26rpx;
  color: #8b4513;
  margin-bottom: 10rpx;
}

.material-desc {
  display: block;
  font-size: 26rpx;
  color: #6b5643;
  line-height: 1.6;
  margin-bottom: 14rpx;
}

.placeholder {
  text-align: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e8dcc8;
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: #3c2a1d;
  margin-bottom: 20rpx;
}

.placeholder-sub {
  display: block;
  font-size: 26rpx;
  color: #8b735c;
}
</style>
