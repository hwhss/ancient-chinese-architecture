<template>
  <view class="container page-enter">
    <!-- 底层：径向渐变打底 -->
    <view class="radial-gradient-bg"></view>
    <!-- 中层：水墨古建远景 -->
    <view class="ink-architecture-bg"></view>
    <!-- 水墨山水纹理背景层 -->
    <view class="ink-background"></view>
    <!-- 顶层：动态祥云 -->
    <view class="cloud-background"></view>

    <!-- 骨架屏 - 加载时显示 -->
    <SkeletonScreen
      v-if="loading"
      type="home"
      :loading="loading"
      :card-count="4"
    />

    <!-- 分享卡片弹窗 -->
    <ShareCard
      :visible="showShareCard"
      :building="shareBuilding"
      @close="showShareCard = false"
      @share="onShareCard"
    />

    <!-- 主内容区域 -->
    <scroll-view
      v-show="!loading"
      scroll-y
      class="scroll-view"
      @scroll="onScroll"
      scroll-with-animation
      :scroll-top="scrollTop"
    >
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
            <button class="hero-btn primary ink-ripple" :class="{ 'visible': sections.hero.btn1 }" @click="goToMap">
              <text class="btn-icon">📋</text>
              <text class="btn-text">查看古建筑名录</text>
            </button>
            <button class="hero-btn secondary ink-ripple" :class="{ 'visible': sections.hero.btn2 }" @click="goToChat">
              <text class="btn-icon">🤖</text>
              <text class="btn-text">开始 AI 导览</text>
            </button>
          
          <!-- 按钮下方的分类快捷入口 -->
          <view class="category-shortcuts" :class="{ 'visible': sections.hero.categoryShortcuts }">
            <view class="category-item tap-feedback" @click="goToCategory('palace')">
              <text class="category-icon">🏯</text>
              <text class="category-text">宫殿</text>
            </view>
            <view class="category-item tap-feedback" @click="goToCategory('garden')">
              <text class="category-icon">🌳</text>
              <text class="category-text">园林</text>
            </view>
            <view class="category-item tap-feedback" @click="goToCategory('bridge')">
              <text class="category-icon">🌉</text>
              <text class="category-text">桥梁</text>
            </view>
            <view class="category-item tap-feedback" @click="goToCategory('defense')">
              <text class="category-icon">🏰</text>
              <text class="category-text">城防</text>
            </view>
          </view>

          <!-- 我的收藏快捷入口 -->
          <view class="favorites-shortcut-wrapper" :class="{ 'visible': sections.hero.categoryShortcuts }">
            <view class="favorites-shortcut card-ink" @click="goToFavorites">
              <view class="favorites-icon-wrapper">
                <text class="favorites-icon">⭐</text>
                <view v-if="favoriteCount > 0" class="favorites-badge">{{ favoriteCount }}</view>
              </view>
              <view class="favorites-info">
                <text class="favorites-title">我的收藏</text>
                <text class="favorites-count">{{ favoriteCount }} 处古建</text>
              </view>
              <view class="favorites-arrow-wrapper">
                <text class="favorites-arrow">→</text>
              </view>
            </view>
          </view>

          <!-- 设置入口 -->
          <view class="settings-shortcut-wrapper" :class="{ 'visible': sections.hero.categoryShortcuts }">
            <view class="settings-shortcut card-ink" @click="goToSettings">
              <view class="settings-icon-wrapper">
                <text class="settings-icon">⚙️</text>
              </view>
              <view class="settings-info">
                <text class="settings-title">设置</text>
                <text class="settings-desc">主题、偏好设置</text>
              </view>
              <view class="settings-arrow-wrapper">
                <text class="settings-arrow">→</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 每日推荐区 -->
      <view class="section-daily" :class="{ 'visible': sections.daily }">
        <view class="section-header">
            <view class="daily-header-left">
              <text class="section-title">📅 每日一建</text>
              <text class="daily-date">{{ todayDate }}</text>
            </view>
            <view class="window-divider">
              <view class="window-pattern"></view>
            </view>
          </view>

        <view v-if="dailyBuilding" class="daily-card-wrapper">
            <view class="daily-card card-ink" @click="goToDetail(dailyBuilding)">
            <!-- 左侧图片 -->
            <view class="daily-image-section">
              <view class="daily-image" :style="{ backgroundImage: 'url(' + dailyBuilding.image + ')' }"></view>
              <view class="daily-badge">
                <text class="badge-text">今日推荐</text>
              </view>
              <!-- 装饰性角落 -->
              <view class="image-corner top-left"></view>
              <view class="image-corner top-right"></view>
              <view class="image-corner bottom-left"></view>
              <view class="image-corner bottom-right"></view>
            </view>

            <!-- 右侧内容 -->
            <view class="daily-content-section">
              <view class="daily-content">
                <!-- 标题区 -->
                <view class="daily-header">
                  <view class="daily-title-wrapper">
                    <text class="daily-name">{{ dailyBuilding.name }}</text>
                    <view class="daily-location">
                      <text class="location-icon">📍</text>
                      <text class="location-text">{{ dailyBuilding.location }}</text>
                    </view>
                  </view>
                  <view class="daily-dynasty-badge">
                    <text class="dynasty-text">{{ dailyBuilding.dynasty }}</text>
                  </view>
                </view>

                <!-- 分隔线 -->
                <view class="daily-divider"></view>

                <!-- 描述 -->
                <text class="daily-desc">{{ dailyBuilding.description }}</text>

                <!-- 标签 -->
                <view class="daily-tags">
                  <text v-for="tag in dailyBuilding.tags" :key="tag" class="daily-tag">{{ tag }}</text>
                </view>

                <!-- 底部操作区 -->
                <view class="daily-footer">
                  <view class="daily-action-btn ink-ripple">
                    <text class="action-icon">👁️</text>
                    <text class="action-text">查看详情</text>
                  </view>
                  <view class="daily-actions-right">
                    <view class="daily-favorite-btn tap-feedback" @click.stop="toggleFavorite(dailyBuilding)">
                      <text class="favorite-icon" :class="{ 'active': isFavorite(dailyBuilding.id) }">
                        {{ isFavorite(dailyBuilding.id) ? '★' : '☆' }}
                      </text>
                      <text class="favorite-text" :class="{ 'active': isFavorite(dailyBuilding.id) }">
                        {{ isFavorite(dailyBuilding.id) ? '已收藏' : '收藏' }}
                      </text>
                    </view>
                    <view class="daily-share-btn tap-feedback" @click.stop="shareDailyBuilding">
                      <text class="share-icon">📤</text>
                      <text class="share-text">分享</text>
                    </view>
                  </view>
                </view>
              </view>
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
            class="preview-card card-ink" 
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
          <view class="feature-card card-ink">
            <view class="feature-icon">
              <svg viewBox="0 0 64 64" class="svg-icon">
                <path d="M32 8 L48 16 L48 48 L32 56 L16 48 L16 16 Z" fill="none" stroke="currentColor" stroke-width="3"/>
                <path d="M32 16 L40 20 L40 40 L32 44 L24 40 L24 20 Z" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </view>
            <text class="feature-title">17 处古建全覆盖</text>
            <text class="feature-desc">从明清皇家宫殿到客家民居，跨越千年的17处代表性古建精华，带你走遍大江南北</text>
          </view>
          
          <view class="feature-card card-ink">
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
          
          <view class="feature-card card-ink">
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
          
          <view class="feature-card card-ink">
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
          <view class="window-divider">
            <view class="window-pattern"></view>
          </view>
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
import SkeletonScreen from "../../components/SkeletonScreen.vue";
import ShareCard from "../../components/ShareCard.vue";

