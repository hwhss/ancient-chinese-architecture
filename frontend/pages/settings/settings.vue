<template>
  <view class="container">
    <!-- 背景层 -->
    <view class="radial-gradient-bg"></view>
    <view class="cloud-background"></view>

    <!-- 顶部导航 -->
    <view class="header">
      <view class="page-container">
        <view class="header-inner">
          <view class="back-btn btn-ink" @click="goBack">
            <TraditionalIcon name="arrow-left" size="32" color="#fff" />
            <text class="back-text">返回</text>
          </view>
          <text class="header-title">设置</text>
          <view class="header-right"></view>
        </view>
      </view>
    </view>

    <!-- 设置内容 -->
    <scroll-view class="settings-content" scroll-y>
      <view class="page-container">
        <!-- 通用设置 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">通用</text>
          </view>
  
          <view class="settings-list shadow-medium">
            <!-- 清除缓存 -->
            <view class="setting-item tap-feedback" @click="clearCache">
              <view class="item-left">
                <TraditionalIcon name="trash" size="36" color="var(--primary)" />
                <text class="item-label">清除缓存</text>
              </view>
              <view class="item-right">
                <text class="item-value">{{ cacheSize }}</text>
                <text class="item-arrow">›</text>
              </view>
            </view>
  
            <!-- 消息通知 -->
            <view class="setting-item tap-feedback" @click="toggleNotification">
              <view class="item-left">
                <TraditionalIcon name="notification" size="36" color="var(--secondary)" />
                <text class="item-label">消息通知</text>
              </view>
              <view class="item-right">
                <view class="custom-switch small" :class="{ 'active': notificationsEnabled }">
                  <view class="switch-thumb"></view>
                </view>
              </view>
            </view>

            <!-- 图片来源 -->
            <view class="setting-item tap-feedback" @click="chooseImageSource">
              <view class="item-left">
                <TraditionalIcon name="tower" size="36" color="var(--secondary)" />
                <text class="item-label">图片来源</text>
              </view>
              <view class="item-right">
                <text class="item-value">{{ imageSourceText }}</text>
                <text class="item-arrow">›</text>
              </view>
            </view>
          </view>
        </view>
  
        <!-- 隐私与安全 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">隐私与安全</text>
          </view>
  
          <view class="settings-list shadow-medium">
            <!-- 隐私政策 -->
            <view class="setting-item tap-feedback" @click="openPrivacyPolicy">
              <view class="item-left">
                <TraditionalIcon name="privacy" size="36" color="var(--secondary)" />
                <text class="item-label">隐私政策</text>
              </view>
              <view class="item-right">
                <text class="item-arrow">›</text>
              </view>
            </view>
  
            <!-- 用户协议 -->
            <view class="setting-item tap-feedback" @click="openUserAgreement">
              <view class="item-left">
                <TraditionalIcon name="agreement" size="36" color="var(--secondary)" />
                <text class="item-label">用户协议</text>
              </view>
              <view class="item-right">
                <text class="item-arrow">›</text>
              </view>
            </view>
          </view>
        </view>
  
        <!-- 关于 -->
        <view class="settings-section about-section shadow-medium rice-paper">
          <view class="about-content">
            <view class="app-logo-wrapper">
              <TraditionalIcon name="palace" size="100" color="var(--primary)" />
            </view>
            <text class="app-name ink-pressed">中华古建筑导览</text>
            <text class="app-version">版本 {{ appVersion }}</text>
            <text class="app-slogan">探索千年文明，感受建筑之美</text>
          </view>
  
          <!-- 检查更新 -->
          <view class="update-btn btn-ink" @click="checkUpdate">
            <text class="update-text">检查更新</text>
            <text v-if="hasUpdate" class="update-badge">NEW</text>
          </view>
        </view>
  
        <!-- 系统设置 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">系统</text>
          </view>
  
          <view class="settings-list shadow-medium">
            <!-- 开发设置 -->
            <view class="setting-item tap-feedback" @click="goToDevSettings">
              <view class="item-left">
                <TraditionalIcon name="defense" size="36" color="var(--primary)" />
                <text class="item-label">开发设置</text>
              </view>
              <view class="item-right">
                <text class="item-arrow">›</text>
              </view>
            </view>
          </view>
        </view>
  
        <!-- 退出登录 -->
        <view v-if="isLoggedIn" class="settings-section">
          <view class="logout-btn btn-ink" @click="logout">
            <text class="logout-text">退出登录</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import TraditionalIcon from '../../components/shared/TraditionalIcon.vue';
import { getImageSourceSetting, setImageSourceSetting } from '../../services/api';

