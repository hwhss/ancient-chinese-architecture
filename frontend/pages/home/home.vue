<template>
  <view class="container">
    <!-- 底层：径向渐变打底 -->
    <view class="radial-gradient-bg"></view>
    <!-- 中层：水墨古建远景 -->
    <view class="ink-architecture-bg"></view>
    <!-- 水墨山水纹理背景层 -->
    <view class="ink-background"></view>
    <!-- 顶层：动态祥云 -->
    <view class="cloud-background"></view>
    
    <!-- 主内容区域 -->
    <scroll-view scroll-y class="scroll-view" @scroll="onScroll" scroll-with-animation :scroll-top="scrollTop">
      <!-- 顶部 Hero 区 - 简化版 -->
      <view class="hero-section">
        <!-- 简化的角落装饰 -->
        <view class="corner-decoration top-left"></view>
        <view class="corner-decoration top-right"></view>
        <view class="corner-decoration bottom-left"></view>
        <view class="corner-decoration bottom-right"></view>
        
        <!-- 标题区域 -->
        <view class="title-area">
          <view class="title-wrapper">
            <text class="main-title" :class="{ 'visible': sections.hero.title }">中华古建筑导览</text>
            <!-- 精致朱砂印章 -->
            <view class="seal-decor" :class="{ 'visible': sections.hero.seal }" @click="goToAbout">古建</view>
          </view>
          
          <text class="subtitle" :class="{ 'visible': sections.hero.subtitle }">探索千年文明，感受建筑之美</text>
          <text class="description" :class="{ 'visible': sections.hero.description }">
            从宫殿庙宇到园林民居，从古城墙到古桥梁，让我们一起穿越时空，领略中国古代建筑的辉煌与魅力
          </text>
          
          <!-- 统计信息 - 移到标题下方 -->
          <view class="hero-stats" :class="{ 'visible': sections.hero.statCards }">
            <view class="stat-item">
              <text class="stat-number">17</text>
              <text class="stat-label">处古建</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-number">4</text>
              <text class="stat-label">大分类</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-number">AI</text>
              <text class="stat-label">智能导览</text>
            </view>
          </view>
          
          <!-- 中式分隔线 -->
          <view class="hero-divider" :class="{ 'visible': sections.hero.divider }">
            <view class="window-divider">
              <view class="window-pattern"></view>
            </view>
          </view>
        </view>
        
        <!-- 入口按钮 -->
        <view class="hero-buttons">
          <button class="hero-btn primary" :class="{ 'visible': sections.hero.btn1 }" @click="goToMap">
            <text class="btn-icon">📋</text>
            <text class="btn-text">查看古建筑名录</text>
          </button>
          <button class="hero-btn secondary" :class="{ 'visible': sections.hero.btn2 }" @click="goToChat">
            <text class="btn-icon">🤖</text>
            <text class="btn-text">开始 AI 导览</text>
          </button>
          
          <!-- 按钮下方的分类快捷入口 -->
          <view class="category-shortcuts" :class="{ 'visible': sections.hero.categoryShortcuts }">
            <view class="category-item" @click="goToCategory('palace')">
              <text class="category-icon">🏯</text>
              <text class="category-text">宫殿</text>
            </view>
            <view class="category-item" @click="goToCategory('garden')">
              <text class="category-icon">🌳</text>
              <text class="category-text">园林</text>
            </view>
            <view class="category-item" @click="goToCategory('bridge')">
              <text class="category-icon">🌉</text>
              <text class="category-text">桥梁</text>
            </view>
            <view class="category-item" @click="goToCategory('defense')">
              <text class="category-icon">🏰</text>
              <text class="category-text">城防</text>
            </view>
          </view>
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
            <view class="feature-icon">
              <svg viewBox="0 0 64 64" class="svg-icon">
                <path d="M32 8 L48 16 L48 48 L32 56 L16 48 L16 16 Z" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M32 16 L40 20 L40 40 L32 44 L24 40 L24 20 Z" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </view>
            <text class="feature-title">17 处古建全覆盖</text>
            <text class="feature-desc">从明清皇家宫殿到客家民居，跨越千年的17处代表性古建精华，带你走遍大江南北</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 64 64" class="svg-icon">
                <circle cx="32" cy="24" r="12" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M20 48 Q32 32 44 48" fill="none" stroke="currentColor" stroke-width="3"/>
                <circle cx="32" cy="24" r="4" fill="currentColor"/>
              </svg>
            </view>
            <text class="feature-title">AI 智能导览</text>
            <text class="feature-desc">基于大模型的智能问答，不管是古建历史还是构造细节，你想问的都能秒速解答</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 64 64" class="svg-icon">
                <rect x="12" y="12" width="40" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
                <rect x="12" y="24" width="40" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
                <rect x="12" y="36" width="30" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/>
              </svg>
            </view>
            <text class="feature-title">分类快速浏览</text>
            <text class="feature-desc">宫殿/园林/桥梁/城防四大分类，一键筛选，快速定位你感兴趣的古建</text>
          </view>
          
          <view class="feature-card">
            <view class="feature-icon">
              <svg viewBox="0 0 64 64" class="svg-icon">
                <path d="M12 48 L24 24 L32 32 L40 24 L52 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                <circle cx="24" cy="20" r="2" fill="currentColor"/>
                <circle cx="40" cy="20" r="2" fill="currentColor"/>
              </svg>
            </view>
            <text class="feature-title">沉浸式体验</text>
            <text class="feature-desc">全新的新中式UI与动效，滚动渐入+悬浮交互，给你身临其境的探索体验</text>
          </view>
        </view>
      </view>
      
      <!-- 古建小知识区 - 横向滑动卡片 -->
      <view class="section-knowledge" :class="{ 'visible': sections.knowledge }">
        <view class="section-header">
          <text class="section-title">古建小知识</text>
          <text class="section-subtitle">探索中国传统建筑的奥秘</text>
        </view>
        
        <scroll-view 
          class="knowledge-scroll" 
          scroll-x 
          show-scrollbar="false"
          @scroll="onKnowledgeScroll"
        >
          <view 
            v-for="(item, index) in knowledgeItems" 
            :key="index"
            class="knowledge-card-horizontal"
            :class="{ 'visible': sections.knowledge }"
            :style="{ 'transition-delay': index * 0.1 + 's' }"
          >
            <view class="knowledge-number">{{ String(index + 1).padStart(2, '0') }}</view>
            <view class="knowledge-content">
              <text class="knowledge-card-title">{{ item.title }}</text>
              <text class="knowledge-card-text">{{ item.text }}</text>
            </view>
            <view class="knowledge-accent"></view>
          </view>
        </scroll-view>
        
        <!-- 滑动指示器 -->
        <view class="scroll-indicator">
          <view class="indicator-line">
            <view class="indicator-progress" :style="{ width: knowledgeScrollProgress + '%' }"></view>
          </view>
          <text class="indicator-text">左右滑动查看更多</text>
        </view>
      </view>
      
      <!-- 底部 Footer -->
      <view class="footer" :class="{ 'visible': sections.footer }">
        <text class="footer-slogan">以数字之眼，窥千年古建之美</text>
        <text class="footer-copyright">© 2026 中华古建筑导览</text>
      </view>
    </scroll-view>
    
    <!-- 回到顶部按钮 -->
    <view 
      class="back-to-top" 
      :class="{ 'visible': showBackToTop }"
      @click="scrollToTop"
    >
      <text class="back-to-top-text">↑</text>
      <text class="back-to-top-seal">古建</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      scrollTop: 0,
      sections: {
        hero: {
          seal: false,
          title: false,
          subtitle: false,
          description: false,
          divider: false,
          btn1: false,
          btn2: false,
          cornerBtns: false,
          statCards: false,
          categoryShortcuts: false
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
        { title: '飞檐', text: '飞檐，屋角翘伸宛若飞鸟，既扩大了采光面，又让建筑多了灵动的美感，是中式建筑的标志性符号。' },
        { title: '瓦当', text: '瓦当，屋檐最前端的一片瓦，既有保护椽头的实用功能，又有精美纹饰的艺术价值，是古建的点睛之笔。' },
        { title: '台基', text: '台基，建筑的底座，不仅承重防潮，更体现等级尊卑，须弥座更是皇家建筑的专属标志。' },
        { title: '歇山顶', text: '歇山顶，中国古建筑中最优美的屋顶形式之一，既有庑殿顶的庄重，又有攒尖顶的灵动，故宫太和殿就是典型代表。' },
        { title: '庑殿顶', text: '庑殿顶，中国古建筑中等级最高的屋顶形式，四面斜坡一条正脊，庄重威严，是皇家建筑的首选。' },
        { title: '悬山顶', text: '悬山顶，屋顶两端伸出山墙之外，既保护墙体免受雨淋，又增添了建筑的层次感，是民居常用的屋顶形式。' },
        { title: '硬山顶', text: '硬山顶，屋顶与山墙齐平，构造简单防火性好，是民间建筑中最常见的屋顶形式之一。' },
        { title: '攒尖顶', text: '攒尖顶，屋顶呈锥形汇聚于一点，没有正脊，多用于亭、塔、阁等建筑，天坛祈年殿就是经典之作。' },
        { title: '雀替', text: '雀替，梁枋与柱交接处的装饰构件，既加固结构又增添美感，形如展翅的云雀，故名雀替。' },
        { title: '藻井', text: '藻井，室内天花板上的高级装饰，形如凹井绘有藻纹，不仅美观更有象征吉祥的寓意，故宫太和殿的蟠龙藻井最为精美。' },
        { title: '开间', text: '开间，古建筑的平面计量单位，两根柱子之间为一开间，开间越多等级越高，故宫太和殿有十一开间。' },
        { title: '须弥座', text: '须弥座，源于佛教的台基形式，由多层组成，雕刻精美，是皇家建筑和重要寺庙的专用基座。' },
        { title: '影壁', text: '影壁，又称照壁，大门内外的屏障建筑，既有风水讲究，又有装饰作用，九龙壁就是最著名的影壁。' }
      ],
      knowledgeScrollProgress: 0,
      showBackToTop: false
    };
  },
  
  mounted() {
    this.startHeroAnimation();
    this.shuffleKnowledgeItems();
  },
  
  beforeDestroy() {
    // 清理工作
  },
  
  methods: {
    shuffleKnowledgeItems() {
      const array = [...this.knowledgeItems];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      this.knowledgeItems = array;
    },

    startHeroAnimation() {
      setTimeout(() => this.sections.hero.title = true, 200);
      setTimeout(() => this.sections.hero.seal = true, 400);
      setTimeout(() => this.sections.hero.subtitle = true, 700);
      setTimeout(() => this.sections.hero.description = true, 1000);
      setTimeout(() => this.sections.hero.divider = true, 1300);
      setTimeout(() => this.sections.hero.btn1 = true, 1600);
      setTimeout(() => this.sections.hero.btn2 = true, 1900);
      setTimeout(() => this.sections.hero.statCards = true, 2100);
      setTimeout(() => this.sections.hero.categoryShortcuts = true, 2300);
    },

    onKnowledgeScroll(e) {
      const { scrollLeft, scrollWidth } = e.detail;
      const windowWidth = uni.getSystemInfoSync().windowWidth;
      this.knowledgeScrollProgress = (scrollLeft / (scrollWidth - windowWidth)) * 100;
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
      
      // 回到顶部按钮显示
      this.showBackToTop = scrollTop > windowHeight;
      
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
    },
    
    scrollToTop() {
      this.scrollTop = 1;
      this.$nextTick(() => {
        this.scrollTop = 0;
      });
    },
    
    goToAbout() {
      uni.navigateTo({
        url: "/pages/about/about"
      });
    },
    
    goToRandomBuilding() {
      const randomIndex = Math.floor(Math.random() * this.previewBuildings.length);
      const randomBuilding = this.previewBuildings[randomIndex];
      this.goToDetail(randomBuilding);
    },
    
    goToCategory(category) {
      uni.navigateTo({
        url: `/pages/map/map?category=${category}`
      });
    }
  }
};
</script>