export default {
  components: {
    SkeletonScreen,
    ShareCard
  },
  data() {
    return {
      loading: true,
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
        daily: false,
        preview: false,
        previewCards: [false, false, false, false, false, false, false, false],
        features: false,
        knowledge: false,
        footer: false
      },
      previewBuildings: [
        { id: 'gugong_01', name: '太和殿', category: 'palace', location: '北京故宫', description: '紫禁城，明清皇家宫殿', tags: ['宫殿', '明代'], dynasty: '明代', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop' },
        { id: 'zhuozheng_01', name: '拙政园', category: 'garden', location: '江苏苏州', description: '咫尺之内再造乾坤', tags: ['园林', '苏州'], dynasty: '明代', image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=300&fit=crop' },
        { id: 'zhaozhou_01', name: '赵州桥', category: 'bridge', location: '河北赵县', description: '天下第一桥，千年不朽', tags: ['桥梁', '隋代'], dynasty: '隋代', image: 'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400&h=300&fit=crop' },
        { id: 'yueyang_01', name: '岳阳楼', category: 'tower', location: '湖南岳阳', description: '天下绝景，江南名楼', tags: ['楼阁', '宋代'], dynasty: '宋代', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop' },
        { id: 'xian_01', name: '西安城墙', category: 'defense', location: '陕西西安', description: '中国现存规模最大的古代城垣', tags: ['城防', '明代'], dynasty: '明代', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop' },
        { id: 'shenyang_01', name: '沈阳故宫大政殿', category: 'palace', location: '辽宁沈阳', description: '浓郁满族特色的宫殿建筑', tags: ['宫殿', '清代'], dynasty: '清代', image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=300&fit=crop' },
        { id: 'kongmiao_01', name: '曲阜孔庙', category: 'tower', location: '山东曲阜', description: '祭祀孔子的庙宇建筑群', tags: ['庙宇', '祭祀'], dynasty: '宋代', image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop' },
        { id: 'tulou_01', name: '福建土楼', category: 'residence', location: '福建龙岩', description: '客家人的东方古城堡', tags: ['民居', '客家'], dynasty: '清代', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop' }
      ],
      dailyBuilding: null,
      favorites: [],
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
      showBackToTop: false,
      showShareCard: false,
      shareBuilding: {}
    };
  },
  
  mounted() {
    // 获取每日推荐
    this.getDailyBuilding();

    // 模拟加载延迟，展示骨架屏效果
    setTimeout(() => {
      this.loading = false;
      this.startHeroAnimation();
      this.shuffleKnowledgeItems();
    }, 800);
  },

  onShow() {
    // 每次页面显示时重新加载收藏列表，保持数据同步
    this.loadFavorites();
  },

  computed: {
    todayDate() {
      return this.getTodayDate();
    },

    // 获取收藏数量
    favoriteCount() {
      return this.favorites?.length || 0;
    }
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

    // 获取每日推荐建筑
    getDailyBuilding() {
      // 获取今天的日期字符串作为种子
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      // 使用日期字符串生成一个固定的索引
      let hash = 0;
      for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      // 使用哈希值选择建筑，确保同一天总是显示同一座建筑
      const index = Math.abs(hash) % this.previewBuildings.length;
      this.dailyBuilding = this.previewBuildings[index];
    },

    // 获取今天的日期字符串
    getTodayDate() {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekDay = weekDays[today.getDay()];
      return `${month}月${day}日 星期${weekDay}`;
    },

    // 分享每日推荐
    shareDailyBuilding() {
      if (!this.dailyBuilding) return;

      // 打开分享卡片弹窗
      this.shareBuilding = {
        id: this.dailyBuilding.id,
        name: this.dailyBuilding.name,
        image: this.dailyBuilding.image,
        location: this.dailyBuilding.location,
        dynasty: this.dailyBuilding.dynasty,
        description: this.dailyBuilding.description,
        tags: this.dailyBuilding.tags
      };
      this.showShareCard = true;
    },

    // 分享卡片回调
    onShareCard(shareData) {
      console.log('分享数据:', shareData);
      // 可以在这里处理分享统计等逻辑
    },

    // ========== 收藏功能 ==========

    // 加载收藏列表
    loadFavorites() {
      try {
        const favorites = uni.getStorageSync('FAVORITE_BUILDINGS');
        if (favorites && Array.isArray(favorites)) {
          this.favorites = favorites;
        }
      } catch (e) {
        console.warn('加载收藏失败:', e);
      }
    },

    // 保存收藏列表
    saveFavorites() {
      try {
        uni.setStorageSync('FAVORITE_BUILDINGS', this.favorites);
      } catch (e) {
        console.warn('保存收藏失败:', e);
      }
    },

    // 切换收藏状态
    toggleFavorite(building) {
      const index = this.favorites.findIndex(f => f.id === building.id);

      if (index > -1) {
        // 取消收藏
        this.favorites.splice(index, 1);
        uni.showToast({
          title: '已取消收藏',
          icon: 'none',
          duration: 1500
        });
      } else {
        // 添加收藏
        this.favorites.push({
          id: building.id,
          name: building.name,
          image: building.image,
          location: building.location,
          dynasty: building.dynasty,
          description: building.description,
          tags: building.tags,
          category: building.category,
          addedAt: Date.now()
        });
        uni.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500
        });
      }

      this.saveFavorites();
    },

    // 检查是否已收藏
    isFavorite(buildingId) {
      return this.favorites.some(f => f.id === buildingId);
    },

    // 跳转到收藏页面
    goToFavorites() {
      uni.navigateTo({
        url: '/pages/favorites/favorites'
      });
    },

    // 跳转到设置页面
    goToSettings() {
      uni.navigateTo({
        url: '/pages/settings/settings'
      });
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
      setTimeout(() => this.sections.daily = true, 2500);
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
  },

  // 微信小程序分享配置
  // #ifdef MP-WEIXIN
  onShareAppMessage() {
    if (this.dailyBuilding) {
      return {
        title: `${this.dailyBuilding.name} - 每日一建 | 中华古建筑导览`,
        path: `/pages/detail/detail?materialId=${this.dailyBuilding.id}&name=${encodeURIComponent(this.dailyBuilding.name)}`,
        imageUrl: this.dailyBuilding.image
      };
    }
    return {
      title: '中华古建筑导览 - 探索千年文明',
      path: '/pages/home/home',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop'
    };
  },

  onShareTimeline() {
    if (this.dailyBuilding) {
      return {
        title: `${this.dailyBuilding.name} - 每日一建 | 中华古建筑导览`,
        query: `materialId=${this.dailyBuilding.id}&name=${encodeURIComponent(this.dailyBuilding.name)}`,
        imageUrl: this.dailyBuilding.image
      };
    }
    return {
      title: '中华古建筑导览 - 探索千年文明',
      query: '',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop'
    };
  }
  // #endif
};
</script>

<style scoped>
/* 霞鹜文楷书法字体 */
@import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');

/* ============================================
   步骤七：规范化色彩系统 - CSS 变量定义
   ============================================ */
:root {
  /* 主色调 - 朱砂红 */
  --color-primary: #c41e3a;
  --color-primary-dark: #8b0000;
  --color-primary-light: #d6455a;
  
  /* 辅助色 - 古铜棕 */
  --color-secondary: #8b4513;
  --color-secondary-dark: #6b3410;
  --color-secondary-light: #a67c52;
  
  /* 中性色 */
  --color-text-primary: #3c2a1d;
  --color-text-secondary: #6b5643;
  --color-text-tertiary: #8b7355;
  --color-text-muted: #a89078;
  
  /* 背景色 */
  --color-bg-primary: #f8f4e8;
  --color-bg-secondary: #f0e9d8;
  --color-bg-tertiary: #e8dcc8;
  --color-bg-card: #ffffff;
  
  /* 边框色 */
  --color-border: #e8dcc8;
  --color-border-light: #dcc8b0;
  
  /* 功能色 */
  --color-error: #b85450;
  --color-success: #5b8c5a;
  
  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(139, 69, 19, 0.08);
  --shadow-md: 0 4rpx 16rpx rgba(139, 69, 19, 0.12);
  --shadow-lg: 0 8rpx 24rpx rgba(139, 69, 19, 0.15);
  --shadow-primary: 0 6rpx 16rpx rgba(196, 30, 58, 0.3);
  
  /* 动画曲线 */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* 圆角 */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
  --radius-full: 9999rpx;
  
  /* ============================================
     步骤八：字体层级系统
     ============================================ */
  /* 字体族 */
  --font-display: 'ZCOOL XiaoWei', 'Noto Serif SC', 'Source Han Serif SC', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  /* 字体大小层级 */
  --text-xs: 20rpx;
  --text-sm: 24rpx;
  --text-base: 28rpx;
  --text-lg: 32rpx;
  --text-xl: 36rpx;
  --text-2xl: 40rpx;
  --text-3xl: 48rpx;
  --text-4xl: 56rpx;
  --text-5xl: 72rpx;
  --text-6xl: 96rpx;
  
  /* 行高 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* 字间距 */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;
  --tracking-widest: 0.2em;
  
  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* ============================================
     步骤九：微动效系统
     ============================================ */
  /* 动画时长 */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  
  /* 悬浮效果 */
  --hover-lift: translateY(-4px);
  --hover-scale: scale(1.02);
  --hover-shadow: 0 12rpx 32rpx rgba(139, 69, 19, 0.2);
}

/* ============================================
   步骤九：微动效 - 骨架屏动画
   ============================================ */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e8dcc8 25%,
    #f0e9d8 50%,
    #e8dcc8 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* ============================================
   步骤九：微动效 - 按钮波纹效果
   ============================================ */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.btn-ripple:active::after {
  width: 300rpx;
  height: 300rpx;
}

/* ============================================
   步骤九：微动效 - 脉冲动画
   ============================================ */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.pulse-effect {
  position: relative;
}

.pulse-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: inherit;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  z-index: -1;
}

/* ============================================
   步骤九：微动效 - 悬浮抬升效果
   ============================================ */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: var(--hover-lift);
  box-shadow: var(--hover-shadow);
}

/* ============================================
   步骤九：微动效 - 摇晃提示
   ============================================ */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4rpx); }
  20%, 40%, 60%, 80% { transform: translateX(4rpx); }
}

