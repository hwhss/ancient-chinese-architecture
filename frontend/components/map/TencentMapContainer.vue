<template>
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
</template>

<script>
import { 
  createOptimizedMapConfig, 
  MapEventThrottler,
  getPerformanceBasedConfig,
  debounce
} from "../../utils/mapPerformance.js";

const LEAFLET_CSS_HREF = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_SRC = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
let leafletAssetPromise = null;

function loadRemoteStylesheet(href) {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  if (document.querySelector(`link[href="${href}"]`)) {
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

  const existing = document.querySelector(`script[src="${src}"]`);
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
  props: {
    filteredBuildings: {
      type: Array,
      default: () => []
    },
    buildings: {
      type: Array,
      default: () => []
    },
    mapPoints: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mapCenter: { lat: 35.8617, lng: 104.1954 },
      mapZoom: 4,
      mapMarkers: [],
      mapPointsById: Object.create(null),
      mapPointsByName: Object.create(null),
      mapDataReady: false,
      mapInstance: null,
      markersInstance: [],
      lastClusterSignature: null,
      mapEventThrottler: null,
      perfConfig: null,
      isRenderingMarkers: false,
      leafletReady: false,
      scheduleMapMarkerSync: null
    };
  },
  watch: {
    mapPoints: {
      handler() {
        this.buildMapPointLookup();
        this.mapDataReady = true;
        if (this.isActive) {
          this.syncMapMarkers();
        }
      },
      immediate: true
    },
    filteredBuildings: {
      handler() {
        if (this.isActive) {
          if (this.scheduleMapMarkerSync) {
            this.scheduleMapMarkerSync();
          } else {
            this.updateMapMarkers();
          }
        }
      },
      deep: true
    },
    isActive(val) {
      if (val) {
        this.$nextTick(() => {
          if (!this.mapInstance) {
            this.initMap();
          } else {
            setTimeout(() => {
              if (this.mapInstance) {
                this.mapInstance.invalidateSize(true);
                this.syncMapMarkers(true);
              }
            }, 150);
          }
        });
      }
    }
  },
  created() {
    this.scheduleMapMarkerSync = debounce(() => {
      if (this.isActive) {
        this.updateMapMarkers();
      }
    }, 120);
  },
  mounted() {
    if (this.isActive) {
      this.initMap();
    }
  },
  beforeDestroy() {
    this.destroyMap();
  },
  methods: {
    initMap() {
      if (typeof window === 'undefined') return;

      ensureLeafletAssets()
        .then(() => {
          this.leafletReady = true;
          this.createLeafletMap();
        })
        .catch((error) => {
          console.error('加载地图资源失败:', error);
          this.$emit('update:error', error.message || '地图资源加载失败');
        });
    },
    createLeafletMap() {
      if (!window.L) return;

      const container = document.getElementById('tencentMap');
      if (!container) return;

      this.perfConfig = getPerformanceBasedConfig();

      container.style.width = '100%';
      container.style.height = '100%';
      container.innerHTML = '';

      this.ensureMapBridge();

      const mapConfig = {
        center: [this.mapCenter.lat, this.mapCenter.lng],
        zoom: this.mapZoom,
        minZoom: 3,
        maxZoom: 18,
        ...createOptimizedMapConfig()
      };

      this.mapInstance = window.L.map('tencentMap', mapConfig);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(this.mapInstance);

      requestAnimationFrame(() => {
        if(this.mapInstance) {
          this.mapInstance.invalidateSize();
          this.syncMapMarkers(true);
        }
      });

      this.mapEventThrottler = new MapEventThrottler(this.mapInstance, {
        zoomDelay: 50,
        moveDelay: 30
      });

      this.mapEventThrottler
        .on('zoom', () => {
          this.updateMarkerPositions();
        })
        .on('zoomEnd', () => {
          this.renderMarkers();
        })
        .on('move', (bounds) => {
          this.updateVisibleMarkers(bounds);
        })
        .start();

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
      if (typeof window !== 'undefined' && window.goToBuildingDetail) {
        delete window.goToBuildingDetail;
      }
    },
    ensureMapBridge() {
      if (typeof window === 'undefined') return;

      window.goToBuildingDetail = (id) => {
        const building = this.buildings.find((item) => String(item.id) === String(id));
        if (building) {
          this.$emit('go-to-detail', building);
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
    updateMarkerPositions() {
      if (!this.mapInstance || !window.L) return;
    },
    updateVisibleMarkers(bounds) {
    },
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
      
      this.renderMarkers();
      
      if (this.mapInstance && window.L) {
        if (this.mapMarkers.length > 0) {
          const totalLat = this.mapMarkers.reduce((sum, m) => sum + m.lat, 0);
          const totalLng = this.mapMarkers.reduce((sum, m) => sum + m.lng, 0);
          const centerLat = totalLat / this.mapMarkers.length;
          const centerLng = totalLng / this.mapMarkers.length;
          this.mapInstance.setView([centerLat, centerLng], this.mapZoom);
        } else {
          this.mapInstance.setView([35.8617, 104.1954], 4);
        }
        
        this.$nextTick(() => {
          if(this.mapInstance) {
             this.mapInstance.invalidateSize();
          }
        });
      }
    },
    async renderMarkers() {
      if (!this.mapInstance || !window.L || this.isRenderingMarkers) return;

      this.isRenderingMarkers = true;

      try {
        if (this.mapMarkers.length === 0) {
          this.clearMarkers();
          return;
        }

        this.clearMarkers();

        const batchSize = this.perfConfig?.batchSize || 50;
        const batches = [];

        for (let i = 0; i < this.mapMarkers.length; i += batchSize) {
          batches.push(this.mapMarkers.slice(i, i + batchSize));
        }

        const markerGroup = window.L.layerGroup();

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

          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }

        markerGroup.addTo(this.mapInstance);
        this.updateMarkerPositions();

      } finally {
        this.isRenderingMarkers = false;
      }
    },
    clearMarkers() {
      if (!this.mapInstance) return;

      this.mapInstance.eachLayer(layer => {
        if (layer instanceof window.L.Marker ||
            layer instanceof window.L.Popup ||
            layer instanceof window.L.LayerGroup) {
          this.mapInstance.removeLayer(layer);
        }
      });

      this.markersInstance = [];
    },
    createSingleMarker(markerData, index) {
      const buildingImage = markerData.buildingData.image || '';

      const customIcon = window.L.divIcon({
        className: 'building-marker',
        html: `
          <div class="marker-container" style="position: relative; width: 40px; height: 50px; display: flex; flex-direction: column; align-items: center;">
            <div class="marker-pulse-ring" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(196, 30, 58, 0.3); animation: pulse 1.5s ease-out infinite;"></div>
            <div class="marker-dot" style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
            <div class="marker-arrow" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid var(--primary);"></div>
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

      const marker = window.L.marker([markerData.lat, markerData.lng], {
        icon: customIcon,
        zIndexOffset: 1000 - index
      });

      const popupContent = `
        <div class="map-info-card">
          <div class="info-image" style="background-image: url('${buildingImage}')"></div>
          <div class="info-body">
            <h4 class="info-title">${markerData.title}</h4>
            <p class="info-desc">${markerData.buildingData.description || ''}</p>
            <button class="info-btn" onclick="window.goToBuildingDetail('${markerData.buildingData.id}')">查看详情</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        offset: [0, -10]
      });

      marker.on('click', () => {
        marker.openPopup();
      });

      this.markersInstance.push(marker);
      return marker;
    }
  }
};
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.tencent-map {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 80%;
  max-width: 600rpx;
}

.state-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  border: 2rpx solid var(--bg-tertiary);
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.state-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.8;
}

