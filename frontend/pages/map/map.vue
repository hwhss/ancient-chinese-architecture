<template>
  <view class="container page-enter">
    <!-- 底层：径向渐变打底 -->
    <view class="radial-gradient-bg"></view>
    <!-- 顶层：动态祥云 -->
    <view class="cloud-background"></view>

    <!-- 骨架屏 - 加载时显示 -->
    <SkeletonScreen
      v-if="loading && buildings.length === 0"
      type="map"
      :loading="loading"
      :list-count="6"
    />

    <!-- 主内容区域 -->
    <view
      v-show="!(loading && buildings.length === 0)"
      class="main-content"
      :class="{ 'map-mode': currentView === 'map' }"
    >
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
            class="toggle-btn tap-feedback" 
            :class="{ active: currentView === 'list' }"
            @click="switchView('list')"
          >
            <text class="toggle-icon">📋</text>
            <text class="toggle-text">列表</text>
          </view>
          <view 
            class="toggle-btn tap-feedback" 
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
        
        <!-- 筛选标签栏 -->
        <view class="filter-tabs-container">
          <scroll-view class="filter-tabs" scroll-x>
            <!-- 分类筛选 -->
            <view class="filter-group">
              <text class="filter-label">分类</text>
              <view
              v-for="cat in categories"
              :key="cat.key"
              class="filter-tab tap-feedback"
              :class="{ active: currentCategory === cat.key }"
              @click="selectCategory(cat.key)"
            >
              {{ cat.name }}
            </view>
            </view>
          </scroll-view>
          
          <!-- 排序按钮 - 移到右侧 -->
          <view class="sort-btn tap-feedback" @click="toggleSort">
            <text class="sort-icon">🔤</text>
          </view>
        </view>
        
        <!-- 已选筛选标签展示 -->
        <view class="active-filters" v-if="currentCategory !== 'all' || searchKeyword">
          <text class="filter-result-text">筛选结果：{{ filteredBuildings.length }} 处古建</text>
          <view class="clear-filters" @click="clearFilters" v-if="currentCategory !== 'all'">
            <text>清除筛选</text>
          </view>
        </view>
      </view>

      <!-- 视图切换动画容器 -->
      <view class="view-transition-container">
        <!-- 建筑列表视图 -->
        <scroll-view
          v-show="currentView === 'list'"
          scroll-y
          class="scroll-view view-content"
          :class="{ 'view-active': currentView === 'list', 'view-inactive': currentView !== 'list' }"
          @scroll="handleScroll"
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
              class="building-card preview-card card-ink"
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

          <!-- 数据可视化图表区域 - 放在列表底部 -->
          <view class="charts-section" v-if="!loading && !error && filteredBuildings.length > 0">
            <!-- 图表切换标签 -->
            <view class="charts-tabs">
              <view
                v-for="tab in chartTabs"
                :key="tab.key"
                class="chart-tab tap-feedback"
                :class="{ active: activeChartTab === tab.key }"
                @click="switchChartTab(tab.key)"
              >
                <text class="chart-tab-icon">{{ tab.icon }}</text>
                <text class="chart-tab-text">{{ tab.name }}</text>
              </view>
            </view>

            <!-- 图表容器 -->
            <view class="chart-display-area">
              <!-- 分类分布饼图 -->
              <view v-if="activeChartTab === 'category'" class="chart-wrapper">
                <view class="chart-title-bar">
                  <text class="chart-title-text">🏛️ 建筑类型分布</text>
                </view>
                <!-- #ifdef H5 -->
                <VisualChart
                  type="pie"
                  :data="categoryChartData"
                  :height="260"
                  @click="onCategoryChartClick"
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
                  <text class="chart-title-text">📍 地理位置分布</text>
                  <text class="chart-subtitle">共 {{ filteredBuildings.length }} 处古建筑</text>
                </view>
                <!-- #ifdef H5 -->
                <VisualChart
                  type="scatter"
                  :data="geoChartData"
                  :height="320"
                  @click="onChartClick"
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

          <!-- 底部按钮 -->
          <view class="bottom-actions">
            <button class="action-btn secondary ink-ripple" @click="goToChat">
              <text class="btn-icon">💬</text>
              <text class="btn-text">返回AI问答</text>
            </button>
          </view>
        </scroll-view>
        
        <!-- 地图视图 -->
        <view 
          v-show="currentView === 'map'" 
          class="map-view view-content"
          :class="{ 'view-active': currentView === 'map', 'view-inactive': currentView !== 'map' }"
        >
          <!-- 地图容器 - 始终保留以确保地图实例正常工作 -->
          <view class="map-container">
            <!-- 可交互地图容器 -->
            <view id="tencentMap" class="tencent-map"></view>
            
            <!-- 加载/错误/空状态遮罩 -->
            <view v-if="loading" class="map-overlay state-box">
              <text class="state-text">正在加载古建筑名录...</text>
            </view>
            <view v-else-if="error" class="map-overlay state-box">
              <text class="state-text error-text">{{ error }}</text>
            </view>
            <view v-else-if="filteredBuildings.length === 0" class="map-overlay state-box">
              <text class="empty-icon">🏛️</text>
              <text class="state-text">没有找到对应的古建哦，试试换个关键词吧</text>
            </view>
            
            <!-- 地图说明 -->
            <view class="map-legend" v-if="!loading && !error && filteredBuildings.length > 0">
              <text class="legend-title">📍 点击标记查看详情</text>
              <text class="legend-desc">当前显示 {{ filteredBuildings.length }} 处古建筑 · 鼠标滚轮缩放 · 拖拽移动</text>
            </view>
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
import { getBuildings, getVisualizationMapPoints } from "../../services/apiWithCache.js";
import SkeletonScreen from "../../components/SkeletonScreen.vue";
import VisualChart from "../../components/VisualChart.vue";
import { throttle } from "../../utils/lazyLoad.js";
import { 
  createOptimizedMapConfig, 
  MapEventThrottler,
  getPerformanceBasedConfig,
  debounce
} from "../../utils/mapPerformance.js";

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

