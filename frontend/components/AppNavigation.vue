<template>
  <view class="app-navigation">
    <!-- 顶部导航栏 -->
    <view class="top-nav" :class="{ 'hidden': isMobile && !showMobileNav }">
      <!-- Logo区域 -->
      <view class="nav-brand" @click="goToHome">
        <text class="brand-icon">🏯</text>
        <text class="brand-text" v-if="!isMobile">古建筑导览</text>
      </view>

      <!-- 桌面端导航菜单 -->
      <view class="nav-menu" v-if="!isMobile">
        <view
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: currentPath === item.path }"
          @click="navigateTo(item.path)"
        >
          <text class="nav-icon">{{ item.icon }}</text>
          <text class="nav-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 右侧操作区 -->
      <view class="nav-actions">
        <view class="nav-action-btn" @click="toggleTheme" title="切换主题">
          <text class="action-icon">{{ isDarkMode ? '☀️' : '🌙' }}</text>
        </view>
        <view class="nav-action-btn" @click="goToSettings" title="设置">
          <text class="action-icon">⚙️</text>
        </view>
      </view>

      <!-- 移动端菜单按钮 -->
      <view class="mobile-menu-btn" v-if="isMobile" @click="toggleMobileNav">
        <text class="menu-icon">{{ showMobileNav ? '✕' : '☰' }}</text>
      </view>
    </view>

    <!-- 移动端侧边导航 -->
    <view class="mobile-nav-mask" :class="{ show: showMobileNav }" @click="hideMobileNav"></view>
    <view class="mobile-nav" :class="{ show: showMobileNav }">
      <view class="mobile-nav-header">
        <text class="mobile-nav-title">🏯 古建筑导览</text>
        <text class="mobile-nav-close" @click="hideMobileNav">✕</text>
      </view>
      <scroll-view class="mobile-nav-content" scroll-y>
        <view
          v-for="item in navItems"
          :key="item.path"
          class="mobile-nav-item"
          :class="{ active: currentPath === item.path }"
          @click="navigateTo(item.path)"
        >
          <text class="mobile-nav-icon">{{ item.icon }}</text>
          <text class="mobile-nav-text">{{ item.name }}</text>
          <text class="mobile-nav-arrow">›</text>
        </view>
      </scroll-view>
    </view>

    <!-- 面包屑导航 -->
    <view class="breadcrumb" v-if="showBreadcrumb && breadcrumbs.length > 1">
      <view class="breadcrumb-list">
        <view
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-item"
          :class="{ 'is-last': index === breadcrumbs.length - 1 }"
        >
          <text
            class="breadcrumb-link"
            :class="{ 'is-link': index < breadcrumbs.length - 1 }"
            @click="index < breadcrumbs.length - 1 && navigateTo(item.path)"
          >{{ item.name }}</text>
          <text class="breadcrumb-separator" v-if="index < breadcrumbs.length - 1">/</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏（移动端） -->
    <view class="bottom-nav" v-if="isMobile && showBottomNav">
      <view
        v-for="item in bottomNavItems"
        :key="item.path"
        class="bottom-nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigateTo(item.path)"
      >
        <text class="bottom-nav-icon">{{ item.icon }}</text>
        <text class="bottom-nav-text">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AppNavigation',

  props: {
    showBreadcrumb: {
      type: Boolean,
      default: true
    },
    showBottomNav: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      isMobile: false,
      showMobileNav: false,
      currentPath: '',
      isDarkMode: false,
      windowWidth: 0,

      // 导航配置
      navItems: [
        { name: '首页', path: '/pages/home/home', icon: '🏠' },
        { name: 'AI导览', path: '/pages/index/index', icon: '💬' },
        { name: '古建筑名录', path: '/pages/map/map', icon: '🗺️' },
        { name: '我的收藏', path: '/pages/favorites/favorites', icon: '⭐' }
      ],

      // 底部导航配置（移动端）
      bottomNavItems: [
        { name: '首页', path: '/pages/home/home', icon: '🏠' },
        { name: '名录', path: '/pages/map/map', icon: '🗺️' },
        { name: 'AI导览', path: '/pages/index/index', icon: '💬' },
        { name: '收藏', path: '/pages/favorites/favorites', icon: '⭐' }
      ],

      // 面包屑映射
      breadcrumbMap: {
        '/pages/home/home': '首页',
        '/pages/index/index': 'AI导览',
        '/pages/map/map': '古建筑名录',
        '/pages/detail/detail': '详情',
        '/pages/viewer/viewer': '3D导览',
        '/pages/favorites/favorites': '我的收藏',
        '/pages/settings/settings': '设置',
        '/pages/dev-settings/dev-settings': '开发设置'
      }
    };
  },

  computed: {
    breadcrumbs() {
      const paths = this.currentPath.split('/').filter(Boolean);
      const breadcrumbs = [];
      let currentPath = '';

      // 添加首页
      breadcrumbs.push({ name: '首页', path: '/pages/home/home' });

      // 构建面包屑路径
      for (let i = 0; i < paths.length; i++) {
        currentPath += '/' + paths[i];
        if (this.breadcrumbMap[currentPath]) {
          breadcrumbs.push({
            name: this.breadcrumbMap[currentPath],
            path: currentPath
          });
        }
      }

      return breadcrumbs;
    }
  },

  mounted() {
    this.initResponsive();
    this.getCurrentPath();

    // 监听窗口大小变化
    uni.onWindowResize(this.handleWindowResize);

    // 监听页面显示
    uni.$on('pageShow', this.getCurrentPath);
  },

  beforeDestroy() {
    uni.offWindowResize(this.handleWindowResize);
    uni.$off('pageShow', this.getCurrentPath);
  },

  methods: {
    // 初始化响应式
    initResponsive() {
      const systemInfo = uni.getSystemInfoSync();
      this.windowWidth = systemInfo.windowWidth;
      this.isMobile = systemInfo.windowWidth < 768;
    },

    // 处理窗口大小变化
    handleWindowResize(res) {
      this.windowWidth = res.size.windowWidth;
      this.isMobile = res.size.windowWidth < 768;

      if (!this.isMobile) {
        this.showMobileNav = false;
      }
    },

    // 获取当前页面路径
    getCurrentPath() {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        this.currentPath = '/' + currentPage.route;
      }
    },

    // 页面跳转
    navigateTo(path) {
      if (this.currentPath === path) {
        this.hideMobileNav();
        return;
      }

      uni.switchTab({
        url: path,
        fail: () => {
          uni.navigateTo({
            url: path,
            fail: (err) => {
              console.error('导航失败:', err);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });

      this.hideMobileNav();
    },

    // 返回首页
    goToHome() {
      this.navigateTo('/pages/home/home');
    },

    // 前往设置
    goToSettings() {
      this.navigateTo('/pages/settings/settings');
    },

    // 切换移动端导航
    toggleMobileNav() {
      this.showMobileNav = !this.showMobileNav;
    },

    // 隐藏移动端导航
    hideMobileNav() {
      this.showMobileNav = false;
    },

    // 切换主题
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      // 触发主题切换事件
      uni.$emit('themeChange', this.isDarkMode);

      uni.showToast({
        title: this.isDarkMode ? '已切换至深色模式' : '已切换至浅色模式',
        icon: 'none',
        duration: 1500
      });
    }
  }
};
</script>

<style scoped>
.app-navigation {
  position: relative;
  z-index: 1000;
}

/* ========== 顶部导航栏 ========== */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
  box-shadow: 0 4rpx 20rpx rgba(139, 69, 19, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.top-nav.hidden {
  transform: translateY(-100%);
}

/* 品牌区域 */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
  cursor: pointer;
  padding: 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.nav-brand:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-brand:active {
  transform: scale(0.98);
}

.brand-icon {
  font-size: 48rpx;
}

.brand-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff8e6;
  letter-spacing: 4rpx;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  border-radius: 40rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.nav-item:hover::before {
  width: 200%;
  height: 200%;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 4rpx;
  background: #fff8e6;
  border-radius: 2rpx;
}

.nav-icon {
  font-size: 32rpx;
}

.nav-text {
  font-size: 28rpx;
  color: #fff8e6;
  font-weight: 500;
}

/* 操作按钮 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-action-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.nav-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.nav-action-btn:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 36rpx;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-icon {
  font-size: 40rpx;
  color: #fff8e6;
  font-weight: bold;
}

/* ========== 移动端侧边导航 ========== */
.mobile-nav-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1001;
}

.mobile-nav-mask.show {
  opacity: 1;
  visibility: visible;
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 70%;
  max-width: 500rpx;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 100%);
  box-shadow: 4rpx 0 30rpx rgba(0, 0, 0, 0.2);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  display: flex;
  flex-direction: column;
}

