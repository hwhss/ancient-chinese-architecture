/**
 * 收藏夹管理器
 * 管理收藏夹的创建、编辑、删除和收藏项的分类
 */

const COLLECTIONS_KEY = 'FAVORITE_COLLECTIONS';
const FAVORITES_KEY = 'FAVORITE_BUILDINGS';

// 默认收藏夹
const DEFAULT_COLLECTION = {
  id: 'default',
  name: '我的收藏',
  cover: '',
  count: 0,
  createdAt: Date.now(),
  isDefault: true,
  sortOrder: 0
};

/**
 * 获取所有收藏夹
 */
export function getCollections() {
  try {
    const collections = uni.getStorageSync(COLLECTIONS_KEY);
    if (collections && Array.isArray(collections) && collections.length > 0) {
      return collections;
    }
    // 如果没有收藏夹，创建默认收藏夹
    const defaultCollections = [DEFAULT_COLLECTION];
    uni.setStorageSync(COLLECTIONS_KEY, defaultCollections);
    return defaultCollections;
  } catch (e) {
    console.warn('获取收藏夹失败:', e);
    return [DEFAULT_COLLECTION];
  }
}

/**
 * 保存收藏夹列表
 */
export function saveCollections(collections) {
  try {
    uni.setStorageSync(COLLECTIONS_KEY, collections);
    return true;
  } catch (e) {
    console.warn('保存收藏夹失败:', e);
    return false;
  }
}

/**
 * 创建新收藏夹
 * @param {string} name 收藏夹名称
 * @param {string} cover 封面图片URL（可选）
 */
export function createCollection(name, cover = '') {
  if (!name || name.trim() === '') {
    return { success: false, message: '收藏夹名称不能为空' };
  }

  const collections = getCollections();

  // 检查名称是否已存在
  if (collections.some(c => c.name === name.trim())) {
    return { success: false, message: '收藏夹名称已存在' };
  }

  const newCollection = {
    id: 'collection_' + Date.now(),
    name: name.trim(),
    cover: cover,
    count: 0,
    createdAt: Date.now(),
    isDefault: false,
    sortOrder: collections.length
  };

  collections.push(newCollection);
  saveCollections(collections);

  return { success: true, data: newCollection };
}

/**
 * 编辑收藏夹
 * @param {string} collectionId 收藏夹ID
 * @param {object} updates 更新的字段
 */
export function updateCollection(collectionId, updates) {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);

  if (index === -1) {
    return { success: false, message: '收藏夹不存在' };
  }

  // 不能修改默认收藏夹的名称
  if (collections[index].isDefault && updates.name) {
    delete updates.name;
  }

  // 检查新名称是否与其他收藏夹冲突
  if (updates.name) {
    const trimmedName = updates.name.trim();
    if (collections.some((c, i) => i !== index && c.name === trimmedName)) {
      return { success: false, message: '收藏夹名称已存在' };
    }
    updates.name = trimmedName;
  }

  collections[index] = { ...collections[index], ...updates };
  saveCollections(collections);

  return { success: true, data: collections[index] };
}

/**
 * 删除收藏夹
 * @param {string} collectionId 收藏夹ID
 * @param {boolean} moveToDefault 是否将收藏项移到默认收藏夹
 */
export function deleteCollection(collectionId, moveToDefault = true) {
  const collections = getCollections();
  const index = collections.findIndex(c => c.id === collectionId);

  if (index === -1) {
    return { success: false, message: '收藏夹不存在' };
  }

  // 不能删除默认收藏夹
  if (collections[index].isDefault) {
    return { success: false, message: '不能删除默认收藏夹' };
  }

  // 如果需要，将收藏项移到默认收藏夹
  if (moveToDefault) {
    moveFavoritesToCollection(collectionId, 'default');
  } else {
    // 删除该收藏夹下的所有收藏
    removeFavoritesByCollection(collectionId);
  }

  collections.splice(index, 1);
  saveCollections(collections);

  return { success: true };
}

/**
 * 获取收藏夹中的收藏项
 * @param {string} collectionId 收藏夹ID
 */
export function getFavoritesByCollection(collectionId = 'default') {
  try {
    const favorites = uni.getStorageSync(FAVORITES_KEY) || [];
    if (collectionId === 'all') {
      return favorites;
    }
    return favorites.filter(f => f.collectionId === collectionId || (!f.collectionId && collectionId === 'default'));
  } catch (e) {
    console.warn('获取收藏项失败:', e);
    return [];
  }
}

/**
 * 将收藏项移动到指定收藏夹
 * @param {string} favoriteId 收藏项ID
 * @param {string} targetCollectionId 目标收藏夹ID
 */