<style scoped>
/* 霞鹜文楷书法字体 */
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');

/* 自定义滚动条样式 */
.scroll-view::-webkit-scrollbar {
  width: 12rpx;
}

.scroll-view::-webkit-scrollbar-track {
  background: #f8f4e8;
  border-radius: 6rpx;
}

.scroll-view::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c41e3a 0%, #8b0000 100%);
  border-radius: 6rpx;
  border: 2rpx solid #f8f4e8;
}

.scroll-view::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #a01830 0%, #6b0000 100%);
}

/* 底层：径向渐变打底 */
.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, #f8f4e8 0%, #f0e9d8 40%, #e8dcc8 70%, #dcc8b0 100%);
  pointer-events: none;
  z-index: 0;
}

/* 中层：水墨古建远景 */
.ink-architecture-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cpath fill='%235c3d2e' d='M0,700 Q200,600 400,650 Q600,550 800,600 Q1000,500 1200,550 L1200,800 L0,800 Z' opacity='0.05'/%3E%3Cpath fill='%238b4513' d='M100,700 L150,500 L200,550 L250,450 L300,500 L350,600 L400,550 L450,400 L500,500 L550,450 L600,550 L650,400 L700,500 L750,450 L800,550 L850,500 L900,600 L950,550 L1000,650 L1000,700 Z' opacity='0.06'/%3E%3Cpath fill='%238b4513' d='M300,700 L350,550 L400,600 L450,450 L500,500 L550,400 L600,480 L650,550 L700,600 L700,700 Z' opacity='0.08'/%3E%3C/svg%3E");
  background-size: cover;
  background-position: bottom;
  opacity: 0.08;
  pointer-events: none;
  z-index: 1;
}

