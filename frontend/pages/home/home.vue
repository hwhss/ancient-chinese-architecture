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
      @scroll="handleScroll"
      scroll-with-animation
      :scroll-top="scrollTop"
    >
      <!-- 顶部 Hero 区 - 简化版 -->
      <HeroSection 
        :animation-state="sections.hero" 
        :favorite-count="favoriteCount"
        @go-to-map="goToMap"
        @go-to-chat="goToChat"
        @go-to-category="goToCategory"
        @go-to-favorites="goToFavorites"
        @go-to-settings="goToSettings"
      />
      
      <!-- 每日推荐区 -->
      <DailyBuilding 
        :visible="sections.daily"
        :building="dailyBuilding"
        :today-date="todayDate"
        :is-favorite="dailyBuilding ? isFavorite(dailyBuilding.id) : false"
        @go-to-detail="goToDetail"
        @toggle-favorite="toggleFavorite"
        @share="shareDailyBuilding"
      />
      
      <!-- 精选古建预览区 -->
      <PreviewSection 
        :visible="sections.preview"
        :visible-cards="sections.previewCards"
        :buildings="previewBuildings"
        @go-to-detail="goToDetail"
      />

      <!-- 项目亮点区 -->
      <FeaturesSection 
        :visible="sections.features"
      />
      
      <!-- 古建小知识区 -->
      <KnowledgeSection 
        :visible="sections.knowledge"
        :items="knowledgeItems"
      />
      
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
import HeroSection from "../../components/home/HeroSection.vue";
import DailyBuilding from "../../components/home/DailyBuilding.vue";
import PreviewSection from "../../components/home/PreviewSection.vue";
import FeaturesSection from "../../components/home/FeaturesSection.vue";
import KnowledgeSection from "../../components/home/KnowledgeSection.vue";
import { throttle } from "../../utils/lazyLoad.js";
import { recordPageLoad } from "../../utils/performance.js";
import { goToMap, goToChat, goToFavorites, goToSettings, goToDetail } from "../../utils/navigation.js";
import { getBuildings } from "../../services/apiWithCache.js";
import { setImageSourceSetting } from "../../services/api.js";

