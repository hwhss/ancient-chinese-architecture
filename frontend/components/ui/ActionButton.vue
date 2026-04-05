<template>
  <button 
    class="action-button" 
    :class="[
      type, 
      { 
        'ink-ripple': ripple,
        'loading': loading,
        'disabled': disabled
      }
    ]"
    :style="customStyle"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <view v-if="loading" class="loading-spinner">
      <view class="spinner-ring"></view>
    </view>
    <text v-else-if="icon" class="btn-icon">{{ icon }}</text>
    <text class="btn-text">{{ text }}</text>
  </button>
</template>

<script>
export default {
  name: 'ActionButton',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'text', 'outline'].includes(value)
    },
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    ripple: {
      type: Boolean,
      default: true
    },
    customStyle: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (e) => {
      if (!props.disabled && !props.loading) {
        emit('click', e)
      }
    }
    return { handleClick }
  }
}
</script>

<style scoped>
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 28rpx 48rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 30rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 120rpx;
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 4rpx rgba(166, 49, 49, 0.15);
}

.action-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4rpx rgba(166, 49, 49, 0.25);
}

/* Primary Button */
.action-button.primary {
  background: linear-gradient(135deg, #a63131 0%, #7a1d1d 100%);
  color: #fff8e6;
  box-shadow: 
    0 8rpx 24rpx rgba(166, 49, 49, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.action-button.primary:hover:not(.disabled):not(.loading) {
  background: linear-gradient(135deg, #b73c3c 0%, #8a2626 100%);
  transform: translateY(-2rpx) scale(1.02);
  box-shadow: 
    0 12rpx 32rpx rgba(166, 49, 49, 0.45),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
}

.action-button.primary:active:not(.disabled):not(.loading) {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
}

/* Secondary Button */
.action-button.secondary {
  background: linear-gradient(135deg, #f9f5e8 0%, #f2ead3 100%);
  color: #2c1e13;
  border: 2rpx solid #e8dec3;
  box-shadow: 0 4rpx 12rpx rgba(114, 90, 61, 0.12);
}

.action-button.secondary:hover:not(.disabled):not(.loading) {
  background: linear-gradient(135deg, #f5efe0 0%, #ebe4d0 100%);
  border-color: #725a3d;
  transform: translateY(-2rpx) scale(1.02);
  box-shadow: 0 8rpx 20rpx rgba(114, 90, 61, 0.2);
}

.action-button.secondary:active:not(.disabled):not(.loading) {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(114, 90, 61, 0.15);
}

/* Outline Button */
.action-button.outline {
  background: transparent;
  color: #a63131;
  border: 2rpx solid #a63131;
  box-shadow: none;
}

.action-button.outline:hover:not(.disabled):not(.loading) {
  background: rgba(166, 49, 49, 0.08);
  transform: translateY(-1rpx) scale(1.01);
  box-shadow: 0 4rpx 12rpx rgba(166, 49, 49, 0.15);
}

.action-button.outline:active:not(.disabled):not(.loading) {
  background: rgba(166, 49, 49, 0.12);
  transform: translateY(0) scale(0.99);
  box-shadow: 0 2rpx 6rpx rgba(166, 49, 49, 0.1);
}

/* Text Button */
.action-button.text {
  background: transparent;
  color: #2c1e13;
  padding: 16rpx 24rpx;
  box-shadow: none;
}

.action-button.text:hover:not(.disabled):not(.loading) {
  background: rgba(114, 90, 61, 0.08);
  color: #a63131;
}

.action-button.text:active:not(.disabled):not(.loading) {
  background: rgba(114, 90, 61, 0.12);
  transform: scale(0.98);
}

/* Disabled State */
.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-button.primary.disabled {
  background: linear-gradient(135deg, #c29898 0%, #a37878 100%);
  box-shadow: 0 4rpx 12rpx rgba(166, 49, 49, 0.15);
}

.action-button.secondary.disabled,
.action-button.outline.disabled {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #999;
}

/* Loading State */
.action-button.loading {
  cursor: wait;
  pointer-events: none;
}

.action-button.loading .btn-text {
  opacity: 0.8;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.spinner-ring {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.btn-icon {
  font-size: 32rpx;
  line-height: 1;
}

.btn-text {
  letter-spacing: 2rpx;
  line-height: 1.2;
}

/* 水墨涟漪效果 */
.ink-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out;
  opacity: 0;
  pointer-events: none;
}

.ink-ripple:active::after {
  width: 400rpx;
  height: 400rpx;
  opacity: 1;
}

/* Accessibility: Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .action-button {
    transition: none;
  }
  
  .spinner-ring {
    animation-duration: 1.5s;
  }
  
  .ink-ripple::after {
    transition: none;
  }
}

/* H5 specific enhancements */
@media (hover: hover) {
  .action-button:hover {
    /* Already defined above */
  }
}
</style>
