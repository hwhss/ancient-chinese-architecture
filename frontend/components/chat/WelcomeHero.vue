<template>
  <view class="welcome-container">
    <!-- 装饰性背景元素 -->
    <view class="welcome-bg-decoration">
      <view class="cloud cloud-1"></view>
      <view class="cloud cloud-2"></view>
      <view class="cloud cloud-3"></view>
    </view>
    
    <!-- 主视觉区域 -->
    <view class="welcome-hero">
      <view class="hero-icon-wrapper">
        <view class="hero-icon-ring"></view>
        <TraditionalIcon name="palace" size="100" color="var(--primary)" />
        <view class="hero-glow"></view>
      </view>
      <view class="hero-title-wrapper">
        <text class="hero-title ink-pressed">古建筑AI导览</text>
        <view class="title-decoration">
          <view class="title-line"></view>
          <text class="title-icon">◆</text>
          <view class="title-line"></view>
        </view>
      </view>
      <text class="hero-subtitle">千年智慧 · 一语道破</text>
    </view>
    
    <!-- 功能特性展示 -->
    <view class="welcome-features">
      <view class="feature-item rice-paper" v-for="(feature, idx) in welcomeFeatures" :key="idx" :style="{ animationDelay: idx * 0.15 + 's' }">
        <view class="feature-icon-wrapper btn-ink">
          <TraditionalIcon :name="getFeatureIcon(idx)" size="40" />
        </view>
        <view class="feature-text-content">
          <text class="feature-title">{{ feature.title }}</text>
          <text class="feature-desc">{{ feature.desc }}</text>
        </view>
      </view>
    </view>
    
    <!-- 引导提示 -->
    <view class="welcome-guide">
      <view class="guide-line"></view>
      <view class="guide-content rice-paper">
        <TraditionalIcon name="chat" size="32" color="var(--primary)" />
        <text class="guide-text">输入您想了解的古建筑知识</text>
      </view>
      <view class="guide-line"></view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'WelcomeHero',
  components: {
    TraditionalIcon
  },
  props: {
    welcomeFeatures: {
      type: Array,
      default: () => [
        { icon: '📚', title: '知识问答', desc: '解答古建筑历史、结构、文化等各类问题' },
        { icon: '🗺️', title: '实景导览', desc: '一键跳转查看古建筑详细资料与实景图片' },
        { icon: '✨', title: '智能推荐', desc: '根据您的兴趣推荐相关古建筑知识' }
      ]
    }
  },
  methods: {
    getFeatureIcon(idx) {
      const icons = ['palace', 'map', 'tower'];
      return icons[idx % icons.length];
    }
  }
}
</script>

<style scoped>
.welcome-container {
  position: relative;
  padding: 40rpx 30rpx 60rpx;
  min-height: calc(100vh - 400rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.welcome-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.cloud {
  position: absolute;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(20rpx);
}

.cloud-1 {
  width: 300rpx;
  height: 150rpx;
  top: 10%;
  left: -50rpx;
  animation: floatCloud 20s ease-in-out infinite;
}

.cloud-2 {
  width: 200rpx;
  height: 100rpx;
  top: 30%;
  right: -30rpx;
  animation: floatCloud 25s ease-in-out infinite reverse;
}

.cloud-3 {
  width: 250rpx;
  height: 120rpx;
  bottom: 20%;
  left: 10%;
  animation: floatCloud 22s ease-in-out infinite;
  animation-delay: -5s;
}

@keyframes floatCloud {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(30rpx) translateY(-10rpx); }
  50% { transform: translateX(-20rpx) translateY(10rpx); }
  75% { transform: translateX(20rpx) translateY(-5rpx); }
}

.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  animation: heroFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-icon-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.hero-icon-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid var(--secondary);
  border-radius: 50%;
  opacity: 0.2;
  animation: ringPulse 2s ease-in-out infinite;
}

.hero-icon-ring::before {
  content: '';
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  right: 10rpx;
  bottom: 10rpx;
  border: 2rpx solid var(--secondary);
  opacity: 0.1;
  border-radius: 50%;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.6; }
}

.hero-glow {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, var(--primary-light) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.15;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.hero-icon {
  font-size: 80rpx;
  z-index: 1;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

.hero-title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.hero-title {
  font-size: 52rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 8rpx;
  margin-bottom: 24rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,0.8), 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.title-line {
  width: 80rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent);
}

.title-icon {
  font-size: 20rpx;
  color: var(--secondary);
  animation: iconRotate 4s linear infinite;
}

@keyframes iconRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hero-subtitle {
  font-size: 28rpx;
  color: var(--text-tertiary);
  letter-spacing: 12rpx;
  font-weight: 500;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 50rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  border-radius: 20rpx;
  border: 4rpx solid var(--border);
  box-shadow: 4rpx 4rpx 20rpx var(--shadow);
  animation: featureSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes featureSlideIn {
  from { opacity: 0; transform: translateX(-30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

.feature-item:hover {
  transform: translateY(-4rpx) translateX(4rpx);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.12);
  border-color: #d8c8b8;
}

.feature-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 12rpx;
  margin-right: 32rpx;
  flex-shrink: 0;
  color: var(--secondary);
  border: 1rpx solid var(--border);
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6rpx;
  display: block;
}

.feature-desc {
  font-size: 24rpx;
  color: var(--text-tertiary);
  display: block;
}

.welcome-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-top: auto;
  padding-top: 30rpx;
  animation: guideFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

@keyframes guideFadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.guide-line {
  width: 80rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent);
}

.guide-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 40rpx;
  background: var(--bg-card);
  border-radius: 50rpx;
  border: 1rpx solid var(--border);
  box-shadow: 0 4rpx 20rpx var(--shadow);
}

.guide-text {
  font-size: 26rpx;
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>
