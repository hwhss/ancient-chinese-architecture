<template>
  <view class="container">
    <!-- 顶部导航 -->
    <DetailHeader
      :isFavorite="isFavorite"
      @go-back="goBack"
      @open-share-card="openShareCard"
      @toggle-favorite="toggleFavorite"
    />

    <!-- 分享卡片弹窗 -->
    <ShareCard
      :visible="showShareCard"
      :building="shareBuilding"
      @close="showShareCard = false"
      @share="onShareCard"
    />

    <!-- 素材展示区域 -->
    <view class="content">
      <view class="page-container">
        <!-- 加载中 -->
        <view v-if="loading" class="loading">
          <text>正在加载...</text>
        </view>

        <!-- 错误提示 -->
        <view v-else-if="error" class="error">
          <text>{{ error }}</text>
        </view>

        <!-- 图片/视频/占位展示 -->
        <DetailGallery
          v-else
          :material="material"
          :materialTitle="materialTitle"
          :materialNotice="materialNotice"
          :materialId="materialId"
          @image-error="onImageError"
        />

        <!-- Tab 切换栏 -->
        <DetailTabs
          v-if="!loading && !error && visibleTabs.length > 0"
          :visibleTabs="visibleTabs"
          :activeTab="activeTab"
          @switch-tab="switchTab"
        />

        <!-- Tab 内容区域 -->
        <DetailContent
          v-if="!loading && !error"
          :activeTab="activeTab"
          :building="building"
          :materialTitle="materialTitle"
          :categoryText="categoryText"
          :isFavorite="isFavorite"
          :visualizationData="visualizationData"
          :radarChartData="radarChartData"
          :radarFeatures="radarFeatures"
          @toggle-favorite="toggleFavorite"
          @go-to-viewer="goToViewer"
          @node-click="onInfographicNodeClick"
          @chart-click="onChartClick"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { getBuildingById, getMaterialById } from "../../services/apiWithCache.js";
import ShareCard from "../../components/ShareCard.vue";
import DetailHeader from "../../components/detail/DetailHeader.vue";
import DetailGallery from "../../components/detail/DetailGallery.vue";
import DetailTabs from "../../components/detail/DetailTabs.vue";
import DetailContent from "../../components/detail/DetailContent.vue";
import { recordPageLoad, recordApiCall } from "../../utils/performance.js";

