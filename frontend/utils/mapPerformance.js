/**
 * 地图性能优化工具
 * 提供地图渲染优化、标记管理、事件节流等功能
 */

/**
 * 创建优化的Leaflet地图配置
 * @returns {Object} 优化后的地图配置
 */
export function createOptimizedMapConfig() {
  return {
    // 禁用默认的动画效果，使用CSS3硬件加速
    fadeAnimation: false,
    zoomAnimation: true,
    zoomAnimationThreshold: 4, // 缩放级别差大于4时禁用动画
    markerZoomAnimation: true,
    
    // 优化渲染性能
    preferCanvas: true, // 使用Canvas渲染（如果可用）
    renderer: undefined, // 让Leaflet自动选择最佳渲染器
    
    // 减少重绘
    updateWhenIdle: true,
    updateWhenZooming: false,
    
    // 优化平移性能
    inertia: true,
    inertiaDeceleration: 3000,
    inertiaMaxSpeed: Infinity,
    easeLinearity: 0.2,
    worldCopyJump: true,
    maxBoundsViscosity: 0.0,
    
    // 禁用不必要的功能
    attributionControl: false,
    zoomControl: false,
  };
}

/**
 * 优化的标记管理器
 * 使用对象池和批量渲染技术
 */
export class OptimizedMarkerManager {
  constructor(map, options = {}) {
    this.map = map;
    this.markers = new Map();
    this.markerPool = [];
    this.visibleMarkers = new Set();
    this.options = {
      batchSize: 50,
      renderDelay: 16,
      ...options
    };
    this.renderQueue = [];
    this.isRendering = false;
    this.markerGroup = null;
  }

  /**
   * 初始化标记组
   */
  init() {
    if (this.map && window.L) {
      this.markerGroup = window.L.layerGroup().addTo(this.map);
    }
  }

  /**
   * 批量添加标记（异步，避免阻塞UI）
   * @param {Array} markerDataList 标记数据列表
   */
  async addMarkersBatch(markerDataList) {
    // 清空现有标记
    this.clear();
    
    // 分批处理
    const batches = this.createBatches(markerDataList, this.options.batchSize);
    
    for (const batch of batches) {
      await this.renderBatch(batch);
      // 让出主线程，避免阻塞
      await this.yieldToMainThread();
    }
  }

  /**
   * 创建批次
   */
  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * 渲染一批标记
   */
  renderBatch(batch) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        batch.forEach(data => {
          const marker = this.createMarker(data);
          if (marker && this.markerGroup) {
            this.markerGroup.addLayer(marker);
            this.markers.set(data.id, marker);
          }
        });
        resolve();
      });
    });
  }

  /**
   * 让出主线程
   */
  yieldToMainThread() {
    return new Promise(resolve => {
      setTimeout(resolve, this.options.renderDelay);
    });
  }

  /**
   * 创建单个标记（子类可重写）
   */
  createMarker(data) {
    // 默认实现，子类可重写
    return null;
  }

  /**
   * 根据可见性更新标记
   * 只渲染视口内的标记
   */
  updateVisibleMarkers(bounds) {
    const visibleIds = new Set();
    
    this.markers.forEach((marker, id) => {
      const markerLatLng = marker.getLatLng();
      const isVisible = bounds.contains(markerLatLng);
      
      if (isVisible && !this.visibleMarkers.has(id)) {
        // 标记进入视口
        marker.addTo(this.markerGroup);
        this.visibleMarkers.add(id);
      } else if (!isVisible && this.visibleMarkers.has(id)) {
        // 标记离开视口
        marker.removeFrom(this.markerGroup);
        this.visibleMarkers.delete(id);
      }
      
      if (isVisible) {
        visibleIds.add(id);
      }
    });
  }

  /**
   * 清除所有标记
   */
  clear() {
    if (this.markerGroup) {
      this.markerGroup.clearLayers();
    }
    this.markers.clear();
    this.visibleMarkers.clear();
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.clear();
    if (this.markerGroup) {
      this.markerGroup.removeFrom(this.map);
    }
    this.map = null;
  }
}

/**
 * 地图事件节流器
 * 优化地图缩放、平移等高频事件
 */
export class MapEventThrottler {
  constructor(map, options = {}) {
    this.map = map;
    this.options = {
      zoomDelay: 100,
      moveDelay: 50,
      ...options
    };
    this.zoomTimeout = null;
    this.moveTimeout = null;
    this.isZooming = false;
    this.callbacks = {
      onZoom: null,
      onMove: null,
      onZoomEnd: null
    };
  }

  /**
   * 注册回调
   */
  on(event, callback) {
    this.callbacks[event] = callback;
    return this;
  }