.shake-animation {
  animation: shake 0.5s ease-in-out;
}

/* ============================================
   步骤九：微动效 - 旋转加载
   ============================================ */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin-animation {
  animation: spin 1s linear infinite;
}

/* ============================================
   步骤九：微动效 - 呼吸效果
   ============================================ */
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.breathe-animation {
  animation: breathe 2s ease-in-out infinite;
}

/* 底层：径向渐变打底 */
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
.section-daily,
.section-preview,
.section-features,
.section-knowledge,
.footer {
  padding: 80rpx 40rpx;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-daily.visible,
.section-preview.visible,
.section-features.visible,
.section-knowledge.visible,
.footer.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ========== 每日推荐区 ========== */
.section-daily {
  padding: 80rpx 40rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(200, 37, 6, 0.03) 50%, transparent 100%);
}

.daily-header-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.daily-date {
  font-size: 26rpx;
  color: #8b7355;
  font-weight: 500;
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
  border: 2rpx solid #e8b860;
  box-shadow: 0 4rpx 12rpx rgba(232, 184, 96, 0.2);
}

/* 卡片容器 */
.daily-card-wrapper {
  max-width: 800rpx;
  margin: 0 auto;
}

/* 卡片主体 - 优化比例 */
.daily-card {
  display: flex;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 
    0 20rpx 60rpx rgba(139, 69, 19, 0.12),
    0 8rpx 24rpx rgba(139, 69, 19, 0.08);
  border: 2rpx solid #e8d8c8;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-card:active {
  transform: translateY(-6rpx);
  box-shadow: 
    0 28rpx 80rpx rgba(139, 69, 19, 0.18),
    0 12rpx 32rpx rgba(139, 69, 19, 0.12);
}

