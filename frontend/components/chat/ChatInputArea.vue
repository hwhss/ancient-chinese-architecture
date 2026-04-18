<template>
  <view>
    <!-- 示例问题区域（仅在聚焦或键盘打开时显示） -->
    <view v-if="isFocused || keyboardHeight > 0" class="example-questions-area">
      <view class="example-header">
        <text class="example-title">常见问题</text>
        <view class="example-close" @click="isFocused = false">
          <TraditionalIcon name="close" size="24" color="var(--text-muted)" />
        </view>
      </view>
      <view class="example-list">
        <text 
          v-for="(q, idx) in exampleQuestions" 
          :key="idx" 
          class="example-tag"
          :class="{ 'disabled': isSending || loading || hasPendingAiMessage }"
          @click="handleQuickQuestion(q)"
        >{{ q }}</text>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-area" :class="{ 'keyboard-active': keyboardHeight > 0 }">
      <view class="input-wrapper">
        <textarea
          :value="inputText"
          class="textarea"
          placeholder="请输入问题，点击发送按钮发送..."
          :disabled="isSending"
          :maxlength="500"
          auto-height
          confirm-type="send"
          @input="$emit('update:inputText', $event.detail.value)"
          @focus="handleFocus"
          @blur="handleBlur"
          @linechange="$emit('linechange', $event)"
          @confirm="handleSend"
        />
        <text class="char-count" :class="{ 'near-limit': (inputText || '').length > 450 }">{{ (inputText || '').length }}/500</text>
      </view>
      <button
        class="send-btn"
        :disabled="!canSend || isSending"
        :class="{ 'sending': isSending, 'has-content': canSend }"
        @click="$emit('send')"
      >
        <TraditionalIcon name="arrow-right" size="32" :color="canSend ? '#fff' : 'rgba(255,255,255,0.5)'" />
      </button>
    </view>
  </view>
</template>

<script>
import TraditionalIcon from '../shared/TraditionalIcon.vue';

export default {
  name: 'ChatInputArea',
  components: {
    TraditionalIcon
  },
  props: {
    inputText: {
      type: String,
      default: ''
    },
    isSending: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    hasPendingAiMessage: {
      type: Boolean,
      default: false
    },
    keyboardHeight: {
      type: Number,
      default: 0
    },
    canSend: {
      type: Boolean,
      default: false
    },
    exampleQuestions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isFocused: false
    };
  },
  methods: {
    handleFocus(e) {
      this.isFocused = true;
      this.$emit('focus', e);
    },
    handleBlur(e) {
      setTimeout(() => {
        this.isFocused = false;
        this.$emit('blur', e);
      }, 100);
    },
    handleQuickQuestion(q) {
      if (!this.isSending && !this.loading && !this.hasPendingAiMessage) {
        this.$emit('quick-question', q);
        this.isFocused = false;
      }
    },
    handleSend() {
      this.$emit('send');
      this.isFocused = false;
    }
  }
}
</script>

