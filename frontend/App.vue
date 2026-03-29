<script>
export default {
  onLaunch() {
    console.log('App Launch')
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
/* 全局基础样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f8f4e9;
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
    #f0e6d3 25%,
    #e8dcc8 50%,
    #f0e6d3 75%
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
  box-shadow: 0 8px 24px rgba(139, 69, 19, 0.15);
}

/* 链接/文字悬停 */
.text-hover {
  transition: color 0.2s ease;
}

.text-hover:hover {
  color: #c82506;
}
</style>