/* 左侧图片区域 - 优化为黄金比例 */
.daily-image-section {
  position: relative;
  width: 42%;
  min-height: 360rpx;
  overflow: hidden;
}

.daily-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-card:hover .daily-image {
  transform: scale(1.1);
}

/* 图片渐变遮罩 */
.daily-image-section::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 60rpx;
  background: linear-gradient(90deg, transparent, rgba(250, 246, 237, 0.8));
  pointer-events: none;
}

/* 图片装饰角落 - 更精致 */
.image-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(200, 37, 6, 0.4);
  z-index: 2;
  transition: all 0.3s ease;
}

.daily-card:hover .image-corner {
  border-color: rgba(200, 37, 6, 0.7);
  width: 50rpx;
  height: 50rpx;
}

.image-corner.top-left {
  top: 20rpx;
  left: 20rpx;
  border-right: none;
  border-bottom: none;
}

.image-corner.top-right {
  top: 20rpx;
  right: 20rpx;
  border-left: none;
  border-bottom: none;
}

.image-corner.bottom-left {
  bottom: 20rpx;
  left: 20rpx;
  border-right: none;
  border-top: none;
}

.image-corner.bottom-right {
  bottom: 20rpx;
  right: 20rpx;
  border-left: none;
  border-top: none;
}

