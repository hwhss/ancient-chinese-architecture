/**
 * 统一导航工具
 * 自动判断使用 switchTab 还是 navigateTo
 */

// TabBar页面列表
const TABBAR_PAGES = [
  '/pages/home/home',
  '/pages/map/map',
  '/pages/index/index',
  '/pages/favorites/favorites'
];

/**
 * 智能页面跳转
 * @param {string} url - 目标页面路径
 * @param {Object} options - 额外选项
 */
export function navigateTo(url, options = {}) {
  const { success, fail, complete } = options;
  
  // 检查是否是TabBar页面
  const isTabBarPage = TABBAR_PAGES.some(page => url.startsWith(page));
  
  if (isTabBarPage) {
    // TabBar页面使用 switchTab
    uni.switchTab({
      url,
      success,
      fail: (err) => {
        console.error('switchTab 失败:', err);
        // 如果失败，尝试使用 navigateTo
        uni.navigateTo({
          url,
          success,
          fail: (err2) => {
            console.error('navigateTo 也失败:', err2);
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
            if (fail) fail(err2);
          },
          complete
        });
      },
      complete
    });
  } else {
    // 普通页面使用 navigateTo
    uni.navigateTo({
      url,
      success,
      fail: (err) => {
        console.error('navigateTo 失败:', err);
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
        if (fail) fail(err);
      },
      complete
    });
  }
}

/**
 * 返回上一页
 */
export function navigateBack(options = {}) {
  const { delta = 1, success, fail, complete } = options;
  
  uni.navigateBack({
    delta,
    success,
    fail: (err) => {
      console.error('返回失败:', err);
      // 如果返回失败，可能是已经在首页，跳转到首页
      uni.switchTab({
        url: '/pages/home/home'
      });
      if (fail) fail(err);
    },
    complete
  });
}

/**
 * 重定向到指定页面（关闭当前页面）
 * @param {string} url - 目标页面路径
 */
export function redirectTo(url, options = {}) {
  const { success, fail, complete } = options;
  
  uni.redirectTo({
    url,
    success,
    fail: (err) => {
      console.error('redirectTo 失败:', err);
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      });
      if (fail) fail(err);
    },
    complete
  });
}

/**
 * 跳转到首页
 */
export function goToHome() {
  uni.switchTab({
    url: '/pages/home/home'
  });
}

/**
 * 跳转到地图页面
 */
export function goToMap(category = '') {
  const url = category 
    ? `/pages/map/map?category=${category}`
    : '/pages/map/map';
  
  uni.switchTab({ url });
}

/**
 * 跳转到AI导览页面
 */
export function goToChat() {
  uni.switchTab({
    url: '/pages/index/index'
  });
}

/**
 * 跳转到收藏页面
 */
export function goToFavorites() {
  uni.switchTab({
    url: '/pages/favorites/favorites'
  });
}

/**
 * 跳转到设置页面
 */
export function goToSettings() {
  uni.navigateTo({
    url: '/pages/settings/settings'
  });
}

/**
 * 跳转到详情页面
 * @param {string|number} materialId - 素材ID
 * @param {string} name - 素材名称
 */
export function goToDetail(materialId, name = '') {
  const url = name
    ? `/pages/detail/detail?materialId=${materialId}&name=${encodeURIComponent(name)}`
    : `/pages/detail/detail?materialId=${materialId}`;
  
  uni.navigateTo({ url });
}

/**
 * 跳转到3D浏览页面
 * @param {string|number} materialId - 素材ID
 */
export function goToViewer(materialId) {
  uni.navigateTo({
    url: `/pages/viewer/viewer?materialId=${materialId}`
  });
}

/**
 * 获取当前页面路径
 * @returns {string} 当前页面路径
 */
export function getCurrentPage() {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    return '/' + pages[pages.length - 1].route;
  }
  return '';
}

/**
 * 检查是否是TabBar页面
 * @param {string} path - 页面路径
 * @returns {boolean}
 */
export function isTabBarPage(path) {
  return TABBAR_PAGES.some(page => path.startsWith(page));
}

// 导出TabBar页面列表
export { TABBAR_PAGES };
