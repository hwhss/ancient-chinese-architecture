<template>
  <scroll-view
    class="message-scroll-view"
    scroll-y
    :scroll-top="scrollTop"
    :scroll-with-animation="true"
    @scroll="onScroll"
  >
    <view class="message-list">
      <!-- 消息列表 -->
      <view
        v-for="(msg, index) in messages"
        :key="msg.id || index"
        class="message-wrapper"
        :class="msg.role"
        :id="'msg-' + index"
      >
        <!-- AI 头像 -->
        <view v-if="msg.role === 'ai'" class="avatar ai-avatar">
          <text class="avatar-icon">🏯</text>
        </view>

        <view class="message-content">
          <!-- 消息头部：名称和时间 -->
          <view class="message-header">
            <text class="message-sender">{{ msg.role === 'ai' ? '古建筑助手' : '我' }}</text>
            <text class="message-time">{{ formatTime(msg.id) }}</text>
          </view>

          <!-- 消息主体 -->
          <view class="message" :class="msg.role">
            <!-- AI消息使用Markdown渲染 -->
            <view v-if="msg.role === 'ai' && !msg.isTyping" class="message-rich-text">
              <rich-text :nodes="renderMarkdown(msg.displayContent || msg.content)"></rich-text>
            </view>
            <!-- 打字中或用户消息使用普通文本 -->
            <text v-else class="message-text">
              {{ msg.displayContent || msg.content }}
              <text v-if="msg.isTyping" class="cursor">|</text>
            </text>

            <!-- 查看详情按钮 -->
            <button
              v-if="msg.materialId && !msg.isTyping"
              class="view-btn"
              @click="goToDetail(msg.materialId)"
            >
              查看实景资料 →
            </button>

            <!-- 相关推荐 -->
            <view
              v-else-if="!msg.isTyping && msg.entities && msg.entities.length"
              class="candidate-list"
            >
              <text class="candidate-title">可能相关的古建：</text>
              <view class="candidate-tags">
                <text
                  v-for="entity in msg.entities"
                  :key="entity.id"
                  class="candidate-tag"
                  @click="goToDetail(entity.id)"
                >
                  {{ entity.name }}
                </text>
              </view>
            </view>
          </view>

          <!-- 消息操作栏 -->
          <view v-if="!msg.isTyping" class="message-actions">
            <view class="action-btn" @click="copyMessage(msg.content)" title="复制">
              <text class="action-icon">📋</text>
              <text class="action-text">复制</text>
            </view>
            <view v-if="msg.role === 'ai'" class="action-btn" @click="regenerateResponse(index)" title="重新生成">
              <text class="action-icon">🔄</text>
              <text class="action-text">重新生成</text>
            </view>
          </view>
        </view>

        <!-- 用户头像 -->
        <view v-if="msg.role === 'user'" class="avatar user-avatar">
          <text class="avatar-icon">👤</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer"></view>
    </view>
  </scroll-view>
</template>

<script>
import { parseMarkdown, renderToHtml, containsMarkdown } from "../utils/markdown.js";

export default {
  name: 'VirtualMessageList',

  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      scrollTop: 0
    };
  },

  watch: {
    messages: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },

  mounted() {
    this.scrollToBottom();
  },

  methods: {
    // 处理滚动
    onScroll(e) {
      this.$emit('scroll', e);
    },

    // 滚动到底部
    scrollToBottom() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.message-list').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          this.scrollTop = res[0].height + 1000;
        }
      });
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    // 渲染Markdown
    renderMarkdown(content) {
      if (!content) return '';
      try {
        if (containsMarkdown(content)) {
          return renderToHtml(parseMarkdown(content));
        }
        return content;
      } catch (e) {
        return content;
      }
    },

    // 复制消息
    copyMessage(content) {
      uni.setClipboardData({
        data: content,
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success',
            duration: 1500
          });
        }
      });
    },

    // 跳转到详情
    goToDetail(materialId) {
      this.$emit('go-to-detail', materialId);
    },

    // 重新生成回复
    regenerateResponse(index) {
      this.$emit('regenerate', index);
    }
  }
};
</script>

<style scoped>
/* 滚动视图 */
.message-scroll-view {
  flex: 1;
  height: 100%;
}

/* 消息列表 */
.message-list {
  padding: 20rpx;
}

/* 消息包装器 */
.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.ai {
  flex-direction: row;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

/* 头像 */
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.user-avatar {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
}

.avatar-icon {
  font-size: 40rpx;
}

/* 消息内容 */
.message-content {
  flex: 1;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.message-wrapper.user .message-content {
  align-items: flex-end;
}

/* 消息头部 */
.message-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.message-wrapper.user .message-header {
  flex-direction: row-reverse;
}

.message-sender {
  font-size: 24rpx;
  color: var(--text-tertiary);
  font-weight: 500;
}

.message-time {
  font-size: 20rpx;
  color: var(--text-muted);
}

/* 消息气泡 */
.message {
  padding: 24rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  line-height: 1.6;
  word-break: break-word;
}

.message.ai {
  background: #fff;
  border: 2rpx solid var(--bg-tertiary);
  color: var(--text-primary);
  border-top-left-radius: 4rpx;
}

.message.user {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border-top-right-radius: 4rpx;
}

.message-rich-text {
  line-height: 1.8;
}

.message-text {
  display: block;
}

/* 打字光标 */
.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 查看按钮 */
.view-btn {
  margin-top: 16rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: none;
  display: inline-block;
}

/* 候选列表 */
.candidate-list {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid rgba(139, 69, 19, 0.1);
}

.candidate-title {
  font-size: 24rpx;
  color: var(--text-tertiary);
  display: block;
  margin-bottom: 12rpx;
}

.candidate-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.candidate-tag {
  padding: 8rpx 20rpx;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 24rpx;
  font-size: 24rpx;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.candidate-tag:hover {
  background: rgba(196, 30, 58, 0.15);
  color: var(--primary);
}

/* 消息操作 */
.message-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(139, 69, 19, 0.12);
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 22rpx;
  color: var(--text-tertiary);
}

/* 底部占位 */
.bottom-spacer {
  height: 40rpx;
}
</style>