/* 今日推荐徽章 - 更醒目 */
.daily-badge {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  box-shadow: 0 6rpx 20rpx rgba(200, 37, 6, 0.4);
  z-index: 3;
  transform: rotate(-3deg);
}

.badge-text {
  font-size: 22rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

/* 右侧内容区域 - 更紧凑 */
.daily-content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 36rpx 40rpx;
}

.daily-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 头部区域 - 优化布局 */
.daily-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 4rpx;
}

.daily-title-wrapper {
  flex: 1;
}

.daily-name {
  font-size: 42rpx;
  font-weight: bold;
  color: #3c2a1d;
  letter-spacing: 8rpx;
  margin-bottom: 10rpx;
  display: block;
  line-height: 1.3;
}

.daily-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.location-icon {
  font-size: 22rpx;
}

.location-text {
  font-size: 24rpx;
  color: #8b7355;
}

/* 朝代徽章 - 圆形设计 */
.daily-dynasty-badge {
  background: linear-gradient(135deg, #c82506 0%, #a81c07 100%);
  padding: 10rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.25);
  flex-shrink: 0;
}

.dynasty-text {
  font-size: 24rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

/* 分隔线 - 更精致 */
.daily-divider {
  width: 100%;
  height: 2rpx;
  background: linear-gradient(90deg, #e8d8c8 0%, transparent 80%);
  margin: 4rpx 0;
}

/* 描述文字 - 优化行高 */
.daily-desc {
  font-size: 28rpx;
  color: #5a4a3a;
  line-height: 1.7;
  text-align: justify;
  max-height: 96rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 标签 - 更紧凑 */
.daily-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.daily-tag {
  font-size: 22rpx;
  color: #8b7355;
  background: linear-gradient(135deg, #f7f1e6 0%, #ebe4d6 100%);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e0d4c0;
}

/* 底部操作区 - 优化按钮 */
.daily-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0e6d8;
}

.daily-action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 32rpx;
  background: linear-gradient(145deg, #e84a38 0%, #c82506 50%, #a81c07 100%);
  border-radius: 32rpx;
  box-shadow:
    0 6rpx 18rpx rgba(200, 37, 6, 0.35),
    0 2rpx 6rpx rgba(200, 37, 6, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.daily-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.daily-action-btn:hover::before {
  left: 100%;
}

.daily-action-btn:hover {
  transform: translateY(-3rpx);
  box-shadow:
    0 10rpx 28rpx rgba(200, 37, 6, 0.4),
    0 4rpx 10rpx rgba(200, 37, 6, 0.25);
}

.daily-action-btn:active {
  transform: translateY(-1rpx) scale(0.97);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.3);
}

.action-icon {
  font-size: 28rpx;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
}

.action-text {
  font-size: 28rpx;
  color: #fff8e6;
  font-weight: 600;
  letter-spacing: 4rpx;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.daily-actions-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.daily-favorite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: linear-gradient(145deg, #fff 0%, #faf6ed 100%);
  border-radius: 32rpx;
  border: 2rpx solid #e0d0c0;
  box-shadow: 0 3rpx 10rpx rgba(139, 69, 19, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-favorite-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(200, 37, 6, 0.15);
  border-color: #c82506;
}

.daily-favorite-btn:active {
  transform: translateY(-1rpx) scale(0.97);
}

.favorite-icon {
  font-size: 32rpx;
  color: #d0c8c0;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.05));
}

.favorite-icon.active {
  color: #c82506;
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 37, 6, 0.3));
  animation: favoritePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes favoritePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.favorite-text {
  font-size: 26rpx;
  color: #8b7355;
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-text.active {
  color: #c82506;
  font-weight: 600;
}

.daily-share-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 24rpx;
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 50%, #f0dcc0 100%);
  border-radius: 32rpx;
  border: 2rpx solid #e8b860;
  box-shadow:
    0 3rpx 10rpx rgba(232, 184, 96, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-share-btn:hover {
  transform: translateY(-2rpx);
  box-shadow:
    0 6rpx 18rpx rgba(232, 184, 96, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.5);
  border-color: #d4a030;
}

.daily-share-btn:active {
  transform: translateY(-1rpx) scale(0.97);
}

.share-icon {
  font-size: 26rpx;
  filter: drop-shadow(0 1rpx 1rpx rgba(0, 0, 0, 0.05));
}

.share-text {
  font-size: 26rpx;
  color: #8b6914;
  font-weight: 500;
}

/* ========== 我的收藏快捷入口 ========== */
.favorites-shortcut-wrapper {
  margin-top: 50rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.favorites-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.favorites-shortcut {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding: 36rpx 44rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 50%, #f5ede0 100%);
  border-radius: 28rpx;
  border: 2rpx solid #e8d8c8;
  box-shadow:
    0 12rpx 40rpx rgba(139, 69, 19, 0.1),
    0 4rpx 12rpx rgba(139, 69, 19, 0.05),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.favorites-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5rpx;
  background: linear-gradient(90deg, #c82506 0%, #e8b860 30%, #e8b860 70%, #c82506 100%);
  opacity: 0.9;
}

.favorites-shortcut::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.favorites-shortcut:hover {
  transform: translateY(-3rpx);
  box-shadow:
    0 20rpx 48rpx rgba(139, 69, 19, 0.14),
    0 6rpx 16rpx rgba(139, 69, 19, 0.06);
}

.favorites-shortcut:hover::after {
  left: 100%;
}

.favorites-shortcut:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.1);
}

.favorites-icon-wrapper {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 50%, #f0dcc0 100%);
  border-radius: 50%;
  border: 3rpx solid #e8b860;
  box-shadow:
    0 6rpx 16rpx rgba(232, 184, 96, 0.3),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.favorites-shortcut:hover .favorites-icon-wrapper {
  transform: scale(1.06) rotate(3deg);
  box-shadow:
    0 10rpx 24rpx rgba(232, 184, 96, 0.4),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.favorites-icon {
  font-size: 46rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 37, 6, 0.2));
  transition: transform 0.3s ease;
}

.favorites-shortcut:hover .favorites-icon {
  transform: scale(1.12);
}

.favorites-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  box-shadow:
    0 3rpx 10rpx rgba(200, 37, 6, 0.4),
    0 0 0 2rpx #fffef9;
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.favorites-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding: 4rpx 0;
}

.favorites-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #3c2a1d;
  letter-spacing: 8rpx;
  font-family: 'ZCOOL XiaoWei', serif;
  line-height: 1.2;
}

.favorites-count {
  font-size: 26rpx;
  color: #a08060;
  font-weight: 500;
  letter-spacing: 2rpx;
}

.favorites-arrow-wrapper {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.1) 0%, rgba(232, 184, 96, 0.1) 100%);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(200, 37, 6, 0.15);
}

.favorites-shortcut:hover .favorites-arrow-wrapper {
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.18) 0%, rgba(232, 184, 96, 0.18) 100%);
  border-color: rgba(200, 37, 6, 0.25);
}

.favorites-arrow {
  font-size: 28rpx;
  color: #c82506;
  font-weight: bold;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.favorites-shortcut:hover .favorites-arrow {
  transform: translateX(4rpx);
  opacity: 1;
}

.favorites-shortcut:active .favorites-arrow {
  transform: translateX(8rpx);
}

/* ========== 设置快捷入口 ========== */
.settings-shortcut-wrapper {
  margin-top: 24rpx;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.settings-shortcut-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.settings-shortcut {
  display: flex;
  align-items: center;
  gap: 28rpx;
  padding: 28rpx 36rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
  border-radius: 24rpx;
  border: 2rpx solid #ced4da;
  box-shadow:
    0 12rpx 36rpx rgba(108, 117, 125, 0.12),
    0 4rpx 12rpx rgba(108, 117, 125, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.settings-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #6c757d 0%, #adb5bd 50%, #6c757d 100%);
  opacity: 0.8;
}

.settings-shortcut::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.settings-shortcut:hover::after {
  left: 100%;
}

.settings-shortcut:hover {
  transform: translateY(-4rpx);
  box-shadow:
    0 20rpx 48rpx rgba(108, 117, 125, 0.16),
    0 8rpx 20rpx rgba(108, 117, 125, 0.08);
}

.settings-shortcut:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(108, 117, 125, 0.1);
}

.settings-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #ffffff 0%, #f1f3f4 50%, #e8eaed 100%);
  border-radius: 50%;
  border: 2rpx solid #dadce0;
  box-shadow:
    0 4rpx 12rpx rgba(108, 117, 125, 0.15),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.settings-shortcut:hover .settings-icon-wrapper {
  transform: scale(1.08) rotate(10deg);
  box-shadow:
    0 8rpx 20rpx rgba(108, 117, 125, 0.2),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.settings-icon {
  font-size: 40rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(108, 117, 125, 0.2));
  transition: transform 0.3s ease;
}

.settings-shortcut:hover .settings-icon {
  transform: scale(1.15) rotate(-10deg);
}

.settings-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.settings-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #495057;
  letter-spacing: 4rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.settings-desc {
  font-size: 24rpx;
  color: #6c757d;
}

.settings-arrow-wrapper {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(173, 181, 189, 0.1) 100%);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1rpx solid rgba(108, 117, 125, 0.15);
}

.settings-shortcut:hover .settings-arrow-wrapper {
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.15) 0%, rgba(173, 181, 189, 0.15) 100%);
  border-color: rgba(108, 117, 125, 0.25);
}

.settings-arrow {
  font-size: 28rpx;
  color: #6c757d;
  font-weight: bold;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.settings-shortcut:hover .settings-arrow {
  transform: translateX(4rpx);
  opacity: 1;
}

/* 响应式适配 */
@media screen and (max-width: 700rpx) {
  .daily-card {
    flex-direction: column;
  }
  
  .daily-image-section {
    width: 100%;
    height: 280rpx;
    min-height: auto;
  }
  
  .daily-image-section::after {
    display: none;
  }
  
  .daily-content-section {
    padding: 28rpx 32rpx;
  }
  
  .daily-name {
    font-size: 38rpx;
    letter-spacing: 6rpx;
  }
}

.daily-share {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  border-radius: 30rpx;
  border: 1rpx solid #e8b860;
  cursor: pointer;
  transition: all 0.2s ease;
}

.daily-share:active {
  transform: scale(0.95);
}

.share-icon {
  font-size: 24rpx;
}

.share-text {
  font-size: 24rpx;
  color: #a81c07;
  font-weight: 500;
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
