<template>
  <view class="building-grid">
    <view v-if="loading" class="state-box loading-state">
      <view class="state-icon-wrapper">
        <text class="state-icon-loading">⏳</text>
      </view>
      <text class="state-text">正在加载古建筑名录...</text>
      <view class="loading-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>

    <view v-else-if="error" class="state-box error-state">
      <view class="state-icon-wrapper">
        <text class="state-icon-error">⚠️</text>
      </view>
      <text class="state-text error-text">{{ error }}</text>
    </view>

    <view v-else-if="buildings.length === 0" class="state-box empty-state">
      <view class="empty-illustration">
        <view class="empty-building"></view>
        <view class="empty-clouds">
          <view class="cloud cloud-1"></view>
          <view class="cloud cloud-2"></view>
        </view>
      </view>
      <text class="state-title">寻古未果</text>
      <text class="state-text">没有找到对应的古建哦，试试换个关键词吧</text>
    </view>

    <view
      v-for="(building, index) in buildings"
      :key="building.id"
      class="building-card card-ink"
      :class="{ 'visible': visibleCards[index] }"
      @click="$emit('go-to-detail', building)"
    >
      <!-- 卡片装饰边框 -->
      <view class="card-border-decoration"></view>

      <!-- 图片区域 -->
      <view v-if="hasRenderableImage(building)" class="card-image-wrap">
        <view v-if="!isLoaded(building)" class="card-image-loading">
          <view class="loading-skeleton"></view>
          <text class="loading-text">加载中...</text>
        </view>
        <image
          class="card-image"
          :class="{ 'is-loaded': isLoaded(building), 'is-hidden': !isLoaded(building) }"
          :src="getImageUrl(building)"
          mode="aspectFill"
          lazy-load="true"
          @load="onImageLoad(building)"
          @error="onImageError(building)"
        />
        <!-- 图片渐变遮罩 -->
        <view class="card-image-overlay"></view>
        <!-- 分类标签角标 -->
        <view class="card-category-badge" :class="'category-' + building.category">
          <text class="category-text">{{ getCategoryText(building.category) }}</text>
        </view>
      </view>

      <view v-else class="card-image-wrap card-image-empty">
        <view class="empty-pattern">
          <view class="pattern-line line-1"></view>
          <view class="pattern-line line-2"></view>
          <view class="pattern-line line-3"></view>
        </view>
        <text class="card-image-empty-text">暂无图片</text>
        <!-- 图片渐变遮罩 -->
        <view class="card-image-overlay"></view>
      </view>

      <!-- 内容区域 -->
      <view class="card-info">
        <view class="card-header">
          <text class="card-name ink-pressed">{{ building.name }}</text>
          <view class="card-location" v-if="building.location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ building.location }}</text>
          </view>
        </view>

        <text class="card-desc">{{ building.description || building.overviewSummary || '暂无简介' }}</text>

        <view class="card-footer">
          <view class="card-tags">
            <text v-for="tag in (building.tags || []).slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
          </view>
          <view class="card-action-hint">
            <text class="action-text">查看详情</text>
            <text class="action-arrow">→</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    buildings: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    error: String,
    visibleCards: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loadedMap: {},
      errorMap: {},
      categoryMap: {
        palace: '宫殿',
        garden: '园林',
        bridge: '桥梁',
        defense: '城防',
        residence: '民居',
        tower: '楼阁',
        water: '水利'
      }
    };
  },
  methods: {
    getImageUrl(building) {
      if (!building) {
        return '';
      }
      return String(building.image || building.coverImage || building.originalImage || '').trim();
    },
    hasImage(building) {
      return Boolean(this.getImageUrl(building));
    },
    hasRenderableImage(building) {
      return this.hasImage(building) && !this.isError(building);
    },
    getImageKey(building) {
      return String((building && building.id) || 'unknown');
    },
    getCategoryText(category) {
      return this.categoryMap[category] || category || '其他';
    },
    onImageLoad(building) {
      const key = this.getImageKey(building);
      this.$set(this.loadedMap, key, true);
      this.$set(this.errorMap, key, false);
    },
    onImageError(building) {
      const key = this.getImageKey(building);
      this.$set(this.errorMap, key, true);
      this.$set(this.loadedMap, key, false);
    },
    isLoaded(building) {
      return Boolean(this.loadedMap[this.getImageKey(building)]);
    },
    isError(building) {
      return Boolean(this.errorMap[this.getImageKey(building)]);
    }
  }
}
</script>

<style scoped>
/* ============================================
   古建筑卡片网格 - 中式古风主题
   ============================================ */

.building-grid {
  padding: var(--space-6);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  position: relative;
  z-index: 2;
}

/* 响应式：平板 - 3列布局 */
@media (min-width: 768px) {
  .building-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
    padding: var(--space-8);
  }
}

/* 响应式：桌面 - 4列布局 */
@media (min-width: 1024px) {
  .building-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-8);
    padding: var(--space-10) var(--space-12);
  }
}