const LEAFLET_CSS_HREF = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_SRC = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
let leafletAssetPromise = null;

function loadRemoteStylesheet(href) {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (document.querySelector(`link[href=\"${href}\"]`)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`加载样式失败: ${href}`));
    document.head.appendChild(link);
  });
}

function loadRemoteScript(src) {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (window.L) {
    return Promise.resolve();
  }

  const existing = document.querySelector(`script[src=\"${src}\"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`加载脚本失败: ${src}`)), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`加载脚本失败: ${src}`));
    document.head.appendChild(script);
  });
}

function ensureLeafletAssets() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.L) {
    return Promise.resolve();
  }

  if (!leafletAssetPromise) {
    leafletAssetPromise = Promise.all([
      loadRemoteStylesheet(LEAFLET_CSS_HREF),
      loadRemoteScript(LEAFLET_JS_SRC)
    ])
      .then(() => undefined)
      .catch((error) => {
        leafletAssetPromise = null;
        throw error;
      });
  }

  return leafletAssetPromise;
}

export default {
  components: {
    SkeletonScreen,
    VisualChart
  },
  data() {
    return {
      categories,
      currentCategory: "all",
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
      mapPoints: [],
      mapPointsById: Object.create(null),
      mapPointsByName: Object.create(null),
      mapDataReady: false,
      mapInstance: null,
      markersInstance: [],
      lastClusterSignature: null,
      showChart: false,
      activeChartTab: 'category',
      chartTabs: [
        { key: 'category', name: '类型分布', icon: '🏛️' },
        { key: 'geo', name: '地理分布', icon: '📍' }
      ],
      mapEventThrottler: null,
      perfConfig: null,
      isRenderingMarkers: false,
      leafletReady: false,
      scheduleMapMarkerSync: null
    };
  },

  onLoad(options) {
    if (options.category) {
      this.currentCategory = options.category;
    }

    // 初始化节流和防抖函数
    this.throttledOnScroll = throttle(this.onScroll.bind(this), 100);
    this.scheduleMapMarkerSync = debounce(() => {
      if (this.currentView === 'map') {
        this.updateMapMarkers();
      }
    }, 120);
    this.loadBuildings();
  },
  
  onUnload() {
    this.destroyMap();
    if (typeof window !== 'undefined' && window.goToBuildingDetail) {
      delete window.goToBuildingDetail;
    }
  },

  computed: {
    filteredBuildings() {
      let result = [...this.buildings];
      
      // 分类筛选
      if (this.currentCategory !== "all") {
        result = result.filter((b) => b.category === this.currentCategory);
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
      }
      
      return result;
    },

    // 地理位置散点图数据
    geoChartData() {
      const series = [];

      // 按分类分组数据
      const categoryColors = {
        palace: '#c82506',
        bridge: '#8B4513',
        garden: '#5b8c5a',
        defense: '#e8b860',
        residence: '#b8956a',
        tower: '#d6455a',
        water: '#6b3410'
      };

      const categoryNames = {
        palace: '宫殿',
        bridge: '桥梁',
        garden: '园林',
        defense: '城防',
        residence: '民居',
        tower: '楼阁',
        water: '水利'
      };

      // 为每个分类创建数据系列
      const categoryGroups = {};
      this.filteredBuildings.forEach(b => {
        const cat = b.category || 'other';
        if (!categoryGroups[cat]) {
          categoryGroups[cat] = [];
        }

        const coords = this.resolveBuildingCoordinates(b);

        categoryGroups[cat].push({
          name: b.name,
          value: [coords.lng, coords.lat],
          itemStyle: {
            color: categoryColors[cat] || '#999'
          }
        });
      });

      // 转换为 series 格式
      Object.entries(categoryGroups).forEach(([cat, data]) => {
        series.push({
          name: categoryNames[cat] || cat,
          type: 'scatter',
          data: data,
          symbolSize: 20,
          symbol: 'circle',
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.2)'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{b}',
            color: '#3c2a1d',
            fontSize: 11,
            backgroundColor: 'rgba(248, 244, 233, 0.95)',
            padding: [4, 8],
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#e8dcc8'
          },
          emphasis: {
            focus: 'series',
            scale: 1.6,
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(200, 37, 6, 0.5)'
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              backgroundColor: 'rgba(200, 37, 6, 0.95)',
              color: '#fff'
            }
          }
        });
      });

      return { 
        series,
        legend: Object.keys(categoryGroups).map(cat => categoryNames[cat] || cat)
      };
    },

    // 分类饼图数据
    categoryChartData() {
      const stats = {};
      const categoryNames = {
        palace: '宫殿',
        bridge: '桥梁',
        garden: '园林',
        defense: '城防',
        residence: '民居',
        tower: '楼阁',
        water: '水利'
      };

      this.filteredBuildings.forEach(b => {
        const cat = b.category || 'other';
        stats[cat] = (stats[cat] || 0) + 1;
      });

      return {
        series: Object.entries(stats).map(([key, value]) => ({
          name: categoryNames[key] || key,
          value
        }))
      };
    },

  },

  watch: {
    filteredBuildings: {
      handler() {
        this.visibleCards = new Array(this.filteredBuildings.length).fill(false);
        this.$nextTick(() => {
          if (this.currentView === 'map') {
            if (this.scheduleMapMarkerSync) {
              this.scheduleMapMarkerSync();
            } else {
              this.updateMapMarkers();
            }
          }
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
        this.$nextTick(() => {
          if (!this.mapInstance) {
            this.initMap();
          } else {
            setTimeout(() => {
              this.mapInstance.invalidateSize(true);
              this.syncMapMarkers(true);
            }, 150);
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

      ensureLeafletAssets()
        .then(() => {
          this.leafletReady = true;
          this.createLeafletMap();
        })
        .catch((error) => {
          console.error('加载地图资源失败:', error);
          this.error = error.message || '地图资源加载失败';
        });
    },
    
    // 创建 Leaflet 地图
    createLeafletMap() {
      if (!window.L) return;

      const container = document.getElementById('tencentMap');
      if (!container) return;

      // 获取性能优化配置
      this.perfConfig = getPerformanceBasedConfig();

      // 确保容器有明确的大小
      container.style.width = '100%';
      container.style.height = '100%';

      // 清空容器
      container.innerHTML = '';

      this.ensureMapBridge();

      // 使用优化的地图配置
      const mapConfig = {
        center: [this.mapCenter.lat, this.mapCenter.lng],
        zoom: this.mapZoom,
        minZoom: 3,
        maxZoom: 18,
        ...createOptimizedMapConfig()
      };

      this.mapInstance = window.L.map('tencentMap', mapConfig);

      // 添加 OpenStreetMap 图层
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        // 优化瓦片加载
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(this.mapInstance);

      // 延迟更新标记以确保地图完全初始化
      requestAnimationFrame(() => {
        this.mapInstance.invalidateSize();
        this.syncMapMarkers(true);
      });

      // 使用优化的事件节流器
      this.mapEventThrottler = new MapEventThrottler(this.mapInstance, {
        zoomDelay: 50,
        moveDelay: 30
      });

      this.mapEventThrottler
        .on('zoom', (zoom) => {
          // 缩放过程中实时更新标记位置
          this.updateMarkerPositions();
        })
        .on('zoomEnd', (zoom) => {
          // 缩放结束后重新渲染标记
          this.renderMarkers();
        })
        .on('move', (bounds) => {
          // 移动过程中更新可见标记
          this.updateVisibleMarkers(bounds);
        })
        .start();

      // 使用 RAF 优化缩放动画
      let rafId = null;
      this.mapInstance.on('zoom', () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          this.updateMarkerPositions();
          rafId = null;
        });
      });
    },

    destroyMap() {
      if (this.mapEventThrottler) {
        this.mapEventThrottler.stop();
        this.mapEventThrottler = null;
      }

      this.clearMarkers();

      if (this.mapInstance) {
        this.mapInstance.off();
        this.mapInstance.remove();
        this.mapInstance = null;
      }

      this.lastClusterSignature = null;
      this.markersInstance = [];
    },

    ensureMapBridge() {
      if (typeof window === 'undefined') return;

      window.goToBuildingDetail = (id) => {
        const building = this.buildings.find((item) => String(item.id) === String(id));
        if (building) {
          this.goToDetail(building);
        }
      };
    },

    buildMapPointLookup() {
      const byId = Object.create(null);
      const byName = Object.create(null);

      this.mapPoints.forEach((point) => {
        if (!point) return;
        if (point.id !== undefined && point.id !== null) {
          byId[String(point.id)] = point;
        }
        if (point.name) {
          byName[String(point.name)] = point;
        }
      });

      this.mapPointsById = byId;
      this.mapPointsByName = byName;
    },

    getMapPointForBuilding(building) {
      if (!building) return null;

      const idKey = String(building.id || '');
      const nameKey = String(building.name || '');

      return this.mapPointsById[idKey] || this.mapPointsByName[nameKey] || null;
    },

    resolveBuildingCoordinates(building) {
      const point = this.getMapPointForBuilding(building);
      if (point && point.coordinates) {
        const lat = Number(point.coordinates.lat);
        const lng = Number(point.coordinates.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
      }

      const lat = Number(building && building.lat);
      const lng = Number(building && building.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng };
      }

      const legacyCoordinates = this.getBuildingCoordinates();
      const legacy = legacyCoordinates[building.name];
      if (legacy) {
        return legacy;
      }

      const fallbackHash = String(building.name || building.id || '')
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      return {
        lat: 35.0 + (fallbackHash % 10) * 0.5,
        lng: 110.0 + (fallbackHash % 20) * 0.5
      };
    },

    syncMapMarkers(force = false) {
      if (!this.mapDataReady && !force) {
        return;
      }

      if (this.scheduleMapMarkerSync && !force) {
        this.scheduleMapMarkerSync();
        return;
      }

      this.updateMapMarkers();
    },

    // 更新标记位置（不重新创建，仅更新位置）
    updateMarkerPositions() {
      if (!this.mapInstance || !window.L) return;

      // 标记位置由 Leaflet 自动管理
      // 这里可以添加额外的位置更新逻辑，如根据缩放级别调整样式
      const currentZoom = this.mapInstance.getZoom();

      // 可以在这里根据缩放级别调整标记样式
      // 当前保持原始视觉效果不变
    },

    // 更新可见标记
    updateVisibleMarkers(bounds) {
      // 可以在这里实现视口外标记的隐藏逻辑
      // 当前 Leaflet 会自动处理，这里预留扩展点
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
      const nextMarkers = this.filteredBuildings.map((building, index) => {
        const coords = this.resolveBuildingCoordinates(building);
        const point = this.getMapPointForBuilding(building);

        return {
          id: building.id || index,
          lat: coords.lat,
          lng: coords.lng,
          title: building.name,
          buildingData: building,
          point
        };
      });

      this.mapMarkers = nextMarkers;

      const markerSignature = nextMarkers
        .map((marker) => `${marker.id}:${marker.lat.toFixed(6)}:${marker.lng.toFixed(6)}`)
        .join('|');

      if (this.lastClusterSignature === markerSignature && this.mapInstance) {
        return;
      }

      this.lastClusterSignature = markerSignature;
      
      // 在地图上添加标记
      this.renderMarkers();
      
      // 更新地图中心 - 修复：空数据时显示默认中国中心
      if (this.mapInstance && window.L) {
        if (this.mapMarkers.length > 0) {
          const totalLat = this.mapMarkers.reduce((sum, m) => sum + m.lat, 0);
          const totalLng = this.mapMarkers.reduce((sum, m) => sum + m.lng, 0);
          const centerLat = totalLat / this.mapMarkers.length;
          const centerLng = totalLng / this.mapMarkers.length;
          this.mapInstance.setView([centerLat, centerLng], this.mapZoom);
        } else {
          // 没有标记时显示中国中心位置
          this.mapInstance.setView([35.8617, 104.1954], 4);
        }
        
        // 修复：强制地图重新计算大小（解决切换后地图不显示问题）
        this.$nextTick(() => {
          this.mapInstance.invalidateSize();
        });
      }
    },

    // 渲染标记到地图
    async renderMarkers() {
      if (!this.mapInstance || !window.L || this.isRenderingMarkers) return;

      // 防止重复渲染
      this.isRenderingMarkers = true;

      try {
        // 如果没有标记数据，直接返回
        if (this.mapMarkers.length === 0) {
          this.clearMarkers();
          return;
        }

        // 清除旧标记
        this.clearMarkers();

        // 使用批量渲染优化性能
        const batchSize = this.perfConfig?.batchSize || 50;
        const batches = [];

        for (let i = 0; i < this.mapMarkers.length; i += batchSize) {
          batches.push(this.mapMarkers.slice(i, i + batchSize));
        }

        // 创建标记组
        const markerGroup = window.L.layerGroup();

        // 分批渲染
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];

          await new Promise(resolve => {
            requestAnimationFrame(() => {
              batch.forEach((markerData, index) => {
                const marker = this.createSingleMarker(markerData, i * batchSize + index);
                if (marker) {
                  markerGroup.addLayer(marker);
                  this.markersInstance.push(marker);
                }
              });
              resolve();
            });
          });

          // 让出主线程，避免阻塞UI
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        // 一次性添加到地图
        markerGroup.addTo(this.mapInstance);

        // 根据缩放级别调整标记样式
        this.updateMarkerPositions();

      } finally {
        this.isRenderingMarkers = false;
      }
    },

    // 清除所有标记
    clearMarkers() {
      if (!this.mapInstance) return;

      // 只清除标记层，保留瓦片层
      this.mapInstance.eachLayer(layer => {
        if (layer instanceof window.L.Marker ||
            layer instanceof window.L.Popup ||
            layer instanceof window.L.LayerGroup) {
          this.mapInstance.removeLayer(layer);
        }
      });

      this.markersInstance = [];
    },

    // 创建单个标记（返回marker实例，不直接添加到地图）
    createSingleMarker(markerData, index) {
      // 获取建筑图片
      const buildingImage = markerData.buildingData.image || '';

      // 创建自定义图标 - 醒目的红色标记（带标签）- 恢复原始视觉效果
      const customIcon = window.L.divIcon({
        className: 'building-marker',
        html: `
          <div class="marker-container" style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
            <div class="marker-pulse-ring" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(196, 30, 58, 0.3); animation: pulse 1.5s ease-out infinite;"></div>
            <div class="marker-dot" style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
            <div class="marker-arrow" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid #c41e3a;"></div>
            <div class="marker-label" style="position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.95); padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #333; white-space: nowrap; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${markerData.title.length > 4 ? markerData.title.substring(0, 4) + '...' : markerData.title}</div>
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
        zIndexOffset: 1000 - index
      });

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

      this.markersInstance.push(marker);
      return marker;
    },

    selectCategory(key) {
      this.currentCategory = key;
    },

    clearFilters() {
      this.currentCategory = "all";
      this.searchKeyword = "";
    },

    toggleSort() {
      this.sortOrder = this.sortOrder === "name" ? "default" : "name";
    },

    async loadBuildings(forceRefresh = false) {
      this.loading = true;
      this.error = "";

      try {
        const [buildingResult, pointResult] = await Promise.allSettled([
          getBuildings({}, forceRefresh),
          getVisualizationMapPoints(forceRefresh)
        ]);

        const list = buildingResult.status === 'fulfilled' ? buildingResult.value : [];
        const mapPointPayload = pointResult.status === 'fulfilled' ? pointResult.value : null;

        this.buildings = Array.isArray(list) ? list : [];
        this.mapPoints = Array.isArray(mapPointPayload && mapPointPayload.points)
          ? mapPointPayload.points
          : [];
        this.buildMapPointLookup();
        this.mapDataReady = true;

        if (this.currentView === 'map') {
          if (this.scheduleMapMarkerSync) {
            this.scheduleMapMarkerSync();
          } else {
            this.updateMapMarkers();
          }
        }
      } catch (error) {
        console.error("加载古建筑名录失败:", error);
        this.error = error.message || "网络异常，暂时无法加载数据";
        this.buildings = [];
        this.mapPoints = [];
        this.buildMapPointLookup();
      } finally {
        this.loading = false;
      }
    },

    // 节流优化的滚动处理
    throttledOnScroll: null,

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

      // 图表区域显示
      this.showChart = scrollTop > windowHeight * 0.5;

      this.checkVisibleCards();
    },

    // 使用节流优化的滚动事件处理
    handleScroll(e) {
      if (this.throttledOnScroll) {
        this.throttledOnScroll(e);
      } else {
        this.onScroll(e);
      }
    },

    // 切换图表标签
    switchChartTab(tabKey) {
      this.activeChartTab = tabKey;
    },

    // 图表点击事件
    onChartClick(params) {
      console.log('点击了散点图:', params);
      if (params && params.name) {
        const building = this.filteredBuildings.find(b => b.name === params.name);
        if (building) {
          this.goToDetail(building);
        }
      }
    },

    // 分类图表点击事件
    onCategoryChartClick(params) {
      console.log('点击了分类图表:', params);
      const categoryMap = {
        '宫殿': 'palace',
        '园林': 'garden',
        '桥梁': 'bridge',
        '城防': 'defense',
        '民居': 'residence',
        '楼阁': 'tower',
        '水利': 'water'
      };
      const category = categoryMap[params.name];
      if (category) {
        this.selectCategory(category);
      }
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

/* ============================================
   步骤七：规范化色彩系统 - CSS 变量定义
   ============================================ */
:root {
  /* 主色调 - 朱砂红 */
  --color-primary: #c41e3a;
  --color-primary-dark: #8b0000;
  --color-primary-light: #d6455a;
  
  /* 辅助色 - 古铜棕 */
  --color-secondary: #8b4513;
  --color-secondary-dark: #6b3410;
  --color-secondary-light: #a67c52;
  
  /* 中性色 */
  --color-text-primary: #3c2a1d;
  --color-text-secondary: #6b5643;
  --color-text-tertiary: #8b7355;
  --color-text-muted: #a89078;
  
  /* 背景色 */
  --color-bg-primary: #f8f4e8;
  --color-bg-secondary: #f0e9d8;
  --color-bg-tertiary: #e8dcc8;
  --color-bg-card: #ffffff;
  
  /* 边框色 */
  --color-border: #e8dcc8;
  --color-border-light: #dcc8b0;
  
  /* 功能色 */
  --color-error: #b85450;
  --color-success: #5b8c5a;
  
  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(139, 69, 19, 0.08);
  --shadow-md: 0 4rpx 16rpx rgba(139, 69, 19, 0.12);
  --shadow-lg: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  --shadow-primary: 0 6rpx 16rpx rgba(196, 30, 58, 0.3);
  
  /* 动画曲线 */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* 圆角 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;
  
  /* ============================================
     步骤八：字体层级系统
     ============================================ */
  /* 字体族 */
  --font-display: 'ZCOOL XiaoWei', 'Noto Serif SC', 'Source Han Serif SC', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  /* 字体大小层级 */
  --text-xs: 20rpx;
  --text-sm: 24rpx;
  --text-base: 28rpx;
  --text-lg: 32rpx;
  --text-xl: 36rpx;
  --text-2xl: 40rpx;
  --text-3xl: 48rpx;
  --text-4xl: 56rpx;
  --text-5xl: 72rpx;
  --text-6xl: 96rpx;
  
  /* 行高 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* 字间距 */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;
  --tracking-widest: 0.2em;
  
  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* ============================================
     步骤九：微动效系统
     ============================================ */
  /* 动画时长 */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  
  /* 悬浮效果 */
  --hover-lift: translateY(-4px);
  --hover-scale: scale(1.02);
  --hover-shadow: 0 12rpx 32rpx rgba(139, 69, 19, 0.2);
}

/* ============================================
   步骤九：微动效 - 骨架屏动画
   ============================================ */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e8dcc8 25%,
    #f0e9d8 50%,
    #e8dcc8 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* ============================================
   步骤九：微动效 - 按钮波纹效果
   ============================================ */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.btn-ripple:active::after {
  width: 300rpx;
  height: 300rpx;
}

/* ============================================
   步骤九：微动效 - 脉冲动画
   ============================================ */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.pulse-effect {
  position: relative;
}

.pulse-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: inherit;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: -1;
}

