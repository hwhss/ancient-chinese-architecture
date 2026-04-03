<template>
  <view v-if="showSearch && searchResults.length > 0" class="search-results-panel">
    <view class="search-results-header">
      <text class="search-results-title">搜索结果 ({{ searchResults.length }})</text>
      <text class="search-results-close" @click="$emit('close-search')">✕</text>
    </view>
    <scroll-view class="search-results-list" scroll-y>
      <view
        v-for="(result, index) in searchResults"
        :key="result.id"
        class="search-result-item"
        :class="{ 'ai': result.role === 'ai', 'user': result.role === 'user' }"
        @click="$emit('jump-to-message', result.id)"
      >
        <view class="result-role">
          <text class="role-icon">{{ result.role === 'ai' ? '🏯' : '👤' }}</text>
          <text class="role-text">{{ result.role === 'ai' ? 'AI' : '我' }}</text>
        </view>
        <view class="result-content">
          <rich-text :nodes="highlightText(result.content, searchQuery)"></rich-text>
        </view>
        <view class="result-time">{{ formatTime(result.id) }}</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'SearchResults',
  props: {
    showSearch: {
      type: Boolean,
      default: false
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    highlightText(text, query) {
      if (!text || !query) return text;

      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);

      if (index === -1) return text;

      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + query.length + 30);
      let snippet = text.substring(start, end);

      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';

      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlighted = snippet.replace(regex, '<span style="background: #c82506; color: #fff; padding: 2px 4px; border-radius: 4px;">$1</span>');

      return `<span style="font-size: 28rpx; line-height: 1.6; color: #2d2d2d;">${highlighted}</span>`;
    }
  }
}
</script>

<style scoped>
.search-results-panel {
  position: absolute;
  top: 140rpx;
  left: 20rpx;
  right: 20rpx;
  max-height: 500rpx;
  background: #fffef9;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  z-index: 50;
  display: flex;
  flex-direction: column;
  border: 1rpx solid #e8d8c8;
}

.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 16rpx 16rpx 0 0;
}

.search-results-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff8e6;
}

.search-results-close {
  font-size: 32rpx;
  color: #fff8e6;
  padding: 8rpx;
  cursor: pointer;
}

.search-results-list {
  max-height: 400rpx;
  padding: 16rpx;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  background: #faf6ed;
  border-radius: 12rpx;
  border-left: 4rpx solid #c82506;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:active {
  background: #f5e6c8;
  transform: scale(0.98);
}

.search-result-item.user {
  border-left-color: var(--secondary);
}

.result-role {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.role-icon {
  font-size: 32rpx;
}

.role-text {
  font-size: 20rpx;
  color: var(--text-tertiary);
}

.result-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.result-time {
  font-size: 20rpx;
  color: #a09080;
  flex-shrink: 0;
}
</style>