/* 响应式：大屏 - 优化间距 */
@media (min-width: 1440px) {
  .building-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-10);
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* ============================================
   状态提示框 - 统一样式
   ============================================ */
.state-box {
  grid-column: 1 / -1;
  background: linear-gradient(
    135deg,
    rgba(249, 245, 232, 0.95) 0%,
    rgba(242, 234, 211, 0.9) 100%
  );
  border-radius: var(--radius-xl);
  border: 2rpx solid var(--border);
  padding: var(--space-16) var(--space-12);
  text-align: center;
  box-shadow:
    0 4rpx 24rpx rgba(44, 30, 19, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
}

.state-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--secondary) 30%,
    var(--primary) 50%,
    var(--secondary) 70%,
    transparent 100%
  );
  opacity: 0.3;
}

/* 加载状态 */
.loading-state .state-icon-wrapper {
  margin-bottom: var(--space-6);
}

.state-icon-loading {
  font-size: 64rpx;
  animation: rotate 2s linear infinite;
  display: inline-block;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: var(--secondary);
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 错误状态 */
.error-state {
  background: linear-gradient(
    135deg,
    rgba(254, 240, 240, 0.95) 0%,
    rgba(252, 228, 228, 0.9) 100%
  );
  border-color: rgba(196, 30, 58, 0.15);
}

.error-state::before {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--error) 30%,
    var(--primary) 50%,
    var(--error) 70%,
    transparent 100%
  );
}

.state-icon-error {
  font-size: 56rpx;
  display: block;
  margin-bottom: var(--space-4);
}

/* 空状态 */
.empty-state {
  padding: var(--space-20) var(--space-12);
}

.empty-illustration {
  width: 200rpx;
  height: 160rpx;
  margin: 0 auto var(--space-8);
  position: relative;
}

.empty-building {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 100rpx;
  background: linear-gradient(
    180deg,
    var(--bg-tertiary) 0%,
    var(--secondary) 100%
  );
  opacity: 0.15;
  clip-path: polygon(
    10% 100%, 0% 60%, 15% 35%, 25% 35%, 30% 15%, 45% 15%,
    50% 0%, 55% 15%, 70% 15%, 75% 35%, 85% 35%, 100% 60%, 90% 100%
  );
}

.empty-clouds {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80rpx;
}

.cloud {
  position: absolute;
  background: var(--bg-secondary);
  opacity: 0.2;
  border-radius: 40rpx;
}

.cloud-1 {
  width: 80rpx;
  height: 32rpx;
  top: 16rpx;
  left: 20rpx;
  animation: cloudFloat 4s ease-in-out infinite;
}

.cloud-2 {
  width: 60rpx;
  height: 24rpx;
  top: 36rpx;
  right: 24rpx;
  animation: cloudFloat 5s ease-in-out infinite reverse;
}

@keyframes cloudFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.state-title {
  display: block;
  font-size: var(--text-xl);
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-3);
}

.state-text {
  display: block;
  font-size: var(--text-base);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  max-width: 480rpx;
  margin: 0 auto;
}

.error-text {
  color: var(--error);
  font-weight: 500;
}

/* ============================================
   建筑卡片 - 核心设计
   ============================================ */
.building-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1rpx solid var(--border);
  transition: all var(--duration-slow) var(--ease-out);
  cursor: pointer;
  position: relative;
  opacity: 0;
  transform: translateY(40rpx) scale(0.95);

  will-change: transform, opacity, box-shadow;
}

.building-card.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.building-card:hover {
  transform: translateY(-8rpx) scale(1.02);
  box-shadow:
    var(--shadow-xl),
    0 0 0 1rpx var(--secondary),
    0 0 40rpx rgba(139, 69, 19, 0.08);
  border-color: var(--secondary);
  z-index: 10;
}

.building-card:active {
  transform: translateY(-4rpx) scale(0.98);
  transition-duration: var(--duration-fast);
}

/* 卡片装饰边框 - 中式角花效果 */
.card-border-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.card-border-decoration::before,
.card-border-decoration::after {
  content: '';
  position: absolute;
  width: 24rpx;
  height: 24rpx;
  border-color: var(--secondary);
  border-style: solid;
  border-width: 0;
  opacity: 0;
  transition: all var(--duration-normal);
}

.card-border-decoration::before {
  top: 8rpx;
  left: 8rpx;
  border-top-width: 2rpx;
  border-left-width: 2rpx;
  border-top-left-radius: 8rpx;
}

.card-border-decoration::after {
  top: 8rpx;
  right: 8rpx;
  border-top-width: 2rpx;
  border-right-width: 2rpx;
  border-top-right-radius: 8rpx;
}

.building-card:hover .card-border-decoration {
  opacity: 1;
}

.building-card:hover .card-border-decoration::before,
.building-card:hover .card-border-decoration::after {
  opacity: 0.6;
}

/* ============================================
   图片区域 - 优化展示
   ============================================ */
