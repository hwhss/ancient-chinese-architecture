/**
 * 带缓存优化的API服务
 * 在原有API基础上增加缓存层
 */

import * as api from './api.js';
import { withCache, CACHE_CONFIG } from '../utils/cache.js';

/**
 * 生成缓存键
 * @param {string} prefix - 前缀
 * @param {Object} params - 参数
 * @returns {string} - 缓存键
 */
function generateCacheKey(prefix, params = {}) {
  const paramsStr = Object.keys(params).length > 0 
    ? '_' + Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}_${v}`)
        .join('_')
    : '';
  return `${prefix}${paramsStr}`;
}

// 健康检查（不缓存）
export async function healthCheck() {
  return api.healthCheck();
}

// 聊天（不缓存）
export async function chat(question) {
  return api.chat(question);
}

// 获取建筑列表（带缓存）
export async function getBuildings(params = {}, forceRefresh = false) {
  const cacheKey = generateCacheKey('buildings', params);
  return withCache(
    () => api.getBuildings(params),
    cacheKey,
    CACHE_CONFIG.TTL.BUILDINGS,
    forceRefresh
  );
}

// 获取建筑详情（带缓存）
export async function getBuildingById(id, forceRefresh = false) {
  const cacheKey = `building_${id}`;
  return withCache(
    () => api.getBuildingById(id),
    cacheKey,
    CACHE_CONFIG.TTL.BUILDING_DETAIL,
    forceRefresh
  );
}

// 获取建筑3D模型（不缓存）
export async function getBuildingModel3d(id) {
  return api.getBuildingModel3d(id);
}

// 获取建筑3D模型清单（不缓存）
export async function getBuildingModel3dManifest(id) {
  return api.getBuildingModel3dManifest(id);
}

// 刷新签名资源令牌（不缓存）
export async function refreshSignedAssetToken(token) {
  return api.refreshSignedAssetToken(token);
}

// 获取素材详情（带缓存）
export async function getMaterialById(materialId, forceRefresh = false) {
  const cacheKey = `material_${materialId}`;
  return withCache(
    () => api.getMaterialById(materialId),
    cacheKey,
    CACHE_CONFIG.TTL.BUILDING_DETAIL,
    forceRefresh
  );
}

// 获取可视化概览（带缓存）
export async function getVisualizationOverview(forceRefresh = false) {
  return withCache(
    () => api.getVisualizationOverview(),
    'visualization_overview',
    CACHE_CONFIG.TTL.VISUALIZATION,
    forceRefresh
  );
}

// 获取可视化地图点位（带缓存）
export async function getVisualizationMapPoints(forceRefresh = false) {
  return withCache(
    () => api.getVisualizationMapPoints(),
    'visualization_map_points',
    CACHE_CONFIG.TTL.VISUALIZATION,
    forceRefresh
  );
}

// 获取可视化时间轴（带缓存）
export async function getVisualizationTimeline(params = {}, forceRefresh = false) {
  const cacheKey = generateCacheKey('visualization_timeline', params);
  return withCache(
    () => api.getVisualizationTimeline(params),
    cacheKey,
    CACHE_CONFIG.TTL.VISUALIZATION,
    forceRefresh
  );
}

// 获取可视化统计（带缓存）
export async function getVisualizationStats(params = {}, forceRefresh = false) {
  const cacheKey = generateCacheKey('visualization_stats', params);
  return withCache(
    () => api.getVisualizationStats(params),
    cacheKey,
    CACHE_CONFIG.TTL.VISUALIZATION,
    forceRefresh
  );
}

// 导出基础API方法
export {
  getApiBaseUrl,
  setApiBaseUrl,
  clearApiBaseUrl
} from './api.js';