/* 顶层：动态祥云（调慢） */
.cloud-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='%238b4513' d='M400,100 Q300,50 200,100 Q100,150 200,200 Q300,250 400,200 Q500,150 600,200 Q700,250 600,100 Q500,50 400,100'/%3E%3C/svg%3E");
  background-size: 400rpx 400rpx;
  background-repeat: repeat;
  opacity: 0.06;
  animation: cloudMove 60s linear infinite;
  pointer-events: none;
  z-index: 2;
}

@keyframes cloudMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 800rpx 400rpx;
  }
}

/* 水墨山水纹理背景层（保留但z-index调整） */
.ink-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(139, 69, 19, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 60%, rgba(139, 69, 19, 0.03) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 90%, rgba(139, 69, 19, 0.035) 0%, transparent 50%);
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

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 80rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 0, 0, 0.4);
  transform: rotate(-12deg) translateY(100rpx) scale(0);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 100;
}

.back-to-top.visible {
  transform: rotate(-12deg) translateY(0) scale(1);
  opacity: 1;
}

.back-to-top:hover {
  transform: rotate(-12deg) translateY(-6rpx) scale(1.05);
  box-shadow: 0 12rpx 32rpx rgba(139, 0, 0, 0.5);
}

.back-to-top:active {
  transform: rotate(-12deg) translateY(-2rpx) scale(0.98);
}

