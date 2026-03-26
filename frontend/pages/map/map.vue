<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-decoration top"></view>
      <text class="title">🏯 中华古建筑名录</text>
      <text class="subtitle">精选十七处代表性古建筑</text>
      <view class="header-decoration bottom"></view>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-tabs" scroll-x>
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="tab"
        :class="{ active: currentCategory === cat.key }"
        @click="selectCategory(cat.key)"
      >
        {{ cat.name }}
      </view>
    </scroll-view>

    <!-- 建筑列表 -->
    <scroll-view class="building-list" scroll-y>
      <view
        v-for="building in filteredBuildings"
        :key="building.id"
        class="building-card"
        @click="goToDetail(building)"
      >
        <image class="building-image" :src="building.image" mode="aspectFill" lazy-load="true" />
        <view class="building-info">
          <text class="building-name">{{ building.name }}</text>
          <text class="building-location">📍 {{ building.location }}</text>
          <text class="building-desc">{{ building.description }}</text>
          <view class="building-tags">
            <text v-for="tag in building.tags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="action-btn secondary" @click="goToChat">
        💬 返回AI问答
      </button>
    </view>
  </view>
</template>

<script>
// 分类配置 - 静态常量
const categories = [
  { key: 'all', name: '全部' },
  { key: 'palace', name: '🏛️ 皇宫' },
  { key: 'bridge', name: '🌉 桥梁' },
  { key: 'garden', name: '🌿 园林' },
  { key: 'defense', name: '🏰 城防' },
  { key: 'residence', name: '🏠 民居' },
  { key: 'tower', name: '🏯 楼阁' },
  { key: 'water', name: '💧 水利' }
];

// 古建筑数据 - 静态数据保持不变，UniApp兼容处理
const buildingsData = [
  // 皇宫
  {
    id: 'gugong_01',
    name: '太和殿',
    category: 'palace',
    location: '北京故宫',
    description: '故宫规模最大、等级最高的建筑，用于举行大典。中国现存最大的木结构大殿。',
    image: 'https://picsum.photos/400/300?random=1',
    tags: ['皇宫', '明代', '木结构']
  },
  {
    id: 'gugong_02',
    name: '乾清宫',
    category: 'palace',
    location: '北京故宫',
    description: '明清皇帝的寝宫，清代雍正后改为处理政务场所。殿内悬挂"正大光明"匾额。',
    image: 'https://picsum.photos/400/300?random=2',
    tags: ['皇宫', '寝宫', '清代']
  },
  {
    id: 'shenyang_01',
    name: '沈阳故宫大政殿',
    category: 'palace',
    location: '辽宁沈阳',
    description: '沈阳故宫的核心建筑，清太祖努尔哈赤营建，具有浓郁的满族特色。',
    image: 'https://picsum.photos/400/300?random=3',
    tags: ['皇宫', '清代', '满族']
  },
  // 桥梁
  {
    id: 'zhaozhou_01',
    name: '赵州桥',
    category: 'bridge',
    location: '河北赵县',
    description: '世界上现存最古老的单孔敞肩石拱桥，建于隋代，已有1400多年历史。',
    image: 'https://picsum.photos/400/300?random=4',
    tags: ['桥梁', '隋代', '石拱']
  },
  {
    id: 'lugou_01',
    name: '卢沟桥',
    category: 'bridge',
    location: '北京',
    description: '北京现存最古老的石造联拱桥，桥上有501只形态各异的石狮。',
    image: 'https://picsum.photos/400/300?random=5',
    tags: ['桥梁', '金代', '石狮']
  },
  {
    id: 'guangji_01',
    name: '广济桥',
    category: 'bridge',
    location: '广东潮州',
    description: '中国四大古桥之一，集梁桥、浮桥、拱桥于一体，被誉为"世界上最早的启闭式桥梁"。',
    image: 'https://picsum.photos/400/300?random=6',
    tags: ['桥梁', '宋代', '启闭式']
  },
  // 园林
  {
    id: 'zhuozheng_01',
    name: '拙政园',
    category: 'garden',
    location: '江苏苏州',
    description: '中国四大名园之一，明代园林代表，以水为中心，山水萦绕，厅榭精美。',
    image: 'https://picsum.photos/400/300?random=7',
    tags: ['园林', '明代', '苏州']
  },
  {
    id: 'yiheyuan_01',
    name: '颐和园',
    category: 'garden',
    location: '北京',
    description: '中国现存规模最大、保存最完整的皇家园林，被誉为"皇家园林博物馆"。',
    image: 'https://picsum.photos/400/300?random=8',
    tags: ['园林', '清代', '皇家']
  },
  // 城防
  {
    id: 'xian_01',
    name: '西安城墙',
    category: 'defense',
    location: '陕西西安',
    description: '中国现存规模最大、保存最完整的古代城垣，全长13.74公里。',
    image: 'https://picsum.photos/400/300?random=9',
    tags: ['城防', '明代', '城墙']
  },
  {
    id: 'nanjing_01',
    name: '南京城墙',
    category: 'defense',
    location: '江苏南京',
    description: '世界最长、规模最大、保存原真性最好的古代城垣，全长35.267公里。',
    image: 'https://picsum.photos/400/300?random=10',
    tags: ['城防', '明代', '最长']
  },
  // 民居
  {
    id: 'tulou_01',
    name: '福建土楼',
    category: 'residence',
    location: '福建龙岩',
    description: '世界文化遗产，客家人聚族而居的大型夯土民居，被誉为"东方古城堡"。',
    image: 'https://picsum.photos/400/300?random=11',
    tags: ['民居', '客家', '圆形']
  },
  {
    id: 'qiaojia_01',
    name: '乔家大院',
    category: 'residence',
    location: '山西祁县',
    description: '清代晋商民宅代表，建筑精美，有"北方民居建筑明珠"之称。',
    image: 'https://picsum.photos/400/300?random=12',
    tags: ['民居', '清代', '晋商']
  },
  {
    id: 'pingyao_01',
    name: '平遥古城',
    category: 'residence',
    location: '山西平遥',
    description: '中国保存最完整的明清古县城，1997年被列入世界文化遗产。',
    image: 'https://picsum.photos/400/300?random=13',
    tags: ['古城', '明清', '世界遗产']
  },
  // 楼阁
  {
    id: 'yueyang_01',
    name: '岳阳楼',
    category: 'tower',
    location: '湖南岳阳',
    description: '江南三大名楼之一，因范仲淹《岳阳楼记》而闻名天下。',
    image: 'https://picsum.photos/400/300?random=14',
    tags: ['楼阁', '宋代', '名楼']
  },
  {
    id: 'kongmiao_01',
    name: '曲阜孔庙',
    category: 'temple',
    location: '山东曲阜',
    description: '中国三大古建筑群之一，祭祀孔子的庙宇，规模宏大。',
    image: 'https://picsum.photos/400/300?random=15',
    tags: ['庙宇', '祭祀', '孔子']
  },
  // 水利工程
  {
    id: 'dujiangyan_01',
    name: '都江堰',
    category: 'water',
    location: '四川成都',
    description: '世界最古老的水利工程之一，至今仍在使用，使成都平原成为"天府之国"。',
    image: 'https://picsum.photos/400/300?random=16',
    tags: ['水利', '战国', '李冰']
  },
  {
    id: 'kanerjing_01',
    name: '坎儿井',
    category: 'water',
    location: '新疆吐鲁番',
    description: '中国古代三大工程之一，与长城、大运河齐名，是干旱地区的地下水利工程。',
    image: 'https://picsum.photos/400/300?random=17',
    tags: ['水利', '地下', '新疆']
  }
];

