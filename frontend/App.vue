<script>
import { initChineseAnimations } from './utils/animationHelper.js'

export default {
  onLaunch() {
    console.log('App Launch')
    // 初始化中式交互动效
    // #ifdef H5
    initChineseAnimations()
    // #endif

    // 初始化页面转场动画
    this.initPageTransitions()
  },
  onShow() {
    console.log('App Show')
    // 触发页面显示事件
    uni.$emit('pageShow')
  },
  onHide() {
    console.log('App Hide')
  },

  methods: {
    // 初始化页面转场动画
    initPageTransitions() {
      // #ifdef H5
      // 监听路由变化，添加转场动画
      if (typeof window !== 'undefined') {
        // 页面进入动画
        document.addEventListener('DOMContentLoaded', () => {
          document.body.classList.add('page-enter')
          setTimeout(() => {
            document.body.classList.remove('page-enter')
          }, 400)
        })
      }
      // #endif
    }
  }
}
</script>

<style>
/* ========== 中式字体引入 ========== */
/* 
  字体说明：
  - 思源宋体 (Source Han Serif CN)：Adobe开源字体，免费商用，用于正文
  - 仓耳今楷：免费商用楷体，用于标题
  - 使用 CDN 加速，确保多端兼容
*/

/* 思源宋体 - 正文用 */
@font-face {
  font-family: 'Source Han Serif CN';
  src: url('https://chinese-font.netlify.app/packages/syst/dist/SourceHanSerifCN/result.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Source Han Serif CN';
  src: url('https://chinese-font.netlify.app/packages/syst/dist/SourceHanSerifCN-Bold/result.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* 仓耳今楷 - 标题用 */
@font-face {
  font-family: 'TsangerJinKai';
  src: url('https://chinese-font.netlify.app/packages/tcjr/dist/%E4%BB%93%E8%80%B3%E4%BB%8A%E5%96%9C02-6753/result.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

/* ========== CSS 变量定义 ========== */
page {
  /* 浅色主题（默认） */
  /* 远中古木主题 - Antique / Muted Palette */
  --primary: #a63131;        /* 故宫红（微黯） */
  --primary-dark: #7a1d1d;
  --primary-light: #c24d4d;
  --secondary: #725a3d;     /* 古铜/青铜 */
  --secondary-dark: #4d3d29;
  --secondary-light: #9c7e5a;
  --text-primary: #2c1e13;   /* 焦墨 */
  --text-secondary: #5a4a3a; /* 水墨 */
  --text-tertiary: #8b7355;  /* 赭石 */
  --text-muted: #a08c70;
  --bg-primary: #f2ead3;     /* 古旧绢本/生宣 */
  --bg-secondary: #e8dec3;
  --bg-tertiary: #decfa8;
  --bg-card: #f9f5e8;        /* 熟宣 */
  --border: #d4c4a8;
  --border-light: #e0d1b5;
  --error: #b74d4d;
  --success: #5a7d5a;
  --warning: #d49c4d;        /* 佛金 */
  --shadow: rgba(44, 30, 19, 0.08); /* 焦墨影 */
  --shadow-primary: rgba(166, 49, 49, 0.2);
  
  /* 字体变量 */
  --font-title: 'TsangerJinKai', 'Source Han Serif CN', 'Noto Serif SC', 'SimSun', serif;
  --font-body: 'Source Han Serif CN', 'Noto Serif SC', 'SimSun', 'PingFang SC', 'Microsoft YaHei', serif;
}

/* 全局基础样式 */
page {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.4s ease, color 0.4s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
}

/* ========== 宣纸/绢本纹理 ========== */
.rice-paper {
  position: relative;
  background-color: var(--bg-card);
  background-image: 
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cfilter id='paper-texture'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23paper-texture)' opacity='0.02'/%3E%3C/svg%3E"),
    radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 80%);
}

/* ========== 墨韵毛笔边框 ========== */
.brush-border-ink {
  border: none;
  position: relative;
}

.brush-border-ink::after {
  content: '';
  position: absolute;
  top: -2rpx;
  left: -2rpx;
  right: -2rpx;
  bottom: -2rpx;
  pointer-events: none;
  border: 4rpx solid transparent;
  border-image: linear-gradient(to right, rgba(44, 30, 19, 0.4), rgba(44, 30, 19, 0.1) 50%, rgba(44, 30, 19, 0.4)) 1;
  -webkit-mask-image: radial-gradient(circle, white 98%, transparent 100%);
  mask-image: radial-gradient(circle, white 98%, transparent 100%);
  -webkit-mask-composite: source-over;
  mask-composite: exclude;
}

/* ========== 墨迹压印文字效果 ========== */
.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,0.8), 0 2rpx 4rpx rgba(0,0,0,0.1);
  letter-spacing: 2rpx;
}

/* 标题字体 */
.title-font,
.section-title,
.main-title,
.card-name,
.daily-name {
  font-family: var(--font-title);
}

/* 正文字体 */
.body-font,
.card-desc,
.daily-desc,
.description {
  font-family: var(--font-body);
}

/* 优化滚动性能 */
scroll-view {
  -webkit-overflow-scrolling: touch;
}

/* ========== 页面转场动画 - 优化版 ========== */

/* 
 * 优化策略：
 * 1. 仅使用 transform 和 opacity（GPU加速属性）
 * 2. 避免 clip-path、filter 等导致重绘的属性
 * 3. 使用 will-change 提示浏览器优化
 * 4. 简化为流畅的滑入+淡入效果
 */

/* 页面进入动画 - 流畅的滑入淡入 */
.page-enter {
  animation: pageEnterSmooth 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  will-change: transform, opacity;
}

@keyframes pageEnterSmooth {
  0% {
    opacity: 0;
    transform: translateY(20rpx) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 页面退出动画 - 流畅的淡出 */
.page-leave {
  animation: pageLeaveSmooth 0.3s ease-out both;
  will-change: transform, opacity;
}

@keyframes pageLeaveSmooth {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-10rpx) scale(0.98);
  }
}

/* 淡入动画 - 简洁的透明度渐变 */
.fade-in {
  animation: fadeInSmooth 0.5s ease-out both;
  will-change: opacity;
}

@keyframes fadeInSmooth {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 从底部滑入 - 流畅的上滑 */
.slide-up {
  animation: slideUpSmooth 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  will-change: transform, opacity;
}

@keyframes slideUpSmooth {
  0% {
    opacity: 0;
    transform: translateY(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放进入 - 流畅的缩放 */
.scale-in {
  animation: scaleInSmooth 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
  will-change: transform, opacity;
}

@keyframes scaleInSmooth {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 古卷轴容器效果 - 静态装饰 */
.scroll-container {
  position: relative;
  background: linear-gradient(
    to right,
    var(--bg-tertiary) 0%,
    var(--bg-primary) 2%,
    var(--bg-primary) 98%,
    var(--bg-tertiary) 100%
  );
}

/* 卷轴边缘装饰 - 静态 */
.scroll-container::before,
.scroll-container::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: linear-gradient(
    to bottom,
    var(--secondary-dark) 0%,
    var(--secondary) 50%,
    var(--secondary-dark) 100%
  );
  z-index: 10;
}

.scroll-container::before {
  left: 0;
  border-radius: 3rpx 0 0 3rpx;
}

.scroll-container::after {
  right: 0;
  border-radius: 0 3rpx 3rpx 0;
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

/* ========== 交互反馈优化 - 墨水滴开波纹效果（增强版） ========== */

/* 
 * 墨水滴波纹效果 - 使用多层叠加增强视觉效果
 * 原理：点击时从中心扩散多层圆形波纹，模拟墨水滴在宣纸上晕染
 */

/* 基础波纹容器 */
.ink-ripple {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

/* 第一层波纹 - 主墨水扩散 */
.ink-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(139, 69, 19, 0.25) 0%,
    rgba(139, 69, 19, 0.15) 20%,
    rgba(139, 69, 19, 0.05) 40%,
    transparent 60%
  );
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
  will-change: transform, opacity;
}

/* 点击时触发 */
.ink-ripple:active::after {
  animation: inkSpread 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes inkSpread {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

/* ========== 按钮点击反馈（更明显） ========== */

/* 按钮点击时的墨水填充效果 */
.btn-ink {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  transition: all 0.2s ease;
}

/* 墨水背景层 */
.btn-ink::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(139, 69, 19, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
  opacity: 0;
  pointer-events: none;
  will-change: width, height, opacity;
}

/* 点击状态 */
.btn-ink:active {
  transform: scale(0.96);
  background-color: rgba(139, 69, 19, 0.1);
}

.btn-ink:active::before {
  width: 200%;
  height: 200%;
  opacity: 1;
}

/* ========== 毛笔书写动画（增强版） ========== */

/* 毛笔书写效果 - 从左到右展开 */
.brush-write {
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.brush-write-text {
  display: inline-block;
  transform: translateX(-101%);
  opacity: 0;
  will-change: transform, opacity;
}

.brush-write-text.animate {
  animation: brushWriteSlide 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes brushWriteSlide {
  0% {
    transform: translateX(-101%);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 逐字显示 - 毛笔字效果 */
.brush-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(20rpx) scale(0.9);
  will-change: opacity, transform;
}

.brush-char.animate {
  animation: brushCharIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes brushCharIn {
  0% {
    opacity: 0;
    transform: translateY(20rpx) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 段落毛笔书写 */
.brush-paragraph {
  opacity: 0;
  transform: translateX(-40rpx);
  filter: blur(4rpx);
  will-change: opacity, transform, filter;
}

.brush-paragraph.animate {
  animation: brushParaIn 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes brushParaIn {
  0% {
    opacity: 0;
    transform: translateX(-40rpx);
    filter: blur(4rpx);
  }
  50% {
    filter: blur(2rpx);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

/* 延迟类 */
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }

/* 字延迟 */
.char-delay-1 { animation-delay: 0.05s; }
.char-delay-2 { animation-delay: 0.1s; }
.char-delay-3 { animation-delay: 0.15s; }
.char-delay-4 { animation-delay: 0.2s; }
.char-delay-5 { animation-delay: 0.25s; }
.char-delay-6 { animation-delay: 0.3s; }
.char-delay-7 { animation-delay: 0.35s; }
.char-delay-8 { animation-delay: 0.4s; }
.char-delay-9 { animation-delay: 0.45s; }
.char-delay-10 { animation-delay: 0.5s; }

/* ========== 卡片墨水晕染效果（增强版） ========== */

.card-ink {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 墨水晕染背景 */
.card-ink::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(
    circle at center,
    rgba(139, 69, 19, 0.12) 0%,
    rgba(139, 69, 19, 0.06) 30%,
    transparent 60%
  );
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease;
  pointer-events: none;
  will-change: transform, opacity;
}

/* 悬停时显示 */
.card-ink:hover::after,
.card-ink.active::after {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

/* 点击效果 */
.card-ink:active {
  transform: scale(0.98);
}

/* ========== 列表项滑入动画（增强版） ========== */

.list-item-ink {
  opacity: 0;
  transform: translateX(-50rpx);
  will-change: opacity, transform;
}

.list-item-ink.animate {
  animation: listItemInkIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes listItemInkIn {
  0% {
    opacity: 0;
    transform: translateX(-50rpx);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 列表项延迟 */
.item-delay-1 { animation-delay: 0.05s; }
.item-delay-2 { animation-delay: 0.1s; }
.item-delay-3 { animation-delay: 0.15s; }
.item-delay-4 { animation-delay: 0.2s; }
.item-delay-5 { animation-delay: 0.25s; }
.item-delay-6 { animation-delay: 0.3s; }

/* ========== 通用点击反馈 ========== */

/* 所有可点击元素的通用反馈 */
.tap-feedback {
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.tap-feedback:active {
  transform: scale(0.96);
  background-color: rgba(139, 69, 19, 0.08);
}

/* ========== 边框与分割线优化 - 毛笔笔触效果 ========== */

/* 
 * 毛笔笔触边框 - 使用渐变模拟毛笔手绘效果
 * 四边粗细不一，模拟毛笔运笔的自然变化
 */
.brush-border {
  position: relative;
  border: none;
  background: var(--bg-card, #ffffff);
}

.brush-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
  padding: 3rpx;
  background: linear-gradient(
    135deg,
    rgba(139, 69, 19, 0.8) 0%,
    rgba(139, 69, 19, 0.6) 25%,
    rgba(139, 69, 19, 0.4) 50%,
    rgba(139, 69, 19, 0.6) 75%,
    rgba(139, 69, 19, 0.8) 100%
  );
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* 古卷压边效果 - 模拟古画卷轴的压边纹理 */
.scroll-edge {
  position: relative;
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}

.scroll-edge::before,
.scroll-edge::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 69, 19, 0.3) 10%,
    rgba(139, 69, 19, 0.5) 30%,
    rgba(139, 69, 19, 0.3) 50%,
    rgba(139, 69, 19, 0.5) 70%,
    rgba(139, 69, 19, 0.3) 90%,
    transparent 100%
  );
  opacity: 0.6;
  z-index: 1;
  pointer-events: none;
}

.scroll-edge::before {
  top: 0;
}

.scroll-edge::after {
  bottom: 0;
}

/* 古卷侧边装饰 - 左右压边 */
.scroll-side-edge {
  position: relative;
}

.scroll-side-edge::before,
.scroll-side-edge::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6rpx;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(139, 69, 19, 0.2) 10%,
    rgba(139, 69, 19, 0.4) 30%,
    rgba(139, 69, 19, 0.3) 50%,
    rgba(139, 69, 19, 0.4) 70%,
    rgba(139, 69, 19, 0.2) 90%,
    transparent 100%
  );
}

.scroll-side-edge::before {
  left: 0;
}

.scroll-side-edge::after {
  right: 0;
}

/* 中式分隔线 - 云纹效果 */
.chinese-divider {
  position: relative;
  height: 2rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 69, 19, 0.2) 20%,
    rgba(139, 69, 19, 0.4) 50%,
    rgba(139, 69, 19, 0.2) 80%,
    transparent 100%
  );
  margin: 30rpx 0;
}

.chinese-divider::before,
.chinese-divider::after {
  content: '◆';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16rpx;
  color: rgba(139, 69, 19, 0.4);
}

.chinese-divider::before {
  left: 20%;
}

.chinese-divider::after {
  right: 20%;
}

/* 古画卷轴阴影 - 模拟古画质感 */
.scroll-shadow {
  box-shadow: 
    0 4rpx 20rpx rgba(139, 69, 19, 0.1),
    0 8rpx 40rpx rgba(139, 69, 19, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.5);
}

/* 宣纸纹理背景 */
.rice-paper-bg {
  background-color: var(--bg-primary, var(--bg-primary));
  background-image: 
    radial-gradient(ellipse at 20% 30%, rgba(139, 69, 19, 0.02) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 69, 19, 0.02) 0%, transparent 50%);
}

/* 印章边框 - 朱砂色粗边框 */
.seal-border {
  border: 4rpx solid var(--primary);
  border-radius: 8rpx;
  position: relative;
}

.seal-border::before {
  content: '';
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  right: -8rpx;
  bottom: -8rpx;
  border: 2rpx solid rgba(196, 30, 58, 0.3);
  border-radius: 12rpx;
  pointer-events: none;
}
</style>
