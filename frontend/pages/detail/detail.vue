<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <text class="header-title">古建筑详情</text>
      <view class="header-actions">
        <view
          class="favorite-btn"
          :class="{ 'active': isFavorite }"
          @click="toggleFavorite"
        >
          <text class="favorite-icon">{{ isFavorite ? '★' : '☆' }}</text>
          <text class="favorite-label">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
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
      <view v-else class="placeholder-section">
        <view class="placeholder-icon">🏯</view>
        <text class="placeholder-text">素材ID: {{ materialId }}</text>
        <text class="placeholder-sub">暂无素材，已展示建筑文字详情</text>
      </view>

      <view v-if="!loading && !error" class="detail-card">
        <view class="detail-header">
          <text class="detail-title">建筑详情</text>
          <view
            class="detail-favorite-btn"
            :class="{ 'active': isFavorite }"
            @click="toggleFavorite"
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
      favorites: [],
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

    isFavorite() {
      return this.favorites.some(f => f.id === this.materialId);
    },
  },

  onLoad(options) {
    this.materialId = options.materialId || "";
    this.materialName = options.name ? decodeURIComponent(options.name) : "";

    // 加载收藏列表
    this.loadFavorites();

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

    // ========== 收藏功能 ==========

    // 加载收藏列表
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('FAVORITE_BUILDINGS');
        if (favorites && Array.isArray(favorites)) {
          this.favorites = favorites;
        }
      } catch (e) {
        console.warn('加载收藏失败:', e);
      }
    },

    // 保存收藏列表
    saveFavorites() {
      try {
        uni.setStorageSync('FAVORITE_BUILDINGS', this.favorites);
      } catch (e) {
        console.warn('保存收藏失败:', e);
      }
    },

    // 切换收藏状态
    toggleFavorite() {
      const index = this.favorites.findIndex(f => f.id === this.materialId);

      if (index > -1) {
        // 取消收藏
        this.favorites.splice(index, 1);
        uni.showToast({
          title: '已取消收藏',
          icon: 'none',
          duration: 1500
        });
      } else {
        // 添加收藏
        this.favorites.push({
          id: this.materialId,
          name: this.materialTitle,
          image: this.material.url || '',
          location: this.building.location || '',
          dynasty: '',
          description: this.building.description || '',
          tags: this.building.tags || [],
          category: this.building.category || '',
          addedAt: Date.now()
        });
        uni.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500
        });
      }

      this.saveFavorites();
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
  justify-content: space-between;
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.3);
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.96);
}

.header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.header-actions {
  display: flex;
  align-items: center;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-btn.active {
  background: rgba(200, 37, 6, 0.2);
  border-color: rgba(255, 200, 100, 0.6);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.favorite-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-icon {
  color: #ffd700;
  filter: drop-shadow(0 2rpx 4rpx rgba(255, 215, 0, 0.4));
}

.favorite-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-label {
  color: #ffd700;
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
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.12),
    0 2rpx 8rpx rgba(139, 69, 19, 0.06);
  border: 2rpx solid #e8dcc8;
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
  color: #3c2a1d;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
}

.material-source {
  display: block;
  font-size: 26rpx;
  color: #8b7355;
  margin-bottom: 12rpx;
}

.material-notice {
  display: block;
  font-size: 24rpx;
  color: #b85450;
  padding: 16rpx 20rpx;
  background: rgba(184, 84, 80, 0.08);
  border-radius: 12rpx;
  border-left: 4rpx solid #b85450;
}

.detail-card {
  margin-top: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid #e8dcc8;
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
  color: #3c2a1d;
  font-weight: bold;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
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
  border-color: #e8b860;
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
  color: #8b7355;
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
  border-bottom: 1rpx solid #f5efe6;
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
  color: #3c2a1d;
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
  background: linear-gradient(145deg, #f8f4e9 0%, #f0e9d8 100%);
  font-size: 24rpx;
  color: #6b5643;
  font-weight: 500;
  transition: all 0.25s ease;
}

.tag-item:hover {
  background: linear-gradient(145deg, #f5e6c8 0%, #f0dcc0 100%);
  border-color: #e8b860;
}

.action-row {
  margin-top: 32rpx;
}

.action-btn {
  width: 100%;
  border: none;
  background: linear-gradient(145deg, #c41e3a 0%, #8b0000 100%);
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

.placeholder-section {
  text-align: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid #e8dcc8;
  box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.08);
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(139, 69, 19, 0.15));
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: #3c2a1d;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.placeholder-sub {
  display: block;
  font-size: 26rpx;
  color: #8b735c;
}
</style>
