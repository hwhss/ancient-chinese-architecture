<template>
  <view class="container page-enter">
    <!-- 背景层 - 与古建筑页面(map.vue)完全一致 -->
    <view class="radial-gradient-bg"></view>
    <view class="cloud-background"></view>

    <!-- 顶部导航 - 简洁居中设计 -->
    <view class="header">
      <view class="page-container">
        <view class="header-inner">
          <view class="header-center">
            <view class="title-decoration"></view>
            <text class="header-title ink-pressed">我的收藏</text>
            <view class="title-subtitle">珍藏中华古建筑之美</view>
          </view>
          <view class="header-right" 
                @click="showCollectionManager" 
                v-if="favorites.length > 0"
                title="管理收藏夹"
                role="button"
                tabindex="0">
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
          class="grid-item card-ink"
          :class="{ 'visible': visibleCards[index] }"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @click="goToDetail(item)"
          @longpress="showItemMenu(item)"
        >
          <!-- 卡片装饰边框 -->
          <view class="card-border-decoration"></view>

          <!-- 图片容器 -->
          <view class="grid-image-wrapper">
            <!-- 图片加载状态 - 骨架屏 -->
            <view v-if="!isImageLoaded(item)" class="grid-image-loading">
              <view class="loading-skeleton"></view>
              <text class="loading-text">加载中...</text>
            </view>

            <!-- 图片元素 -->
            <image
              v-if="hasValidImage(item) && !isImageError(item)"
              class="grid-image"
              :class="{ 'is-loaded': isImageLoaded(item), 'is-hidden': !isImageLoaded(item) }"
              :src="item.image"
              mode="aspectFill"
              lazy-load
              @load="onImageLoad(item)"
              @error="onImageError(item)"
            />

            <!-- 图片错误/空状态 -->
            <view v-else class="grid-image-empty">
              <view class="empty-pattern">
                <view class="pattern-line line-1"></view>
                <view class="pattern-line line-2"></view>
                <view class="pattern-circle"></view>
              </view>
              <text class="empty-text">暂无图片</text>
            </view>

            <!-- 图片渐变遮罩 -->
            <view class="grid-image-overlay"></view>

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
            <view class="grid-header">
              <text class="grid-name ink-pressed">{{ item.name }}</text>
              <view class="grid-location" v-if="item.location">
                <TraditionalIcon name="map" size="20" color="var(--text-muted)" style="margin-right: 4rpx;" />
                {{ item.location }}
              </view>
            </view>

            <view class="grid-meta">
              <text class="grid-time">{{ formatTime(item.addedAt) }}</text>
            </view>

            <!-- 标签 -->
            <view class="grid-tags" v-if="item.tags && item.tags.length">
              <text v-for="tag in item.tags.slice(0, 2)" :key="tag" class="grid-tag">{{ tag }}</text>
            </view>

            <!-- 操作提示 -->
            <view class="grid-action-hint">
              <text class="action-text">查看详情</text>
              <text class="action-arrow">→</text>
            </view>
          </view>

          <!-- 悬浮操作按钮 -->
          <view class="grid-actions">
            <view class="grid-action-btn btn-ink" @click.stop="showMoveDialog(item)" v-if="collections.length > 1">
              <TraditionalIcon name="tower" size="28" color="var(--secondary)" />
            </view>
            <view class="grid-action-btn remove btn-ink" @click.stop="removeFavorite(item.id)">
              <TraditionalIcon name="close" size="24" color="#fff" />
            </view>
          </view>
        </view>
        </view>

        <!-- 底部提示 -->
        <view class="grid-footer">
          <view class="footer-decoration"></view>
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

      // 图片加载状态
      loadedImages: {},
      errorImages: {},
      visibleCards: {},

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
    // 获取图片唯一标识
    getImageKey(item) {
      return String(item.id || 'unknown');
    },

    // 检查图片是否有效
    hasValidImage(item) {
      return Boolean(item && item.image);
    },

    // 检查图片是否已加载
    isImageLoaded(item) {
      return Boolean(this.loadedImages[this.getImageKey(item)]);
    },

    // 检查图片是否加载错误
    isImageError(item) {
      return Boolean(this.errorImages[this.getImageKey(item)]);
    },

    // 图片加载成功回调
    onImageLoad(item) {
      const key = this.getImageKey(item);
      this.$set(this.loadedImages, key, true);
      this.$set(this.errorImages, key, false);
    },

    // 图片加载失败回调
    onImageError(item) {
      const key = this.getImageKey(item);
      this.$set(this.errorImages, key, true);
      this.$set(this.loadedImages, key, false);
      console.warn(`[收藏页] 图片加载失败: ${item.name}`, item.image);
    },

    // 加载所有数据
    loadData() {
      const stats = getCollectionStats();
      this.collections = stats.collections;
      this.totalFavorites = stats.totalFavorites;
      this.loadFavorites();
      this.initVisibleCards();
    },

    // 初始化卡片可见状态
    initVisibleCards() {
      this.visibleCards = {};
      if (this.filteredFavorites && this.filteredFavorites.length > 0) {
        this.filteredFavorites.forEach((item, index) => {
          setTimeout(() => {
            this.$set(this.visibleCards, index, true);
          }, 100 + index * 80);
        });
      }
    },

    // 加载收藏项
    loadFavorites() {
      this.favorites = getFavoritesByCollection('all');
      this.filteredFavorites = getFavoritesByCollection(this.currentCollectionId);
      this.initVisibleCards();
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
/* ============================================
   收藏页面 - 中式古风主题
   ============================================ */

.container {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  position: relative;
  overflow: hidden;
}

/* 背景 - 与古建筑页面(map.vue)完全一致（2层背景系统） */

.radial-gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-secondary) 40%, var(--bg-tertiary) 70%, #dcc8b0 100%);
  pointer-events: none;
  z-index: 0;
}

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
  z-index: 1;
}

