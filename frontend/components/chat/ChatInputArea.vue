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
  padding: 20rpx 30rpx;
  background: var(--bg-primary, #f2ead3);
  border-top: 1rpx solid rgba(114, 90, 61, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
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
  padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
  background: var(--bg-primary, #f2ead3);
  border-top: 1rpx solid rgba(114, 90, 61, 0.1);
  position: relative;
  z-index: 10;
  gap: 20rpx;
}

.input-area.keyboard-active {
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #fff;
  border-radius: 12rpx;
  border: 1rpx solid rgba(114, 90, 61, 0.2);
  padding: 20rpx 24rpx;
  padding-bottom: 48rpx;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--primary, #a63131);
  box-shadow: 0 0 0 2rpx rgba(166, 49, 49, 0.1);
}

.textarea {
  width: 100%;
  min-height: 48rpx;
  max-height: 200rpx;
  font-size: 30rpx;
  line-height: 1.5;
  color: var(--text-primary, #2c1e13);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
}

.textarea::placeholder {
  color: var(--text-tertiary, #8b7355);
  opacity: 0.6;
}

.char-count {
  position: absolute;
  right: 20rpx;
  bottom: 12rpx;
  font-size: 22rpx;
  color: var(--text-tertiary, #8b7355);
  background: #fff;
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
  flex-shrink: 0;
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
</style>