.card-image-wrap {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  position: relative;
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    #e8dcc8 100%
  );
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  opacity: 1;
}

.card-image.is-loaded {
  opacity: 1;
}

.card-image.is-hidden {
  opacity: 0;
}

/* 图片渐变遮罩 - 增强层次感 */
.card-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    to top,
    rgba(44, 30, 19, 0.4) 0%,
    rgba(44, 30, 19, 0.15) 40%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* 图片悬停缩放效果 */
.building-card:hover .card-image {
  transform: scale(1.08);
}

/* 加载状态 - 骨架屏 */
.card-image-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.loading-skeleton {
  width: 60rpx;
  height: 60rpx;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.loading-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* 空图片状态 - 中式纹理 */
.card-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 100%
  );
}

.empty-pattern {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: var(--space-3);
}

.pattern-line {
  position: absolute;
  background: var(--border);
  opacity: 0.3;
}

.line-1 {
  width: 100%;
  height: 2rpx;
  top: 50%;
  left: 0;
  transform: translateY(-50%) rotate(45deg);
}

.line-2 {
  width: 100%;
  height: 2rpx;
  top: 50%;
  left: 0;
  transform: translateY(-50%) rotate(-45deg);
}

.line-3 {
  width: 56rpx;
  height: 56rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2rpx solid var(--border);
  border-radius: 50%;
  opacity: 0.3;
}

.card-image-empty-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
  position: relative;
  z-index: 2;
}

/* 分类标签角标 */
.card-category-badge {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  backdrop-filter: blur(8px);
  z-index: 2;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 1rpx;
}

.category-palace {
  background: rgba(166, 49, 49, 0.9);
  color: #fff8e6;
}

.category-garden {
  background: rgba(90, 125, 90, 0.9);
  color: #fff;
}

.category-bridge {
  background: rgba(114, 90, 61, 0.9);
  color: #fff8e6;
}

.category-defense {
  background: rgba(212, 156, 77, 0.9);
  color: #fff8e6;
}

.category-residence {
  background: rgba(156, 126, 90, 0.9);
  color: #fff8e6;
}

.category-tower {
  background: rgba(194, 77, 77, 0.9);
  color: #fff8e6;
}

.category-water {
  background: rgba(77, 61, 41, 0.9);
  color: #fff8e6;
}

.category-text {
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

/* ============================================
   内容区域 - 信息层次优化
   ============================================ */
.card-info {
  padding: var(--space-5) var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    var(--bg-card) 100%
  );
  position: relative;
  z-index: 2;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.card-name {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--text-primary);
  line-height: var(--leading-tight);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: var(--tracking-normal);
}

/* 墨按文字阴影效果 */
.ink-pressed {
  text-shadow:
    0.5rpx 0.5rpx 0px rgba(255, 255, 255, 0.8),
    -0.5rpx -0.5rpx 1rpx rgba(0, 0, 0, 0.1),
    0 2rpx 4rpx rgba(44, 30, 19, 0.08);
}

.card-location {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.location-icon {
  font-size: var(--text-xs);
  line-height: 1;
}

.location-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1;
}

.card-desc {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  line-height: var(--leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(var(--text-sm) * var(--leading-normal) * 2);
}

/* 底部操作区 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1rpx solid var(--border);
  gap: var(--space-4);
}

.card-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.card-tag {
  font-size: var(--text-xs);
  color: var(--secondary);
  background: linear-gradient(
    135deg,
    rgba(139, 69, 19, 0.06) 0%,
    rgba(139, 69, 19, 0.12) 100%
  );
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: 500;
  border: 1rpx solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-tag:hover {
  background: linear-gradient(
    135deg,
    rgba(166, 49, 49, 0.1) 0%,
    rgba(166, 49, 49, 0.18) 100%
  );
  color: var(--primary-dark);
  border-color: rgba(166, 49, 49, 0.2);
}

/* 查看详情提示 */
.card-action-hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  border-radius: var(--radius-full);
  opacity: 0;
  transform: translateX(10rpx);
  transition: all var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
}

.building-card:hover .card-action-hint {
  opacity: 1;
  transform: translateX(0);
}

.action-text {
  font-size: var(--text-xs);
  color: #fff8e6;
  font-weight: 600;
  white-space: nowrap;
}

.action-arrow {
  font-size: var(--text-xs);
  color: #fff8e6;
  font-weight: bold;
  transition: transform var(--duration-fast);
}

.building-card:hover .action-arrow {
  transform: translateX(2rpx);
}

/* ============================================
   性能优化与可访问性
   ============================================ */

/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .building-card,
  .card-image,
  .card-action-hint,
  .state-icon-loading,
  .dot,
  .cloud {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }

  .building-card.visible {
    opacity: 1;
    transform: none;
  }

  .building-card:hover {
    transform: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .building-card {
    border-width: 2rpx;
    border-color: var(--text-primary);
  }

  .card-tag {
    border-width: 1rpx;
    border-color: currentColor;
  }
}
</style>
