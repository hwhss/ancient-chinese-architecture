<template>
  <view>
    <!-- 侧边栏遮罩 -->
    <view 
      class="sidebar-mask" 
      :class="{ 'show': showSidebar }"
      @click="$emit('toggle-sidebar')"
    ></view>
    
    <!-- 侧边栏历史会话 -->
    <view class="sidebar rice-paper" :class="{ 'show': showSidebar }">
      <view class="sidebar-header">
        <view class="sidebar-header-left">
          <TraditionalIcon name="chat" size="40" color="var(--secondary)" />
          <text class="sidebar-title ink-pressed">历史会话</text>
        </view>
        <view class="sidebar-close btn-ink" @click="$emit('toggle-sidebar')">
          <TraditionalIcon name="close" size="32" color="var(--text-muted)" />
        </view>
      </view>
      
      <scroll-view class="sidebar-content" scroll-y>
        <!-- 新建会话按钮 -->
        <view class="new-chat-btn btn-ink" @click="$emit('create-new')">
          <TraditionalIcon name="chat" size="32" color="var(--primary)" />
          <text class="new-chat-text">新建会话</text>
        </view>
        
        <!-- 会话列表 -->
        <view class="session-list">
          <view 
            v-for="(session, index) in sessionList" 
            :key="session.id"
            class="session-item"
            :class="{ 'active': currentSessionId === session.id }"
            @click="$emit('switch-session', session.id)"
          >
            <view class="session-icon">
              <TraditionalIcon :name="currentSessionId === session.id ? 'palace' : 'chat'" size="32" />
            </view>
            <view class="session-info">
              <text class="session-title">{{ session.title }}</text>
              <text class="session-time">{{ formatSessionTime(session.time) }}</text>
            </view>
            <view class="session-actions">
              <view class="session-delete" @click.stop="$emit('delete-session', session.id)">
                <TraditionalIcon name="close" size="24" color="var(--primary-light)" />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="sessionList.length === 0" class="sidebar-empty">
          <TraditionalIcon name="map" size="80" color="var(--text-muted)" style="opacity: 0.3; margin-bottom: 20rpx;" />
          <text class="empty-text">暂无历史会话</text>
          <text class="empty-hint">开启一段千年古建之旅</text>
        </view>
      </scroll-view>
      
      <!-- 侧边栏底部 -->
      <view class="sidebar-footer">
        <text class="footer-text">共 {{ sessionList.length }} 个会话</text>
      </view>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'ChatSidebar',
  components: {
    TraditionalIcon
  },
  props: {
    showSidebar: {
      type: Boolean,
      default: false
    },
    sessionList: {
      type: Array,
      default: () => []
    },
    currentSessionId: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatSessionTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
    }
  }
}
</script>

<style scoped>
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 100;
}

.sidebar-mask.show {
  opacity: 1;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 600rpx;
  height: 100vh;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: 4rpx 0 20rpx rgba(0, 0, 0, 0.15);
}

.sidebar.show {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50rpx 30rpx 40rpx;
  background: var(--bg-card);
  border-bottom: 2rpx solid var(--border);
}

.sidebar-header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sidebar-title {
  font-size: 38rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 4rpx;
}

.ink-pressed {
  text-shadow: 0.5rpx 0.5rpx 0px rgba(255,255,255,0.8), 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.sidebar-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 12rpx;
  border: 1rpx solid var(--border);
  cursor: pointer;
}

.sidebar-close:hover {
  background: rgba(255, 248, 230, 0.35);
  transform: scale(1.05);
}

.close-icon {
  font-size: 28rpx;
  color: #fff8e6;
}

.sidebar-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  background: var(--bg-card);
  border: 2rpx dashed var(--secondary);
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s;
}

.new-chat-btn:hover {
  background: var(--bg-primary);
  border-style: solid;
  transform: translateY(-2rpx);
}

.new-chat-text {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--secondary);
  font-family: 'TsangerJinKai', serif;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: var(--bg-card);
  border-radius: 12rpx;
  border: 1rpx solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.session-item:hover {
  background: var(--bg-primary);
  transform: translateX(4rpx);
}

.session-item.active {
  background: var(--bg-secondary);
  border-color: var(--secondary);
  box-shadow: inset 4rpx 0 0 var(--primary);
}

.session-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.session-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

.session-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-delete {
  font-size: 28rpx;
  padding: 8rpx;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.session-delete:hover {
  opacity: 1;
  transform: scale(1.1);
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-tertiary);
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #a09080;
}

.sidebar-footer {
  padding: 30rpx 20rpx;
  background: var(--bg-card);
  border-top: 2rpx solid var(--border);
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: var(--text-muted);
  letter-spacing: 2rpx;
}

@media (min-width: 768px) {
  .sidebar { width: 400rpx; }
}
</style>