export default {
  components: {
    TraditionalIcon
  },
  data() {
    return {
      // 通知
      notificationsEnabled: true,
      imageSource: 'server',

      // 缓存
      cacheSize: '0 MB',

      // 应用信息
      appVersion: '1.0.0',
      hasUpdate: false,
      isLoggedIn: false
    }
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    goToDevSettings() {
      uni.navigateTo({
        url: '/pages/dev-settings/dev-settings'
      })
    },

    // 加载设置
    loadSettings() {
      try {
        const notifications = uni.getStorageSync('NOTIFICATION_SETTING')
        if (notifications !== '') this.notificationsEnabled = notifications
        this.imageSource = getImageSourceSetting()
      } catch (e) {
        console.warn('加载设置失败:', e)
      }
    },

    // 保存设置
    saveSettings() {
      try {
        uni.setStorageSync('NOTIFICATION_SETTING', this.notificationsEnabled)
        setImageSourceSetting(this.imageSource)
      } catch (e) {
        console.warn('保存设置失败:', e)
      }
    },

    chooseImageSource() {
      const itemList = ['服务器映射（后端决定）', '对象存储（七牛）', '本地存储']
      uni.showActionSheet({
        itemList,
        success: (res) => {
          const next = res.tapIndex === 0 ? 'server' : (res.tapIndex === 1 ? 'object' : 'local')
          this.imageSource = next
          this.saveSettings()
          uni.showToast({
            title: next === 'server'
              ? '已切换到服务器映射'
              : (next === 'local' ? '已切换到本地存储' : '已切换到对象存储'),
            icon: 'none',
            duration: 1500
          })
        }
      })
    },

    // 切换通知
    toggleNotification() {
      this.notificationsEnabled = !this.notificationsEnabled
      this.saveSettings()
      uni.showToast({
        title: this.notificationsEnabled ? '通知已开启' : '通知已关闭',
        icon: 'none',
        duration: 1500
      })
    },

    // 计算缓存大小
    calculateCacheSize() {
      try {
        const info = uni.getStorageInfoSync()
        const sizeInMB = (info.currentSize / 1024).toFixed(2)
        this.cacheSize = sizeInMB > 0 ? `${sizeInMB} MB` : '0 MB'
      } catch (e) {
        this.cacheSize = '0 MB'
      }
    },

    // 清除缓存
    clearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有缓存数据吗？这将清除图片缓存和临时文件。',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            try {
              // 清除本地存储（保留设置）
              const notification = uni.getStorageSync('NOTIFICATION_SETTING')
              const imageSource = this.imageSource

              uni.clearStorageSync()

              // 恢复设置
              uni.setStorageSync('NOTIFICATION_SETTING', notification)
              this.imageSource = setImageSourceSetting(imageSource)

              this.cacheSize = '0 MB'
              uni.showToast({
                title: '缓存已清除',
                icon: 'success',
                duration: 2000
              })
            } catch (e) {
              uni.showToast({
                title: '清除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    // 打开隐私政策
    openPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/webview/webview?url=https://your-domain.com/privacy'
      })
    },

    // 打开用户协议
    openUserAgreement() {
      uni.navigateTo({
        url: '/pages/webview/webview?url=https://your-domain.com/terms'
      })
    },

    // 检查更新
    checkUpdate() {
      uni.showLoading({ title: '检查中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已是最新版本',
          icon: 'success',
          duration: 2000
        })
      }, 1500)
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            this.isLoggedIn = false
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    }
  },

  computed: {
    imageSourceText() {
      if (this.imageSource === 'server') {
        return '服务器映射'
      }

      return this.imageSource === 'local' ? '本地存储' : '对象存储'
    }
  }
}
</script>

<style scoped>
/* 容器 */
.container {
  min-height: 100vh;
  background-color: var(--bg-primary);
  position: relative;
}

/* 背景层 */
.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
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
  opacity: 0.04;
  animation: cloudMove 60s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes cloudMove {
  0% { background-position: 0 0; }
  100% { background-position: 800rpx 400rpx; }
}

/* 顶部导航 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.3);
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.15);
  padding: 16rpx 24rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.back-icon, .back-text {
  font-size: 26rpx;
  color: #fff;
}

.header-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 6rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.header-right {
  width: 100rpx;
}

/* 设置内容 */
.settings-content {
  position: relative;
  z-index: 5;
  padding: 30rpx;
  height: calc(100vh - 140rpx);
}

.settings-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: 20rpx;
  padding: 0 10rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
  margin-bottom: 8rpx;
}

/* 设置列表 */
.settings-list {
  background: var(--bg-card);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx var(--shadow);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--border);
  transition: background-color 0.2s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background-color: var(--bg-secondary);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.item-icon {
  font-size: 36rpx;
}

.item-label {
  font-size: 30rpx;
  color: var(--text-primary);
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-value {
  font-size: 26rpx;
  color: var(--text-tertiary);
}

.item-arrow {
  font-size: 32rpx;
  color: var(--text-muted);
}

/* 自定义开关 */
.custom-switch {
  width: 80rpx;
  height: 44rpx;
  background: var(--bg-tertiary);
  border-radius: 22rpx;
  position: relative;
  transition: all 0.3s ease;
  border: 2rpx solid var(--border);
}

.custom-switch.active {
  background: var(--primary);
  border-color: var(--primary);
}

.switch-thumb {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 32rpx;
  height: 32rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.custom-switch.active .switch-thumb {
  transform: translateX(36rpx);
}

/* 关于区域 */
.about-section {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 4rpx 16rpx var(--shadow);
  text-align: center;
}

.about-content {
  margin-bottom: 32rpx;
}

.app-logo {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.app-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 6rpx;
  margin-bottom: 12rpx;
}

.app-version {
  display: block;
  font-size: 26rpx;
  color: var(--text-tertiary);
  margin-bottom: 16rpx;
}

.app-slogan {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
}

.update-btn {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 40rpx;
  background: linear-gradient(145deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx var(--shadow-primary);
}

.update-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.update-badge {
  font-size: 20rpx;
  color: #fff;
  background: #ffb74d;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

/* 退出登录 */
.logout-btn {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 28rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx var(--shadow);
}

.logout-text {
  font-size: 30rpx;
  color: var(--error);
  font-weight: 500;
}
</style>