.mobile-nav.show {
  transform: translateX(0);
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx;
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
}

.mobile-nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff8e6;
  letter-spacing: 4rpx;
}

.mobile-nav-close {
  font-size: 40rpx;
  color: #fff8e6;
  padding: 20rpx;
  cursor: pointer;
}

.mobile-nav-content {
  flex: 1;
  padding: 20rpx 0;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  margin: 0 20rpx 16rpx;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
}

.mobile-nav-item:hover,
.mobile-nav-item:active {
  background: rgba(139, 69, 19, 0.1);
  transform: translateX(8rpx);
}

.mobile-nav-item.active {
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  box-shadow: 0 4rpx 16rpx rgba(196, 30, 58, 0.3);
}

.mobile-nav-item.active .mobile-nav-text,
.mobile-nav-item.active .mobile-nav-icon {
  color: #fff8e6;
}

.mobile-nav-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.mobile-nav-text {
  flex: 1;
  font-size: 30rpx;
  color: #3c2a1d;
  font-weight: 500;
}

.mobile-nav-arrow {
  font-size: 36rpx;
  color: #8b7355;
}

.mobile-nav-item.active .mobile-nav-arrow {
  color: #fff8e6;
}

/* ========== 面包屑导航 ========== */
.breadcrumb {
  padding: 20rpx 30rpx;
  background: rgba(248, 244, 232, 0.95);
  border-bottom: 2rpx solid #e8dcc8;
  position: fixed;
  top: 100rpx;
  left: 0;
  right: 0;
  z-index: 999;
  backdrop-filter: blur(10rpx);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.breadcrumb-link {
  font-size: 26rpx;
  color: #8b7355;
  transition: all 0.2s ease;
}

.breadcrumb-link.is-link {
  color: #8b4513;
  cursor: pointer;
}

.breadcrumb-link.is-link:hover {
  color: #c41e3a;
}

.breadcrumb-link.is-last {
  color: #3c2a1d;
  font-weight: 600;
}

.breadcrumb-separator {
  font-size: 24rpx;
  color: #a89078;
}

/* ========== 底部导航栏（移动端） ========== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 100%);
  border-top: 2rpx solid #e8dcc8;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20rpx;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -4rpx 20rpx rgba(139, 69, 19, 0.1);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120rpx;
}

.bottom-nav-item:hover {
  background: rgba(139, 69, 19, 0.05);
}

.bottom-nav-item.active {
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  box-shadow: 0 4rpx 16rpx rgba(196, 30, 58, 0.3);
  transform: translateY(-8rpx);
}

.bottom-nav-icon {
  font-size: 40rpx;
  transition: transform 0.3s ease;
}

.bottom-nav-item.active .bottom-nav-icon {
  transform: scale(1.1);
}

.bottom-nav-text {
  font-size: 22rpx;
  color: #8b7355;
  transition: all 0.3s ease;
}

.bottom-nav-item.active .bottom-nav-text {
  color: #fff8e6;
  font-weight: 600;
}

/* ========== 页面内容区域调整 ========== */
/* 添加顶部导航栏高度的padding */
:global(.page-with-nav) {
  padding-top: 100rpx;
}

/* 添加面包屑高度的padding */
:global(.page-with-breadcrumb) {
  padding-top: 180rpx;
}

/* 添加底部导航栏高度的padding（移动端） */
@media (max-width: 767px) {
  :global(.page-with-bottom-nav) {
    padding-bottom: 140rpx;
  }
}

/* ========== 动画效果 ========== */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-nav-item {
  animation: slideInRight 0.3s ease both;
}

.mobile-nav-item:nth-child(1) { animation-delay: 0.05s; }
.mobile-nav-item:nth-child(2) { animation-delay: 0.1s; }
.mobile-nav-item:nth-child(3) { animation-delay: 0.15s; }
.mobile-nav-item:nth-child(4) { animation-delay: 0.2s; }
.mobile-nav-item:nth-child(5) { animation-delay: 0.25s; }
</style>
