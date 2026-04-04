<template>
  <view>
    <!-- 示例问题区域（永久显示） -->
    <view class="example-questions-area">
      <text class="example-title">常见问题：</text>
      <view class="example-list">
        <text 
          v-for="(q, idx) in exampleQuestions" 
          :key="idx" 
          class="example-tag"
          :class="{ 'disabled': isSending || loading || hasPendingAiMessage }"
          @click="!isSending && !loading && !hasPendingAiMessage && $emit('quick-question', q)"
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
          @focus="$emit('focus', $event)"
          @blur="$emit('blur', $event)"
          @linechange="$emit('linechange', $event)"
          @confirm="$emit('send')"
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
  }
}
</script>

<style scoped>
.example-questions-area {
  padding: 24rpx 30rpx;
  background: var(--bg-card);
  border-top: 2rpx solid var(--border);
  border-bottom: 2rpx solid var(--border);
  position: relative;
  z-index: 10;
}

.example-title {
  display: block;
  font-size: 24rpx;
  color: var(--secondary);
  margin-bottom: 16rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
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
  padding: 30rpx;
  background: var(--bg-card);
  border-top: 2rpx solid var(--border);
  transition: all 0.3s;
  position: relative;
  z-index: 10;
  gap: 20rpx;
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
