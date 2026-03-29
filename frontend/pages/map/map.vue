<template>
  <view class="container">
    <!-- 底层：径向渐变打底 -->
    <view class="radial-gradient-bg"></view>
    <!-- 顶层：动态祥云 -->
    <view class="cloud-background"></view>
    
    <!-- 主内容区域 -->
    <view class="main-content" :class="{ 'map-mode': currentView === 'map' }">
      <!-- 顶部标题 -->
      <view class="header">
        <view class="header-decoration top"></view>
        <view class="header-content">
          <text class="title">🏯 中华古建筑名录</text>
          <text class="subtitle">精选十七处代表性古建筑</text>
        </view>
        <!-- 视图切换按钮 -->
        <view class="view-toggle">
          <view 
            class="toggle-btn" 
            :class="{ active: currentView === 'list' }"
            @click="switchView('list')"
          >
            <text class="toggle-icon">📋</text>
            <text class="toggle-text">列表</text>
          </view>
          <view 
            class="toggle-btn" 
            :class="{ active: currentView === 'map' }"
            @click="switchView('map')"
          >
            <text class="toggle-icon">🗺️</text>
            <text class="toggle-text">地图</text>
          </view>
        </view>
        <view class="header-decoration bottom"></view>
      </view>

      <!-- 筛选区域 - 优化版 -->
      <view class="filter-area">
        <!-- 搜索框 - 移到顶部更醒目 -->
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            v-model="searchKeyword" 
            placeholder="搜索古建名称或标签..." 
            placeholder-class="search-placeholder"
          />
          <view class="search-clear" v-if="searchKeyword" @click="searchKeyword = ''">
            <text>×</text>
          </view>
        </view>
        
        <!-- 筛选标签栏 - 分类和朝代合并 -->
        <view class="filter-tabs-container">
          <scroll-view class="filter-tabs" scroll-x>
            <!-- 分类筛选 -->
            <view class="filter-group">
              <text class="filter-label">分类</text>
              <view
                v-for="cat in categories"
                :key="cat.key"
                class="filter-tab"
                :class="{ active: currentCategory === cat.key }"
                @click="selectCategory(cat.key)"
              >
                {{ cat.name }}
              </view>
            </view>
            
            <!-- 分隔线 -->
            <view class="filter-divider"></view>
            
            <!-- 朝代筛选 -->
            <view class="filter-group">
              <text class="filter-label">朝代</text>
              <view
                v-for="dynasty in dynasties"
                :key="dynasty.key"
                class="filter-tab"
                :class="{ active: currentDynasty === dynasty.key }"
                @click="selectDynasty(dynasty.key)"
              >
                {{ dynasty.name }}
              </view>
            </view>
          </scroll-view>
          
          <!-- 排序按钮 - 移到右侧 -->
          <view class="sort-btn" @click="toggleSort">
            <text class="sort-icon">{{ sortOrder === 'name' ? '🔤' : '�' }}</text>
          </view>
        </view>
        
        <!-- 已选筛选标签展示 -->
        <view class="active-filters" v-if="currentCategory !== 'all' || currentDynasty !== 'all' || searchKeyword">
          <text class="filter-result-text">筛选结果：{{ filteredBuildings.length }} 处古建</text>
          <view class="clear-filters" @click="clearFilters" v-if="currentCategory !== 'all' || currentDynasty !== 'all'">
            <text>清除筛选</text>
          </view>
        </view>
      </view>

      <!-- 建筑列表视图 -->
      <scroll-view 
        v-show="currentView === 'list'" 
        scroll-y 
        class="scroll-view" 
        @scroll="onScroll" 
        scroll-with-animation 
        :scroll-top="scrollTop"
      >
        <view class="building-grid">
          <view v-if="loading" class="state-box">
            <text class="state-text">正在加载古建筑名录...</text>
          </view>
          <view v-else-if="error" class="state-box">
            <text class="state-text error-text">{{ error }}</text>
          </view>
          <view v-else-if="filteredBuildings.length === 0" class="state-box">
            <text class="empty-icon">🏛️</text>
            <text class="state-text">没有找到对应的古建哦，试试换个关键词吧</text>
          </view>
          <view
            v-for="(building, index) in filteredBuildings"
            :key="building.id"
            class="building-card preview-card"
            :class="{ 'visible': visibleCards[index] }"
            @click="goToDetail(building)"
          >
            <view class="card-image" :style="{ backgroundImage: 'url(' + building.image + ')' }"></view>
            <view class="card-info">
              <text class="card-name">{{ building.name }}</text>
              <text class="card-desc">{{ building.description }}</text>
              <view class="card-tags">
                <text v-for="tag in building.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="bottom-actions">
          <button class="action-btn secondary" @click="goToChat">
            💬 返回AI问答
          </button>
        </view>
      </scroll-view>
      
      <!-- 地图视图 -->
      <view v-show="currentView === 'map'" class="map-view">
        <view v-if="loading" class="state-box">
          <text class="state-text">正在加载古建筑名录...</text>
        </view>
        <view v-else-if="error" class="state-box">
          <text class="state-text error-text">{{ error }}</text>
        </view>
        <view v-else-if="filteredBuildings.length === 0" class="state-box">
          <text class="empty-icon">🏛️</text>
          <text class="state-text">没有找到对应的古建哦，试试换个关键词吧</text>
        </view>
        <view v-else class="map-container">
          <!-- 可交互地图容器 -->
          <view id="tencentMap" class="tencent-map"></view>
          
          <!-- 地图说明 -->
          <view class="map-legend">
            <text class="legend-title">📍 点击标记查看详情</text>
            <text class="legend-desc">当前显示 {{ filteredBuildings.length }} 处古建筑 · 鼠标滚轮缩放 · 拖拽移动</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 回到顶部按钮（仅在列表模式下显示） -->
    <view 
      v-if="currentView === 'list'"
      class="back-to-top" 
      :class="{ 'visible': showBackToTop }"
      @click="scrollToTop"
    >
      <text class="back-to-top-text">↑</text>
      <text class="back-to-top-seal">古建</text>
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