@keyframes cloudMove {
  0% { background-position: 0 0; }
  100% { background-position: 800rpx 400rpx; }
}

/* 顶部导航 - 沉浸式设计 */
.header {
  padding: var(--space-24) var(--space-6) var(--space-16);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  background: linear-gradient(
    180deg,
    rgba(242, 234, 211, 0.99) 0%,
    rgba(242, 234, 211, 0.95) 40%,
    rgba(242, 234, 211, 0.75) 70%,
    transparent 100%
  );
  backdrop-filter: blur(20rpx);
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1rpx;
  background: linear-gradient(
    90deg,
    transparent,
    var(--border-light) 20%,
    var(--secondary) 50%,
    var(--border-light) 80%,
    transparent
  );
  opacity: 0.5;
}

.header-inner {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
}

/* 标题装饰线 - 中式优雅风格 */
.title-decoration {
  width: 120rpx;
  height: 3rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary) 20%,
    var(--secondary) 50%,
    var(--primary) 80%,
    transparent 100%
  );
  border-radius: 2rpx;
  opacity: 0.7;
  margin-bottom: var(--space-3);
  position: relative;
}

.title-decoration::before,
.title-decoration::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  background: var(--secondary);
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 10rpx rgba(139, 69, 19, 0.3);
}

.title-decoration::before {
  left: -4rpx;
}

.title-decoration::after {
  right: -4rpx;
}

/* 副标题 - 优雅衬线风格 */
.title-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  letter-spacing: var(--tracking-wider);
  font-weight: 400;
  opacity: 0.85;
  position: relative;
  padding: 0 var(--space-4);
}

.title-subtitle::before,
.title-subtitle::after {
  content: '·';
  margin: 0 var(--space-2);
  color: var(--secondary);
  opacity: 0.5;
}

