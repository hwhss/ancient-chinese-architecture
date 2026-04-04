<template>
  <view class="filter-area">
    <view class="page-container">
      <view class="search-box rice-paper">
        <TraditionalIcon name="search" size="32" color="var(--secondary)" />
        <input 
          class="search-input" 
          :value="searchKeyword"
          @input="onSearchInput"
          placeholder="搜索古建名称或标签..." 
          placeholder-class="search-placeholder"
        />
        <view class="search-clear" v-if="searchKeyword" @click="$emit('update:searchKeyword', '')">
          <TraditionalIcon name="close" size="24" color="var(--text-muted)" />
        </view>
      </view>
      
      <view class="filter-tabs-container">
        <scroll-view class="filter-tabs" scroll-x>
          <view class="filter-group">
            <text class="filter-label">分类</text>
            <view
              v-for="cat in categories"
              :key="cat.key"
              class="filter-tab btn-ink"
              :class="{ active: currentCategory === cat.key }"
              @click="$emit('select-category', cat.key)"
            >
              <view class="tab-icon-wrapper" v-if="cat.icon">
                <TraditionalIcon :name="cat.icon" size="24" :color="currentCategory === cat.key ? '#fff' : 'var(--secondary)'" />
              </view>
              <text class="tab-text">{{ cat.name }}</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="sort-btn btn-ink" @click="$emit('toggle-sort')">
          <TraditionalIcon name="map" size="36" color="var(--secondary)" />
        </view>
      </view>
      
      <view class="active-filters" v-if="currentCategory !== 'all' || searchKeyword">
        <text class="filter-result-text">筛选结果：{{ filteredCount }} 处古建</text>
        <view class="clear-filters rice-paper" @click="$emit('clear-filters')" v-if="currentCategory !== 'all'">
          <text>清空</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  components: {
    TraditionalIcon
  },
  props: {
    searchKeyword: {
      type: String,
      default: ""
    },
    currentCategory: {
      type: String,
      default: "all"
    },
    categories: {
      type: Array,
      default: () => []
    },
    filteredCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    onSearchInput(e) {
      this.$emit('update:searchKeyword', e.detail.value);
    }
  }
};
</script>

<style scoped>
.filter-area {
  background: var(--bg-card);
  padding: 30rpx;
  border-bottom: 2rpx solid var(--border);
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 20rpx var(--shadow);
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 44rpx;
  padding: 16rpx 28rpx;
  border: 1rpx solid var(--border);
  transition: all 0.3s;
  margin-bottom: 24rpx;
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.05);
}

.search-box:focus-within {
  border-color: var(--secondary);
  background: var(--bg-card);
  box-shadow: 0 4rpx 16rpx var(--shadow);
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.search-placeholder {
  color: var(--text-muted);
}

.search-clear {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
  margin-left: 12rpx;
  cursor: pointer;
  transition: all 0.25s ease;
}

.search-clear:hover {
  background: #d4c4a8;
}

.search-clear text {
  font-size: 28rpx;
  color: var(--secondary);
  font-weight: bold;
}

.filter-tabs-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.filter-tabs {
  flex: 1;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.filter-group {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
}

.filter-label {
  font-size: 24rpx;
  color: var(--text-tertiary);
  font-weight: 500;
  margin-right: 8rpx;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: var(--bg-primary);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  transition: all 0.3s;
  border: 1rpx solid var(--border);
  cursor: pointer;
}

.filter-tab:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.12);
}

.filter-tab:active {
  transform: translateY(-1px) scale(0.98);
}

.filter-tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary-dark);
  box-shadow: 0 4rpx 12rpx var(--shadow-primary);
}

.filter-divider {
  display: inline-block;
  width: 1rpx;
  height: 40rpx;
  background: linear-gradient(180deg, transparent, var(--bg-tertiary), transparent);
  margin: 0 20rpx;
}

.sort-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  border: 2rpx solid var(--secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.sort-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.15);
  background: var(--bg-primary);
}

.sort-btn:active {
  transform: translateY(-1px) scale(0.95);
}

.sort-icon {
  font-size: 32rpx;
}

.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--bg-secondary);
}

.filter-result-text {
  font-size: 24rpx;
  color: var(--text-tertiary);
}

.clear-filters {
  padding: 8rpx 20rpx;
  background: rgba(196, 30, 58, 0.1);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.25s ease;
}

.clear-filters:hover {
  background: rgba(196, 30, 58, 0.2);
}

.clear-filters text {
  font-size: 22rpx;
  color: var(--primary);
  font-weight: 500;
}
</style>
