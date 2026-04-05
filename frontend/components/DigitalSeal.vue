<template>
  <view class="seal-container" @click="handleStamp">
    <!-- 印章主体 -->
    <view 
      class="seal" 
      :class="{ 'stamped': isStamped, 'stamping': isStamping }"
    >
      <view class="seal-inner">
        <text class="seal-text">{{ sealText }}</text>
      </view>
    </view>
    
    <!-- 印章印记（盖印后显示） -->
    <view v-if="isStamped" class="seal-mark">
      <view class="mark-outer"></view>
      <view class="mark-inner">
        <text class="mark-text">{{ sealText }}</text>
      </view>
    </view>
    
    <!-- 涟漪效果 -->
    <view v-if="isStamping" class="ripple-container">
      <view 
        v-for="i in 3" 
        :key="i"
        class="ripple"
        :style="{ animationDelay: (i - 1) * 0.2 + 's' }"
      ></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DigitalSeal',
  props: {
    // 印章文字
    sealText: {
      type: String,
      default: '已览'
    },
    // 关联的建筑ID
    buildingId: {
      type: String,
      required: true
    },
    // 印章尺寸
    size: {
      type: Number,
      default: 120
    }
  },
  data() {
    return {
      isStamped: false,
      isStamping: false,
      stampAnimationTimer: null
    };
  },
  computed: {
    storageKey() {
      return 'SEAL_' + this.buildingId;
    }
  },
  mounted() {
    this.checkSealStatus();
  },
  beforeDestroy() {
    if (this.stampAnimationTimer) {
      clearTimeout(this.stampAnimationTimer);
    }
  },
  methods: {
    // 检查印章状态
    checkSealStatus() {
      try {
        const stampInfo = uni.getStorageSync(this.storageKey);
        if (stampInfo) {
          this.isStamped = true;
        }
      } catch (e) {
        console.warn('检查印章状态失败:', e);
      }
    },
    
    // 处理盖印
    handleStamp() {
      if (this.isStamped) {
        // 已盖印，提示
        uni.showToast({
          title: '已盖过印章啦',
          icon: 'none',
          duration: 1500
        });
        return;
      }
      
      // 执行盖印动画
      this.performStampAnimation();
    },
    
    // 执行盖印动画
    performStampAnimation() {
      this.isStamping = true;
      
      // 播放音效（如果支持）
      this.playStampSound();
      
      // 动画完成后设置状态
      this.stampAnimationTimer = setTimeout(() => {
        this.isStamped = true;
        this.isStamping = false;
        this.saveSeal();
        this.$emit('stamped', {
          buildingId: this.buildingId,
          timestamp: Date.now(),
          sealText: this.sealText
        });
        
        uni.showToast({
          title: '盖印成功！',
          icon: 'success',
          duration: 1500
        });
      }, 800);
    },
    
    // 播放盖印音效
    playStampSound() {
      // 可以添加音效播放逻辑
      // 暂时使用震动反馈
      if (typeof uni.vibrateShort === 'function') {
        uni.vibrateShort({
          type: 'heavy'
        });
      }
    },
    
    // 保存印章信息
    saveSeal() {
      try {
        const stampInfo = {
          buildingId: this.buildingId,
          sealText: this.sealText,
          timestamp: Date.now()
        };
        uni.setStorageSync(this.storageKey, stampInfo);
        
        // 更新全局印章统计
        this.updateGlobalSeals();
      } catch (e) {
        console.warn('保存印章失败:', e);
      }
    },
    
    // 更新全局印章统计
    updateGlobalSeals() {
      try {
        let seals = uni.getStorageSync('GLOBAL_SEALS') || [];
        if (!Array.isArray(seals)) {
          seals = [];
        }
        
        // 检查是否已存在
        const existingIndex = seals.findIndex(s => s.buildingId === this.buildingId);
        if (existingIndex === -1) {
          seals.push({
            buildingId: this.buildingId,
            sealText: this.sealText,
            timestamp: Date.now()
          });
          uni.setStorageSync('GLOBAL_SEALS', seals);
        }
      } catch (e) {
        console.warn('更新全局印章统计失败:', e);
      }
    }
  }
};
</script>