// 朝代配置
const dynasties = [
  { key: "all", name: "全部" },
  { key: "sui", name: "隋代" },
  { key: "tang", name: "唐代" },
  { key: "song", name: "宋代" },
  { key: "ming", name: "明代" },
  { key: "qing", name: "清代" },
];

// 朝代映射
const dynastyMap = {
  "隋代": "sui",
  "唐代": "tang",
  "宋代": "song",
  "明代": "ming",
  "清代": "qing"
};

export default {
  data() {
    return {
      categories,
      dynasties,
      currentCategory: "all",
      currentDynasty: "all",
      searchKeyword: "",
      sortOrder: "name",
      currentView: "list",
      buildings: [],
      loading: false,
      error: "",
      scrollTop: 0,
      showBackToTop: false,
      visibleCards: [],
      mapCenter: {
        lat: 35.8617,
        lng: 104.1954
      },
      mapZoom: 4,
      mapMarkers: [],
      mapInstance: null,
      markersInstance: []
    };
  },

  onLoad(options) {
    if (options.category) {
      this.currentCategory = options.category;
    }
    this.loadBuildings();
  },
  
  onUnload() {
    // 页面卸载时清理地图
    if (this.mapInstance) {
      this.mapInstance = null;
    }
  },

  computed: {
    filteredBuildings() {
      let result = [...this.buildings];
      
      // 分类筛选
      if (this.currentCategory !== "all") {
        result = result.filter((b) => b.category === this.currentCategory);
      }
      
      // 朝代筛选
      if (this.currentDynasty !== "all") {
        result = result.filter((b) => {
          const dynastyTag = b.tags.find(tag => dynastyMap[tag]);
          return dynastyTag && dynastyMap[dynastyTag] === this.currentDynasty;
        });
      }
      
      // 搜索筛选
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.trim().toLowerCase();
        result = result.filter((b) => {
          return b.name.toLowerCase().includes(keyword) || 
                 b.tags.some(tag => tag.toLowerCase().includes(keyword));
        });
      }
      
      // 排序
      if (this.sortOrder === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      } else {
        // 按朝代排序
        const dynastyOrder = ["隋代", "唐代", "宋代", "明代", "清代"];
        result.sort((a, b) => {
          const aDynasty = a.tags.find(tag => dynastyOrder.includes(tag)) || "";
          const bDynasty = b.tags.find(tag => dynastyOrder.includes(tag)) || "";
          return dynastyOrder.indexOf(aDynasty) - dynastyOrder.indexOf(bDynasty);
        });
      }
      
      return result;
    },
  },

  watch: {
    filteredBuildings: {
      handler() {
        this.visibleCards = new Array(this.filteredBuildings.length).fill(false);
        this.updateMapMarkers();
        this.$nextTick(() => {
          this.checkVisibleCards();
        });
      },
      immediate: true
    }
  },

  methods: {
    switchView(view) {
      this.currentView = view;
      if (view === 'map') {
        // 切换到地图视图时初始化地图
        this.$nextTick(() => {
          if (!this.mapInstance) {
            this.initMap();
          } else {
            this.updateMapMarkers();
          }
        });
      }
      if (view === 'list') {
        // 切换回列表时重新初始化可见性
        this.$nextTick(() => {
          this.visibleCards = new Array(this.filteredBuildings.length).fill(false);
          this.$nextTick(() => {
            this.checkVisibleCards();
          });
        });
      }
    },
    
    // 初始化 Leaflet 地图
    initMap() {
      if (typeof window === 'undefined') return;
      
      if (window.L) {
        this.createLeafletMap();
        return;
      }
      
      // 加载 Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      // 加载 Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        this.createLeafletMap();
      };
      document.head.appendChild(script);
    },
    
    // 创建 Leaflet 地图
    createLeafletMap() {
      if (!window.L) return;
      
      const container = document.getElementById('tencentMap');
      if (!container) return;
      
      // 清空容器
      container.innerHTML = '';
      
      this.mapInstance = window.L.map('tencentMap', {
        center: [this.mapCenter.lat, this.mapCenter.lng],
        zoom: this.mapZoom,
        minZoom: 3,
        maxZoom: 18
      });
      
      // 添加 OpenStreetMap 图层
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.mapInstance);
      
      // 更新标记
      this.updateMapMarkers();
    },
    
    // 获取建筑坐标
    getBuildingCoordinates() {
      return {
        '太和殿': { lat: 39.916345, lng: 116.397155 },
        '故宫': { lat: 39.916345, lng: 116.397155 },
        '天坛': { lat: 39.883365, lng: 116.412345 },
        '颐和园': { lat: 39.999982, lng: 116.275461 },
        '圆明园': { lat: 40.008449, lng: 116.298382 },
        '长城': { lat: 40.431908, lng: 116.570375 },
        '赵州桥': { lat: 37.756282, lng: 114.775364 },
        '拙政园': { lat: 31.324162, lng: 120.628311 },
        '苏州园林': { lat: 31.324162, lng: 120.628311 },
        '南京城墙': { lat: 32.060255, lng: 118.796877 },
        '西安城墙': { lat: 34.2658, lng: 108.9541 },
        '兵马俑': { lat: 34.3841, lng: 109.2785 },
        '岳阳楼': { lat: 29.3815, lng: 113.0910 },
        '沈阳故宫': { lat: 41.7967, lng: 123.4560 },
        '曲阜孔庙': { lat: 35.5964, lng: 116.9915 },
        '福建土楼': { lat: 25.0244, lng: 117.0184 },
        '布达拉宫': { lat: 29.6550, lng: 91.1175 },
        '丽江古城': { lat: 26.8721, lng: 100.2304 },
        '平遥古城': { lat: 37.2025, lng: 112.1748 },
        '云冈石窟': { lat: 40.1100, lng: 113.1333 },
        '龙门石窟': { lat: 34.5564, lng: 112.4710 },
        '少林寺': { lat: 34.5061, lng: 112.9345 },
        '都江堰': { lat: 31.0010, lng: 103.6167 },
        '青城山': { lat: 30.9083, lng: 103.5636 },
        '西湖': { lat: 30.2489, lng: 120.1469 },
        '灵隐寺': { lat: 30.2408, lng: 120.0985 },
        '武当山': { lat: 32.4008, lng: 111.0039 },
        '黄鹤楼': { lat: 30.5444, lng: 114.2961 },
        '莫高窟': { lat: 40.0415, lng: 94.8090 },
        '宏村': { lat: 30.0044, lng: 117.9875 },
        '开平碉楼': { lat: 22.3763, lng: 112.5656 },
        '大足石刻': { lat: 29.7058, lng: 105.7153 }
      };
    },
    
    updateMapMarkers() {
      const buildingCoordinates = this.getBuildingCoordinates();
      
      this.mapMarkers = this.filteredBuildings.map((building, index) => {
        let coords = buildingCoordinates[building.name];
        
        if (!coords) {
          const nameHash = building.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          coords = {
            lat: 35.0 + (nameHash % 10) * 0.5,
            lng: 110.0 + (nameHash % 20) * 0.5
          };
        }
        
        return {
          id: index,
          lat: coords.lat,
          lng: coords.lng,
          title: building.name,
          buildingData: building
        };
      });
      
      // 在地图上添加标记
      this.renderMarkers();
      
      // 更新地图中心
      if (this.mapMarkers.length > 0 && this.mapInstance && window.L) {
        const totalLat = this.mapMarkers.reduce((sum, m) => sum + m.lat, 0);
        const totalLng = this.mapMarkers.reduce((sum, m) => sum + m.lng, 0);
        const centerLat = totalLat / this.mapMarkers.length;
        const centerLng = totalLng / this.mapMarkers.length;
        this.mapInstance.setView([centerLat, centerLng], this.mapZoom);
      }
    },
    
    // 渲染标记到地图
    renderMarkers() {
      if (!this.mapInstance || !window.L) return;
      
      // 清除旧标记
      this.mapInstance.eachLayer(layer => {
        if (layer instanceof window.L.Marker) {
          this.mapInstance.removeLayer(layer);
        }
      });
      this.markersInstance = [];
      
      // 添加新标记
      this.mapMarkers.forEach((markerData, index) => {
        // 获取建筑图片
        const buildingImage = markerData.buildingData.image || '';
        
        // 创建自定义图标 - 醒目的红色标记（带标签）
        const customIcon = window.L.divIcon({
          className: 'building-marker',
          html: `
            <div style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
              <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(196, 30, 58, 0.3); animation: pulse 1.5s ease-out infinite;"></div>
              <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
              <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #c41e3a;"></div>
              <div style="position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #333; white-space: nowrap; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${markerData.title.length > 4 ? markerData.title.substring(0, 4) + '...' : markerData.title}</div>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: translateX(-50%) scale(1); opacity: 1; }
                100% { transform: translateX(-50%) scale(1.6); opacity: 0; }
              }
            </style>
          `,
          iconSize: [40, 50],
          iconAnchor: [20, 50],
          popupAnchor: [0, -50]
        });
        
        // 创建标记
        const marker = window.L.marker([markerData.lat, markerData.lng], { 
          icon: customIcon,
          zIndexOffset: 1000 - index // 确保后面的标记在前面
        }).addTo(this.mapInstance);
        
        // 创建弹窗内容
        const popupContent = `
          <div class="map-info-card">
            <div class="info-image" style="background-image: url('${buildingImage}')"></div>
            <div class="info-body">
              <h4 class="info-title">${markerData.title}</h4>
              <p class="info-desc">${markerData.buildingData.description || ''}</p>
              <button class="info-btn" onclick="window.goToBuildingDetail(${markerData.buildingData.id})">查看详情</button>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -10]
        });
        
        // 点击标记打开弹窗
        marker.on('click', () => {
          marker.openPopup();
        });
        
        // 将跳转函数挂载到 window 对象
        window.goToBuildingDetail = (id) => {
          const building = this.filteredBuildings.find(b => b.id === id);
          if (building) {
            this.goToDetail(building);
          }
        };
        
        this.markersInstance.push(marker);
      });
    },
    
    selectCategory(key) {
      this.currentCategory = key;
    },

    selectDynasty(key) {
      this.currentDynasty = key;
    },

    clearFilters() {
      this.currentCategory = "all";
      this.currentDynasty = "all";
      this.searchKeyword = "";
    },

    toggleSort() {
      this.sortOrder = this.sortOrder === "name" ? "dynasty" : "name";
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

    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      const windowHeight = uni.getSystemInfoSync().windowHeight;
      
      // 回到顶部按钮显示
      this.showBackToTop = scrollTop > windowHeight;
      
      this.checkVisibleCards();
    },

    checkVisibleCards() {
      const query = uni.createSelectorQuery().in(this);
      query.selectAll('.building-card').boundingClientRect((rects) => {
        if (rects) {
          const windowHeight = uni.getSystemInfoSync().windowHeight;
          rects.forEach((rect, index) => {
            if (rect && rect.top < windowHeight + 100) {
              this.$set(this.visibleCards, index, true);
            }
          });
        }
      }).exec();
    },

    scrollToTop() {
      this.scrollTop = 1;
      this.$nextTick(() => {
        this.scrollTop = 0;
      });
    }
  },
};
</script>

<style scoped>
/* 霞鹜文楷书法字体 */
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');

/* 底层：径向渐变打底 */
.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, #f8f4e8 0%, #f0e9d8 40%, #e8dcc8 70%, #dcc8b0 100%);
  pointer-events: none;
  z-index: 0;
}

/* 顶层：动态祥云 */
.cloud-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='%238b4513' d='M400,100 Q300,50 200,100 Q100,150 200,200 Q300,250 400,200 Q500,150 600,200 Q700,250 600,100 Q500,50 400,100'/%3E%3C/svg%3E");
  background-size: 400rpx 400rpx;
  background-repeat: repeat;
  opacity: 0.06;
  animation: cloudMove 60s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes cloudMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 800rpx 400rpx;
  }
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 50%, #e8dcc8 100%);
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 2;
}

.main-content.map-mode {
  overflow: hidden;
}

.scroll-view {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 2;
}

.header {
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.header-content {
  flex: 1;
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
  font-family: 'ZCOOL XiaoWei', serif;
}

.subtitle {
  display: block;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

/* 筛选区域 - 优化版 */
.filter-area {
  background: #fff;
  padding: 24rpx 30rpx;
  border-bottom: 2rpx solid #e8dcc8;
  position: relative;
  z-index: 2;
}

/* 搜索框 - 更醒目 */
.search-box {
  display: flex;
  align-items: center;
  background: #f8f4e9;
  border-radius: 44rpx;
  padding: 20rpx 28rpx;
  border: 2rpx solid #e8dcc8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20rpx;
}

.search-box:focus-within {
  border-color: #8b4513;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.15);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #3c2a1d;
  background: transparent;
  border: none;
  outline: none;
}

.search-placeholder {
  color: #a89078;
}

.search-clear {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8dcc8;
  border-radius: 50%;
  margin-left: 12rpx;
  cursor: pointer;
  transition: all 0.25s ease;
}

.search-clear:hover {
  background: #d4c4a8;
}

.search-clear text {
  font-size: 28rpx;
  color: #8b4513;
  font-weight: bold;
}

/* 筛选标签栏容器 */
.filter-tabs-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.filter-tabs {
  flex: 1;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.filter-group {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
}

.filter-label {
  font-size: 24rpx;
  color: #8b7355;
  font-weight: 500;
  margin-right: 8rpx;
}

.filter-tab {
  display: inline-block;
  padding: 14rpx 28rpx;
  background: #f8f4e9;
  border-radius: 28rpx;
  font-size: 24rpx;
  color: #6b5643;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1rpx solid transparent;
  cursor: pointer;
}

.filter-tab:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.12);
}

.filter-tab:active {
  transform: translateY(-1px) scale(0.98);
}

.filter-tab.active {
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff;
  border-color: #8b4513;
  box-shadow: 0 4rpx 12rpx rgba(196, 30, 58, 0.3);
}

.filter-divider {
  display: inline-block;
  width: 1rpx;
  height: 40rpx;
  background: linear-gradient(180deg, transparent, #e8dcc8, transparent);
  margin: 0 20rpx;
}

/* 排序按钮 */
.sort-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  border: 2rpx solid #8b4513;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.sort-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.15);
  background: #f8f4e9;
}

.sort-btn:active {
  transform: translateY(-1px) scale(0.95);
}

.sort-icon {
  font-size: 32rpx;
}

/* 已选筛选标签展示 */
.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0e9d8;
}

.filter-result-text {
  font-size: 24rpx;
  color: #8b7355;
}

.clear-filters {
  padding: 8rpx 20rpx;
  background: rgba(196, 30, 58, 0.1);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.25s ease;
}

.clear-filters:hover {
  background: rgba(196, 30, 58, 0.2);
}

.clear-filters text {
  font-size: 22rpx;
  color: #c41e3a;
  font-weight: 500;
}

.building-grid {
  padding: 24rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  position: relative;
  z-index: 2;
}

@media (min-width: 768px) {
  .building-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .building-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.state-box {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 20rpx;
  border: 2rpx solid #e8dcc8;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.state-text {
  display: block;
  font-size: 28rpx;
  color: #6b5643;
  line-height: 1.8;
}

.error-text {
  color: #b85450;
}

/* 轻量化卡片设计 - 与首页统一 */
.building-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(139, 69, 19, 0.08);
  border: 1rpx solid rgba(139, 69, 19, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px);
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.12);
}

.building-card:active {
  transform: translateY(-2px);
}

/* 统一图片比例 4:3 */
.card-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.building-card:hover .card-image {
  transform: scale(1.04);
}

.card-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3c2a1d;
  line-height: 1.4;
}

.card-desc {
  font-size: 22rpx;
  color: #8b7355;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 20rpx;
  color: #8b4513;
  background: rgba(139, 69, 19, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-weight: 500;
  transition: all 0.25s ease;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-tag:hover {
  background: rgba(196, 30, 58, 0.18);
  color: #8b0000;
}

.bottom-actions {
  background: #fff;
  padding: 24rpx 30rpx;
  border-top: 2rpx solid #e8dcc8;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.action-btn {
  width: 300rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: none;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 6rpx 16rpx rgba(139, 0, 0, 0.3);
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 10rpx 24rpx rgba(139, 0, 0, 0.4);
}

.action-btn:active {
  transform: translateY(-2px) scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(139, 0, 0, 0.25);
}

.action-btn.secondary {
  background: #fff;
  color: #8b4513;
  border: 3rpx solid #8b4513;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.15);
}

.action-btn.secondary:hover {
  box-shadow: 0 8rpx 20rpx rgba(139, 69, 19, 0.25);
  background: #f8f4e9;
}

.action-btn.secondary:active {
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.2);
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 80rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 0, 0, 0.4);
  transform: rotate(-12deg) translateY(100rpx) scale(0);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 100;
}

.back-to-top.visible {
  transform: rotate(-12deg) translateY(0) scale(1);
  opacity: 1;
}

.back-to-top:hover {
  transform: rotate(-12deg) translateY(-6rpx) scale(1.05);
  box-shadow: 0 12rpx 32rpx rgba(139, 0, 0, 0.5);
}

.back-to-top:active {
  transform: rotate(-12deg) translateY(-2rpx) scale(0.98);
}

.back-to-top-text {
  font-size: 36rpx;
  color: #fff8e6;
  font-weight: bold;
  line-height: 1;
}

.back-to-top-seal {
  font-size: 20rpx;
  color: #fff8e6;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 1rpx;
}

/* 地图标记基础样式 */
.building-marker {
  background: transparent !important;
  border: none !important;
}

/* 地图弹窗卡片样式 */
.map-info-card {
  width: 280rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.info-image {
  width: 100%;
  height: 140rpx;
  background-size: cover;
  background-position: center;
}

.info-body {
  padding: 16rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin: 0 0 8rpx 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-desc {
  font-size: 22rpx;
  color: #666;
  margin: 0 0 12rpx 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-btn {
  width: 100%;
  padding: 12rpx 0;
  background: #c41e3a;
  color: #fff;
  font-size: 24rpx;
  border: none;
  border-radius: 8rpx;
  cursor: pointer;
}

.info-btn:hover {
  background: #a01830;
}

/* 视图切换按钮 */
.view-toggle {
  display: flex;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  padding: 6rpx;
  border-radius: 40rpx;
  align-self: center;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toggle-btn.active {
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.toggle-icon {
  font-size: 28rpx;
}

.toggle-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.toggle-btn.active .toggle-text {
  color: #8b4513;
}

/* 地图视图 */
.map-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  padding: 0;
}

.map-container {
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.tencent-map {
  width: 100%;
  height: 100%;
  min-height: 500rpx;
}

/* Leaflet 自定义标记样式 */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* 地图说明 */
.map-legend {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.15);
  border: 2rpx solid #e8dcc8;
  z-index: 5;
}

.legend-title {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 6rpx;
}

.legend-desc {
  display: block;
  font-size: 22rpx;
  color: #8b7355;
}

/* 确保卡片样式和首页完全一致 */
.building-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.12);
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2rpx solid #e8dcc8;
  position: relative;
  z-index: 1;
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px);
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.building-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 12rpx 32rpx rgba(139, 69, 19, 0.25);
}

.building-card:active {
  transform: translateY(-4px) scale(0.99);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.2);
}

.building-card .card-image {
  width: 100%;
  height: 220rpx;
  background-size: cover;
  background-position: center;
  border-radius: 16rpx 16rpx 0 0;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.building-card:hover .card-image {
  transform: scale(1.06);
}

.building-card .card-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.building-card .card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #8b4513;
}

.building-card .card-desc {
  font-size: 22rpx;
  color: #8b7355;
  line-height: 1.6;
}

.building-card .card-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 12rpx;
}

.building-card .card-tag {
  font-size: 22rpx;
  color: #a03037;
  background: rgba(196, 30, 58, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 14rpx;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.building-card .card-tag:hover {
  background: rgba(196, 30, 58, 0.18);
  color: #8b0000;
}
</style>
