<template>
  <scroll-view
    class="message-scroll-view"
    scroll-y
    :scroll-into-view="scrollIntoViewId"
    :scroll-with-animation="true"
    @scroll="onScroll"
  >
    <view class="message-list">
      <!-- 所有消息区域 -->
      <view
        v-for="(msg, idx) in messages"
        :key="msg.id || idx"
        :id="getMessageId(msg, idx)"
        class="message-wrapper"
        :class="msg.role"
        @click="msg.isTyping ? handleSkipTyping() : null"
        :style="{ cursor: msg.isTyping ? 'pointer' : 'default' }"
      >
        <!-- AI 头像 -->
        <view v-if="msg.role === 'ai'" class="avatar ai-avatar rice-paper brush-border-ink">
          <TraditionalIcon name="palace" size="44" color="var(--primary)" />
        </view>

        <view class="message-content">
          <!-- 消息头部：名称和时间 -->
          <view class="message-header">
            <text class="message-sender">{{ msg.role === 'ai' ? '古建筑助手' : '我' }}</text>
            <text class="message-time">{{ formatTime(msg.id) }}</text>
            <!-- 打字中提示 -->
            <text v-if="msg.isTyping" class="typing-hint">点击跳过</text>
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
              <TraditionalIcon name="chat" size="24" color="var(--text-muted)" />
              <text class="action-text">复制</text>
            </view>
            <view v-if="msg.role === 'ai'" class="action-btn" @click="regenerateResponse(idx)" title="重新生成">
              <TraditionalIcon name="arrow-right" size="24" color="var(--text-muted)" />
              <text class="action-text">重思</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-spacer"></view>
    </view>
  </scroll-view>
</template>

<script>
import { parseMarkdown, renderToHtml, containsMarkdown } from "../utils/markdown.js";
import TraditionalIcon from "./shared/TraditionalIcon.vue";

export default {
  name: 'VirtualMessageList',
  components: {
    TraditionalIcon
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      scrollTop: 0,
      scrollIntoViewId: ''
    };
  },

  watch: {
    messages: {
      deep: true,
      handler(newVal) {
        this.$nextTick(() => {
          if (newVal.length > 0) {
            const lastMsg = newVal[newVal.length - 1];
            const lastIdx = newVal.length - 1;
            this.scrollIntoViewId = this.getMessageId(lastMsg, lastIdx);
          }
        });
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.messages.length > 0) {
        const lastMsg = this.messages[this.messages.length - 1];
        const lastIdx = this.messages.length - 1;
        this.scrollIntoViewId = this.getMessageId(lastMsg, lastIdx);
      }
    });
  },

  methods: {
    // 获取消息唯一ID（确保不以数字开头）
    getMessageId(msg, idx) {
      if (msg.id) {
        // 如果 msg.id 是纯数字，加前缀
        const idStr = String(msg.id);
        if (/^\d+$/.test(idStr)) {
          return 'msg-' + idStr;
        }
        return idStr;
      }
      return 'msg-' + idx;
    },
    
    // 处理滚动
    onScroll(e) {
      this.scrollTop = e.detail.scrollTop;
      this.$emit('scroll', e);
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
            title: '已复制到剪贴板',
            icon: 'success',
            duration: 1500
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none',
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
      uni.showModal({
        title: '重新生成',
        content: '确定要重新生成这个回答吗？',
        confirmText: '重新生成',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '重新思考中...',
              mask: true
            });
            setTimeout(() => {
              uni.hideLoading();
              this.$emit('regenerate', index);
            }, 500);
          }
        }
      });
    },

    // 跳过打字效果
    handleSkipTyping() {
      this.$emit('skip-typing');
    }
  }
};
</script>

<style scoped>
/* 滚动视图 */
.message-scroll-view {
  flex: 1;
  height: 100%;
  width: 100%;
}