.header-title {
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--primary);
  letter-spacing: var(--tracking-wider);
  font-family: 'ZCOOL XiaoWei', serif;
  text-shadow:
    0 1rpx 0px rgba(255, 255, 255, 1),
    0 2rpx 4rpx rgba(166, 49, 49, 0.08),
    0 4rpx 12rpx rgba(166, 49, 49, 0.05);
  position: relative;
  display: inline-block;
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% { 
    filter: brightness(1);
  }
  50% { 
    filter: brightness(1.02);
  }
}

/* ============================================
   管理收藏夹按钮 - 精简高效设计
   核心原则：简洁、清晰、高性能
   ============================================ */
.header-right {
  position: absolute;
  right: var(--space-4);
  top: var(--space-1);
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #fff 0%, rgba(249,245,232,0.95) 100%);
  border: 1rpx solid rgba(255,255,255,0.7);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  box-shadow:
    0 4rpx 12rpx rgba(139,69,19,0.08),
    inset 0 1rpx 2rpx rgba(255,255,255,0.9);
}

.header-right:hover {
  transform: scale(1.08) translateY(-2rpx);
  box-shadow:
    0 8rpx 20rpx rgba(139,69,19,0.14),
    inset 0 1px 2px rgba(255,255,255,1);
  border-color: var(--secondary);
}

.header-right:active {
  transform: scale(0.94);
  transition-duration: 0.1s;
  box-shadow:
    0 2rpx 6rpx rgba(139,69,19,0.12),
    inset 0 2rpx 6rpx rgba(139,69,19,0.06);
}

.header-right:focus {
  outline: none;
  box-shadow:
    0 4rpx 12rpx rgba(139,69,19,0.08),
    inset 0 1px 2px rgba(255,255,255,0.9),
    0 0 0 3rpx var(--secondary);
}

@media (min-width: 1024px) {
  .header-right {
    width: 104rpx;
    height: 104rpx;
  }
}

/* 统计卡片区域 - 玻璃态设计 */
.stats-section {
  padding: var(--space-10) var(--space-6);
  margin-top: calc(-1 * var(--space-6));
  position: relative;
  z-index: 2;
}

.stats-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(249, 245, 232, 0.92) 50%,
    rgba(242, 234, 211, 0.88) 100%
  );
  border-radius: var(--radius-xl);
  padding: var(--space-12) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow:
    0 8rpx 32rpx rgba(139, 69, 19, 0.08),
    0 2rpx 8rpx rgba(0, 0, 0, 0.04),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10rpx);
  transition: all var(--duration-normal) var(--ease-out);
}

.stats-card:hover {
  transform: translateY(-4rpx);
  box-shadow:
    0 16rpx 48rpx rgba(139, 69, 19, 0.12),
    0 4rpx 16rpx rgba(0, 0, 0, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}

/* 装饰性背景图案 */
.stats-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300rpx;
  height: 300rpx;
  background: radial-gradient(
    circle,
    rgba(166, 49, 49, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* 顶部装饰线 - 渐变光效 */
.stats-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 3rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--secondary) 20%,
    var(--primary) 50%,
    var(--secondary) 80%,
    transparent 100%
  );
  opacity: 0.5;
}

/* 小屏优化：统计卡片垂直排列 */
@media (max-width: 480px) {
  .stats-card {
    flex-direction: column;
    gap: var(--space-8);
    padding: var(--space-8) var(--space-6);
  }
  
  .stat-divider {
    width: 80%;
    height: 2rpx;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--border) 30%,
      var(--border-light) 70%,
      transparent 100%
    );
  }
  
  .stat-number {
    font-size: var(--text-2xl);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  position: relative;
  padding: var(--space-4) var(--space-6);
}

.stat-number {
  font-size: var(--text-4xl);
  font-weight: bold;
  color: var(--primary);
  font-family: 'ZCOOL XiaoWei', serif;
  text-shadow:
    0 2rpx 0px rgba(255, 255, 255, 1),
    0 4rpx 8rpx rgba(166, 49, 49, 0.1);
  position: relative;
  line-height: 1.2;
  transition: all var(--duration-normal) var(--ease-out);
}

