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
        class="send-btn"
        :disabled="!canSend || isSending"
        :class="{ 'sending': isSending, 'has-content': canSend }"
        @click="$emit('send')"
      >
        <text class="send-icon">➤</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatInputArea',
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
  padding: 16rpx 20rpx;
  background: linear-gradient(180deg, #faf6ed 0%, #f7f1e6 100%);
  border-top: 1rpx solid #e8d8c8;
  border-bottom: 1rpx solid #e8d8c8;
  position: relative;
  z-index: 1;
}

.example-title {
  display: block;
  font-size: 24rpx;
  color: #c82506;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.example-tag {
  display: inline-block;
  padding: 10rpx 20rpx;
  background: #fff8d8;
  border: 1rpx solid var(--warning);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #c82506;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  transform: translateZ(0) translateY(0);
}

.example-tag:hover {
  background: #f5d56a;
  color: #a81c07;
  transform: translateY(-2px);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.12);
}

.example-tag:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 1rpx 4rpx rgba(200, 37, 6, 0.08);
}

.example-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 20rpx;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  border-top: 1rpx solid #e8d8c8;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  gap: 16rpx;
}

.keyboard-active {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fffef9;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: #fffef9;
  border-radius: 24rpx;
  border: 1rpx solid #d8c8b8;
  padding: 16rpx 24rpx;
  padding-bottom: 40rpx;
  transition: border-color 0.2s, box-shadow 0.2s;
  max-height: 240rpx;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: #c82506;
  box-shadow: 0 0 0 2rpx rgba(200, 37, 6, 0.1);
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
  color: #999;
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
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
  border-radius: 50%;
  border: none;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
  flex-shrink: 0;
}

.send-btn.has-content {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.35);
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