<style scoped>
.example-questions-area {
  padding: 16rpx 24rpx;
  background: var(--bg-primary, #f2ead3);
  border-top: 1rpx solid rgba(114, 90, 61, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  max-height: 200rpx; /* 限制最大高度 */
  overflow-y: auto; /* 允许滚动 */
  z-index: 14; /* 层级低于input-area */
}

/* 移动端示例问题区域优化 */
@media (max-width: 767px) {
  .example-questions-area {
    padding: 12rpx 16rpx;
    max-height: 150rpx; /* 移动端减小高度 */
  }
  
  .example-tag {
    padding: 10rpx 20rpx;
    font-size: 24rpx;
  }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.example-title {
  font-size: 26rpx;
  color: var(--secondary, #725a3d);
  font-weight: 600;
  display: flex;
  align-items: center;
}

.example-title::before {
  content: '';
  display: inline-block;
  width: 6rpx;
  height: 24rpx;
  background: var(--primary, #a63131);
  margin-right: 12rpx;
  border-radius: 4rpx;
}

.example-close {
  padding: 10rpx;
  cursor: pointer;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.example-tag {
  display: inline-block;
  padding: 14rpx 28rpx;
  background: var(--bg-card, #f9f5e8);
  border: 1rpx solid rgba(114, 90, 61, 0.15);
  border-radius: 8rpx;
  font-size: 26rpx;
  color: var(--secondary, #725a3d);
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-tag:active {
  background: var(--primary, #a63131);
  color: #fff;
  border-color: var(--primary, #a63131);
}

.example-tag.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom, 34px));
  background: var(--bg-primary, #f2ead3);
  border-top: 1rpx solid rgba(114, 90, 61, 0.1);
  position: relative;
  z-index: 15;
  gap: 20rpx; /* 增加间距，避免按钮与输入框重叠 */
}

.input-area.keyboard-active {
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom, 34px));
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #fff;
  border-radius: 12rpx;
  border: 1rpx solid rgba(114, 90, 61, 0.2);
  padding: 16rpx 20rpx;
  padding-bottom: 48rpx; /* 增加底部padding，为char-count留足空间 */
  transition: all 0.3s ease;
  min-height: 88rpx; /* 确保最小高度 */
  display: flex;
  flex-direction: column;
}

.input-wrapper:focus-within {
  border-color: var(--primary, #a63131);
  box-shadow: 0 0 0 2rpx rgba(166, 49, 49, 0.1);
}

.textarea {
  width: 100%;
  min-height: 56rpx;
  max-height: 200rpx;
  font-size: 30rpx;
  line-height: 1.5;
  color: var(--text-primary, #2c1e13);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow-y: auto !important; /* 覆盖UniApp的内联样式 */
  position: relative; /* 确保定位上下文 */
  z-index: 1; /* 基础层级 */
}

/* 深度选择器覆盖UniApp的textarea内联样式 */
.textarea textarea,
.input-wrapper textarea,
.uni-textarea-textarea {
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

.textarea::placeholder {
  color: var(--text-tertiary, #8b7355);
  opacity: 0.6;
}

.char-count {
  position: absolute;
  right: 20rpx;
  bottom: 14rpx; /* 微调位置 */
  font-size: 22rpx;
  color: var(--text-tertiary, #8b7355);
  background: #fff;
  z-index: 10; /* 确保在textarea之上 */
  padding: 2rpx 6rpx; /* 增加可点击区域 */
  pointer-events: none; /* 不影响交互 */
}

.char-count.near-limit {
  color: var(--primary, #a63131);
  font-weight: 600;
}

.send-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card, #f9f5e8);
  border-radius: 12rpx;
  border: 1rpx solid rgba(114, 90, 61, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0; /* 防止被压缩 */
  position: relative; /* 确保定位上下文 */
  z-index: 5; /* 层级高于input-wrapper */
}

.send-btn.has-content {
  background: var(--primary, #a63131);
  border-color: var(--primary, #a63131);
  box-shadow: 0 6rpx 16rpx rgba(166, 49, 49, 0.2);
}

.send-btn.has-content:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(166, 49, 49, 0.2);
}

.send-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============================================
   UniApp内部元素遮挡修复
   解决textarea、uni-textarea-wrapper等内部元素的显示问题
   ============================================ */

/* 修复UniApp的uni-textarea-wrapper高度问题 */
.input-wrapper .uni-textarea-wrapper {
  width: 100% !important;
  min-height: 56rpx !important;
  position: relative;
  z-index: 1;
}

/* 确保实际的textarea元素可滚动 */
.input-wrapper .uni-textarea-textarea {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
  resize: none;
}

/* 修复placeholder显示 */
.input-wrapper .input-placeholder {
  color: var(--text-tertiary, #8b7355) !important;
  opacity: 0.6;
  position: absolute;
  top: 16rpx;
  left: 20rpx;
  z-index: 0; /* 在textarea之下 */
}

/* 确保计算层不影响布局 */
.input-wrapper .uni-textarea-compute {
  visibility: hidden;
  height: 0 !important;
  overflow: hidden;
}

/* 修复resize-sensor导致的布局问题 */
.input-wrapper uni-resize-sensor {
  display: none !important;
}

/* 移动端额外优化 */
@media (max-width: 767px) {
  .input-area {
    padding: 16rpx 16rpx calc(16rpx + env(safe-area-inset-bottom, 34px));
    gap: 16rpx;
  }
  
  .input-wrapper {
    padding: 12rpx 16rpx;
    padding-bottom: 44rpx;
    min-height: 80rpx;
  }
  
  .send-btn {
    width: 80rpx;
    height: 80rpx;
  }
  
  .char-count {
    font-size: 20rpx;
    bottom: 10rpx;
    right: 14rpx;
  }
}
</style>