.stat-item:hover .stat-number {
  transform: scale(1.08);
  color: var(--primary-dark);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  position: relative;
}

.stat-divider {
  width: 2rpx;
  height: 70rpx;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--border-light) 20%,
    var(--secondary) 50%,
    var(--border-light) 80%,
    transparent 100%
  );
  opacity: 0.6;
  position: relative;
}

.stat-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10rpx;
  height: 10rpx;
  background: var(--bg-card);
  border: 2rpx solid var(--secondary);
  border-radius: 50%;
  opacity: 0.4;
}

/* 收藏夹选择器 - 胶囊样式 */
.collections-section {
  padding: 0 var(--space-6) var(--space-5);
}

.collections-scroll {
  white-space: nowrap;
  position: relative;
}

/* 滚动区域左右渐变提示 */
.collections-scroll::before,
.collections-scroll::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40rpx;
  pointer-events: none;
  z-index: 10;
}

.collections-scroll::before {
  left: 0;
  background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
}

.collections-scroll::after {
  right: 0;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
}

.collections-list {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-1) 0;
}

.collection-pill {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(249, 245, 232, 0.9) 100%
  );
  border-radius: var(--radius-full);
  border: 1rpx solid var(--border-light);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
  box-shadow:
    0 2rpx 8rpx rgba(139, 69, 19, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  min-width: 160rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.collection-pill::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s ease;
}

.collection-pill:hover:not(.active):not(.add-pill)::before {
  left: 100%;
}

.collection-pill:hover:not(.active):not(.add-pill) {
  border-color: var(--secondary);
  transform: translateY(-3rpx);
  box-shadow:
    0 6rpx 16rpx rgba(139, 69, 19, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
}

.collection-pill.active {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  border-color: var(--primary-dark);
  box-shadow:
    0 6rpx 20rpx rgba(200, 37, 6, 0.25),
    0 2rpx 8rpx rgba(200, 37, 6, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.03);
}

.collection-pill:active {
  transform: scale(0.97) translateY(0);
}

.pill-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.collection-pill.active .pill-name {
  color: #fff8e6;
  font-weight: 600;
}

.pill-name {
  font-size: var(--text-base);
  color: var(--text-primary);
  font-weight: 500;
}

.pill-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
  background: linear-gradient(
    135deg,
    rgba(139, 69, 19, 0.08) 0%,
    rgba(139, 69, 19, 0.15) 100%
  );
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  min-width: 36rpx;
  text-align: center;
  font-weight: 600;
}

.collection-pill.active .pill-count {
  color: var(--primary-light);
  background: rgba(255, 248, 230, 0.25);
}

.add-pill {
  background: linear-gradient(
    135deg,
    rgba(249, 245, 232, 0.95) 0%,
    rgba(232, 222, 195, 0.9) 100%
  );
  border-style: dashed;
  border-color: var(--border);
}

.add-pill:hover {
  border-color: var(--secondary);
  background: linear-gradient(
    135deg,
    var(--bg-card) 0%,
    var(--bg-secondary) 100%
  );
}

.add-pill .pill-name {
  color: var(--secondary);
}

/* 加载状态 - 优雅骨架屏 */
.loading-state {
  padding: var(--space-10) var(--space-6);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .skeleton-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-8);
  }
}

.skeleton-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(249, 245, 232, 0.95) 100%
  );
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 4rpx 16rpx rgba(139, 69, 19, 0.06),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 4/3;
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

.skeleton-content {
  padding: var(--space-5);
}