<style scoped>
.seal-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 印章主体 */
.seal {
  width: var(--seal-size, 120rpx);
  height: var(--seal-size, 120rpx);
  background: linear-gradient(135deg, #c82506 0%, #a61f06 50%, #8b1b05 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-12deg);
  box-shadow: 
    0 4rpx 12rpx rgba(166, 49, 49, 0.4),
    inset 0 2rpx 8rpx rgba(255, 255, 255, 0.2),
    inset 0 -2rpx 8rpx rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
  border: 3rpx solid #8b1b05;
}

.seal-inner {
  width: 90%;
  height: 90%;
  border: 2rpx solid rgba(255, 248, 230, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-text {
  color: #fff8e6;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  font-family: 'TsangerJinKai', 'Source Han Serif CN', serif;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 悬停效果 */
.seal:not(.stamped):hover {
  transform: rotate(-12deg) translateY(-4rpx) scale(1.05);
  box-shadow: 
    0 8rpx 20rpx rgba(166, 49, 49, 0.5),
    inset 0 2rpx 8rpx rgba(255, 255, 255, 0.3),
    inset 0 -2rpx 8rpx rgba(0, 0, 0, 0.3);
}

/* 点击效果 */
.seal:not(.stamped):active {
  transform: rotate(-12deg) translateY(2rpx) scale(0.95);
}

/* 已盖印状态 */
.seal.stamped {
  opacity: 0.7;
  transform: rotate(-12deg) scale(0.9);
  box-shadow: 
    0 2rpx 8rpx rgba(166, 49, 49, 0.2),
    inset 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  cursor: default;
}

/* 盖印动画 */
.seal.stamping {
  animation: stampPress 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes stampPress {
  0% {
    transform: rotate(-12deg) translateY(0) scale(1);
  }
  30% {
    transform: rotate(-12deg) translateY(20rpx) scale(1.1);
  }
  60% {
    transform: rotate(-12deg) translateY(10rpx) scale(0.95);
  }
  100% {
    transform: rotate(-12deg) translateY(0) scale(1);
  }
}

/* 印章印记 */
.seal-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(6deg);
  pointer-events: none;
  z-index: 5;
  animation: markAppear 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes markAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(6deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(6deg) scale(1);
  }
}

.mark-outer {
  position: absolute;
  width: calc(var(--seal-size, 120rpx) * 1.5);
  height: calc(var(--seal-size, 120rpx) * 1.5);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 4rpx solid rgba(200, 37, 6, 0.15);
  border-radius: 16rpx;
}

.mark-inner {
  width: calc(var(--seal-size, 120rpx) * 1.3);
  height: calc(var(--seal-size, 120rpx) * 1.3);
  background: rgba(200, 37, 6, 0.08);
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(200, 37, 6, 0.2);
  backdrop-filter: blur(2rpx);
}

.mark-text {
  color: rgba(200, 37, 6, 0.4);
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
  font-family: 'TsangerJinKai', 'Source Han Serif CN', serif;
}

/* 涟漪效果 */
.ripple-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(var(--seal-size, 120rpx) * 0.5);
  height: calc(var(--seal-size, 120rpx) * 0.5);
  border: 3rpx solid rgba(200, 37, 6, 0.3);
  border-radius: 50%;
  animation: rippleExpand 1s ease-out forwards;
}

@keyframes rippleExpand {
  0% {
    width: calc(var(--seal-size, 120rpx) * 0.5);
    height: calc(var(--seal-size, 120rpx) * 0.5);
    opacity: 1;
  }
  100% {
    width: calc(var(--seal-size, 120rpx) * 3);
    height: calc(var(--seal-size, 120rpx) * 3);
    opacity: 0;
  }
}
</style>