/* ============================================
   步骤九：微动效 - 悬浮抬升效果
   ============================================ */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: var(--hover-lift);
  box-shadow: var(--hover-shadow);
}

/* ============================================
   步骤九：微动效 - 摇晃提示
   ============================================ */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4rpx); }
  20%, 40%, 60%, 80% { transform: translateX(4rpx); }
}

.shake-animation {
  animation: shake 0.5s ease-in-out;
}

/* ============================================
   步骤九：微动效 - 旋转加载
   ============================================ */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

/* ============================================
   步骤九：微动效 - 呼吸效果
   ============================================ */
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.breathe-animation {
  animation: breathe 2s ease-in-out infinite;
}

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
  min-height: 0;
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

/* 视图切换动画 */
.view-transition-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.view-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateX(30rpx);
  pointer-events: none;
}

.view-content.view-active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.view-content.view-inactive {
  opacity: 0;
  transform: translateX(-30rpx);
}

/* 修复：确保地图视图在激活时有正确的高度 */
.map-view.view-active,
.map-view.view-content {
  display: flex;
  flex-direction: column;
}

/* 列表视图特定样式 */
.scroll-view.view-active {
  animation: fadeInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 地图视图特定样式 */
.map-view.view-active {
  animation: fadeInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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

/* ========== 图表区域样式 ========== */
.chart-section {
  margin: 40rpx 0;
  padding: 40rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 24rpx;
  border: 2rpx solid #e8dcc8;
  box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.08);
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.chart-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #3c2a1d;
  letter-spacing: 2rpx;
}

.chart-container {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e8dcc8;
}

/* 图表降级方案 */
.chart-fallback {
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
}

.chart-fallback .fallback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.chart-fallback .fallback-icon {
  font-size: 64rpx;
}

.chart-fallback .fallback-text {
  font-size: 28rpx;
  color: #8b7355;
}

.geo-stats {
  text-align: center;
  margin-top: 20rpx;
}

.geo-stat-text {
  font-size: 26rpx;
  color: #3c2a1d;
  font-weight: 500;
}

/* ========== 新的图表区域样式 ========== */
.charts-section {
  padding: 24rpx 20rpx;
  margin: 20rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 20rpx;
  border: 2rpx solid #e8dcc8;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
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
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 1rpx solid #e8dcc8;
  transition: all 0.3s ease;
}

.chart-tab:active {
  transform: scale(0.96);
}

.chart-tab.active {
  background: linear-gradient(135deg, #c82506 0%, #8b0000 100%);
  border-color: #c82506;
  box-shadow: 0 3rpx 10rpx rgba(200, 37, 6, 0.3);
}

.chart-tab-icon {
  font-size: 24rpx;
}

.chart-tab-text {
  font-size: 24rpx;
  color: #6b5643;
  font-weight: 500;
}

.chart-tab.active .chart-tab-text {
  color: #fff;
}

.chart-display-area {
  background: #fff;
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
  overflow: hidden;
}

.chart-wrapper {
  padding: 0;
}

.chart-title-bar {
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #faf6ed 0%, #f5efe0 100%);
  border-bottom: 1rpx solid #e8dcc8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #3c2a1d;
  letter-spacing: 2rpx;
}

.chart-subtitle {
  font-size: 22rpx;
  color: #8b7355;
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
  color: #8b7355;
}

/* 响应式布局 */
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

.geo-stat-hint {
  font-size: 24rpx;
  color: #8b7355;
  margin-top: 8rpx;
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

.action-btn .btn-icon {
  display: inline-block;
  margin-right: 8rpx;
  font-size: 28rpx;
  vertical-align: middle;
}

.action-btn .btn-text {
  display: inline-block;
  vertical-align: middle;
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

/* 标记容器 - 恢复原始样式 */
.marker-container {
  position: relative;
  width: 40px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;
}

/* 脉冲动画环 */
.marker-pulse-ring {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(196, 30, 58, 0.3);
  animation: pulse 1.5s ease-out infinite;
  will-change: transform, opacity;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(1.6);
    opacity: 0;
  }
}

/* 标记点 */
.marker-dot {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  z-index: 2;
}

/* 标记箭头 */
.marker-arrow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #c41e3a;
  z-index: 1;
}

/* 标记标签 */
.marker-label {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.95);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 3;
}

/* Leaflet 弹窗样式 */
.leaflet-popup-content-wrapper {
  border-radius: 16rpx !important;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15) !important;
}

.leaflet-popup-content {
  margin: 0 !important;
  padding: 0 !important;
}

/* 地图性能优化 - 硬件加速 */
.leaflet-container {
  will-change: transform;
}

.leaflet-tile {
  will-change: transform;
}

.leaflet-marker-icon {
  will-change: transform;
}

/* 标记悬停效果 */
.building-marker:hover .marker-dot {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.building-marker:hover .marker-label {
  background: #fff;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
  height: 100%;
  min-height: 600rpx;
}

.map-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  min-height: 600rpx;
}

.tencent-map {
  width: 100%;
  height: 100%;
  min-height: 600rpx;
}

/* 地图遮罩层 - 用于显示加载/错误/空状态 */
.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 244, 232, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  grid-column: auto;
  border: none;
  box-shadow: none;
  border-radius: 0;
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