.skeleton-title {
  height: 32rpx;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-text {
  height: 24rpx;
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  width: 60%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* 收藏网格列表 */
.favorites-grid {
  padding: 0 var(--space-6) calc(var(--space-8) + 120rpx + env(safe-area-inset-bottom, 34px));
  height: calc(100vh - var(--header-height, 420rpx));
  min-height: 50vh;
  box-sizing: border-box;
}

/* 移动端优化：减小头部高度偏移量 */
@media (max-width: 768px) {
  .favorites-grid {
    height: calc(100vh - 380rpx);
    min-height: 45vh;
  }
}

/* 超小屏优化（iPhone SE等） */
@media (max-width: 480px) {
  .favorites-grid {
    height: calc(100vh - 350rpx);
    min-height: 40vh;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

@media (min-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-7);
  }
}

/* 平板设备优化（iPad等） */
@media (min-width: 900px) and (max-width: 1023px) {
  .grid-container {
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    gap: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-8);
  }
}

@media (min-width: 1440px) {
  .grid-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* ============================================
   收藏卡片 - 精致现代设计
   ============================================ */
.grid-item {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(249, 245, 232, 0.96) 50%,
    rgba(242, 234, 211, 0.94) 100%
  );
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow:
    0 4rpx 16rpx rgba(139, 69, 19, 0.08),
    0 2rpx 6rpx rgba(0, 0, 0, 0.04),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  transition: all var(--duration-slow) var(--ease-out);
  position: relative;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(40rpx) scale(0.95);

  will-change: transform, opacity;
}

.grid-item.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  will-change: auto;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(40rpx) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.grid-item:hover {
  transform: translateY(-10rpx) scale(1.03);
  box-shadow:
    0 20rpx 48rpx rgba(139, 69, 19, 0.15),
    0 8rpx 20rpx rgba(0, 0, 0, 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 1),
    0 0 0 1rpx var(--secondary);
  border-color: var(--secondary);
  z-index: 10;
}

.grid-item:active {
  transform: translateY(-5rpx) scale(0.98);
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

.grid-item:hover .card-border-decoration {
  opacity: 1;
}

.grid-item:hover .card-border-decoration::before,
.grid-item:hover .card-border-decoration::after {
  opacity: 0.6;
}

/* ============================================
   图片区域 - 优雅展示
   ============================================ */
.grid-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    #e8dcc8 100%
  );
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.8s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    filter 0.5s ease;
  opacity: 1;
  filter: saturate(1.05) contrast(1.02);
}

.grid-image.is-loaded {
  opacity: 1;
}

.grid-image.is-hidden {
  opacity: 0;
}