// 素材ID到名称的映射 - 静态常量
const MATERIAL_NAMES = {
  taihe_dian: "太和殿", qiankun_gong: "乾清宫", zhonghe_dian: "中和殿", 
  baohe_dian: "保和殿", yangxin_dian: "养心殿", yuhua_yuan: "御花园", 
  wumen: "午门", tiananmen: "天安门", dazheng_dian: "沈阳故宫大政殿", 
  potala_palace: "布达拉宫", foguang_temple: "佛光寺东大殿", nanchan_temple: "南禅寺大殿", 
  temple_of_heaven: "天坛", zhaozhou_bridge: "赵州桥", lugou_bridge: "卢沟桥", 
  guangji_bridge: "广济桥", luoyang_bridge: "洛阳桥", anping_bridge: "安平桥",
  zhuozheng_garden: "拙政园", yihe_yuan: "颐和园", liu_yuan: "留园", 
  bishu_shanzhuang: "承德避暑山庄", shizi_lin: "狮子林", canglang_ting: "沧浪亭", 
  wangshi_yuan: "网师园", huanxiu_shanzhuang: "环秀山庄", xian_wall: "西安城墙", 
  nanjing_wall: "南京城墙", pingyao_city: "平遥古城", lijiang_city: "丽江古城", 
  fenghuang_city: "凤凰古城", fujian_tulou: "福建土楼", qiaojia_dayuan: "乔家大院", 
  wangjia_dayuan: "王家大院", siheyuan: "北京四合院", huizhou_house: "徽派建筑", 
  hongcun: "宏村", xidi: "西递", yaodong: "窑洞", diaojiaolou: "吊脚楼",
  yueyang_tower: "岳阳楼", huanghe_tower: "黄鹤楼", tengwang_ge: "滕王阁", 
  qufu_kongmiao: "曲阜孔庙", yingxian_muta: "应县木塔", songyue_tower: "嵩岳寺塔",
  dujiangyan: "都江堰", kanerjing: "坎儿井", grand_canal: "京杭大运河", lingqu: "灵渠",
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
    DetailHeader,
    DetailGallery,
    DetailTabs,
    DetailContent
  },
  data() {
    return {
      materialId: "",
      materialName: "",
      building: {
        id: "", name: "", category: "", location: "", description: "", tags: [],
      },
      material: {
        url: "", type: "image", source: "", images: [],
      },
      materialNotice: "",
      loading: false,
      error: null,
      favorites: [],
      showShareCard: false,
      shareBuilding: {},
      activeTab: 'basic',
      visualizationData: {
        infographic: null, animationId: null, chartData: null,
      },
    };
  },

  computed: {
    materialTitle() {
      return this.materialName || this.building.name || MATERIAL_NAMES[this.materialId] || "古建筑素材";
    },
    categoryText() {
      const map = {
        palace: "皇宫", bridge: "桥梁", garden: "园林", defense: "城防",
        residence: "民居", tower: "楼阁", water: "水利",
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
      const categoryFeatures = {
        palace: [
          { name: '规模宏大', value: 95 }, { name: '等级森严', value: 90 }, { name: '装饰华丽', value: 85 },
          { name: '布局严谨', value: 88 }, { name: '工艺精湛', value: 92 }, { name: '历史悠久', value: 85 }
        ],
        bridge: [
          { name: '结构稳固', value: 95 }, { name: '造型优美', value: 88 }, { name: '工艺独特', value: 90 },
          { name: '历史价值', value: 92 }, { name: '实用性', value: 95 }, { name: '艺术性', value: 85 }
        ],
        garden: [
          { name: '意境深远', value: 95 }, { name: '布局精巧', value: 90 }, { name: '造景艺术', value: 92 },
          { name: '文化内涵', value: 88 }, { name: '自然和谐', value: 95 }, { name: '空间层次', value: 87 }
        ],
        defense: [
          { name: '防御功能', value: 95 }, { name: '结构坚固', value: 92 }, { name: '规模宏大', value: 88 },
          { name: '历史价值', value: 90 }, { name: '完整性', value: 85 }, { name: '代表性', value: 87 }
        ],
        residence: [
          { name: '居住舒适', value: 90 }, { name: '地域特色', value: 92 }, { name: '工艺水平', value: 85 },
          { name: '文化传承', value: 88 }, { name: '实用性', value: 90 }, { name: '美观性', value: 82 }
        ],
        tower: [
          { name: '高度优势', value: 92 }, { name: '造型独特', value: 90 }, { name: '结构精巧', value: 88 },
          { name: '文化意义', value: 95 }, { name: '观景功能', value: 90 }, { name: '历史价值', value: 87 }
        ],
        water: [
          { name: '工程价值', value: 95 }, { name: '实用性', value: 92 }, { name: '科学性', value: 90 },
          { name: '历史意义', value: 88 }, { name: '持久性', value: 95 }, { name: '影响力', value: 87 }
        ]
      };
      return categoryFeatures[this.building.category] || categoryFeatures.palace;
    },
    // 雷达图数据
    radarChartData() {
      const features = this.radarFeatures;
      return {
        indicator: features.map(f => ({ name: f.name, max: 100 })),
        series: [{
          name: '建筑特征',
          value: features.map(f => f.value),
          areaStyle: { color: 'rgba(200, 37, 6, 0.2)' },
          lineStyle: { color: '#c82506', width: 2 },
          itemStyle: { color: '#c82506' }
        }]
      };
    }
  },

  onLoad(options) {
    this._pageLoadStart = Date.now();
    this.materialId = options.materialId || "";
    this.materialName = options.name ? decodeURIComponent(options.name) : "";

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

      // 先加载素材（含多图），再加载建筑（含回退逻辑），避免并发时回退逻辑覆盖掉 images
      await this.loadMaterial();
      await Promise.allSettled([
        this.loadBuilding(),
        this.loadVisualizationData(),
      ]);

      if (!this.building || !this.building.id) {
        this.error = "未找到建筑详情";
      }

      this.loading = false;

      if (this._pageLoadStart) {
        const loadTime = Date.now() - this._pageLoadStart;
        recordPageLoad(`detail_${this.materialId}`, loadTime);
      }
    },

    async loadBuilding() {
      const startTime = Date.now();
      try {
        this.building = await getBuildingById(this.materialId);
        // 仅在 material 完全没有 url 且也没有 images 时，才用建筑封面作为回退
        // 绝不覆盖已从素材 API 取到的 images 数组
        const hasImages = Array.isArray(this.material.images) && this.material.images.length > 0;
        const hasUrl = String(this.material.url || '').trim();
        if (!hasImages && !hasUrl) {
          const fallbackImage = String(
            this.building.image || this.building.coverImage || this.building.originalImage || ''
          ).trim();
          if (fallbackImage) {
            this.material = {
              ...(this.material || {}),
              url: fallbackImage,
              images: [fallbackImage],
              type: 'image',
              source: String((this.material && this.material.source) || '建筑详情回退图片').trim() || '建筑详情回退图片'
            };
          }
        }
        const duration = Date.now() - startTime;
        recordApiCall('getBuildingById', duration, true);
      } catch (error) {
        const duration = Date.now() - startTime;
        recordApiCall('getBuildingById', duration, false);
        console.error("加载建筑详情失败:", error);
        this.error = error.message || "建筑详情加载失败";
      }
    },

    async loadMaterial() {
      const startTime = Date.now();
      try {
        // 强制刷新缓存以确保获取到后端最新的 6 张图片数据结构
        this.material = await getMaterialById(this.materialId, true);
        const duration = Date.now() - startTime;
        recordApiCall('getMaterialById', duration, true);
      } catch (error) {
        const duration = Date.now() - startTime;
        recordApiCall('getMaterialById', duration, false);
        console.error("加载素材失败:", error);
        this.setFailureData(error);
        this.materialNotice = this.getMaterialErrorNotice(error);
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
        this.visualizationData = {
          infographic: null, animationId: null, chartData: null,
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
          fail: () => resolve({}),
        });
      });
    },

    setFailureData(error) {
      const fallbackImage = String(
        (this.building && (this.building.image || this.building.coverImage || this.building.originalImage)) || ""
      ).trim();
      this.material = {
        url: fallbackImage,
        type: "image",
        source: fallbackImage ? "建筑详情回退图片" : "后端未下发图片",
        assetVerification: error && error.detail ? error.detail : null,
      };
    },

    getMaterialErrorNotice(error) {
      if (!error) {
        return "当前素材暂不可用，后端未返回图片。";
      }

      if (error.statusCode === 422) {
        const detail = error.detail || {};
        const reason = detail.reason || "asset_name_mismatch";
        return `后端校验未通过：${reason === 'missing_asset_name' ? '缺少图片命名' : '图片命名与实体不匹配'}`;
      }

      if (error.statusCode === 404) {
        return "当前素材不存在，后端未下发图片。";
      }

      return error.message || "当前素材暂不可用，后端未下发图片。";
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
      if (node.link) {
        uni.navigateTo({ url: node.link });
      }
    },

    onChartClick(params) {
      console.log('点击了雷达图:', params);
    },

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

    saveFavorites() {
      try {
        uni.setStorageSync('FAVORITE_BUILDINGS', this.favorites);
      } catch (e) {
        console.warn('保存收藏失败:', e);
      }
    },

    toggleFavorite() {
      const index = this.favorites.findIndex(f => f.id === this.materialId);
      if (index > -1) {
        this.favorites.splice(index, 1);
        uni.showToast({ title: '已取消收藏', icon: 'none', duration: 1500 });
      } else {
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
        uni.showToast({ title: '收藏成功', icon: 'success', duration: 1500 });
      }
      this.saveFavorites();
    },

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

    onShareCard(shareData) {
      console.log('分享数据:', shareData);
    }
  },

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
  background-color: var(--bg-primary);
  background-image: url('https://www.transparenttextures.com/patterns/rice-paper.png'); /* 宣纸纹理 */
}

.content {
  padding: 20rpx 30rpx 60rpx;
}

.loading,
.error {
  text-align: center;
  padding: 120rpx 40rpx;
  background: var(--bg-card);
  margin: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}

.loading-text {
  font-size: 30rpx;
  color: var(--text-tertiary);
  font-style: italic;
}

.error-text {
  color: var(--primary);
  font-weight: bold;
}
</style>