  /**
   * 开始监听
   */
  start() {
    if (!this.map) return;

    // 缩放开始
    this.map.on('zoomstart', () => {
      this.isZooming = true;
      this.clearTimeouts();
    });

    // 缩放过程中（节流）
    this.map.on('zoom', () => {
      if (this.zoomTimeout) return;
      
      this.zoomTimeout = setTimeout(() => {
        this.zoomTimeout = null;
        if (this.callbacks.onZoom && this.isZooming) {
          this.callbacks.onZoom(this.map.getZoom());
        }
      }, this.options.zoomDelay);
    });

    // 缩放结束
    this.map.on('zoomend', () => {
      this.isZooming = false;
      this.clearTimeouts();
      if (this.callbacks.onZoomEnd) {
        this.callbacks.onZoomEnd(this.map.getZoom());
      }
    });

    // 移动过程中（节流）
    this.map.on('move', () => {
      if (this.moveTimeout) return;
      
      this.moveTimeout = setTimeout(() => {
        this.moveTimeout = null;
        if (this.callbacks.onMove) {
          this.callbacks.onMove(this.map.getBounds());
        }
      }, this.options.moveDelay);
    });
  }

  /**
   * 清除定时器
   */
  clearTimeouts() {
    if (this.zoomTimeout) {
      clearTimeout(this.zoomTimeout);
      this.zoomTimeout = null;
    }
    if (this.moveTimeout) {
      clearTimeout(this.moveTimeout);
      this.moveTimeout = null;
    }
  }

  /**
   * 停止监听
   */
  stop() {
    this.clearTimeouts();
    if (this.map) {
      this.map.off('zoomstart zoom zoomend move');
    }
  }
}

/**
 * 标记缓存管理器
 * 缓存标记的DOM元素，避免重复创建
 */
export class MarkerCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * 获取缓存的标记
   */
  get(id) {
    const item = this.cache.get(id);
    if (item) {
      // 更新访问时间
      item.lastAccessed = Date.now();
      return item.data;
    }
    return null;
  }

  /**
   * 设置缓存
   */
  set(id, data) {
    // 如果缓存已满，移除最久未使用的
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(id, {
      data,
      lastAccessed: Date.now()
    });
  }

  /**
   * 移除最久未使用的项
   */
  evictLRU() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [id, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldest = id;
      }
    }
    
    if (oldest !== null) {
      this.cache.delete(oldest);
    }
  }

  /**
   * 清除缓存
   */
  clear() {
    this.cache.clear();
  }
}

/**
 * 创建高性能的DivIcon
 * 优化渲染性能
 */
export function createOptimizedDivIcon(options) {
  const { html, className, iconSize, iconAnchor, popupAnchor } = options;
  
  return window.L.divIcon({
    className: className || 'optimized-marker',
    html: html,
    iconSize: iconSize || [40, 50],
    iconAnchor: iconAnchor || [20, 50],
    popupAnchor: popupAnchor || [0, -50],
    // 优化性能
    bgPos: null,
    
  });
}

/**
 * 使用requestIdleCallback或setTimeout进行空闲时渲染
 */
export function renderWhenIdle(callback, timeout = 2000) {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, { timeout });
  } else {
    return setTimeout(callback, 1);
  }
}

/**
 * 检测设备性能
 * @returns {Object} 设备性能信息
 */
export function detectDevicePerformance() {
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const connection = navigator.connection || {};
  
  return {
    memory,
    cores,
    saveData: connection.saveData || false,
    effectiveType: connection.effectiveType || '4g',
    
    // 根据性能返回优化级别
    getOptimizationLevel() {
      if (memory <= 2 || cores <= 2) {
        return 'low'; // 低性能设备
      } else if (memory <= 4 || cores <= 4) {
        return 'medium'; // 中性能设备
      }
      return 'high'; // 高性能设备
    }
  };
}

/**
 * 根据设备性能获取优化配置
 */
export function getPerformanceBasedConfig() {
  const perf = detectDevicePerformance();
  const level = perf.getOptimizationLevel();
  
  const configs = {
    low: {
      batchSize: 20,
      renderDelay: 32,
      enableAnimations: false,
      maxMarkers: 50,
      simplifyMarkers: true
    },
    medium: {
      batchSize: 50,
      renderDelay: 16,
      enableAnimations: true,
      maxMarkers: 100,
      simplifyMarkers: false
    },
    high: {
      batchSize: 100,
      renderDelay: 8,
      enableAnimations: true,
      maxMarkers: 200,
      simplifyMarkers: false
    }
  };
  
  return configs[level];
}

/**
 * 防抖函数（用于地图事件）
 */
export function debounce(fn, delay) {
  let timeout = null;
  return function(...args) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
      timeout = null;
    }, delay);
  };
}

/**
 * 节流函数（用于地图事件）
 */
export function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