export default {
  name: 'HomePage',
  components: {
    SkeletonScreen,
    HeroSection,
    DailyBuilding,
    PreviewSection,
    FeaturesSection,
    KnowledgeSection
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
        { id: 'taihe_dian', name: '太和殿', category: 'palace', location: '北京故宫', description: '紫禁城，明清皇家宫殿', tags: ['宫殿', '明代'], dynasty: '明代', image: '' },
        { id: 'zhuozheng_garden', name: '拙政园', category: 'garden', location: '江苏苏州', description: '咫尺之内再造乾坤', tags: ['园林', '苏州'], dynasty: '明代', image: '' },
        { id: 'zhaozhou_bridge', name: '赵州桥', category: 'bridge', location: '河北赵县', description: '天下第一桥，千年不朽', tags: ['桥梁', '隋代'], dynasty: '隋代', image: '' },
        { id: 'yueyang_tower', name: '岳阳楼', category: 'tower', location: '湖南岳阳', description: '天下绝景，江南名楼', tags: ['楼阁', '宋代'], dynasty: '宋代', image: '' },
        { id: 'xian_wall', name: '西安城墙', category: 'defense', location: '陕西西安', description: '中国现存规模最大的古代城垣', tags: ['城防', '明代'], dynasty: '明代', image: '' },
        { id: 'dazheng_dian', name: '沈阳故宫大政殿', category: 'palace', location: '辽宁沈阳', description: '浓郁满族特色的宫殿建筑', tags: ['宫殿', '清代'], dynasty: '清代', image: '' },
        { id: 'qufu_kongmiao', name: '曲阜孔庙', category: 'tower', location: '山东曲阜', description: '祭祀孔子的庙宇建筑群', tags: ['庙宇', '祭祀'], dynasty: '宋代', image: '' },
        { id: 'fujian_tulou', name: '福建土楼', category: 'residence', location: '福建龙岩', description: '客家人的东方古城堡', tags: ['民居', '客家'], dynasty: '清代', image: '' }
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
    // 记录页面加载开始时间
    this._pageLoadStart = Date.now();

    // 首页固定优先使用本地实物图源，避免 object 模式下返回空图
    setImageSourceSetting('local');

    // 获取每日推荐
    this.getDailyBuilding();
    this.loadHomepageBuildings();

    // 立即显示内容，移除延迟
    this.loading = false;
    this.startHeroAnimation();
    this.shuffleKnowledgeItems();

    // 记录页面加载完成时间
    if (this._pageLoadStart) {
      const loadTime = Date.now() - this._pageLoadStart;
      recordPageLoad('home', loadTime);
    }

    // 初始化节流滚动处理
    this.throttledOnScroll = throttle(this.onScroll.bind(this), 100);
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
    getImagePreferenceScore(url) {
      const value = String(url || '').trim().toLowerCase();
      if (!value) return -100;

      let score = 0;
      if (value.includes('photo')) score += 100;
      if (value.includes('real')) score += 15;
      if (value.includes('overview')) score -= 80;
      if (value.includes('classification')) score -= 15;
      if (value.includes('structure')) score -= 15;
      if (value.includes('timeline')) score -= 15;
      if (value.includes('function')) score -= 15;
      if (value.includes('infographic')) score -= 20;
      return score;
    },

    pickPreferredImage(building) {
      const candidates = [
        building && building.originalImage,
        building && building.coverImage,
        building && building.image
      ]
        .map((item) => String(item || '').trim())
        .filter(Boolean);

      if (!candidates.length) {
        return '';
      }

      const uniqueCandidates = [...new Set(candidates)];
      uniqueCandidates.sort((a, b) => this.getImagePreferenceScore(b) - this.getImagePreferenceScore(a));
      return uniqueCandidates[0];
    },

    inferDynasty(building) {
      const tags = Array.isArray(building && building.tags) ? building.tags : [];
      const tagDynasty = tags.find((tag) => /代/.test(String(tag)));
      if (tagDynasty) return String(tagDynasty);

      const eraStart = Number(building && building.mainEra && building.mainEra.start);
      if (!Number.isFinite(eraStart)) {
        return '古代';
      }

      if (eraStart >= 1644) return '清代';
      if (eraStart >= 1368) return '明代';
      if (eraStart >= 1271) return '元代';
      if (eraStart >= 960) return '宋代';
      if (eraStart >= 618) return '唐代';
      if (eraStart >= 581) return '隋代';
      if (eraStart >= 220) return '魏晋南北朝';
      if (eraStart >= -221) return '秦汉';
      return '先秦';
    },

    normalizeHomepageBuilding(building) {
      const image = this.pickPreferredImage(building);
      const tags = Array.isArray(building && building.tags) ? building.tags : [];
      return {
        ...building,
        image,
        dynasty: this.inferDynasty(building),
        tags
      };
    },

    async loadHomepageBuildings() {
      try {
        const list = await getBuildings({}, true);
        if (!Array.isArray(list) || list.length === 0) {
          return;
        }

        const fallbackList = Array.isArray(this.previewBuildings)
          ? this.previewBuildings.map((item) => ({ ...item }))
          : [];

        const normalized = list
          .map((item) => this.normalizeHomepageBuilding(item))
          .filter((item) => Boolean(String(item.image || '').trim()));

        if (!normalized.length) {
          return;
        }

        const ranked = [...normalized].sort((a, b) => {
          const diff = this.getImagePreferenceScore(b.image) - this.getImagePreferenceScore(a.image);
          return diff !== 0 ? diff : String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN');
        });

        const selected = ranked.slice(0, 8);

        if (selected.length < 8 && fallbackList.length) {
          const usedIds = new Set(selected.map((item) => item.id));
          const fillers = fallbackList.filter((item) => !usedIds.has(item.id)).slice(0, 8 - selected.length);
          selected.push(...fillers);
        }

        if (selected.length) {
          this.previewBuildings = selected.slice(0, 8);
          this.getDailyBuilding();
        }
      } catch (error) {
        console.warn('首页建筑数据加载失败，保留本地兜底数据:', error && error.message ? error.message : error);
      }
    },

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
      if (!Array.isArray(this.previewBuildings) || this.previewBuildings.length === 0) {
        this.dailyBuilding = null;
        return;
      }

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
      goToFavorites();
    },

    // 跳转到设置页面
    goToSettings() {
      goToSettings();
    },

    startHeroAnimation() {
      // 优化动画序列，更快更流畅
      const baseDelay = 80; // 基础延迟缩短
      setTimeout(() => this.sections.hero.title = true, baseDelay * 1);
      setTimeout(() => this.sections.hero.seal = true, baseDelay * 2);
      setTimeout(() => this.sections.hero.subtitle = true, baseDelay * 3);
      setTimeout(() => this.sections.hero.description = true, baseDelay * 4);
      setTimeout(() => this.sections.hero.divider = true, baseDelay * 5);
      setTimeout(() => this.sections.hero.btn1 = true, baseDelay * 6);
      setTimeout(() => this.sections.hero.btn2 = true, baseDelay * 7);
      setTimeout(() => this.sections.hero.statCards = true, baseDelay * 8);
      setTimeout(() => this.sections.hero.categoryShortcuts = true, baseDelay * 9);
      setTimeout(() => this.sections.daily = true, baseDelay * 10);
      setTimeout(() => this.sections.preview = true, baseDelay * 11);
    },

    
    
    goToDetail(building) {
      goToDetail(building.id, building.name);
    },
    
    goToMap() {
      goToMap();
    },

    goToChat() {
      goToChat();
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

    // 使用节流优化的滚动事件处理
    handleScroll(e) {
      if (this.throttledOnScroll) {
        this.throttledOnScroll(e);
      } else {
        this.onScroll(e);
      }
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
      goToMap(category);
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
  --color-primary: var(--primary);
  --color-primary-dark: var(--primary-dark);
  --color-primary-light: var(--primary-light);
  
  /* 辅助色 - 古铜棕 */
  --color-secondary: var(--secondary);
  --color-secondary-dark: var(--secondary-dark);
  --color-secondary-light: var(--secondary-light);
  
  /* 中性色 */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-text-muted: var(--text-muted);
  
  /* 背景色 */
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-bg-tertiary: var(--bg-tertiary);
  --color-bg-card: #ffffff;
  
  /* 边框色 */
  --color-border: var(--bg-tertiary);
  --color-border-light: #dcc8b0;
  
  /* 功能色 */
  --color-error: var(--error);
  --color-success: var(--success);
  
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
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
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
  background: var(--bg-primary);
  border-radius: 6rpx;
}

.scroll-view::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 6rpx;
  border: 2rpx solid var(--bg-primary);
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
  background: radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-secondary) 40%, var(--bg-tertiary) 70%, #dcc8b0 100%);
  pointer-events: none;
  z-index: -3;
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
  z-index: -2;
}

/* 顶层：动态祥云（优化性能） */
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
  animation: cloudMove 80s linear infinite;
  pointer-events: none;
  z-index: -1;
  will-change: background-position;
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
  z-index: -4;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  position: relative;
}

.scroll-view {
  flex: 1;
  height: 100%;
  position: relative;
  z-index: 10;
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 80rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
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

/* Footer */
.footer {
  text-align: center;
  padding-bottom: 100rpx;
}

.footer-slogan {
  display: block;
  font-size: 28rpx;
  color: var(--secondary);
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.footer-copyright {
  display: block;
  font-size: 22rpx;
  color: var(--text-tertiary);
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
  color: var(--secondary);
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
