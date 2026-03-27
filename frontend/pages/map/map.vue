<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-decoration top"></view>
      <text class="title">🏯 中华古建筑名录</text>
      <text class="subtitle">精选十七处代表性古建筑</text>
      <view class="header-decoration bottom"></view>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-tabs" scroll-x>
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="tab"
        :class="{ active: currentCategory === cat.key }"
        @click="selectCategory(cat.key)"
      >
        {{ cat.name }}
      </view>
    </scroll-view>

    <!-- 建筑列表 -->
    <scroll-view class="building-list" scroll-y>
      <view v-if="loading" class="state-box">
        <text class="state-text">正在加载古建筑名录...</text>
      </view>
      <view v-else-if="error" class="state-box">
        <text class="state-text error-text">{{ error }}</text>
      </view>
      <view v-else-if="filteredBuildings.length === 0" class="state-box">
        <text class="state-text">暂无符合条件的数据</text>
      </view>
      <view
        v-for="building in filteredBuildings"
        :key="building.id"
        class="building-card"
        @click="goToDetail(building)"
      >
        <image
          class="building-image"
          :src="building.image"
          mode="aspectFill"
          lazy-load="true"
        />
        <view class="building-info">
          <text class="building-name">{{ building.name }}</text>
          <text class="building-location">📍 {{ building.location }}</text>
          <text class="building-desc">{{ building.description }}</text>
          <view class="building-tags">
            <text v-for="tag in building.tags" :key="tag" class="tag">{{
              tag
            }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @click="goToChat">
        💬 返回AI问答
      </button>
    </view>
  </view>
</template>

<script>
import { getBuildings } from "../../services/api";

// 分类配置 - 静态常量
const categories = [
  { key: "all", name: "全部" },
  { key: "palace", name: "🏛️ 皇宫" },
  { key: "bridge", name: "🌉 桥梁" },
  { key: "garden", name: "🌿 园林" },
  { key: "defense", name: "🏰 城防" },
  { key: "residence", name: "🏠 民居" },
  { key: "tower", name: "🏯 楼阁" },
  { key: "water", name: "💧 水利" },
];

export default {
  data() {
    return {
      categories,
      currentCategory: "all",
      buildings: [],
      loading: false,
      error: "",
    };
  },

  onLoad() {
    this.loadBuildings();
  },

  computed: {
    filteredBuildings() {
      if (this.currentCategory === "all") {
        return this.buildings;
      }
      return this.buildings.filter((b) => b.category === this.currentCategory);
    },
  },

  methods: {
    selectCategory(key) {
      this.currentCategory = key;
    },

    async loadBuildings() {
      this.loading = true;
      this.error = "";

      try {
        const list = await getBuildings();
        this.buildings = Array.isArray(list) ? list : [];
      } catch (error) {
        console.error("加载古建筑名录失败:", error);
        this.error = error.message || "网络异常，暂时无法加载数据";
        this.buildings = [];
      } finally {
        this.loading = false;
      }
    },

    goToDetail(building) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${building.id}&name=${encodeURIComponent(building.name)}`,
      });
    },

    goToChat() {
      uni.navigateTo({
        url: "/pages/index/index",
      });
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 100%);
}

.header {
  background: #8b4513;
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
}

.header-decoration {
  height: 2rpx;
  width: 50%;
  margin: 12rpx auto;
  background: rgba(255, 255, 255, 0.3);
}

.header-decoration.top {
  margin-top: 0;
  margin-bottom: 16rpx;
}

.header-decoration.bottom {
  margin-bottom: 0;
  margin-top: 16rpx;
}

.title {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.category-tabs {
  background: #fff;
  padding: 20rpx;
  white-space: nowrap;
  border-bottom: 1rpx solid #e8dcc8;
}

.tab {
  display: inline-block;
  padding: 16rpx 32rpx;
  margin-right: 16rpx;
  background: #f8f4e9;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #6b5643;
  transition: all 0.3s;
  transform: translateZ(0);
  border: 1rpx solid transparent;
}

.tab.active {
  background: #8b4513;
  color: #fff;
  border-color: #8b4513;
}

.building-list {
  flex: 1;
  padding: 20rpx;
}

.state-box {
  background: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e8dcc8;
  padding: 40rpx 24rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.state-text {
  font-size: 28rpx;
  color: #6b5643;
}

.error-text {
  color: #b85450;
}

.building-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.12);
  transform: translateZ(0);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1rpx solid #e8dcc8;
}

.building-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.15);
}

.building-image {
  width: 100%;
  height: 300rpx;
}

.building-info {
  padding: 30rpx;
}

.building-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #3c2a1d;
  margin-bottom: 12rpx;
}

.building-location {
  display: block;
  font-size: 26rpx;
  color: #8b4513;
  margin-bottom: 16rpx;
}

.building-desc {
  display: block;
  font-size: 28rpx;
  color: #6b5643;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.building-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  padding: 8rpx 20rpx;
  background: #f8f4e9;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #8b4513;
  margin-right: 16rpx;
  margin-bottom: 10rpx;
  border: 1rpx solid #e8dcc8;
}

.bottom-actions {
  background: #fff;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e8dcc8;
  display: flex;
  justify-content: center;
}

.action-btn {
  width: 300rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #8b4513;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  transform: translateZ(0);
  transition: all 0.2s;
}

.action-btn.secondary {
  background: #fff;
  color: #8b4513;
  border: 2rpx solid #8b4513;
}

.action-btn:active {
  transform: scale(0.96);
}
</style>