/* 图片渐变遮罩 - 柔和过渡 */
.grid-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: linear-gradient(
    to top,
    rgba(44, 30, 19, 0.4) 0%,
    rgba(44, 30, 19, 0.2) 35%,
    rgba(44, 30, 19, 0.08) 65%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* 图片悬停缩放效果 */
.grid-item:hover .grid-image {
  transform: scale(1.1);
  filter: saturate(1.15) contrast(1.05) brightness(1.02);
}

.grid-item:active .grid-image {
  transform: scale(1.05);
}

/* 图片加载状态 - 骨架屏 */
.grid-image-loading {
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

/* 图片错误/空状态 */
.grid-image-empty {
  position: absolute;
  inset: 0;
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

.pattern-circle {
  position: absolute;
  width: 56rpx;
  height: 56rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2rpx solid var(--border);
  border-radius: 50%;
  opacity: 0.3;
}

.empty-text {
  font-size: var(--text-xs);
  color: var(--text-muted);
  z-index: 2;
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

/* ============================================
   内容区域 - 精致排版
   ============================================ */
.grid-content {
  padding: var(--space-6);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(249, 245, 232, 0.96) 100%
  );
  position: relative;
  z-index: 3;
}

.grid-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.grid-name {
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--text-primary);
  line-height: var(--leading-tight);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: var(--tracking-normal);
  transition: color var(--duration-fast) ease;
}

/* 墨按文字阴影效果 */
.ink-pressed {
  text-shadow:
    0.5rpx 0.5rpx 0px rgba(255, 255, 255, 0.8),
    -0.5rpx -0.5rpx 1rpx rgba(0, 0, 0, 0.1),
    0 2rpx 4rpx rgba(44, 30, 19, 0.08);
}

.grid-item:hover .grid-name {
  color: var(--primary);
}

.grid-location {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.grid-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1rpx solid var(--border-light);
}

.grid-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  flex-shrink: 0;
}

/* 标签 */
.grid-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.grid-tag {
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

.grid-tag:hover {
  background: linear-gradient(
    135deg,
    rgba(166, 49, 49, 0.1) 0%,
    rgba(166, 49, 49, 0.18) 100%
  );
  color: var(--primary-dark);
  border-color: rgba(166, 49, 49, 0.2);
}

/* 查看详情提示 */
.grid-action-hint {
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
  margin-top: var(--space-3);
  width: fit-content;
}

.grid-item:hover .grid-action-hint {
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

.grid-item:hover .action-arrow {
  transform: translateX(2rpx);
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

/* 桌面端：hover时显示 */
@media (hover: hover) and (pointer: fine) {
  .grid-item:hover .grid-actions:not(.always-visible),
  .grid-item:active .grid-actions:not(.always-visible) {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端（触摸设备）：始终显示操作按钮 */
@media (hover: none) and (pointer: coarse) {
  .grid-actions {
    opacity: 0.9;
    transform: translateY(0);
  }
  
  /* 同时显示查看详情提示 */
  .grid-action-hint {
    opacity: 0.8;
    transform: translateX(0);
  }
  
  /* 显示卡片装饰边框 */
  .card-border-decoration {
    opacity: 0.5;
  }
}

.grid-action-btn {
  width: 88rpx;
  height: 88rpx;
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

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .grid-action-btn {
    width: 96rpx;
    height: 96rpx;
  }
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
  padding: var(--space-16) var(--space-6) var(--space-10);
  position: relative;
}

.footer-decoration {
  width: 120rpx;
  height: 2rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--secondary) 50%,
    transparent 100%
  );
  margin: 0 auto var(--space-4);
  opacity: 0.3;
}

.footer-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
  letter-spacing: var(--tracking-wide);
}

/* 空状态 - 温馨引导设计 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-28) var(--space-12);
  text-align: center;
  min-height: 65vh;
  position: relative;
}

.empty-state::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(
    circle,
    rgba(166, 49, 49, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.empty-illustration {
  position: relative;
  margin-bottom: var(--space-12);
  width: 220rpx;
  height: 220rpx;
  animation: float 4s ease-in-out infinite;
}

/* 空状态装饰背景 - 光环效果 */
.empty-illustration::before {
  content: '';
  position: absolute;
  inset: -30rpx;
  background: radial-gradient(
    circle at center,
    rgba(166, 49, 49, 0.08) 0%,
    rgba(139, 69, 19, 0.04) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: breathe 3s ease-in-out infinite;
}

@keyframes emptyPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.empty-icon-large {
  font-size: 120rpx;
  opacity: 0.5;
  position: relative;
  z-index: 1;
  filter: grayscale(30%);
}

.empty-decoration {
  position: absolute;
  top: -10rpx;
  right: -20rpx;
  width: 50rpx;
  height: 50rpx;
  background: linear-gradient(135deg, var(--warning) 0%, var(--primary) 100%);
  border-radius: 50%;
  opacity: 0.25;
  animation: floatDecoration 6s ease-in-out infinite;
}

@keyframes floatDecoration {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15rpx) rotate(180deg); }
}

.empty-title {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--primary);
  margin-bottom: var(--space-5);
  letter-spacing: var(--tracking-wide);
  font-family: 'ZCOOL XiaoWei', serif;
  text-shadow:
    0 1rpx 0px rgba(255, 255, 255, 1),
    0 2rpx 6rpx rgba(166, 49, 49, 0.08);
}

.empty-desc {
  font-size: var(--text-base);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-14);
  max-width: 500rpx;
  opacity: 0.9;
}

