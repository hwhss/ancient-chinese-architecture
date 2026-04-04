<template>
  <view>
    <!-- 示例问题区域（仅在聚焦或键盘打开时显示） -->
    <view v-if="isFocused || keyboardHeight > 0" class="example-questions-area" :class="{ 'on-top': keyboardHeight > 0 }">
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

    <!-- 输入区域 - 升级为多行文本域 -->
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
        class="send-btn btn-ink"
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
  padding: 0 30rpx 30rpx;
  background: transparent;
  position: relative;
  z-index: 10;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.example-title {
  font-size: 26rpx;
  color: var(--secondary);
  font-weight: 600;
  letter-spacing: 2rpx;
  position: relative;
  padding-left: 16rpx;
}

.example-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 24rpx;
  background: var(--primary);
  border-radius: 4rpx;
}

.example-close {
  padding: 10rpx;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.example-tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  background: var(--bg-primary);
  border: 1rpx solid var(--border);
  border-radius: 40rpx;
  font-size: 24rpx;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.example-tag:hover {
  background: var(--bg-tertiary);
  color: var(--primary);
  border-color: var(--secondary);
}

.example-tag:active {
  transform: scale(0.95);
  background: var(--bg-tertiary);
}

.example-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 20rpx 30rpx 40rpx;
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  transition: all 0.3s;
  position: relative;
  z-index: 10;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.keyboard-active {
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-card);
  box-shadow: 0 -10rpx 40rpx var(--shadow);
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: var(--bg-primary);
  border-radius: 20rpx;
  border: 1rpx solid var(--border);
  padding: 20rpx 24rpx;
  padding-bottom: 48rpx;
  transition: all 0.3s;
  max-height: 240rpx;
  overflow: hidden;
  box-shadow: inset 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.input-wrapper:focus-within {
  border-color: var(--secondary);
  background: var(--bg-card);
  box-shadow: 0 4rpx 16rpx var(--shadow);
}

.textarea {
  width: 100%;
  min-height: 48rpx;
  max-height: 160rpx;
  font-size: 30rpx;
  line-height: 1.6;
  color: #2d2d2d;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;
}

.textarea::placeholder {
  color: var(--text-muted);
}

.char-count {
  position: absolute;
  right: 16rpx;
  bottom: 8rpx;
  font-size: 20rpx;
  color: #999;
  transition: color 0.2s;
}

.char-count.near-limit {
  color: #c82506;
  font-weight: 600;
}

.send-btn {
  width: 96rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 24rpx;
  border: 1rpx solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;
}

.send-btn.has-content {
  background: var(--primary);
  border-color: var(--primary-dark);
  box-shadow: 0 6rpx 20rpx var(--shadow-primary);
}

.send-icon {
  font-size: 32rpx;
  color: #fff;
  transform: translateX(-2rpx);
}

.send-btn:hover:not([disabled]) {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.45);
}

.send-btn:active:not([disabled]) {
  transform: translateY(-1px) scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.3);
}

.send-btn[disabled] {
  background: linear-gradient(135deg, #c8c8c8 0%, #b0b0b0 100%);
  color: #e8e8e8;
  box-shadow: none;
  cursor: not-allowed;
}

.send-btn.sending {
  opacity: 0.9;
}

@media (min-width: 1024px) {
  .input-area {
    padding: 30rpx 60rpx;
  }
  .example-questions-area {
    padding: 30rpx 60rpx;
  }
}
</style>
