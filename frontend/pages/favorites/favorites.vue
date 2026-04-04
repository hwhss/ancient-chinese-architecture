<template>
  <view class="container page-enter">
    <!-- 背景层 -->
    <view class="radial-gradient-bg"></view>
    <view class="cloud-background"></view>
    <view class="ink-background"></view>

    <!-- 顶部导航 -->
    <view class="header rice-paper brush-border-ink">
      <view class="page-container">
        <view class="header-inner">
          <view class="back-btn btn-ink" @click="goBack">
            <TraditionalIcon name="arrow-left" size="32" color="var(--primary)" />
          </view>
          <view class="header-center">
            <text class="header-title ink-pressed">我的收藏</text>
          </view>
          <view class="header-right btn-ink" @click="showCollectionManager" v-if="favorites.length > 0">
            <TraditionalIcon name="chat" size="36" color="var(--primary)" />
          </view>
        </view>
      </view>
    </view>

    <!-- 统计卡片区域 -->
    <view class="stats-section" v-if="!loading">
      <view class="page-container">
        <view class="stats-card">
          <view class="stat-item">
            <text class="stat-number">{{ totalFavorites }}</text>
            <text class="stat-label">总收藏</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-number">{{ collections.length }}</text>
            <text class="stat-label">收藏夹</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-number">{{ currentMonthCount }}</text>
            <text class="stat-label">本月新增</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 收藏夹选择器 - 胶囊样式 -->
    <view class="collections-section" v-if="collections.length > 0 && !loading">
      <view class="page-container">
        <scroll-view class="collections-scroll" scroll-x show-scrollbar="false">
          <view class="collections-list">
            <view
              v-for="collection in collections"
              :key="collection.id"
              class="collection-pill btn-ink"
              :class="{ 'active': currentCollectionId === collection.id }"
              @click="switchCollection(collection.id)"
            >
              <view class="pill-icon-wrapper">
                <TraditionalIcon :name="collection.isDefault ? 'palace' : 'tower'" size="28" :color="currentCollectionId === collection.id ? '#fff' : 'var(--secondary)'" />
              </view>
              <text class="pill-name">{{ collection.name }}</text>
              <text class="pill-count">{{ collection.actualCount || collection.count }}</text>
            </view>

            <!-- 添加收藏夹按钮 -->
            <view class="collection-pill add-pill btn-ink" @click="showCreateCollection">
              <TraditionalIcon name="home" size="28" color="var(--secondary)" />
              <text class="pill-name">新建</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <view class="skeleton-grid">
        <view v-for="i in 6" :key="i" class="skeleton-card">
          <view class="skeleton-image"></view>
          <view class="skeleton-content">
            <view class="skeleton-title"></view>
            <view class="skeleton-text"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 收藏网格列表 -->
    <scroll-view 
      class="favorites-grid" 
      scroll-y 
      v-if="filteredFavorites.length > 0 && !loading"
      @scrolltolower="loadMore"
    >
      <view class="page-container">
        <view class="grid-container">
        <view
          v-for="(item, index) in filteredFavorites"
          :key="item.id"
          class="grid-item rice-paper brush-border-ink"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @click="goToDetail(item)"
          @longpress="showItemMenu(item)"
        >
          <!-- 图片容器 -->
          <view class="grid-image-wrapper">
            <image 
              class="grid-image" 
              :src="item.image" 
              mode="aspectFill"
              lazy-load
            />
            <!-- 朝代标签 -->
            <view class="grid-dynasty-badge" v-if="item.dynasty">
              <text class="dynasty-text">{{ item.dynasty }}</text>
            </view>
            <!-- 收藏夹标签 -->
            <view class="grid-collection-badge" v-if="item.collectionId && item.collectionId !== 'default'">
              <TraditionalIcon name="tower" size="20" color="#fff" />
            </view>
          </view>

          <!-- 内容区域 -->
          <view class="grid-content">
            <text class="grid-name">{{ item.name }}</text>
            <view class="grid-meta">
              <text class="grid-location" v-if="item.location">
                <TraditionalIcon name="map" size="20" color="var(--text-muted)" style="margin-right: 4rpx;" />
                {{ item.location }}
              </text>
              <text class="grid-time">{{ formatTime(item.addedAt) }}</text>
            </view>
            <!-- 标签 -->
            <view class="grid-tags" v-if="item.tags && item.tags.length">
              <text v-for="tag in item.tags.slice(0, 2)" :key="tag" class="grid-tag">{{ tag }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="grid-actions">
            <view class="grid-action-btn btn-ink" @click.stop="showMoveDialog(item)" v-if="collections.length > 1">
              <TraditionalIcon name="tower" size="28" color="var(--secondary)" />
            </view>
            <view class="grid-action-btn remove btn-ink" @click.stop="removeFavorite(item.id)">
              <TraditionalIcon name="close" size="24" color="var(--primary)" />
            </view>
          </view>
          </view>
        </view>

        <!-- 底部提示 -->
        <view class="grid-footer">
          <text class="footer-text">—— {{ currentCollectionName }} · 共 {{ filteredFavorites.length }} 处 ——</text>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredFavorites.length === 0 && !loading">
      <view class="empty-illustration">
        <TraditionalIcon :name="currentCollectionId === 'default' ? 'palace' : 'tower'" size="120" color="var(--border)" />
        <view class="empty-decoration"></view>
      </view>
      <text class="empty-title">{{ currentCollectionId === 'default' ? '还没有收藏古建筑' : '收藏夹是空的' }}</text>
      <text class="empty-desc">{{ emptyStateDesc }}</text>
      <view class="empty-actions">
        <view class="empty-btn primary btn-ink" @click="goToExplore">
          <TraditionalIcon name="search" size="32" color="#fff" style="margin-right: 8rpx;" />
          <text class="btn-text">去发现</text>
        </view>
        <view class="empty-btn secondary btn-ink" @click="showCreateCollection" v-if="currentCollectionId === 'default'">
          <TraditionalIcon name="home" size="32" color="var(--primary)" style="margin-right: 8rpx;" />
          <text class="btn-text">创建收藏夹</text>
        </view>
      </view>
    </view>

    <!-- 创建收藏夹弹窗 -->
    <view class="modal-overlay" v-if="showCreateModal" @click="closeCreateModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">新建收藏夹</text>
          <text class="modal-close" @click="closeCreateModal">×</text>
        </view>
        <view class="modal-body">
          <input
            class="collection-input"
            v-model="newCollectionName"
            placeholder="给收藏夹起个名字"
            maxlength="20"
            focus
          />
          <text class="input-hint">最多20个字符，如："故宫系列"、"园林精选"</text>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="closeCreateModal">取消</button>
          <button class="modal-btn confirm" @click="createCollection" :disabled="!newCollectionName.trim()">创建</button>
        </view>
      </view>
    </view>

    <!-- 移动到收藏夹弹窗 -->
    <view class="modal-overlay" v-if="showMoveModal" @click="closeMoveModal">
      <view class="modal-content move-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">移动到</text>
          <text class="modal-close" @click="closeMoveModal">×</text>
        </view>
        <view class="modal-body">
          <scroll-view class="move-collections-list" scroll-y>
            <view
              v-for="collection in movableCollections"
              :key="collection.id"
              class="move-collection-item"
              @click="moveToCollection(collection.id)"
            >
              <text class="move-collection-icon">{{ collection.isDefault ? '⭐' : '📁' }}</text>
              <view class="move-collection-info">
                <text class="move-collection-name">{{ collection.name }}</text>
                <text class="move-collection-count">{{ collection.actualCount || collection.count }} 处收藏</text>
              </view>
              <text class="move-check" v-if="currentMovingItem?.collectionId === collection.id">✓</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 收藏夹管理弹窗 -->
    <view class="modal-overlay" v-if="showManageModal" @click="closeManageModal">
      <view class="modal-content manage-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">管理收藏夹</text>
          <text class="modal-close" @click="closeManageModal">×</text>
        </view>
        <view class="modal-body">
          <scroll-view class="manage-collections-list" scroll-y>
            <!-- 默认收藏夹 -->
            <view class="manage-section-title">默认收藏夹</view>
            <view class="manage-collection-item default">
              <view class="manage-collection-info">
                <text class="manage-collection-icon">⭐</text>
                <view class="manage-collection-text">
                  <text class="manage-collection-name">我的收藏</text>
                  <text class="manage-collection-desc">所有收藏的默认归属</text>
                </view>
              </view>
              <text class="manage-collection-count">{{ defaultCollectionCount }} 处</text>
            </view>

            <!-- 自定义收藏夹 -->
            <view class="manage-section-title" v-if="customCollections.length > 0">自定义收藏夹</view>
            <view
              v-for="collection in customCollections"
              :key="collection.id"
              class="manage-collection-item"
            >
              <view class="manage-collection-info" @click="editCollectionName(collection)">
                <text class="manage-collection-icon">📁</text>
                <view class="manage-collection-text">
                  <text class="manage-collection-name">{{ collection.name }}</text>
                  <text class="manage-collection-desc">创建于 {{ formatDate(collection.createdAt) }}</text>
                </view>
              </view>
              <view class="manage-collection-actions">
                <text class="manage-action-btn edit" @click="editCollectionName(collection)">编辑</text>
                <text class="manage-action-btn delete" @click="deleteCollection(collection)">删除</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn confirm full" @click="showCreateCollectionFromManage">
            <text class="btn-icon">+</text>
            <text>新建收藏夹</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 悬浮操作按钮 -->
    <view class="fab-button btn-ink" v-if="filteredFavorites.length > 0 && !loading" @click="scrollToTop">
      <TraditionalIcon name="arrow-left" size="40" color="#fff" style="transform: rotate(90deg);" />
    </view>
  </view>
</template>

<script>
import {
  getCollections,
  getFavoritesByCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  moveFavoriteToCollection,
  getCollectionStats,
  initializeCollections
} from '../../utils/collectionManager.js';
import TraditionalIcon from '../../components/shared/TraditionalIcon.vue';

export default {
  components: {
    TraditionalIcon
  },
  data() {
    return {
      collections: [],
      favorites: [],
      filteredFavorites: [],
      currentCollectionId: 'default',
      totalFavorites: 0,
      loading: true,

      // 弹窗控制
      showCreateModal: false,
      showMoveModal: false,
      showManageModal: false,

      // 表单数据
      newCollectionName: '',
      editingCollection: null,
      currentMovingItem: null
    };
  },

  computed: {
    currentCollectionName() {
      const collection = this.collections.find(c => c.id === this.currentCollectionId);
      return collection ? collection.name : '我的收藏';
    },

    emptyStateDesc() {
      if (this.currentCollectionId === 'default') {
        return '探索中华古建筑之美，收藏你感兴趣的建筑';
      }
      return '这个收藏夹还没有内容，快去添加一些古建筑吧';
    },

    movableCollections() {
      return this.collections.filter(c => c.id !== this.currentMovingItem?.collectionId);
    },

    customCollections() {
      return this.collections.filter(c => !c.isDefault);
    },

    defaultCollectionCount() {
      const defaultCollection = this.collections.find(c => c.isDefault);
      return defaultCollection ? (defaultCollection.actualCount || defaultCollection.count) : 0;
    },

    currentMonthCount() {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      return this.favorites.filter(f => {
        const date = new Date(f.addedAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
    }
  },

  onShow() {
    this.loading = true;
    // 初始化收藏夹系统
    initializeCollections();
    // 模拟加载延迟，展示骨架屏
    setTimeout(() => {
      this.loadData();
      this.loading = false;
    }, 600);
  },

  methods: {
    // 加载所有数据
    loadData() {
      const stats = getCollectionStats();
      this.collections = stats.collections;
      this.totalFavorites = stats.totalFavorites;
      this.loadFavorites();
    },

    // 加载收藏项
    loadFavorites() {
      this.favorites = getFavoritesByCollection('all');
      this.filteredFavorites = getFavoritesByCollection(this.currentCollectionId);
    },

    // 切换收藏夹
    switchCollection(collectionId) {
      if (this.currentCollectionId === collectionId) return;
      this.currentCollectionId = collectionId;
      this.filteredFavorites = getFavoritesByCollection(collectionId);
    },

    // 显示创建收藏夹弹窗
    showCreateCollection() {
      this.newCollectionName = '';
      this.showCreateModal = true;
    },

    // 从管理弹窗创建收藏夹
    showCreateCollectionFromManage() {
      this.closeManageModal();
      setTimeout(() => {
        this.showCreateCollection();
      }, 300);
    },

    // 关闭创建弹窗
    closeCreateModal() {
      this.showCreateModal = false;
      this.newCollectionName = '';
    },

    // 创建收藏夹
    createCollection() {
      const name = this.newCollectionName.trim();
      if (!name) {
        uni.showToast({ title: '请输入收藏夹名称', icon: 'none' });
        return;
      }

      const result = createCollection(name);
      if (result.success) {
        uni.showToast({ title: '创建成功', icon: 'success' });
        this.closeCreateModal();
        this.loadData();
        // 自动切换到新创建的收藏夹
        this.switchCollection(result.data.id);
      } else {
        uni.showToast({ title: result.message, icon: 'none' });
      }
    },

    // 显示移动弹窗
    showMoveDialog(item) {
      this.currentMovingItem = item;
      this.showMoveModal = true;
    },

    // 关闭移动弹窗
    closeMoveModal() {
      this.showMoveModal = false;
      this.currentMovingItem = null;
    },

    // 移动到指定收藏夹
    moveToCollection(targetCollectionId) {
      if (!this.currentMovingItem) return;

      const result = moveFavoriteToCollection(this.currentMovingItem.id, targetCollectionId);
      if (result.success) {
        uni.showToast({ title: '移动成功', icon: 'success' });
        this.closeMoveModal();
        this.loadData();
      } else {
        uni.showToast({ title: result.message || '移动失败', icon: 'none' });
      }
    },

    // 显示管理弹窗
    showCollectionManager() {
      this.showManageModal = true;
    },

    // 关闭管理弹窗
    closeManageModal() {
      this.showManageModal = false;
    },

    // 编辑收藏夹名称
    editCollectionName(collection) {
      uni.showModal({
        title: '编辑收藏夹',
        editable: true,
        placeholderText: '请输入新名称',
        content: collection.name,
        success: (res) => {
          if (res.confirm && res.content && res.content.trim()) {
            const result = updateCollection(collection.id, { name: res.content.trim() });
            if (result.success) {
              uni.showToast({ title: '修改成功', icon: 'success' });
              this.loadData();
            } else {
              uni.showToast({ title: result.message, icon: 'none' });
            }
          }
        }
      });
    },

    // 删除收藏夹
    deleteCollection(collection) {
      uni.showModal({
        title: '确认删除',
        content: `删除「${collection.name}」后，其中的收藏将移到"我的收藏"`,
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            const result = deleteCollection(collection.id, true);
            if (result.success) {
              uni.showToast({ title: '删除成功', icon: 'success' });
              if (this.currentCollectionId === collection.id) {
                this.currentCollectionId = 'default';
              }
              this.loadData();
            } else {
              uni.showToast({ title: result.message, icon: 'none' });
            }
          }
        }
      });
    },

    // 移除收藏
    removeFavorite(id) {
      uni.showModal({
        title: '确认移除',
        content: '确定要移除这个收藏吗？',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            const favorites = uni.getStorageSync('FAVORITE_BUILDINGS') || [];
            const index = favorites.findIndex(f => f.id === id);
            if (index > -1) {
              const oldCollectionId = favorites[index].collectionId || 'default';
              favorites.splice(index, 1);
              uni.setStorageSync('FAVORITE_BUILDINGS', favorites);

              const { updateCollectionCount } = require('../../utils/collectionManager.js');
              updateCollectionCount(oldCollectionId);

              uni.showToast({ title: '已移除', icon: 'success' });
              this.loadData();
            }
          }
        }
      });
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return '今天';
      if (days === 1) return '昨天';
      if (days < 7) return `${days}天前`;
      if (days < 30) return `${Math.floor(days / 7)}周前`;

      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },

    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    },

    // 跳转到详情页
    goToDetail(building) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${building.id}&name=${encodeURIComponent(building.name || '')}`
      });
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 去浏览古建筑
    goToExplore() {
      uni.navigateTo({
        url: '/pages/map/map'
      });
    },

    // 显示长按菜单
    showItemMenu(item) {
      const itemList = ['查看详情', '分享', '移除收藏'];
      if (this.collections.length > 1) {
        itemList.splice(2, 0, '移动到...');
      }

      uni.showActionSheet({
        itemList,
        success: (res) => {
          switch(res.tapIndex) {
            case 0:
              this.goToDetail(item);
              break;
            case 1:
              this.shareItem(item);
              break;
            case 2:
              if (this.collections.length > 1) {
                this.showMoveDialog(item);
              } else {
                this.removeFavorite(item.id);
              }
              break;
            case 3:
              this.removeFavorite(item.id);
              break;
          }
        }
      });
    },

    // 分享收藏项
    shareItem(item) {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    },

    // 滚动到顶部
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    },

    // 加载更多（预留）
    loadMore() {
      // 预留分页加载功能
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: var(--bg-primary);
  position: relative;
}

/* 背景 */
.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, var(--bg-secondary) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.cloud-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,50 Q30,30 50,30 T80,50 Q90,50 90,60 T80,70 Q70,80 50,80 T20,70 Q10,70 10,60 T20,50' fill='rgba(139,69,19,0.03)'/%3E%3C/svg%3E");
  background-size: 200rpx 200rpx;
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
}

.ink-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cpath fill='%235c3d2e' d='M0,700 Q200,600 400,650 Q600,550 800,600 Q1000,500 1200,550 L1200,800 L0,800 Z' opacity='0.03'/%3E%3C/svg%3E");
  background-size: cover;
  background-position: bottom;
  pointer-events: none;
  z-index: 1;
}

/* 顶部导航 */
.header {
  padding: 60rpx 30rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 20rpx var(--shadow);
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1rpx solid var(--border);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: rgba(255, 248, 230, 0.3);
}

.back-icon {
  font-size: 32rpx;
  color: #fff8e6;
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 38rpx;
  font-weight: bold;
  color: var(--primary);
  letter-spacing: 8rpx;
  font-family: 'TsangerJinKai', serif;
}

.header-right {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.manage-text {
  font-size: 28rpx;
  color: #fff8e6;
  opacity: 0.9;
}

/* 统计卡片区域 */
.stats-section {
  padding: 30rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 2;
}

.stats-card {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 8rpx 32rpx var(--shadow);
  border: 2rpx solid var(--border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary);
  font-family: 'TsangerJinKai', serif;
}

.stat-label {
  font-size: 26rpx;
  color: var(--text-tertiary);
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: linear-gradient(180deg, transparent, var(--border), transparent);
}

/* 收藏夹选择器 - 胶囊样式 */
.collections-section {
  padding: 0 30rpx 20rpx;
}

.collections-scroll {
  white-space: nowrap;
}

.collections-list {
  display: flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.collection-pill {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 28rpx;
  background: var(--bg-primary);
  border-radius: 40rpx;
  border: 1rpx solid var(--border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.collection-pill.active {
  background: var(--primary);
  border-color: var(--primary-dark);
  box-shadow: 0 8rpx 24rpx var(--shadow-primary);
}

.collection-pill:active {
  transform: scale(0.95);
}

.pill-icon {
  font-size: 28rpx;
}

.collection-pill.active .pill-icon {
  filter: brightness(0) invert(1);
}

.pill-name {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.collection-pill.active .pill-name {
  color: #fff;
}

.pill-count {
  font-size: 22rpx;
  color: var(--text-tertiary);
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 36rpx;
  text-align: center;
}

.collection-pill.active .pill-count {
  color: var(--primary);
  background: #fff;
}

.add-pill {
  background: #f5f5f5;
  border-style: dashed;
}

.add-pill .pill-name {
  color: #666;
}

/* 加载状态 - 骨架屏 */
.loading-state {
  padding: 30rpx;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.skeleton-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.skeleton-image {
  width: 100%;
  height: 280rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 20rpx;
}

.skeleton-title {
  height: 32rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 24rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  width: 60%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 收藏网格列表 */
.favorites-grid {
  padding: 0 24rpx 30rpx;
  height: calc(100vh - 420rpx);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 32rpx;
  }
}

.grid-item {
  background: var(--bg-card);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx var(--shadow);
  border: 1rpx solid var(--border);
  animation: cardEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(40rpx) scale(0.95);
  }
  50% {
    transform: translateY(-5rpx) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.grid-item:hover {
  transform: translateY(-6rpx);
  box-shadow:
    0 16rpx 48rpx rgba(139, 69, 19, 0.15),
    0 4rpx 12rpx rgba(139, 69, 19, 0.08);
}

.grid-item:active {
  transform: scale(0.98) translateY(-2rpx);
  box-shadow:
    0 6rpx 20rpx rgba(139, 69, 19, 0.12),
    0 2rpx 6rpx rgba(139, 69, 19, 0.06);
}

.grid-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f0e8 0%, #ebe5d8 100%);
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-item:hover .grid-image {
  transform: scale(1.08);
}

.grid-item:active .grid-image {
  transform: scale(1.05);
}

.grid-dynasty-badge {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.9) 0%, rgba(180, 30, 5, 0.9) 100%);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(8rpx);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.3);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-item:hover .grid-dynasty-badge {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(200, 37, 6, 0.4);
}

.dynasty-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.grid-collection-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fff 0%, #faf6ed 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-item:hover .grid-collection-badge {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.2);
}

.collection-badge-text {
  font-size: 24rpx;
}

.grid-content {
  padding: 20rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background: linear-gradient(180deg, #fff 0%, #faf8f5 100%);
}

.grid-name {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 84rpx;
  transition: color 0.3s ease;
}

.grid-item:hover .grid-name {
  color: var(--primary);
}

.grid-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12rpx;
  border-top: 2rpx solid #f0e6d8;
}

.grid-location {
  font-size: 24rpx;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.meta-icon {
  font-size: 20rpx;
  flex-shrink: 0;
}

.grid-time {
  font-size: 22rpx;
  color: #a09080;
  flex-shrink: 0;
  margin-left: 8rpx;
}

.grid-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.grid-tag {
  font-size: 20rpx;
  color: var(--text-tertiary);
  background: linear-gradient(145deg, #faf6ed 0%, #f5efe6 100%);
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  border: 1rpx solid var(--bg-tertiary);
  transition: all 0.3s ease;
}

.grid-tag:hover {
  background: linear-gradient(145deg, #fff8d8 0%, #f5e6c8 100%);
  border-color: var(--warning);
  color: #c82506;
}

.grid-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 10rpx;
  opacity: 0;
  transform: translateY(-10rpx);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-actions.always-visible {
  opacity: 1;
  transform: translateY(0);
}

.grid-item:hover .grid-actions:not(.always-visible),
.grid-item:active .grid-actions:not(.always-visible) {
  opacity: 1;
  transform: translateY(0);
}

.grid-action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx var(--shadow);
  cursor: pointer;
  transition: all 0.3s;
  border: 1rpx solid var(--border);
}

.grid-action-btn:active {
  transform: scale(0.92);
}

.grid-action-btn.remove {
  background: var(--primary);
  border-color: var(--primary-dark);
}

.grid-action-btn.remove:hover {
  animation: favoritePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 8rpx 24rpx rgba(200, 37, 6, 0.4);
}

.action-icon-small {
  font-size: 26rpx;
  color: var(--secondary);
  transition: all 0.3s ease;
}

.grid-action-btn:hover .action-icon-small {
  color: var(--primary);
}

.grid-action-btn.remove .action-icon-small {
  color: #fff;
  font-weight: bold;
}

@keyframes favoritePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 网格底部 */
.grid-footer {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #a09080;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 60rpx;
  text-align: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 40rpx;
}

.empty-icon-large {
  font-size: 140rpx;
  opacity: 0.6;
}

.empty-decoration {
  position: absolute;
  top: -20rpx;
  right: -30rpx;
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, var(--warning) 0%, #c82506 100%);
  border-radius: 50%;
  opacity: 0.3;
}

.empty-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--primary);
  margin-bottom: 20rpx;
  letter-spacing: 4rpx;
  font-family: 'TsangerJinKai', serif;
}

.empty-desc {
  font-size: 28rpx;
  color: var(--text-tertiary);
  line-height: 1.6;
  margin-bottom: 50rpx;
}

.empty-actions {
  display: flex;
  gap: 24rpx;
}

.empty-btn {
  padding: 24rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.empty-btn.primary {
  background: var(--primary);
  box-shadow: 0 8rpx 24rpx var(--shadow-primary);
}

.empty-btn.secondary {
  background: var(--bg-card);
  border: 2rpx solid var(--border);
}

.empty-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 28rpx;
}

.btn-text {
  font-size: 28rpx;
  color: #fff8e6;
  font-weight: 500;
}

.empty-btn.secondary .btn-text {
  color: var(--text-primary);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
  backdrop-filter: blur(4rpx);
}

.modal-content {
  background: var(--bg-card);
  border-radius: 28rpx;
  width: 100%;
  max-width: 640rpx;
  overflow: hidden;
  animation: modalIn 0.3s ease;
  box-shadow: 0 20rpx 60rpx var(--shadow);
  border: 1rpx solid var(--border);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0e6d8;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--primary);
  font-family: 'TsangerJinKai', serif;
}

.modal-close {
  font-size: 44rpx;
  color: #999;
  padding: 0 10rpx;
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close:active {
  color: #666;
}

.modal-body {
  padding: 32rpx;
}

.collection-input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e8d8c8;
  border-radius: 16rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  color: var(--text-primary);
  background: #faf6ed;
  transition: border-color 0.3s ease;
}

.collection-input:focus {
  border-color: var(--warning);
  outline: none;
}

.input-hint {
  display: block;
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx 32rpx;
}

.modal-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: none;
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.confirm {
  background: var(--primary);
  color: #fff;
}

.modal-btn.confirm[disabled] {
  opacity: 0.5;
}

.modal-btn.confirm.full {
  flex: none;
  width: 100%;
  gap: 12rpx;
}

.btn-icon {
  font-size: 32rpx;
}

.modal-btn:active {
  transform: scale(0.98);
}

/* 移动收藏夹弹窗 */
.move-modal .modal-body {
  max-height: 600rpx;
  padding: 20rpx;
}

.move-collections-list {
  max-height: 500rpx;
}

.move-collection-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  cursor: pointer;
}

.move-collection-item:active {
  background: #f5f5f5;
}

.move-collection-icon {
  font-size: 44rpx;
}

.move-collection-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.move-collection-name {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.move-collection-count {
  font-size: 24rpx;
  color: #999;
}

.move-check {
  font-size: 32rpx;
  color: #c82506;
  font-weight: bold;
}

/* 管理收藏夹弹窗 */
.manage-modal .modal-body {
  max-height: 700rpx;
  padding: 20rpx 0;
}

.manage-collections-list {
  max-height: 600rpx;
}

.manage-section-title {
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 32rpx;
  background: #f9f9f9;
}

.manage-collection-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.manage-collection-item.default {
  background: #faf6ed;
}

.manage-collection-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  cursor: pointer;
}

.manage-collection-icon {
  font-size: 44rpx;
}

.manage-collection-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.manage-collection-name {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.manage-collection-desc {
  font-size: 24rpx;
  color: #999;
}

.manage-collection-count {
  font-size: 26rpx;
  color: var(--text-tertiary);
}

.manage-collection-actions {
  display: flex;
  gap: 24rpx;
}

.manage-action-btn {
  font-size: 26rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.manage-action-btn.edit {
  color: var(--warning);
}

.manage-action-btn.delete {
  color: #c82506;
}

.manage-action-btn:active {
  opacity: 0.7;
}

/* 悬浮按钮 */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(200, 37, 6, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.fab-button:active {
  transform: scale(0.9);
  box-shadow: 0 4rpx 16rpx rgba(200, 37, 6, 0.3);
}

.fab-icon {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}
</style>