.empty-actions {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
  justify-content: center;
}

.empty-btn {
  padding: var(--space-6) var(--space-12);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-normal) var(--ease-out);
  font-weight: 600;
  letter-spacing: var(--tracking-normal);
  position: relative;
  overflow: hidden;
}

.empty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.empty-btn:hover::before {
  left: 100%;
}

.empty-btn.primary {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 100%
  );
  box-shadow:
    0 8rpx 24rpx rgba(166, 49, 49, 0.25),
    0 4rpx 12rpx rgba(200, 37, 6, 0.15),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.empty-btn.primary:hover {
  transform: translateY(-4rpx) scale(1.03);
  box-shadow:
    0 12rpx 32rpx rgba(166, 49, 49, 0.35),
    0 6rpx 16rpx rgba(200, 37, 6, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.3);
}

.empty-btn.secondary {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    var(--bg-card) 100%
  );
  border: 2rpx solid var(--border);
  box-shadow: var(--shadow-sm);
}

.empty-btn.secondary:hover {
  transform: translateY(-3rpx);
  border-color: var(--secondary);
  box-shadow: var(--shadow-md);
  background: linear-gradient(
    135deg,
    var(--bg-card) 0%,
    var(--bg-secondary) 100%
  );
}

.empty-btn:active {
  transform: scale(0.97) translateY(0);
}

/* ============================================
   弹窗样式
   ============================================ */
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

/* 小屏弹窗优化 */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 20rpx;
    align-items: flex-end;
  }
  
  .modal-content {
    border-radius: 28rpx 28rpx 0 0;
    max-height: 85vh;
    animation: modalInBottom 0.3s ease;
  }
}

@keyframes modalInBottom {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* 小屏弹窗头部优化 */
@media (max-width: 480px) {
  .modal-header {
    padding: 24rpx;
  }
  
  .modal-body {
    padding: 24rpx;
  }
  
  .modal-footer {
    padding: 16rpx 24rpx 24rpx;
  }
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
  padding: 0 16rpx;
  min-width: 88rpx;
  min-height: 88rpx;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-height: min(500rpx, 50vh);
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
  max-height: min(600rpx, 60vh);
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
  padding: 12rpx 24rpx;
  min-height: 88rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  bottom: calc(60rpx + env(safe-area-inset-bottom, 34px));
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

/* 大屏优化：FAB按钮与内容对齐 */
@media (min-width: 1440px) {
  .fab-button {
    right: calc((100vw - 1400px) / 2 + 40rpx);
  }
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

/* ============================================
   全局动画与微交互系统
   ============================================ */

/* 页面入场动画 */
.page-enter {
  animation: pageEnter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 脉冲动画 - 用于重要元素 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
}

/* 浮动动画 - 用于装饰元素 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10rpx) rotate(2deg);
  }
}

/* 呼吸动画 - 用于背景装饰 */
@keyframes breathe {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

/* 光泽扫过效果 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 数字跳动效果 - 统计数据使用 */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10rpx) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.stat-number {
  animation: countUp 0.5s ease-out forwards;
}

/* 卡片悬浮光晕效果 */
.grid-item::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(166, 49, 49, 0.03) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--duration-normal);
  pointer-events: none;
  z-index: 0;
}

.grid-item:hover::before {
  opacity: 1;
}

/* 按钮点击波纹效果（CSS实现） */
.btn-ink {
  position: relative;
  overflow: hidden;
}

.btn-ink::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition:
    width 0.4s ease,
    height 0.4s ease,
    opacity 0.4s ease;
  opacity: 0;
}

.btn-ink:active::after {
  width: 200%;
  height: 200%;
  opacity: 0;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6rpx;
  height: 6rpx;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    var(--secondary) 0%,
    var(--primary) 100%
  );
  border-radius: 3rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    var(--primary-dark) 0%,
    var(--primary) 100%
  );
}
</style>