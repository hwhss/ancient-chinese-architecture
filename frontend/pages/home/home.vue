<template>
  <view class="container">
    <!-- 动态祥云背景层 -->
    <view class="cloud-background"></view>
    <!-- 水墨山水纹理背景层 -->
    <view class="ink-background"></view>
    
    <!-- 主内容区域 -->
    <scroll-view scroll-y class="scroll-view" @scroll="onScroll">
      <!-- 顶部 Hero 区 -->
      <view class="hero-section">
        <!-- 左侧故宫角楼剪影装饰 -->
        <view class="silhouette left"></view>
        <!-- 右侧园林亭台剪影装饰 -->
        <view class="silhouette right"></view>
        
        <!-- 印章装饰 -->
        <view class="seal-decor" :class="{ 'visible': sections.hero.seal }">古建</view>
        
        <!-- 标题区域 -->
        <view class="title-area">
          <text class="main-title" :class="{ 'visible': sections.hero.title }">中华古建筑导览</text>
          <text class="subtitle" :class="{ 'visible': sections.hero.subtitle }">探索千年文明，感受建筑之美</text>
          <text class="description" :class="{ 'visible': sections.hero.description }">
            从宫殿庙宇到园林民居，从古城墙到古桥梁，让我们一起穿越时空，领略中国古代建筑的辉煌与魅力
          </text>
        </view>
        
        <!-- 入口按钮 -->
        <view class="hero-buttons">
          <button class="hero-btn primary" :class="{ 'visible': sections.hero.btn1 }" @click="goToMap">
            <text class="btn-text">查看古建筑名录</text>
          </button>
          <button class="hero-btn secondary" :class="{ 'visible': sections.hero.btn2 }" @click="goToChat">
            <text class="btn-text">开始 AI 导览</text>
          </button>
        </view>
      </view>
      
      <!-- 精选古建预览区 -->
      <view class="section-preview" :class="{ 'visible': sections.preview }">
        <view class="section-header">
          <text class="section-title">精选古建</text>
          <view class="window-divider">
            <view class="window-pattern"></view>
          </view>
        </view>
        
        <view class="preview-cards-grid">
          <view 
            v-for="(building, index) in previewBuildings" 
            :key="building.id"
            class="preview-card" 
            :class="{ 'visible': sections.previewCards[index] }"
            @click="goToDetail(building)"
          >
            <view class="card-image" :style="{ backgroundImage: 'url(' + building.image + ')' }"></view>
            <view class="card-info">
              <text class="card-name">{{ building.name }}</text>
              <text class="card-desc">{{ building.description }}</text>
              <view class="card-tags">
                <text v-for="tag in building.tags.slice(0, 2)" :key="tag" class="card-tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 项目亮点区 -->
      <view class="section-features" :class="{ 'visible': sections.features }">
        <view class="section-header">
          <text class="section-title">我们的特色</text>
          <view class="window-divider">
            <view class="window-pattern"></view>
          </view>
        </view>
        
        <view class="features-grid">
          <view class="feature-card">
            <view class="feature-icon">🏛️</view>
            <text class="feature-title">17 处古建全覆盖</text>
            <text class="feature-desc">覆盖宫殿、园林、桥梁、城防全类型</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">🤖</view>
            <text class="feature-title">AI 智能导览</text>
            <text class="feature-desc">实时问答，秒懂古建背后的文化故事</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">📋</view>
            <text class="feature-title">分类快速浏览</text>
            <text class="feature-desc">按类型筛选，一键找到你想看的古建</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">🎨</view>
            <text class="feature-title">沉浸式体验</text>
            <text class="feature-desc">新中式 UI 设计，身临其境的探索体验</text>
          </view>
        </view>
      </view>
      
      <!-- 古建小知识区 -->
      <view class="section-knowledge" :class="{ 'visible': sections.knowledge }">
        <view class="knowledge-card">
          <view class="bamboo-strip top"></view>
          <view class="bamboo-strip bottom"></view>
          
          <view class="knowledge-content">
            <view class="knowledge-icon">📜</view>
            <text class="knowledge-title">古建小知识</text>
            <view class="knowledge-text-wrapper">
              <text class="knowledge-text" :key="currentKnowledgeIndex">
                {{ knowledgeItems[currentKnowledgeIndex].text }}
              </text>
            </view>
          </view>
          
          <view class="knowledge-dots">
            <view 
              v-for="(item, index) in knowledgeItems" 
              :key="index"
              class="knowledge-dot"
              :class="{ active: currentKnowledgeIndex === index }"
              @click="goToKnowledge(index)"
            ></view>
          </view>
          
          <view class="knowledge-nav">
            <view class="nav-btn prev" @click="prevKnowledge"></view>
            <view class="nav-btn next" @click="nextKnowledge"></view>
          </view>
        </view>
      </view>
      
      <!-- 底部 Footer -->
      <view class="footer" :class="{ 'visible': sections.footer }">
        <text class="footer-slogan">以数字之眼，窥千年古建之美</text>
        <text class="footer-copyright">© 2026 中华古建筑导览</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sections: {
        hero: {
          seal: false,
          title: false,
          subtitle: false,
          description: false,
          btn1: false,
          btn2: false
        },
        preview: false,
        previewCards: [false, false, false, false, false, false, false, false],
        features: false,
        knowledge: false,
        footer: false
      },
      previewBuildings: [
        { id: 'gugong_01', name: '太和殿', category: 'palace', location: '北京故宫', description: '紫禁城，明清皇家宫殿', tags: ['宫殿', '明代'], image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop' },
        { id: 'zhuozheng_01', name: '拙政园', category: 'garden', location: '江苏苏州', description: '咫尺之内再造乾坤', tags: ['园林', '苏州'], image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=300&fit=crop' },
        { id: 'zhaozhou_01', name: '赵州桥', category: 'bridge', location: '河北赵县', description: '天下第一桥，千年不朽', tags: ['桥梁', '隋代'], image: 'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400&h=300&fit=crop' },
        { id: 'yueyang_01', name: '岳阳楼', category: 'tower', location: '湖南岳阳', description: '天下绝景，江南名楼', tags: ['楼阁', '宋代'], image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop' },
        { id: 'xian_01', name: '西安城墙', category: 'defense', location: '陕西西安', description: '中国现存规模最大的古代城垣', tags: ['城防', '明代'], image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop' },
        { id: 'shenyang_01', name: '沈阳故宫大政殿', category: 'palace', location: '辽宁沈阳', description: '浓郁满族特色的宫殿建筑', tags: ['宫殿', '清代'], image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=300&fit=crop' },
        { id: 'kongmiao_01', name: '曲阜孔庙', category: 'tower', location: '山东曲阜', description: '祭祀孔子的庙宇建筑群', tags: ['庙宇', '祭祀'], image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop' },
        { id: 'tulou_01', name: '福建土楼', category: 'residence', location: '福建龙岩', description: '客家人的东方古城堡', tags: ['民居', '客家'], image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop' }
      ],
      knowledgeItems: [
        { title: '斗拱', text: '斗拱，中国古建筑的灵魂构件，不用一钉一卯，就能撑起千斤重量，是古人榫卯智慧的极致体现。' },
        { title: '榫卯', text: '榫卯，木头之间的"海誓山盟"，一凸一凹严密扣合，越压越紧，让古建历经千年不倒。' },
        { title: '飞檐', text: '飞檐，屋角翘伸宛若飞鸟，既扩大了采光面，又让建筑多了灵动的美感，是中式建筑的标志性符号。' }
      ],
      currentKnowledgeIndex: 0,
      knowledgeTimer: null
    };
  },
  
  mounted() {
    this.startHeroAnimation();
    this.startKnowledgeCarousel();
  },
  
  beforeDestroy() {
    if (this.knowledgeTimer) {
      clearInterval(this.knowledgeTimer);
    }
  },
  
  methods: {
    startHeroAnimation() {
      setTimeout(() => this.sections.hero.seal = true, 200);
      setTimeout(() => this.sections.hero.title = true, 500);
      setTimeout(() => this.sections.hero.subtitle = true, 800);
      setTimeout(() => this.sections.hero.description = true, 1100);
      setTimeout(() => this.sections.hero.btn1 = true, 1400);
      setTimeout(() => this.sections.hero.btn2 = true, 1700);
    },
    
    startKnowledgeCarousel() {
      this.knowledgeTimer = setInterval(() => {
        this.nextKnowledge();
      }, 4000);
    },
    
    nextKnowledge() {
      this.currentKnowledgeIndex = (this.currentKnowledgeIndex + 1) % this.knowledgeItems.length;
    },
    
    prevKnowledge() {
      this.currentKnowledgeIndex = (this.currentKnowledgeIndex - 1 + this.knowledgeItems.length) % this.knowledgeItems.length;
    },
    
    goToKnowledge(index) {
      this.currentKnowledgeIndex = index;
    },
    
    goToDetail(building) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${building.id}&name=${encodeURIComponent(building.name)}`,
      });
    },
    
    goToMap() {
      uni.navigateTo({
        url: "/pages/map/map"
      });
    },
    
    goToChat() {
      uni.navigateTo({
        url: "/pages/index/index"
      });
    },
    
    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      const windowHeight = uni.getSystemInfoSync().windowHeight;
      
      this.sections.preview = scrollTop > windowHeight * 0.3;
      
      if (this.sections.preview) {
        this.previewBuildings.forEach((_, index) => {
          setTimeout(() => {
            this.$set(this.sections.previewCards, index, true);
          }, index * 100);
        });
      }
      
      this.sections.features = scrollTop > windowHeight * 0.8;
      this.sections.knowledge = scrollTop > windowHeight * 1.4;
      this.sections.footer = scrollTop > windowHeight * 1.8;
    }
  }
};
</script>

<style scoped>
/* 动态祥云背景层 */
.cloud-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='%238b4513' d='M400,100 Q300,50 200,100 Q100,150 200,200 Q300,250 400,200 Q500,150 600,200 Q700,250 600,100 Q500,50 400,100'/%3E%3C/svg%3E");
  background-size: 400rpx 400rpx;
  background-repeat: repeat;
  opacity: 0.08;
  animation: cloudMove 30s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes cloudMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 800rpx 400rpx;
  }
}

/* 水墨山水纹理背景层 */
.ink-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(139, 69, 19, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 60%, rgba(139, 69, 19, 0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 90%, rgba(139, 69, 19, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 50%, #e8dcc8 100%);
  position: relative;
}

.scroll-view {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* Hero 区 */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx 80rpx;
  position: relative;
  overflow: hidden;
}

/* 古建剪影装饰 */
.silhouette {
  position: absolute;
  bottom: 0;
  width: 300rpx;
  height: 400rpx;
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
}

.silhouette.left {
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cpath fill='%238b4513' d='M100,0 L160,60 L160,80 L180,80 L180,100 L140,100 L140,140 L150,140 L150,160 L130,160 L130,300 L70,300 L70,160 L50,160 L50,140 L60,140 L60,100 L20,100 L20,80 L40,80 L40,60 Z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom left;
}

.silhouette.right {
  right: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Cpath fill='%238b4513' d='M100,20 L140,60 L140,80 L160,80 L160,100 L120,100 L120,150 L130,150 L130,170 L110,170 L110,300 L90,300 L90,170 L70,170 L70,150 L80,150 L80,100 L40,100 L40,80 L60,80 L60,60 Z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom right;
}

/* 印章装饰 */
.seal-decor {
  position: absolute;
  top: 120rpx;
  left: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff8e6;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  letter-spacing: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 0, 0, 0.3);
  transform: rotate(-5deg);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.seal-decor.visible {
  opacity: 0.9;
}

/* 标题区域 */
.title-area {
  text-align: center;
  max-width: 600rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 2;
}

.main-title {
  display: block;
  font-size: 98rpx;
  font-weight: 900;
  color: #8b4513;
  letter-spacing: 20rpx;
  margin-bottom: 24rpx;
  text-shadow: 0 4rpx 16rpx rgba(196, 30, 58, 0.3), 0 2rpx 8rpx rgba(139, 69, 19, 0.2);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-title.visible {
  opacity: 1;
  transform: translateY(0);
}

.subtitle {
  display: block;
  font-size: 42rpx;
  color: #6b5643;
  margin-bottom: 32rpx;
  letter-spacing: 6rpx;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.description {
  display: block;
  font-size: 30.8rpx;
  color: #8b7355;
  line-height: 1.9;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.description.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Hero 按钮 */
.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 480rpx;
  position: relative;
  z-index: 2;
}

.hero-btn {
  height: 108rpx;
  border-radius: 54rpx;
  font-size: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
}

.hero-btn.visible {
  opacity: 1;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff8e6;
  box-shadow: 0 8rpx 24rpx rgba(139, 0, 0, 0.4);
}

.hero-btn.secondary {
  background: #fff;
  color: #8b4513;
  border: 3rpx solid #8b4513;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);
}

.hero-btn:hover {
  transform: translateY(-6px);
}

.hero-btn.primary:hover {
  box-shadow: 0 12rpx 32rpx rgba(139, 0, 0, 0.5);
}

.hero-btn.secondary:hover {
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.3);
}

.hero-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.btn-text {
  font-weight: 500;
  letter-spacing: 4rpx;
}

/* 通用区块样式 */
.section-preview,
.section-features,
.section-knowledge,
.footer {
  padding: 80rpx 40rpx;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-preview.visible,
.section-features.visible,
.section-knowledge.visible,
.footer.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 区块标题 */
.section-header {
  text-align: center;
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #8b4513;
  letter-spacing: 8rpx;
  display: block;
  margin-bottom: 16rpx;
}

/* 窗棂分隔线 */
.window-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
}

.window-pattern {
  width: 200rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #8b4513, transparent);
  position: relative;
}

.window-pattern::before,
.window-pattern::after {
  content: '';
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #8b4513;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.window-pattern::before {
  left: 0;
}

.window-pattern::after {
  right: 0;
}

/* 精选古建卡片 - 响应式网格 */
.preview-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

@media (min-width: 768px) {
  .preview-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .preview-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.preview-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(139, 69, 19, 0.15);
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px);
}

.preview-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.preview-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12rpx 32rpx rgba(139, 69, 19, 0.25);
}

.preview-card:active {
  transform: translateY(-4px) scale(0.99);
}

.card-image {
  width: 100%;
  height: 220rpx;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-card:hover .card-image {
  transform: scale(1.08);
}

.card-info {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #8b4513;
}

.card-desc {
  font-size: 22rpx;
  color: #8b7355;
  line-height: 1.6;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.card-tag {
  font-size: 18rpx;
  color: #c41e3a;
  background: rgba(196, 30, 58, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* 项目亮点 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.feature-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.18);
}

.feature-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.feature-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 12rpx;
}

.feature-desc {
  display: block;
  font-size: 28rpx;
  color: #8b7355;
  line-height: 1.6;
}

/* 古建小知识 - 竹简质感 */
.section-knowledge {
  padding-top: 0;
}

.knowledge-card {
  background: linear-gradient(90deg, #d4a574 0%, #e6c9a8 5%, #f0dbb8 15%, #f5e3c8 50%, #f0dbb8 85%, #e6c9a8 95%, #d4a574 100%);
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  border: 3rpx solid #a67c52;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.2);
}

/* 竹简条纹 */
.knowledge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 39rpx,
    rgba(166, 124, 82, 0.15) 39rpx,
    rgba(166, 124, 82, 0.15) 40rpx
  );
  pointer-events: none;
  z-index: 0;
}

.bamboo-strip {
  position: absolute;
  left: 20rpx;
  right: 20rpx;
  height: 12rpx;
  background: linear-gradient(90deg, #8b5a2b, #a67c52, #8b5a2b);
  border-radius: 4rpx;
  z-index: 1;
}

.bamboo-strip.top {
  top: 12rpx;
}

.bamboo-strip.bottom {
  bottom: 12rpx;
}

.knowledge-content {
  position: relative;
  z-index: 2;
}

.knowledge-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.knowledge-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #5c3d2e;
  margin-bottom: 20rpx;
}

.knowledge-text-wrapper {
  min-height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.knowledge-text {
  display: block;
  font-size: 32rpx;
  color: #5c3d2e;
  line-height: 1.9;
  animation: knowledgeFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes knowledgeFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.knowledge-dots {
  display: flex;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
  position: relative;
  z-index: 2;
}

.knowledge-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: rgba(139, 69, 19, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.knowledge-dot.active {
  background: #8b4513;
  transform: scale(1.3);
}

.knowledge-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 16rpx;
  pointer-events: none;
  z-index: 3;
}

.nav-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(139, 69, 19, 0.15);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 12rpx;
  height: 12rpx;
  border-top: 3rpx solid #8b4513;
  border-right: 3rpx solid #8b4513;
}

.nav-btn.prev::after {
  left: 55%;
  transform: translate(-50%, -50%) rotate(-135deg);
}

.nav-btn.next::after {
  left: 45%;
  transform: translate(-50%, -50%) rotate(45deg);
}

.nav-btn:hover {
  background: rgba(139, 69, 19, 0.25);
}

/* Footer */
.footer {
  text-align: center;
  padding-bottom: 100rpx;
}

.footer-slogan {
  display: block;
  font-size: 28rpx;
  color: #8b4513;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}

.footer-copyright {
  display: block;
  font-size: 22rpx;
  color: #8b7355;
}
</style>