.error-text {
  color: var(--error);
}

.map-legend {
  position: absolute;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(139, 69, 19, 0.1);
}

.legend-title {
  font-size: 24rpx;
  color: var(--primary);
  font-weight: bold;
  margin-bottom: 4rpx;
}

.legend-desc {
  font-size: 20rpx;
  color: var(--text-secondary);
}

/* Map Info Card Styles for Leaflet Popup */
::v-deep .map-info-card {
  width: 280rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

::v-deep .info-image {
  width: 100%;
  height: 140rpx;
  background-size: cover;
  background-position: center;
}

::v-deep .info-body {
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

::v-deep .info-title {
  margin: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

::v-deep .info-desc {
  margin: 0;
  font-size: 20rpx;
  color: var(--text-tertiary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

::v-deep .info-btn {
  margin-top: 8rpx;
  width: 100%;
  padding: 10rpx 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 22rpx;
  cursor: pointer;
  transition: all 0.2s;
}

::v-deep .info-btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}

::v-deep .leaflet-popup-content-wrapper {
  border-radius: 16rpx !important;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15) !important;
  padding: 0 !important;
}

::v-deep .leaflet-popup-content {
  margin: 0 !important;
}

::v-deep .leaflet-popup-close-button {
  color: #fff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  font-weight: bold;
  z-index: 10;
}
</style>
