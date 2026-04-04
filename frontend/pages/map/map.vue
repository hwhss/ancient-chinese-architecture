<template>
  <view class="container page-enter">
    <!-- 底层：径向渐变打底 -->
    <view class="radial-gradient-bg"></view>
    <!-- 顶层：动态祥云 -->
    <view class="cloud-background"></view>

    <!-- 骨架屏 -->
    <SkeletonScreen
      v-if="loading && buildings.length === 0"
      type="map"
      :loading="loading"
      :list-count="6"
    />

    <view
      v-show="!(loading && buildings.length === 0)"
      class="main-content"
      :class="{ 'map-mode': currentView === 'map' }"
    >
      <MapHeader
        :currentView="currentView"
        @switch-view="switchView"
      />

      <MapFilter
        :searchKeyword="searchKeyword"
        :currentCategory="currentCategory"
        :categories="categories"
        :filteredCount="filteredBuildings.length"
        @update:searchKeyword="searchKeyword = $event"
        @select-category="selectCategory"
        @clear-filters="clearFilters"
        @toggle-sort="toggleSort"
      />

      <view class="view-transition-container">
        <!-- 列表视图 -->
        <scroll-view
          v-show="currentView === 'list'"
          scroll-y
          class="scroll-view view-content"
          :class="{ 'view-active': currentView === 'list', 'view-inactive': currentView !== 'list' }"
          @scroll="handleScroll"
          scroll-with-animation
          :scroll-top="scrollTop"
        >
          <view class="page-container">
            <BuildingList
              :buildings="filteredBuildings"
              :loading="loading"
              :error="error"
              :visibleCards="visibleCards"
              @go-to-detail="goToDetail"
            />

            <MapCharts
              :hasData="!loading && !error && filteredBuildings.length > 0"
              :activeChartTab="activeChartTab"
              :chartTabs="chartTabs"
              :categoryChartData="categoryChartData"
              :geoChartData="geoChartData"
              :dataCount="filteredBuildings.length"
              @switch-chart-tab="switchChartTab"
              @category-chart-click="onCategoryChartClick"
              @chart-click="onChartClick"
            />


          </view>
        </scroll-view>

        <!-- 地图视图 -->
        <view 
          v-show="currentView === 'map'" 
          class="map-view view-content"
          :class="{ 'view-active': currentView === 'map', 'view-inactive': currentView !== 'map' }"
        >
          <TencentMapContainer
            :buildings="buildings"
            :filteredBuildings="filteredBuildings"
            :mapPoints="mapPoints"
            :loading="loading"
            :error="error"
            :isActive="currentView === 'map'"
            @go-to-detail="goToDetail"
            @update:error="error = $event"
          />
        </view>
      </view>
    </view>
    
    <view 
      v-if="currentView === 'list'"
      class="back-to-top btn-ink" 
      :class="{ 'visible': showBackToTop }"
      @click="scrollToTop"
    >
      <TraditionalIcon name="arrow-left" size="40" color="#fff" style="transform: rotate(90deg);" />
      <text class="back-to-top-seal">回顶</text>
    </view>
  </view>
</template>

<script>
import { getBuildings, getVisualizationMapPoints } from "../../services/apiWithCache.js";
import SkeletonScreen from "../../components/SkeletonScreen.vue";
import { throttle } from "../../utils/lazyLoad.js";

import MapHeader from "../../components/map/MapHeader.vue";
import MapFilter from "../../components/map/MapFilter.vue";
import BuildingList from "../../components/map/BuildingList.vue";
import MapCharts from "../../components/map/MapCharts.vue";
import TencentMapContainer from "../../components/map/TencentMapContainer.vue";
import TraditionalIcon from "../../components/shared/TraditionalIcon.vue";

const categories = [
  { key: "all", name: "全部", icon: "palace" },
  { key: "palace", name: "皇宫", icon: "palace" },
  { key: "bridge", name: "桥梁", icon: "bridge" },
  { key: "garden", name: "园林", icon: "garden" },
  { key: "defense", name: "城防", icon: "defense" },
  { key: "residence", name: "民居", icon: "home" },
  { key: "tower", name: "楼阁", icon: "tower" },
  { key: "water", name: "水利", icon: "tower" },
];

