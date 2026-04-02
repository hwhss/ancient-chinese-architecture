/**
 * HTTP缓存策略优化
 * 提供请求去重、缓存控制和网络优化功能
 */

import { getCache, setCache, CACHE_CONFIG } from './cache.js';

// 请求去重映射
const pendingRequests = new Map();

/**
 * 生成请求唯一标识
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {string} - 请求标识
 */
function generateRequestId(url, data = {}) {
  const dataStr = JSON.stringify(data);
  return `${url}_${dataStr}`;
}

/**
 * 带去重的请求封装
 * @param {Function} requestFn - 请求函数
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @returns {Promise} - 请求结果
 */
export function deduplicatedRequest(requestFn, url, data = {}) {
  const requestId = generateRequestId(url, data);
  
  // 检查是否有相同请求正在进行
  if (pendingRequests.has(requestId)) {
    return pendingRequests.get(requestId);
  }
  
  // 创建新请求
  const requestPromise = requestFn().finally(() => {
    // 请求完成后移除
    pendingRequests.delete(requestId);
  });
  
  pendingRequests.set(requestId, requestPromise);
  return requestPromise;
}

/**
 * 智能缓存请求
 * 根据请求类型自动选择缓存策略
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 配置选项
 */
export async function smartCachedRequest(requestFn, options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    cacheKey,
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    forceRefresh = false,
    deduplicate = true
  } = options;
  
  // POST请求不使用缓存
  if (method !== 'GET') {
    return deduplicate 
      ? deduplicatedRequest(requestFn, url, data)
      : requestFn();
  }
  
  // 生成缓存键
  const key = cacheKey || generateRequestId(url, data);
  
  // 尝试从缓存获取
  if (!forceRefresh) {
    const cached = getCache(key);
    if (cached !== null) {
      return cached;
    }
  }
  
  // 执行请求
  const requestPromise = deduplicate
    ? deduplicatedRequest(requestFn, url, data)
    : requestFn();
  
  const result = await requestPromise;
  
  // 存入缓存
  setCache(key, result, ttl);
  
  return result;
}

/**
 * 请求合并器
 * 将多个相同类型的请求合并为一个
 */
export class RequestBatcher {
  constructor(batchFn, delay = 50) {
    this.batchFn = batchFn;
    this.delay = delay;
    this.batch = [];
    this.timer = null;
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.batch.push({
        request,
        resolve,
        reject
      });
      
      this.scheduleBatch();
    });
  }
  
  scheduleBatch() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.executeBatch();
    }, this.delay);
  }
  
  async executeBatch() {
    const currentBatch = [...this.batch];
    this.batch = [];
    this.timer = null;
    
    if (currentBatch.length === 0) return;
    
    try {
      const requests = currentBatch.map(item => item.request);
      const results = await this.batchFn(requests);
      
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error);
      });
    }
  }
}

/**
 * 网络状态检测
 * @returns {Object} - 网络状态信息
 */
export function getNetworkStatus() {
  // #ifdef H5
  if (typeof navigator !== 'undefined') {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
  }
  // #endif
  
  // 默认返回未知状态
  return {
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  };
}

/**
 * 根据网络状态调整请求策略
 * @returns {Object} - 优化后的请求配置
 */
export function getOptimizedRequestConfig() {
  const networkStatus = getNetworkStatus();
  
  // 根据网络状态调整配置
  switch (networkStatus.effectiveType) {
    case '4g':
      return {
        timeout: 10000,
        retryCount: 1,
        enableCache: true,
        imageQuality: 'high'
      };
    case '3g':
      return {
        timeout: 15000,
        retryCount: 2,
        enableCache: true,
        imageQuality: 'medium'
      };
    case '2g':
    case 'slow-2g':
      return {
        timeout: 30000,
        retryCount: 3,
        enableCache: true,
        imageQuality: 'low'
      };
    default:
      return {
        timeout: 10000,
        retryCount: 2,
        enableCache: true,
        imageQuality: 'medium'
      };
  }
}

/**
 * 请求重试包装器
 * @param {Function} requestFn - 请求函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟
 */
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 如果是最后一次尝试，抛出错误
      if (i === maxRetries) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
}

/**
 * 缓存优先策略
 * 优先使用缓存，同时后台更新
 * @param {Function} fetchFn - 获取数据函数
 * @param {string} cacheKey - 缓存键
 * @param {number} ttl - 缓存时间
 */
export async function cacheFirstStrategy(fetchFn, cacheKey, ttl = CACHE_CONFIG.DEFAULT_TTL) {
  // 尝试获取缓存
  const cached = getCache(cacheKey);
  
  // 后台更新Promise
  const backgroundUpdate = async () => {
    try {
      const fresh = await fetchFn();
      setCache(cacheKey, fresh, ttl);
      return fresh;
    } catch (error) {
      console.warn('Background update failed:', error);
      return null;
    }
  };
  
  if (cached !== null) {
    // 有缓存，先返回缓存，后台更新
    backgroundUpdate();
    return cached;
  }
  
  // 无缓存，等待请求完成
  const fresh = await fetchFn();
  setCache(cacheKey, fresh, ttl);
  return fresh;
}

/**
 * 网络优先策略
 * 优先使用网络，失败时使用缓存
 * @param {Function} fetchFn - 获取数据函数
 * @param {string} cacheKey - 缓存键
 * @param {number} ttl - 缓存时间
 */
export async function networkFirstStrategy(fetchFn, cacheKey, ttl = CACHE_CONFIG.DEFAULT_TTL) {
  try {
    // 优先尝试网络请求
    const fresh = await fetchFn();
    setCache(cacheKey, fresh, ttl);
    return fresh;
  } catch (error) {
    // 网络失败，尝试使用缓存
    const cached = getCache(cacheKey);
    if (cached !== null) {
      return cached;
    }
    // 无缓存，抛出错误
    throw error;
  }
}

/**
 * 仅网络策略
 * 只使用网络，不使用缓存
 * @param {Function} fetchFn - 获取数据函数
 */
export async function networkOnlyStrategy(fetchFn) {
  return fetchFn();
}

/**
 * 仅缓存策略
 * 只使用缓存，不发起网络请求
 * @param {string} cacheKey - 缓存键
 */
export async function cacheOnlyStrategy(cacheKey) {
  const cached = getCache(cacheKey);
  if (cached !== null) {
    return cached;
  }
  throw new Error('Cache not found');
}
