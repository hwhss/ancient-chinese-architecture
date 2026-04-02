/**
 * 缓存管理工具
 * 提供本地存储缓存和内存缓存功能
 */

// 内存缓存
const memoryCache = new Map();

// 缓存配置
const CACHE_CONFIG = {
  // 默认缓存时间（毫秒）
  DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
  
  // 不同API的缓存时间
  TTL: {
    BUILDINGS: 10 * 60 * 1000,      // 建筑列表：10分钟
    BUILDING_DETAIL: 30 * 60 * 1000, // 建筑详情：30分钟
    VISUALIZATION: 5 * 60 * 1000,    // 可视化数据：5分钟
    SEARCH: 2 * 60 * 1000,           // 搜索结果：2分钟
    USER_DATA: 60 * 1000             // 用户数据：1分钟
  },
  
  // 存储键前缀
  PREFIX: 'cache_',
  
  // 最大缓存条目数
  MAX_ITEMS: 100
};

/**
 * 生成缓存键
 * @param {string} key - 原始键
 * @returns {string} - 带前缀的键
 */
function getCacheKey(key) {
  return `${CACHE_CONFIG.PREFIX}${key}`;
}

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} data - 缓存数据
 * @param {number} ttl - 过期时间（毫秒）
 */
export function setCache(key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
  const cacheKey = getCacheKey(key);
  const expires = Date.now() + ttl;
  
  const cacheData = {
    data,
    expires,
    timestamp: Date.now()
  };
  
  // 内存缓存
  memoryCache.set(cacheKey, cacheData);
  
  // 本地存储缓存（异步）
  try {
    uni.setStorage({
      key: cacheKey,
      data: cacheData
    });
  } catch (error) {
    console.warn('本地存储缓存失败:', error);
  }
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any|null} - 缓存数据或null
 */
export function getCache(key) {
  const cacheKey = getCacheKey(key);
  
  // 优先从内存缓存获取
  const memoryData = memoryCache.get(cacheKey);
  if (memoryData && memoryData.expires > Date.now()) {
    return memoryData.data;
  }
  
  // 内存缓存未命中或已过期，尝试从本地存储获取
  try {
    const storageData = uni.getStorageSync(cacheKey);
    if (storageData && storageData.expires > Date.now()) {
      // 重新加载到内存缓存
      memoryCache.set(cacheKey, storageData);
      return storageData.data;
    }
  } catch (error) {
    console.warn('读取本地存储缓存失败:', error);
  }
  
  return null;
}

/**
 * 异步获取缓存（支持从本地存储异步加载）
 * @param {string} key - 缓存键
 * @returns {Promise<any|null>} - 缓存数据或null
 */
export async function getCacheAsync(key) {
  const cacheKey = getCacheKey(key);
  
  // 优先从内存缓存获取
  const memoryData = memoryCache.get(cacheKey);
  if (memoryData && memoryData.expires > Date.now()) {
    return memoryData.data;
  }
  
  // 尝试从本地存储获取
  return new Promise((resolve) => {
    uni.getStorage({
      key: cacheKey,
      success: (res) => {
        if (res.data && res.data.expires > Date.now()) {
          // 重新加载到内存缓存
          memoryCache.set(cacheKey, res.data);
          resolve(res.data.data);
        } else {
          resolve(null);
        }
      },
      fail: () => {
        resolve(null);
      }
    });
  });
}

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
export function removeCache(key) {
  const cacheKey = getCacheKey(key);
  
  // 删除内存缓存
  memoryCache.delete(cacheKey);
  
  // 删除本地存储缓存
  try {
    uni.removeStorageSync(cacheKey);
  } catch (error) {
    console.warn('删除本地存储缓存失败:', error);
  }
}

/**
 * 清空所有缓存
 */
export function clearAllCache() {
  // 清空内存缓存
  memoryCache.clear();
  
  // 清空本地存储中的缓存项
  try {
    const keys = uni.getStorageInfoSync().keys || [];
    keys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        uni.removeStorageSync(key);
      }
    });
  } catch (error) {
    console.warn('清空缓存失败:', error);
  }
}

/**
 * 清理过期缓存
 */
export function cleanExpiredCache() {
  const now = Date.now();
  
  // 清理内存缓存
  for (const [key, value] of memoryCache.entries()) {
    if (value.expires <= now) {
      memoryCache.delete(key);
    }
  }
  
  // 清理本地存储缓存
  try {
    const keys = uni.getStorageInfoSync().keys || [];
    keys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        try {
          const data = uni.getStorageSync(key);
          if (data && data.expires <= now) {
            uni.removeStorageSync(key);
          }
        } catch (e) {
          // 忽略读取错误
        }
      }
    });
  } catch (error) {
    console.warn('清理过期缓存失败:', error);
  }
}

/**
 * 获取缓存统计信息
 * @returns {Object} - 缓存统计
 */
export function getCacheStats() {
  let storageCount = 0;
  
  try {
    const keys = uni.getStorageInfoSync().keys || [];
    storageCount = keys.filter(key => key.startsWith(CACHE_CONFIG.PREFIX)).length;
  } catch (error) {
    console.warn('获取缓存统计失败:', error);
  }
  
  return {
    memoryCount: memoryCache.size,
    storageCount,
    totalCount: memoryCache.size + storageCount
  };
}

/**
 * 带缓存的API请求封装
 * @param {Function} fetchFn - 获取数据的函数
 * @param {string} cacheKey - 缓存键
 * @param {number} ttl - 缓存时间
 * @param {boolean} forceRefresh - 是否强制刷新
 * @returns {Promise<any>} - 数据
 */
export async function withCache(fetchFn, cacheKey, ttl = CACHE_CONFIG.DEFAULT_TTL, forceRefresh = false) {
  // 如果不强制刷新，先尝试从缓存获取
  if (!forceRefresh) {
    const cached = await getCacheAsync(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }
  
  // 从服务器获取数据
  const data = await fetchFn();
  
  // 存入缓存
  setCache(cacheKey, data, ttl);
  
  return data;
}

// 导出配置
export { CACHE_CONFIG };

// 定期清理过期缓存（每5分钟）
setInterval(cleanExpiredCache, 5 * 60 * 1000);
