<template>
  <view class="filter-area">
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input 
        class="search-input" 
        :value="searchKeyword"
        @input="onSearchInput"
        placeholder="搜索古建名称或标签..." 
        placeholder-class="search-placeholder"
      />
      <view class="search-clear" v-if="searchKeyword" @click="$emit('update:searchKeyword', '')">
        <text>×</text>
      </view>
    </view>
    
    <view class="filter-tabs-container">
      <scroll-view class="filter-tabs" scroll-x>
        <view class="filter-group">
          <text class="filter-label">分类</text>
          <view
            v-for="cat in categories"
            :key="cat.key"
            class="filter-tab tap-feedback"
            :class="{ active: currentCategory === cat.key }"
            @click="$emit('select-category', cat.key)"
          >
            {{ cat.name }}
          </view>
        </view>
      </scroll-view>
      
      <view class="sort-btn tap-feedback" @click="$emit('toggle-sort')">
        <text class="sort-icon">🔤</text>
      </view>
    </view>
    
    <view class="active-filters" v-if="currentCategory !== 'all' || searchKeyword">
      <text class="filter-result-text">筛选结果：{{ filteredCount }} 处古建</text>
      <view class="clear-filters" @click="$emit('clear-filters')" v-if="currentCategory !== 'all'">
        <text>清除筛选</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
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
  background: #fff;
  padding: 24rpx 30rpx;
  border-bottom: 2rpx solid var(--bg-tertiary);
  position: relative;
  z-index: 2;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 44rpx;
  padding: 20rpx 28rpx;
  border: 2rpx solid var(--bg-tertiary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20rpx;
}

.search-box:focus-within {
  border-color: var(--secondary);
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.15);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
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
  display: inline-block;
  padding: 14rpx 28rpx;
  background: var(--bg-primary);
  border-radius: 28rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1rpx solid transparent;
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border-color: var(--secondary);
  box-shadow: 0 4rpx 12rpx rgba(196, 30, 58, 0.3);
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
