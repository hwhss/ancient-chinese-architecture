<template>
  <button 
    class="action-button" 
    :class="[type, { 'ink-ripple': ripple }]"
    :style="customStyle"
    @click="handleClick"
  >
    <text v-if="icon" class="btn-icon">{{ icon }}</text>
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
      validator: (value) => ['primary', 'secondary', 'text'].includes(value)
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
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (e) => {
      emit('click', e)
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
  border-radius: 16rpx;
  border: none;
  font-size: 30rpx;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-button.primary {
  background: linear-gradient(135deg, #c82506 0%, #8b0000 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(200, 37, 6, 0.3);
}

.action-button.secondary {
  background: linear-gradient(135deg, #fff 0%, #faf6ed 100%);
  color: #3c2a1d;
  border: 2rpx solid #e8dcc8;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.1);
}

.action-button.text {
  background: transparent;
  color: #3c2a1d;
  padding: 16rpx 24rpx;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  letter-spacing: 2rpx;
}

/* 水墨涟漪效果 */
.ink-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ink-ripple:active::after {
  width: 300rpx;
  height: 300rpx;
}
</style>
