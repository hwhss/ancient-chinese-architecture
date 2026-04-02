<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <text class="header-title">古建筑详情</text>
      <view class="header-actions">
        <view
          class="share-btn-header tap-feedback"
          @click="openShareCard"
        >
          <text class="share-icon-header">📤</text>
          <text class="share-label-header">分享</text>
        </view>
        <view
          class="favorite-btn tap-feedback"
          :class="{ 'active': isFavorite }"
          @click="toggleFavorite"
        >
          <text class="favorite-icon">{{ isFavorite ? '★' : '☆' }}</text>
          <text class="favorite-label">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
    </view>

    <!-- 分享卡片弹窗 -->
    <ShareCard
      :visible="showShareCard"
      :building="shareBuilding"
      @close="showShareCard = false"
      @share="onShareCard"
    />

    <!-- 素材展示区域 -->
    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading" class="loading">
        <text>正在加载...</text>
      </view>

      <!-- 错误提示 -->
      <view v-else-if="error" class="error">
        <text>{{ error }}</text>
      </view>

      <!-- 图片素材 -->
      <view v-else-if="material.type === 'image'" class="material-wrapper">
        <image
          class="material-image"
          :src="material.url"
          mode="widthFix"
          lazy-load="true"
          @error="onImageError"
        />
        <view class="material-info">
          <text class="material-title">{{ materialTitle }}</text>
          <text class="material-source"
            >参考素材来源：{{ material.source || "未知" }}</text
          >
          <text v-if="materialNotice" class="material-notice">{{
            materialNotice
          }}</text>
        </view>
      </view>

      <!-- 视频素材 -->
      <view v-else-if="material.type === 'video'" class="material-wrapper">
        <video
          class="material-video"
          :src="material.url"
          controls
          poster="/static/video-poster.png"
        />
        <view class="material-info">
          <text class="material-title">{{ materialTitle }}</text>
          <text class="material-source"
            >参考素材来源：{{ material.source || "未知" }}</text
          >
          <text v-if="materialNotice" class="material-notice">{{
            materialNotice
          }}</text>
        </view>
      </view>

      <!-- 占位展示 -->
      <view v-else class="placeholder-section">
        <view class="placeholder-icon">🏯</view>
        <text class="placeholder-text">素材ID: {{ materialId }}</text>
        <text class="placeholder-sub">暂无素材，已展示建筑文字详情</text>
      </view>

      <!-- Tab 切换栏 -->
      <view v-if="!loading && !error && visibleTabs.length > 0" class="tab-bar">
        <view
          v-for="tab in visibleTabs"
          :key="tab.key"
          class="tab-item tap-feedback"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>

      <!-- Tab 内容区域 -->
      <view v-if="!loading && !error" class="tab-content">
        <!-- 基础信息 Tab -->
        <view v-if="activeTab === 'basic'" class="detail-card">
          <view class="detail-header">
            <text class="detail-title">建筑详情</text>
            <view
              class="detail-favorite-btn tap-feedback"
              :class="{ 'active': isFavorite }"
              @click="toggleFavorite"
            >
              <text class="detail-favorite-icon">{{ isFavorite ? '★' : '☆' }}</text>
              <text class="detail-favorite-text">{{ isFavorite ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
          <view class="detail-row">
            <text class="detail-label">名称</text>
            <text class="detail-value">{{ materialTitle }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">分类</text>
            <text class="detail-value">{{ categoryText }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">位置</text>
            <text class="detail-value">{{ building.location || "暂无" }}</text>
          </view>
          <view class="detail-row detail-col">
            <text class="detail-label">简介</text>
            <text class="detail-value wrap">{{
              building.description || "暂无介绍"
            }}</text>
          </view>
          <view v-if="building.tags && building.tags.length" class="tag-list">
            <text v-for="tag in building.tags" :key="tag" class="tag-item">{{
              tag
            }}</text>
          </view>

          <view class="action-row">
            <button class="action-btn ink-ripple" @click="goToViewer">进入3D导览</button>
          </view>
        </view>

        <!-- 结构解析 Tab -->
        <view v-if="activeTab === 'infographic' && visualizationData.infographic" class="detail-card">
          <view class="detail-header">
            <text class="detail-title">结构解析</text>
          </view>
          <InfoGraphic
            :nodes="visualizationData.infographic.nodes"
            :edges="visualizationData.infographic.edges"
            :layout="visualizationData.infographic.layout"
            @node-click="onInfographicNodeClick"
          />
        </view>

        <!-- 动态演示 Tab -->
        <view v-if="activeTab === 'animation' && visualizationData.animationId" class="detail-card">
          <view class="detail-header">
            <text class="detail-title">动态演示</text>
          </view>
          <LottieAnimation
            :animation-id="visualizationData.animationId"
            :loop="true"
            :autoplay="true"
          />
        </view>

        <!-- 数据概览 Tab -->
        <view v-if="activeTab === 'chart'" class="detail-card">
          <view class="detail-header">
            <text class="detail-title">建筑特征雷达图</text>
          </view>

          <!-- #ifdef H5 -->
          <view class="chart-wrapper">
            <VisualChart
              type="radar"
              :data="radarChartData"
              :height="400"
              @click="onChartClick"
            />
          </view>
          <!-- #endif -->

          <!-- #ifndef H5 -->
          <view class="chart-fallback">
            <view class="fallback-content">
              <text class="fallback-icon">📊</text>
              <text class="fallback-text">雷达图请在 H5 环境下查看</text>
              <view class="feature-list">
                <view v-for="(item, index) in radarFeatures" :key="index" class="feature-item">
                  <text class="feature-name">{{ item.name }}</text>
                  <view class="feature-bar">
                    <view class="feature-progress" :style="{ width: item.value + '%' }"></view>
                  </view>
                  <text class="feature-value">{{ item.value }}</text>
                </view>
              </view>
            </view>
          </view>
          <!-- #endif -->
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getBuildingById, getMaterialById } from "../../services/api";
import ShareCard from "../../components/ShareCard.vue";
import InfoGraphic from "../../components/InfoGraphic.vue";
import LottieAnimation from "../../components/LottieAnimation.vue";
import VisualChart from "../../components/VisualChart.vue";

// 素材ID到名称的映射 - 静态常量
// 注意：这些ID必须与后端 data-jsondb/buildings/*.json 中的 id 字段完全一致
const MATERIAL_NAMES = {
  // 皇宫 (palace.json)
  taihe_dian: "太和殿",
  qiankun_gong: "乾清宫",
  zhonghe_dian: "中和殿",
  baohe_dian: "保和殿",
  yangxin_dian: "养心殿",
  yuhua_yuan: "御花园",
  wumen: "午门",
  tiananmen: "天安门",
  dazheng_dian: "沈阳故宫大政殿",
  potala_palace: "布达拉宫",
  foguang_temple: "佛光寺东大殿",
  nanchan_temple: "南禅寺大殿",
  temple_of_heaven: "天坛",
  // 桥梁 (bridge.json)
  zhaozhou_bridge: "赵州桥",
  lugou_bridge: "卢沟桥",
  guangji_bridge: "广济桥",
  luoyang_bridge: "洛阳桥",
  anping_bridge: "安平桥",
  // 园林 (garden.json)
  zhuozheng_garden: "拙政园",
  yihe_yuan: "颐和园",
  liu_yuan: "留园",
  bishu_shanzhuang: "承德避暑山庄",
  shizi_lin: "狮子林",
  canglang_ting: "沧浪亭",
  wangshi_yuan: "网师园",
  huanxiu_shanzhuang: "环秀山庄",
  // 城防 (defense.json)
  xian_wall: "西安城墙",
  nanjing_wall: "南京城墙",
  pingyao_city: "平遥古城",
  lijiang_city: "丽江古城",
  fenghuang_city: "凤凰古城",
  // 民居 (residence.json)
  fujian_tulou: "福建土楼",
  qiaojia_dayuan: "乔家大院",
  wangjia_dayuan: "王家大院",
  siheyuan: "北京四合院",
  huizhou_house: "徽派建筑",
  hongcun: "宏村",
  xidi: "西递",
  yaodong: "窑洞",
  diaojiaolou: "吊脚楼",
  // 楼阁 (tower.json)
  yueyang_tower: "岳阳楼",
  huanghe_tower: "黄鹤楼",
  tengwang_ge: "滕王阁",
  qufu_kongmiao: "曲阜孔庙",
  yingxian_muta: "应县木塔",
  songyue_tower: "嵩岳寺塔",
  // 水利 (water.json)
  dujiangyan: "都江堰",
  kanerjing: "坎儿井",
  grand_canal: "京杭大运河",
  lingqu: "灵渠",
};

// Tab 配置
const TAB_CONFIG = [
  { key: 'basic', label: '基础信息', required: true },
  { key: 'infographic', label: '结构解析', dataKey: 'infographic' },
  { key: 'animation', label: '动态演示', dataKey: 'animationId' },
  { key: 'chart', label: '特征分析', required: true },
];

export default {
  components: {
    ShareCard,
    InfoGraphic,
    LottieAnimation,
    VisualChart,
  },
  data() {
    return {
      materialId: "",
      materialName: "",
      building: {
        id: "",
        name: "",
        category: "",
        location: "",
        description: "",
        tags: [],
      },
      material: {
        url: "",
        type: "",
        source: "",
      },
      materialNotice: "",
      loading: false,
      error: null,
      favorites: [],
      showShareCard: false,
      shareBuilding: {},
      activeTab: 'basic',
      visualizationData: {
        infographic: null,
        animationId: null,
        chartData: null,
      },
    };
  },

  computed: {
    materialTitle() {
      return (
        this.materialName ||
        this.building.name ||
        MATERIAL_NAMES[this.materialId] ||
        "古建筑素材"
      );
    },

    categoryText() {
      const map = {
        palace: "皇宫",
        bridge: "桥梁",
        garden: "园林",
        defense: "城防",
        residence: "民居",
        tower: "楼阁",
        water: "水利",
      };
      return map[this.building.category] || "未分类";
    },

    isFavorite() {
      return this.favorites.some(f => f.id === this.materialId);
    },

    visibleTabs() {
      return TAB_CONFIG.filter(tab => {
        if (tab.required) return true;
        return !!this.visualizationData[tab.dataKey];
      });
    },

    // 雷达图特征数据（降级方案用）
    radarFeatures() {
      // 根据建筑分类返回不同的特征数据
      const categoryFeatures = {
        palace: [
          { name: '规模宏大', value: 95 },
          { name: '等级森严', value: 90 },
          { name: '装饰华丽', value: 85 },
          { name: '布局严谨', value: 88 },
          { name: '工艺精湛', value: 92 },
          { name: '历史悠久', value: 85 }
        ],
        bridge: [
          { name: '结构稳固', value: 95 },
          { name: '造型优美', value: 88 },
          { name: '工艺独特', value: 90 },
          { name: '历史价值', value: 92 },
          { name: '实用性', value: 95 },
          { name: '艺术性', value: 85 }
        ],
        garden: [
          { name: '意境深远', value: 95 },
          { name: '布局精巧', value: 90 },
          { name: '造景艺术', value: 92 },
          { name: '文化内涵', value: 88 },
          { name: '自然和谐', value: 95 },
          { name: '空间层次', value: 87 }
        ],
        defense: [
          { name: '防御功能', value: 95 },
          { name: '结构坚固', value: 92 },
          { name: '规模宏大', value: 88 },
          { name: '历史价值', value: 90 },
          { name: '完整性', value: 85 },
          { name: '代表性', value: 87 }
        ],
        residence: [
          { name: '居住舒适', value: 90 },
          { name: '地域特色', value: 92 },
          { name: '工艺水平', value: 85 },
          { name: '文化传承', value: 88 },
          { name: '实用性', value: 90 },
          { name: '美观性', value: 82 }
        ],
        tower: [
          { name: '高度优势', value: 92 },
          { name: '造型独特', value: 90 },
          { name: '结构精巧', value: 88 },
          { name: '文化意义', value: 95 },
          { name: '观景功能', value: 90 },
          { name: '历史价值', value: 87 }
        ],
        water: [
          { name: '工程价值', value: 95 },
          { name: '实用性', value: 92 },
          { name: '科学性', value: 90 },
          { name: '历史意义', value: 88 },
          { name: '持久性', value: 95 },
          { name: '影响力', value: 87 }
        ]
      };

      const features = categoryFeatures[this.building.category] || categoryFeatures.palace;
      return features;
    },

    // 雷达图数据
    radarChartData() {
      const features = this.radarFeatures;
      return {
        indicator: features.map(f => ({ name: f.name, max: 100 })),
        series: [{
          name: '建筑特征',
          value: features.map(f => f.value),
          areaStyle: {
            color: 'rgba(200, 37, 6, 0.2)'
          },
          lineStyle: {
            color: '#c82506',
            width: 2
          },
          itemStyle: {
            color: '#c82506'
          }
        }]
      };
    }
  },

  onLoad(options) {
    this.materialId = options.materialId || "";
    this.materialName = options.name ? decodeURIComponent(options.name) : "";

    // 加载收藏列表
    this.loadFavorites();

    if (this.materialId) {
      this.loadDetailData();
    } else {
      this.error = "缺少素材ID";
    }
  },

  methods: {
    async loadDetailData() {
      this.loading = true;
      this.error = null;
      this.materialNotice = "";

      await Promise.allSettled([
        this.loadBuilding(),
        this.loadMaterial(),
        this.loadVisualizationData(),
      ]);

      if (!this.building || !this.building.id) {
        this.error = "未找到建筑详情";
      }

      this.loading = false;
    },

    async loadBuilding() {
      try {
        this.building = await getBuildingById(this.materialId);
      } catch (error) {
        console.error("加载建筑详情失败:", error);
        this.error = error.message || "建筑详情加载失败";
      }
    },

    async loadMaterial() {
      try {
        this.material = await getMaterialById(this.materialId);
      } catch (error) {
        console.error("加载素材失败:", error);
        this.setPlaceholderData();
        this.materialNotice = "当前素材暂不可用，已展示示例图";
      }
    },

    async loadVisualizationData() {
      try {
        const data = await this.fetchVisualizationData(this.materialId);
        this.visualizationData = {
          infographic: data.infographic || null,
          animationId: data.animationId || null,
          chartData: data.chartData || null,
        };
      } catch (error) {
        console.error("加载可视化数据失败:", error);
        // 可视化数据加载失败不影响页面主要功能
        this.visualizationData = {
          infographic: null,
          animationId: null,
          chartData: null,
        };
      }
    },

    async fetchVisualizationData(buildingId) {
      return new Promise((resolve) => {
        uni.request({
          url: `/api/visualization/${buildingId}`,
          method: 'GET',
          success: (res) => {
            if (res.statusCode === 200 && res.data) {
              resolve(res.data);
            } else {
              resolve({});
            }
          },
          fail: () => {
            resolve({});
          },
        });
      });
    },

    setPlaceholderData() {
      // 模拟数据，为每个建筑ID生成对应的图片
      const randomNum =
        parseInt(this.materialId.replace(/\D/g, "")) ||
        Math.floor(Math.random() * 100);
      this.material = {
        url: `https://picsum.photos/800/600?random=${randomNum}`,
        type: "image",
        source: "示例图片",
      };
    },

    onImageError() {
      this.error = "图片加载失败";
    },

    goBack() {
      uni.navigateBack();
    },

    goToViewer() {
      const name = encodeURIComponent(this.materialTitle || "");
      uni.navigateTo({
        url: `/pages/viewer/viewer?materialId=${this.materialId}&name=${name}`,
      });
    },

    switchTab(tabKey) {
      this.activeTab = tabKey;
    },

    onInfographicNodeClick(node) {
      console.log('点击了节点:', node);
      // 可以在这里添加节点点击后的逻辑，比如跳转到详情页
      if (node.link) {
        uni.navigateTo({
          url: node.link,
        });
      }
    },

    // 图表点击事件
    onChartClick(params) {
      console.log('点击了雷达图:', params);
      // 可以在这里添加图表点击后的逻辑
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
    toggleFavorite() {
      const index = this.favorites.findIndex(f => f.id === this.materialId);

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
          id: this.materialId,
          name: this.materialTitle,
          image: this.material.url || '',
          location: this.building.location || '',
          dynasty: '',
          description: this.building.description || '',
          tags: this.building.tags || [],
          category: this.building.category || '',
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

    // 打开分享卡片
    openShareCard() {
      this.shareBuilding = {
        id: this.materialId,
        name: this.materialTitle,
        image: this.material.url || '',
        location: this.building.location || '',
        dynasty: '',
        description: this.building.description || '',
        tags: this.building.tags || []
      };
      this.showShareCard = true;
    },

    // 分享卡片回调
    onShareCard(shareData) {
      console.log('分享数据:', shareData);
    }
  },

  // 微信小程序分享配置
  // #ifdef MP-WEIXIN
  onShareAppMessage() {
    return {
      title: `${this.materialTitle} - 中华古建筑导览`,
      path: `/pages/detail/detail?materialId=${this.materialId}&name=${encodeURIComponent(this.materialTitle)}`,
      imageUrl: this.material.url || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop'
    };
  },

  onShareTimeline() {
    return {
      title: `${this.materialTitle} - 中华古建筑导览`,
      query: `materialId=${this.materialId}&name=${encodeURIComponent(this.materialTitle)}`,
      imageUrl: this.material.url || 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=300&fit=crop'
    };
  }
  // #endif
};
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f4e9;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
  padding: 30rpx 30rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.3);
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.96);
}

.header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  font-family: 'ZCOOL XiaoWei', serif;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.share-btn-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-btn-header:active {
  transform: scale(0.95);
  background: rgba(232, 184, 96, 0.2);
  border-color: rgba(255, 200, 100, 0.5);
}

.share-icon-header {
  font-size: 28rpx;
}

.share-label-header {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 32rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-btn.active {
  background: rgba(200, 37, 6, 0.2);
  border-color: rgba(255, 200, 100, 0.6);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.favorite-icon {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-icon {
  color: #ffd700;
  filter: drop-shadow(0 2rpx 4rpx rgba(255, 215, 0, 0.4));
}

.favorite-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-btn.active .favorite-label {
  color: #ffd700;
}

.content {
  padding: 30rpx;
}

.loading,
.error {
  text-align: center;
  padding: 100rpx 40rpx;
  font-size: 32rpx;
  color: #6b5643;
}

.error {
  color: #b85450;
}

.material-wrapper {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.12),
    0 2rpx 8rpx rgba(139, 69, 19, 0.06);
  border: 2rpx solid #e8dcc8;
}

.material-image {
  width: 100%;
  display: block;
}

.material-video {
  width: 100%;
  height: 400rpx;
}

.material-info {
  padding: 32rpx;
}

.material-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #3c2a1d;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
}

.material-source {
  display: block;
  font-size: 26rpx;
  color: #8b7355;
  margin-bottom: 12rpx;
}

.material-notice {
  display: block;
  font-size: 24rpx;
  color: #b85450;
  padding: 16rpx 20rpx;
  background: rgba(184, 84, 80, 0.08);
  border-radius: 12rpx;
  border-left: 4rpx solid #b85450;
}

/* Tab 栏样式 */
.tab-bar {
  display: flex;
  margin-top: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #e8dcc8;
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-item.active {
  background: #8b4513;
}

.tab-text {
  font-size: 26rpx;
  color: #6b5643;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #f8f4e9;
  font-weight: 600;
}

.tab-content {
  margin-top: 20rpx;
}

.detail-card {
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid #e8dcc8;
  padding: 32rpx;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.1),
    0 2rpx 8rpx rgba(139, 69, 19, 0.05);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0e6d8;
}

.detail-title {
  font-size: 36rpx;
  color: #3c2a1d;
  font-weight: bold;
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
}

/* 图表区域样式 */
.chart-wrapper {
  padding: 20rpx;
  background: #faf6ed;
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
}

.chart-fallback {
  padding: 40rpx;
  background: #faf6ed;
  border-radius: 16rpx;
  border: 1rpx solid #e8dcc8;
}

.fallback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.fallback-icon {
  font-size: 64rpx;
}

.fallback-text {
  font-size: 28rpx;
  color: #8b7355;
}

.feature-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.feature-name {
  width: 140rpx;
  font-size: 26rpx;
  color: #3c2a1d;
  flex-shrink: 0;
}

.feature-bar {
  flex: 1;
  height: 16rpx;
  background: #e8dcc8;
  border-radius: 8rpx;
  overflow: hidden;
}

.feature-progress {
  height: 100%;
  background: linear-gradient(90deg, #c82506 0%, #e84a38 100%);
  border-radius: 8rpx;
  transition: width 0.8s ease;
}

.feature-value {
  width: 60rpx;
  font-size: 24rpx;
  color: #c82506;
  font-weight: bold;
  text-align: right;
}

.detail-favorite-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 28rpx;
  background: linear-gradient(145deg, #fff 0%, #faf6ed 100%);
  border: 2rpx solid #e0d0c0;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-favorite-btn.active {
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 100%);
  border-color: #e8b860;
  box-shadow: 0 6rpx 18rpx rgba(232, 184, 96, 0.25);
}

.detail-favorite-btn:active {
  transform: scale(0.96);
}

.detail-favorite-icon {
  font-size: 32rpx;
  color: #d0c8c0;
  transition: all 0.3s ease;
}

.detail-favorite-btn.active .detail-favorite-icon {
  color: #c82506;
  filter: drop-shadow(0 2rpx 4rpx rgba(200, 37, 6, 0.3));
  animation: favoritePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.detail-favorite-text {
  font-size: 26rpx;
  color: #8b7355;
  font-weight: 500;
  transition: all 0.3s ease;
}

.detail-favorite-btn.active .detail-favorite-text {
  color: #c82506;
  font-weight: 600;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(139, 69, 19, 0.1);
  position: relative;
}

.detail-row::after {
  content: '';
  position: absolute;
  bottom: -1rpx;
  left: 0;
  right: 0;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 69, 19, 0.3) 20%,
    rgba(139, 69, 19, 0.5) 50%,
    rgba(139, 69, 19, 0.3) 80%,
    transparent 100%
  );
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-row.detail-col {
  display: block;
}

.detail-label {
  width: 120rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  color: #8b735c;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #3c2a1d;
  line-height: 1.7;
}

.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0e6d8;
}

.tag-item {
  padding: 10rpx 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e0d4c0;
  background: linear-gradient(145deg, #f8f4e9 0%, #f0e9d8 100%);
  font-size: 24rpx;
  color: #6b5643;
  font-weight: 500;
  transition: all 0.25s ease;
}

.tag-item:hover {
  background: linear-gradient(145deg, #f5e6c8 0%, #f0dcc0 100%);
  border-color: #e8b860;
}

.action-row {
  margin-top: 32rpx;
}

.action-btn {
  width: 100%;
  border: none;
  background: linear-gradient(145deg, #c41e3a 0%, #8b0000 100%);
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  padding: 24rpx 0;
  font-weight: 600;
  letter-spacing: 6rpx;
  box-shadow:
    0 8rpx 24rpx rgba(196, 30, 58, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:active {
  transform: translateY(-2rpx) scale(0.98);
  box-shadow: 0 12rpx 32rpx rgba(196, 30, 58, 0.45);
}

.placeholder-section {
  text-align: center;
  padding: 100rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  border: 2rpx solid #e8dcc8;
  box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.08);
}

.placeholder-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  filter: drop-shadow(0 4rpx 8rpx rgba(139, 69, 19, 0.15));
}

.placeholder-text {
  display: block;
  font-size: 32rpx;
  color: #3c2a1d;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.placeholder-sub {
  display: block;
  font-size: 26rpx;
  color: #8b735c;
}
</style>
