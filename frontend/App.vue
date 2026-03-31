<script>
import themeManager from './utils/themeManager.js'

export default {
  onLaunch() {
    console.log('App Launch')
    // 初始化主题
    themeManager.init()
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>
/* ========== CSS 变量定义 ========== */
:root {
  /* 浅色主题（默认） */
  --primary: #c41e3a;
  --primary-dark: #8b0000;
  --primary-light: #d6455a;
  --secondary: #8b4513;
  --secondary-dark: #6b3410;
  --secondary-light: #a67c52;
  --text-primary: #3c2a1d;
  --text-secondary: #6b5643;
  --text-tertiary: #8b7355;
  --text-muted: #a89078;
  --bg-primary: #f8f4e8;
  --bg-secondary: #f0e9d8;
  --bg-tertiary: #e8dcc8;
  --bg-card: #ffffff;
  --border: #e8dcc8;
  --border-light: #dcc8b0;
  --error: #b85450;
  --success: #5b8c5a;
  --warning: #e8b860;
  --shadow: rgba(139, 69, 19, 0.12);
  --shadow-primary: rgba(196, 30, 58, 0.3);
}

/* 深色主题 */
[data-theme="dark"] {
  --primary: #e84a5f;
  --primary-dark: #c41e3a;
  --primary-light: #f06b7d;
  --secondary: #c4956a;
  --secondary-dark: #a67c52;
  --secondary-light: #d4a87a;
  --text-primary: #f5f0e6;
  --text-secondary: #d4c8b8;
  --text-tertiary: #b8a898;
  --text-muted: #8b7d6b;
  --bg-primary: #1a1612;
  --bg-secondary: #242018;
  --bg-tertiary: #2e2820;
  --bg-card: #363028;
  --border: #4a4035;
  --border-light: #5a5045;
  --error: #e57373;
  --success: #81c784;
  --warning: #ffb74d;
  --shadow: rgba(0, 0, 0, 0.4);
  --shadow-primary: rgba(232, 74, 95, 0.4);
}

/* 全局基础样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 优化滚动性能 */
scroll-view {
  -webkit-overflow-scrolling: touch;
}

/* ========== 页面转场动画 ========== */

/* 页面进入动画 - 从右向左滑入 */
.page-enter {
  animation: pageEnter 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 页面退出动画 - 向左滑出 */
.page-leave {
  animation: pageLeave 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
}

@keyframes pageLeave {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}

/* 淡入动画 - 用于内容加载 */
.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 从底部滑入 - 用于弹窗、底部面板 */
.slide-up {
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放进入 - 用于卡片、按钮 */
.scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 延迟动画类 */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

/* ========== 骨架屏动画 ========== */
@keyframes skeletonLoading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeletonLoading 1.5s ease-in-out infinite;
}

/* ========== 通用过渡效果 ========== */

/* 按钮点击效果 */
.btn-active:active {
  transform: scale(0.97);
  opacity: 0.9;
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow);
}

/* 链接/文字悬停 */
.text-hover {
  transition: color 0.2s ease;
}

.text-hover:hover {
  color: var(--primary);
}

/* ========== 深色主题特定样式 ========== */

/* 深色主题下的图片亮度调整 */
[data-theme="dark"] image,
[data-theme="dark"] .card-image,
[data-theme="dark"] .daily-image {
  filter: brightness(0.9);
}

/* 深色主题下的阴影调整 */
[data-theme="dark"] .shadow-card {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}

/* 深色主题下的边框发光效果 */
[data-theme="dark"] .glow-border {
  border-color: rgba(232, 74, 95, 0.3);
  box-shadow: 0 0 20rpx rgba(232, 74, 95, 0.1);
}

/* 主题切换过渡动画 */
.theme-transition {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}
</style>
