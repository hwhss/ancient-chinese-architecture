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
  gap: var(--space-3);
  padding: var(--space-7, 28rpx) var(--space-12, 48rpx);
  border-radius: var(--radius-xl);
  border: none;
  font-size: var(--text-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 120rpx;
  z-index: 1;
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 4rpx rgba(166, 49, 49, 0.15);
}

.action-button:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-offset);
  box-shadow: none;
}

/* Primary Button */
.action-button.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff8e6;
  box-shadow: 
    var(--shadow-primary),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.action-button.primary:hover:not(.disabled):not(.loading) {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
  transform: var(--hover-lift) var(--hover-scale);
  box-shadow: 
    0 12rpx 32rpx rgba(166, 49, 49, 0.45),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.25);
  z-index: 100;
}

.action-button.primary:active:not(.disabled):not(.loading) {
  transform: translateY(0) var(--active-scale);
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.3),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
}

/* Secondary Button */
.action-button.secondary {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
  color: var(--text-primary);
  border: 2rpx solid var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.action-button.secondary:hover:not(.disabled):not(.loading) {
  background: linear-gradient(135deg, #f5efe0 0%, #ebe4d0 100%);
  border-color: var(--secondary);
  transform: var(--hover-lift) var(--hover-scale);
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.action-button.secondary:active:not(.disabled):not(.loading) {
  transform: translateY(0) var(--active-scale);
  box-shadow: var(--shadow-sm);
}

/* Outline Button */
.action-button.outline {
  background: transparent;
  color: var(--primary);
  border: 2rpx solid var(--primary);
  box-shadow: none;
}

.action-button.outline:hover:not(.disabled):not(.loading) {
  background: rgba(166, 49, 49, 0.08);
  transform: translateY(-1rpx) scale(1.01);
  box-shadow: var(--shadow-md);
  z-index: 100;
}

.action-button.outline:active:not(.disabled):not(.loading) {
  background: rgba(166, 49, 49, 0.12);
  transform: translateY(0) scale(0.99);
  box-shadow: var(--shadow-sm);
}

/* Text Button */
.action-button.text {
  background: transparent;
  color: var(--text-primary);
  padding: var(--space-4) var(--space-6);
  box-shadow: none;
}

.action-button.text:hover:not(.disabled):not(.loading) {
  background: rgba(114, 90, 61, 0.08);
  color: var(--primary);
  z-index: 100;
}

.action-button.text:active:not(.disabled):not(.loading) {
  background: rgba(114, 90, 61, 0.12);
  transform: var(--active-scale);
}

/* Disabled State */
.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-button.primary.disabled {
  background: linear-gradient(135deg, #c29898 0%, #a37878 100%);
  box-shadow: var(--shadow-md);
}

.action-button.secondary.disabled,
.action-button.outline.disabled {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: var(--text-muted);
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
  margin-right: var(--space-3);
}

.spinner-ring {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin var(--duration-slow) linear infinite;
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
  font-size: var(--text-lg);
  line-height: 1;
}

.btn-text {
  letter-spacing: var(--tracking-wide);
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
  transition: width var(--duration-slow) var(--ease-out), height var(--duration-slow) var(--ease-out), opacity var(--duration-slow) var(--ease-out);
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