.back-to-top-text {
  font-size: 36rpx;
  color: #fff8e6;
  font-weight: bold;
  line-height: 1;
}

.back-to-top-seal {
  font-size: 20rpx;
  color: #fff8e6;
  font-weight: bold;
  line-height: 1;
  letter-spacing: 1rpx;
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

/* 简化的角落装饰 */
.corner-decoration {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
  border: 2rpx solid #8b4513;
}

.corner-decoration.top-left {
  top: 30rpx;
  left: 30rpx;
  border-right: none;
  border-bottom: none;
}

.corner-decoration.top-right {
  top: 30rpx;
  right: 30rpx;
  border-left: none;
  border-bottom: none;
}

.corner-decoration.bottom-left {
  bottom: 30rpx;
  left: 30rpx;
  border-right: none;
  border-top: none;
}

.corner-decoration.bottom-right {
  bottom: 30rpx;
  right: 30rpx;
  border-left: none;
  border-top: none;
}

/* 标题区域 */
.title-area {
  text-align: center;
  max-width: 600rpx;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 2;
}

.title-wrapper {
  position: relative;
  display: inline-block;
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
  font-family: 'ZCOOL XiaoWei', serif;
}

.main-title.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 精致朱砂印章（放大） */
.seal-decor {
  position: absolute;
  top: -30rpx;
  right: -80rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  color: #fff8e6;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  letter-spacing: 2rpx;
  box-shadow: 0 6rpx 16rpx rgba(139, 0, 0, 0.35);
  transform: rotate(-12deg);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  border: 3rpx solid rgba(255, 248, 230, 0.2);
}

.seal-decor.visible {
  opacity: 0.95;
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
  font-family: 'ZCOOL XiaoWei', serif;
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

/* Hero分隔线 */
.hero-divider {
  margin-top: 32rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-divider.visible {
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
  gap: 12rpx;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  position: relative;
  overflow: hidden;
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

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-weight: 500;
  letter-spacing: 4rpx;
}

/* Hero 统计信息 - 新的简化设计 */
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  margin-top: 32rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #c41e3a;
  line-height: 1;
  font-family: 'ZCOOL XiaoWei', serif;
}

.stat-label {
  font-size: 22rpx;
  color: #8b7355;
  letter-spacing: 2rpx;
}

.stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: linear-gradient(180deg, transparent, #dcc8b0, transparent);
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
  font-family: 'ZCOOL XiaoWei', serif;
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

/* 轻量化卡片设计 */
.preview-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(139, 69, 19, 0.08);
  border: 1rpx solid rgba(139, 69, 19, 0.06);
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
  transform: translateY(-4px);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.12);
}

.preview-card:active {
  transform: translateY(-2px);
}

/* 统一图片比例 4:3 */
.card-image {
  width: 100%;
  aspect-ratio: 4/3;
  background-size: cover;
  background-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-card:hover .card-image {
  transform: scale(1.04);
}

.card-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #3c2a1d;
  line-height: 1.4;
}

.card-desc {
  font-size: 22rpx;
  color: #8b7355;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 20rpx;
  color: #8b4513;
  background: rgba(139, 69, 19, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-weight: 500;
  transition: all 0.25s ease;
}

.card-tag:hover {
  background: rgba(139, 69, 19, 0.15);
}

/* 项目亮点 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28rpx;
}

.feature-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 28rpx;
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
  font-size: 64rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-icon {
  width: 64rpx;
  height: 64rpx;
  color: #c41e3a;
}

.feature-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 14rpx;
  letter-spacing: 2rpx;
}

.feature-desc {
  display: block;
  font-size: 28rpx;
  color: #8b7355;
  line-height: 1.7;
  letter-spacing: 1rpx;
}

/* 古建小知识 - 横向滑动卡片 */
.section-knowledge {
  padding-top: 0;
}

.section-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #3c2a1d;
  margin-bottom: 12rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.section-subtitle {
  display: block;
  font-size: 26rpx;
  color: #8b7355;
}

.knowledge-scroll {
  white-space: nowrap;
  padding: 0 30rpx 20rpx;
}

.knowledge-card-horizontal {
  display: inline-block;
  width: 560rpx;
  margin-right: 24rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f4e8 100%);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  border-left: 6rpx solid #c41e3a;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  vertical-align: top;
}

.knowledge-card-horizontal.visible {
  opacity: 1;
  transform: translateX(0);
}

.knowledge-card-horizontal:last-child {
  margin-right: 60rpx;
}

.knowledge-number {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  font-size: 48rpx;
  font-weight: bold;
  color: rgba(196, 30, 58, 0.15);
  font-family: 'ZCOOL XiaoWei', serif;
  line-height: 1;
}

.knowledge-content {
  position: relative;
  z-index: 1;
}

.knowledge-card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #3c2a1d;
  margin-bottom: 16rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.knowledge-card-text {
  display: block;
  font-size: 26rpx;
  color: #6b5643;
  line-height: 1.8;
  white-space: normal;
}

.knowledge-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #c41e3a, #8b4513);
  opacity: 0.3;
}