export function moveFavoriteToCollection(favoriteId, targetCollectionId) {
  try {
    const favorites = uni.getStorageSync(FAVORITES_KEY) || [];
    const index = favorites.findIndex(f => f.id === favoriteId);

    if (index === -1) {
      return { success: false, message: '收藏项不存在' };
    }

    // 检查目标收藏夹是否存在
    const collections = getCollections();
    if (!collections.some(c => c.id === targetCollectionId)) {
      return { success: false, message: '目标收藏夹不存在' };
    }

    const oldCollectionId = favorites[index].collectionId || 'default';
    favorites[index].collectionId = targetCollectionId;

    uni.setStorageSync(FAVORITES_KEY, favorites);

    // 更新收藏夹计数
    updateCollectionCount(oldCollectionId);
    updateCollectionCount(targetCollectionId);

    return { success: true };
  } catch (e) {
    console.warn('移动收藏项失败:', e);
    return { success: false, message: '移动失败' };
  }
}

/**
 * 批量移动收藏项
 * @param {array} favoriteIds 收藏项ID数组
 * @param {string} targetCollectionId 目标收藏夹ID
 */
export function batchMoveFavoritesToCollection(favoriteIds, targetCollectionId) {
  try {
    const favorites = uni.getStorageSync(FAVORITES_KEY) || [];
    const affectedCollections = new Set();

    favoriteIds.forEach(id => {
      const index = favorites.findIndex(f => f.id === id);
      if (index !== -1) {
        affectedCollections.add(favorites[index].collectionId || 'default');
        favorites[index].collectionId = targetCollectionId;
      }
    });

    uni.setStorageSync(FAVORITES_KEY, favorites);

    // 更新所有受影响的收藏夹计数
    affectedCollections.forEach(collectionId => {
      updateCollectionCount(collectionId || 'default');
    });
    updateCollectionCount(targetCollectionId);

    return { success: true };
  } catch (e) {
    console.warn('批量移动收藏项失败:', e);
    return { success: false, message: '批量移动失败' };
  }
}

/**
 * 更新收藏夹的收藏数量
 * @param {string} collectionId 收藏夹ID
 */
export function updateCollectionCount(collectionId) {
  const count = getFavoritesByCollection(collectionId).length;
  updateCollection(collectionId, { count });
}

/**
 * 将收藏项移到另一个收藏夹（内部方法）
 * @param {string} fromCollectionId 源收藏夹ID
 * @param {string} toCollectionId 目标收藏夹ID
 */
function moveFavoritesToCollection(fromCollectionId, toCollectionId) {
  try {
    const favorites = uni.getStorageSync(FAVORITES_KEY) || [];
    favorites.forEach(f => {
      if (f.collectionId === fromCollectionId) {
        f.collectionId = toCollectionId;
      }
    });
    uni.setStorageSync(FAVORITES_KEY, favorites);
    updateCollectionCount(toCollectionId);
  } catch (e) {
    console.warn('移动收藏项失败:', e);
  }
}

/**
 * 删除指定收藏夹下的所有收藏（内部方法）
 * @param {string} collectionId 收藏夹ID
 */
function removeFavoritesByCollection(collectionId) {
  try {
    let favorites = uni.getStorageSync(FAVORITES_KEY) || [];
    favorites = favorites.filter(f => f.collectionId !== collectionId);
    uni.setStorageSync(FAVORITES_KEY, favorites);
  } catch (e) {
    console.warn('删除收藏项失败:', e);
  }
}

/**
 * 获取收藏统计数据
 */
export function getCollectionStats() {
  const collections = getCollections();
  const favorites = uni.getStorageSync(FAVORITES_KEY) || [];

  return {
    totalCollections: collections.length,
    totalFavorites: favorites.length,
    collections: collections.map(c => ({
      ...c,
      actualCount: favorites.filter(f => f.collectionId === c.id || (!f.collectionId && c.id === 'default')).length
    }))
  };
}

/**
 * 初始化收藏夹系统（迁移旧数据）
 */
export function initializeCollections() {
  const collections = getCollections();

  // 如果已经有收藏夹，检查是否需要迁移旧数据
  if (collections.length > 0) {
    const favorites = uni.getStorageSync(FAVORITES_KEY) || [];

    // 为没有 collectionId 的收藏项设置默认收藏夹
    let needUpdate = false;
    favorites.forEach(f => {
      if (!f.collectionId) {
        f.collectionId = 'default';
        needUpdate = true;
      }
    });

    if (needUpdate) {
      uni.setStorageSync(FAVORITES_KEY, favorites);
    }

    // 更新所有收藏夹的计数
    collections.forEach(c => {
      updateCollectionCount(c.id);
    });
  }
}