/* 消息列表 */
.message-list {
  padding: 20rpx;
  min-height: 100%;
  box-sizing: border-box;
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
  background: var(--bg-card);
  border: 1rpx solid var(--border);
  box-shadow: 2rpx 2rpx 10rpx var(--shadow);
}

.user-avatar {
  background: var(--bg-secondary);
  border: 1rpx solid var(--border);
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

/* 平板响应式 */
@media (min-width: 768px) and (max-width: 1023px) {
  .message-content {
    max-width: 75%;
  }
}

/* 桌面响应式 */
@media (min-width: 1024px) {
  .message-content {
    max-width: 65%;
  }
}

/* 大屏幕响应式 */
@media (min-width: 1440px) {
  .message-content {
    max-width: 55%;
  }
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

.typing-hint {
  font-size: 20rpx;
  color: var(--primary);
  padding: 4rpx 12rpx;
  background: rgba(200, 37, 6, 0.08);
  border-radius: 8rpx;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 消息气泡 */
.message {
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  line-height: 1.7;
  word-break: break-word;
  position: relative;
  transition: all 0.2s ease;
}

.message.ai {
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255, 248, 230, 0.95) 100%);
  border: 2rpx solid rgba(139, 115, 85, 0.2);
  color: var(--text-primary);
  border-top-left-radius: 6rpx;
  box-shadow: 
    0 4rpx 16rpx rgba(139, 115, 85, 0.12),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.8);
}

.message.ai::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  border-radius: 22rpx 22rpx 0 0;
  pointer-events: none;
}

.message.user {
  background: linear-gradient(135deg, var(--primary) 0%, #a62815 100%);
  color: #fff8e6;
  border-top-right-radius: 6rpx;
  box-shadow: 
    0 6rpx 20rpx rgba(200, 37, 6, 0.25),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.message.user::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
  border-radius: 22rpx 22rpx 0 0;
  pointer-events: none;
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
  margin-top: 20rpx;
  padding: 14rpx 36rpx;
  background: linear-gradient(135deg, #fff8e8 0%, #ffe8d0 100%);
  color: var(--primary);
  font-size: 26rpx;
  border-radius: 40rpx;
  border: 2rpx solid var(--primary);
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0) translateY(0);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.1);
}

.view-btn:hover {
  background: linear-gradient(135deg, var(--primary) 0%, #a62815 100%);
  color: #fff8e6;
  transform: translateY(-3rpx);
  box-shadow: 0 6rpx 16rpx rgba(200, 37, 6, 0.3);
}

.view-btn:active {
  transform: translateY(-1rpx) scale(0.97);
  box-shadow: 0 3rpx 10rpx rgba(200, 37, 6, 0.2);
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
  padding: 10rpx 24rpx;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 28rpx;
  font-size: 24rpx;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0) translateY(0);
  border: 2rpx solid transparent;
  font-weight: 500;
}

.candidate-tag:hover {
  background: rgba(200, 37, 6, 0.12);
  color: var(--primary);
  border-color: rgba(200, 37, 6, 0.2);
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.15);
}

.candidate-tag:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2rpx 6rpx rgba(200, 37, 6, 0.1);
}

/* 消息操作 */
.message-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 24rpx;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0) translateY(0);
  border: 2rpx solid transparent;
}

.action-btn:hover {
  background: rgba(200, 37, 6, 0.1);
  border-color: rgba(200, 37, 6, 0.2);
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.15);
}

.action-btn:hover .action-text {
  color: var(--primary);
}

.action-btn:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 2rpx 6rpx rgba(200, 37, 6, 0.1);
}

.action-icon {
  font-size: 24rpx;
  transition: transform 0.2s ease;
}

.action-btn:hover .action-icon {
  transform: scale(1.1);
}

.action-text {
  font-size: 22rpx;
  color: var(--text-tertiary);
  font-weight: 500;
  transition: color 0.2s ease;
}

/* 底部占位 */
.bottom-spacer {
  height: 40rpx;
}
</style>