/* 滑动指示器 */
.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32rpx;
  gap: 16rpx;
}

.indicator-line {
  width: 120rpx;
  height: 4rpx;
  background: #e8dcc8;
  border-radius: 2rpx;
  overflow: hidden;
}

.indicator-progress {
  height: 100%;
  background: linear-gradient(90deg, #c41e3a, #8b4513);
  border-radius: 2rpx;
  transition: width 0.1s ease;
}

.indicator-text {
  font-size: 22rpx;
  color: #a89078;
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
  font-family: 'ZCOOL XiaoWei', serif;
}

.footer-copyright {
  display: block;
  font-size: 22rpx;
  color: #8b7355;
}

/* 按钮下方的分类快捷入口 */
.category-shortcuts {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-top: 32rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.category-shortcuts.visible {
  opacity: 1;
  transform: translateY(0);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 16rpx 12rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12rpx;
}

.category-item:hover {
  transform: translateY(-4rpx);
  background: rgba(196, 30, 58, 0.08);
}

.category-item:active {
  transform: translateY(-2rpx) scale(0.98);
}

.category-icon {
  font-size: 32rpx;
  line-height: 1;
}

.category-text {
  font-size: 20rpx;
  color: #8b4513;
  font-weight: 500;
  letter-spacing: 1rpx;
  line-height: 1;
}

/* 印章可点击样式调整 */
.seal-decor {
  cursor: pointer;
  pointer-events: auto;
}

.seal-decor:hover {
  transform: rotate(-12deg) scale(1.1);
  box-shadow: 0 10rpx 24rpx rgba(139, 0, 0, 0.45);
}

.seal-decor:active {
  transform: rotate(-12deg) scale(0.98);
}

/* 响应式：手机端适配 */
@media (max-width: 767px) {
  .main-title {
    font-size: 56rpx;
    letter-spacing: 12rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
  }
  
  .description {
    font-size: 24rpx;
    padding: 0 40rpx;
  }
  
  .hero-stats {
    gap: 24rpx;
  }
  
  .stat-number {
    font-size: 32rpx;
  }
  
  .category-shortcuts {
    flex-wrap: wrap;
    gap: 16rpx;
  }
  
  .seal-decor {
    width: 70rpx;
    height: 70rpx;
    font-size: 24rpx;
    right: -60rpx;
    top: -20rpx;
  }
}
</style>