export default {
  components: {
    SkeletonScreen,
    MapHeader,
    MapFilter,
    BuildingList,
    MapCharts,
    TencentMapContainer,
    TraditionalIcon
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
      mapPoints: [],
      showChart: false,
      activeChartTab: 'category',
      chartTabs: [
        { key: 'category', name: '类型分布', icon: 'tower' },
        { key: 'geo', name: '地理分布', icon: 'map' }
      ]
    };
  },
  onLoad(options) {
    if (options.category) {
      this.currentCategory = options.category;
    }
    this.throttledOnScroll = throttle(this.onScroll.bind(this), 100);
    this.loadBuildings(true);
  },
  computed: {
    filteredBuildings() {
      let result = [...this.buildings];
      if (this.currentCategory !== "all") {
        result = result.filter((b) => b.category === this.currentCategory);
      }
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.trim().toLowerCase();
        result = result.filter((b) => {
          return b.name.toLowerCase().includes(keyword) || 
                 b.tags.some(tag => tag.toLowerCase().includes(keyword));
        });
      }
      if (this.sortOrder === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      }
      return result;
    },
    geoChartData() {
      const series = [];
      const categoryColors = {
        palace: '#c82506',
        bridge: 'var(--secondary)',
        garden: 'var(--success)',
        defense: 'var(--warning)',
        residence: '#b8956a',
        tower: 'var(--primary-light)',
        water: 'var(--secondary-dark)'
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
      const categoryGroups = {};
      this.filteredBuildings.forEach(b => {
        const cat = b.category || 'other';
        if (!categoryGroups[cat]) {
          categoryGroups[cat] = [];
        }
        
        let lat = Number(b.lat);
        let lng = Number(b.lng);
        
        if (!lat || !lng) {
          const point = this.mapPoints.find(p => p.id === b.id || p.name === b.name);
          if (point && point.coordinates) {
            lat = Number(point.coordinates.lat);
            lng = Number(point.coordinates.lng);
          }
        }
        
        if (!lat || !lng) {
          const fallbackHash = String(b.name || b.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          lat = 35.0 + (fallbackHash % 10) * 0.5;
          lng = 110.0 + (fallbackHash % 20) * 0.5;
        }

        categoryGroups[cat].push({
          name: b.name,
          value: [lng, lat],
          itemStyle: {
            color: categoryColors[cat] || '#999'
          }
        });
      });

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
            color: 'var(--text-primary)',
            fontSize: 11,
            backgroundColor: 'rgba(248, 244, 233, 0.95)',
            padding: [4, 8],
            borderRadius: 4,
            borderWidth: 1,
            borderColor: 'var(--bg-tertiary)'
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
    }
  },
  watch: {
    filteredBuildings: {
      handler() {
        this.visibleCards = new Array(this.filteredBuildings.length).fill(false);
        this.$nextTick(() => {
          if (this.currentView === 'list') {
            this.checkVisibleCards();
          }
        });
      },
      immediate: true
    }
  },
  methods: {
    switchView(view) {
      this.currentView = view;
      if (view === 'list') {
        this.$nextTick(() => {
          this.visibleCards = new Array(this.filteredBuildings.length).fill(false);
          this.$nextTick(() => {
            this.checkVisibleCards();
          });
        });
      }
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

        this.buildings = Array.isArray(list)
          ? list.map((item) => {
            const image = String(item && (item.image || item.coverImage || item.originalImage) || '').trim();
            return {
              ...item,
              image,
              coverImage: image,
              originalImage: String(item && (item.originalImage || item.image || item.coverImage) || '').trim()
            };
          })
          : [];
        this.mapPoints = Array.isArray(mapPointPayload && mapPointPayload.points)
          ? mapPointPayload.points
          : [];
          
      } catch (error) {
        console.error("加载古建筑名录失败:", error);
        this.error = error.message || "网络异常，暂时无法加载数据";
        this.buildings = [];
        this.mapPoints = [];
      } finally {
        this.loading = false;
      }
    },
    goToDetail(building) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${building.id}&name=${encodeURIComponent(building.name)}`,
      });
    },

    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      const windowHeight = uni.getSystemInfoSync().windowHeight;

      this.showBackToTop = scrollTop > windowHeight;
      this.showChart = scrollTop > windowHeight * 0.5;

      this.checkVisibleCards();
    },
    handleScroll(e) {
      if (this.throttledOnScroll) {
        this.throttledOnScroll(e);
      } else {
        this.onScroll(e);
      }
    },
    switchChartTab(tabKey) {
      this.activeChartTab = tabKey;
    },
    onChartClick(params) {
      if (params && params.name) {
        const building = this.filteredBuildings.find(b => b.name === params.name);
        if (building) {
          this.goToDetail(building);
        }
      }
    },
    onCategoryChartClick(params) {
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
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');

:root {
  --color-primary: var(--primary);
  --color-primary-dark: var(--primary-dark);
  --color-primary-light: var(--primary-light);
  --color-secondary: var(--secondary);
  --color-secondary-dark: var(--secondary-dark);
  --color-secondary-light: var(--secondary-light);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-text-muted: var(--text-muted);
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-bg-tertiary: var(--bg-tertiary);
  --color-bg-card: #ffffff;
  --color-border: var(--bg-tertiary);
  --color-border-light: #dcc8b0;
  --color-error: var(--error);
  --color-success: var(--success);
  --shadow-sm: 0 2rpx 8rpx rgba(139, 69, 19, 0.08);
  --shadow-md: 0 4rpx 16rpx rgba(139, 69, 19, 0.12);
  --shadow-lg: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  --shadow-primary: 0 6rpx 16rpx rgba(196, 30, 58, 0.3);
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

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

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
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

.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: var(--hover-lift);
  box-shadow: var(--hover-shadow);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4rpx); }
  20%, 40%, 60%, 80% { transform: translateX(4rpx); }
}

.shake-animation {
  animation: shake 0.5s ease-in-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.breathe-animation {
  animation: breathe 2s ease-in-out infinite;
}

.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-secondary) 40%, var(--bg-tertiary) 70%, #dcc8b0 100%);
  pointer-events: none;
  z-index: 0;
}

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
  0% { background-position: 0 0; }
  100% { background-position: 800rpx 400rpx; }
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
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

.map-view.view-active,
.map-view.view-content {
  display: flex;
  flex-direction: column;
}

.scroll-view.view-active {
  animation: fadeInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.map-view.view-active {
  animation: fadeInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30rpx); }
  to { opacity: 1; transform: translateX(0); }
}



.back-to-top {
  position: fixed;
  bottom: 80rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
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
</style>