export default {
  data() {
    return {
      categories,
      currentCategory: 'all',
      buildings: buildingsData
    };
  },

  computed: {
    filteredBuildings() {
      if (this.currentCategory === 'all') {
        return this.buildings;
      }
      return this.buildings.filter(b => b.category === this.currentCategory);
    }
  },

  methods: {
    selectCategory(key) {
      this.currentCategory = key;
    },

    goToDetail(building) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${building.id}&name=${encodeURIComponent(building.name)}`
      });
    },

    goToChat() {
      uni.navigateTo({
        url: '/pages/index/index'
      });
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 100%);
}

.header {
  background: #8B4513;
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
}

.header-decoration {
  height: 2rpx;
  width: 50%;
  margin: 12rpx auto;
  background: rgba(255, 255, 255, 0.3);
}

.header-decoration.top {
  margin-top: 0;
  margin-bottom: 16rpx;
}

.header-decoration.bottom {
  margin-bottom: 0;
  margin-top: 16rpx;
}

.title {
  display: block;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  color: rgba(255,255,255,0.8);
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.category-tabs {
  background: #fff;
  padding: 20rpx;
  white-space: nowrap;
  border-bottom: 1rpx solid #e8dcc8;
}

.tab {
  display: inline-block;
  padding: 16rpx 32rpx;
  margin-right: 16rpx;
  background: #f8f4e9;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #6b5643;
  transition: all 0.3s;
  transform: translateZ(0);
  border: 1rpx solid transparent;
}

.tab.active {
  background: #8B4513;
  color: #fff;
  border-color: #8B4513;
}

.building-list {
  flex: 1;
  padding: 20rpx;
}

.building-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.12);
  transform: translateZ(0);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1rpx solid #e8dcc8;
}

.building-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.15);
}

.building-image {
  width: 100%;
  height: 300rpx;
}

.building-info {
  padding: 30rpx;
}

.building-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #3c2a1d;
  margin-bottom: 12rpx;
}

.building-location {
  display: block;
  font-size: 26rpx;
  color: #8B4513;
  margin-bottom: 16rpx;
}

.building-desc {
  display: block;
  font-size: 28rpx;
  color: #6b5643;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.building-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  padding: 8rpx 20rpx;
  background: #f8f4e9;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #8B4513;
  margin-right: 16rpx;
  margin-bottom: 10rpx;
  border: 1rpx solid #e8dcc8;
}

.bottom-actions {
  background: #fff;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #e8dcc8;
  display: flex;
  justify-content: center;
}

.action-btn {
  width: 300rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #8B4513;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  transform: translateZ(0);
  transition: all 0.2s;
}

.action-btn.secondary {
  background: #fff;
  color: #8B4513;
  border: 2rpx solid #8B4513;
}

.action-btn:active {
  transform: scale(0.96);
}
</style>
