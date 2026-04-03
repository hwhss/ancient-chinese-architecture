<template>
  <view class="lottie-container">
    <view v-if="loading" class="loading-state">
      <text class="loading-text">正在加载动画...</text>
    </view>
    <view v-else-if="error" class="error-state">
      <text class="error-text">{{ error }}</text>
    </view>
    <view 
      v-show="!loading && !error" 
      :id="containerId" 
      class="lottie-wrapper"
      :style="wrapperStyle"
    ></view>
    
    <!-- 播放控制 -->
    <view v-if="showControls && !loading && !error" class="controls">
      <view class="control-btn" @click="togglePlay">
        <text class="control-icon">{{ isPlaying ? '⏸️' : '▶️' }}</text>
      </view>
      <view class="control-btn" @click="toggleLoop">
        <text class="control-icon" :class="{ 'active': loop }">🔁</text>
      </view>
      <view class="control-btn" @click="stop">
        <text class="control-icon">⏹️</text>
      </view>
    </view>
  </view>
</template>

<script>
// Lottie CDN 地址
const LOTTIE_CDN = 'https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js';

// 加载脚本（复用viewer页面的逻辑）
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is not available'));
      return;
    }

    const found = document.querySelector(`script[data-lottie-src="${src}"]`);
    if (found) {
      if (found.getAttribute('data-loaded') === '1') {
        resolve();
      } else {
        found.addEventListener('load', () => resolve(), { once: true });
        found.addEventListener('error', () => reject(new Error(`load failed: ${src}`)), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-lottie-src', src);
    script.onload = () => {
      script.setAttribute('data-loaded', '1');
      resolve();
    };
    script.onerror = () => reject(new Error(`load failed: ${src}`));
    document.head.appendChild(script);
  });
}

let lottieReadyPromise = null;

function ensureLottieLib() {
  if (lottieReadyPromise) {
    return lottieReadyPromise;
  }
  lottieReadyPromise = loadScriptOnce(LOTTIE_CDN);
  return lottieReadyPromise;
}

export default {
  name: 'LottieAnimation',
  props: {
    // 动画ID，会自动加载 /static/lottie/[id].json
    animationId: {
      type: String,
      required: true
    },
    // 宽度
    width: {
      type: Number,
      default: 300
    },
    // 高度
    height: {
      type: Number,
      default: 300
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: true
    },
    // 是否循环播放
    loop: {
      type: Boolean,
      default: true
    },
    // 播放速度
    speed: {
      type: Number,
      default: 1
    },
    // 是否显示控制按钮
    showControls: {
      type: Boolean,
      default: false
    },
    // 背景色
    backgroundColor: {
      type: String,
      default: 'transparent'
    }
  },
  data() {
    return {
      containerId: `lottie-container-${Date.now()}`,
      loading: false,
      error: '',
      anim: null,
      isPlaying: false,
      isH5: false
    };
  },
  computed: {
    wrapperStyle() {
      return {
        width: `${this.width}rpx`,
        height: `${this.height}rpx`,
        backgroundColor: this.backgroundColor
      };
    }
  },
  mounted() {
    this.isH5 = typeof window !== 'undefined';
    if (this.isH5 && this.animationId) {
      this.initAnimation();
    }
  },
  beforeDestroy() {
    this.destroyAnimation();
  },
  watch: {
    animationId: {
      handler(newVal) {
        if (this.isH5 && newVal) {
          this.$nextTick(() => {
            this.initAnimation();
          });
        }
      }
    }
  },
  methods: {
    async initAnimation() {
      if (!this.isH5) {
        this.error = '当前环境不支持 Lottie 渲染，请切换到 H5 预览';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        await ensureLottieLib();
        await this.loadAnimation();
      } catch (err) {
        console.error('Lottie 初始化失败:', err);
        this.error = '动画加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    async loadAnimation() {
      const lottie = window.lottie;
      if (!lottie) {
        this.error = 'Lottie 库未加载成功';
        return;
      }

      // 销毁旧动画
      this.destroyAnimation();

      const container = document.getElementById(this.containerId);
      if (!container) {
        this.error = '容器未找到';
        return;
      }

      // 构建动画路径
      const animationPath = `/static/lottie/${this.animationId}.json`;

      try {
        // 先检查文件是否存在
        const response = await fetch(animationPath);
        if (!response.ok) {
          throw new Error(`动画文件不存在: ${animationPath}`);
        }

        // 加载动画
        this.anim = lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: this.loop,
          autoplay: this.autoplay,
          path: animationPath
        });

        // 设置播放速度
        this.anim.setSpeed(this.speed);

        // 监听播放状态
        this.anim.addEventListener('play', () => {
          this.isPlaying = true;
          this.$emit('play');
        });

        this.anim.addEventListener('pause', () => {
          this.isPlaying = false;
          this.$emit('pause');
        });

        this.anim.addEventListener('stop', () => {
          this.isPlaying = false;
          this.$emit('stop');
        });

        this.anim.addEventListener('complete', () => {
          this.$emit('complete');
        });

        this.anim.addEventListener('loopComplete', () => {
          this.$emit('loopComplete');
        });

        this.anim.addEventListener('data_ready', () => {
          this.$emit('dataReady');
        });

        this.anim.addEventListener('DOMLoaded', () => {
          this.$emit('domLoaded');
        });

        this.anim.addEventListener('error', (err) => {
          console.error('Lottie 播放错误:', err);
          this.error = '动画播放出错';
          this.$emit('error', err);
        });

        // 初始播放状态
        this.isPlaying = this.autoplay;

      } catch (err) {
        console.error('加载动画失败:', err);
        this.error = err.message || '动画加载失败';
      }
    },

    // 播放
    play() {
      if (this.anim) {
        this.anim.play();
      }
    },

    // 暂停
    pause() {
      if (this.anim) {
        this.anim.pause();
      }
    },

    // 停止
    stop() {
      if (this.anim) {
        this.anim.stop();
      }
    },

    // 切换播放/暂停
    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    // 切换循环
    toggleLoop() {
      if (this.anim) {
        const newLoop = !this.anim.loop;
        this.anim.loop = newLoop;
        // 触发更新
        this.$emit('update:loop', newLoop);
      }
    },

    // 跳转到指定帧
    goToAndStop(frame) {
      if (this.anim) {
        this.anim.goToAndStop(frame, true);
      }
    },

    // 跳转到指定帧并播放
    goToAndPlay(frame) {
      if (this.anim) {
        this.anim.goToAndPlay(frame, true);
      }
    },

    // 设置播放速度
    setSpeed(speed) {
      if (this.anim) {
        this.anim.setSpeed(speed);
      }
    },

    // 设置方向（1正向，-1反向）
    setDirection(direction) {
      if (this.anim) {
        this.anim.setDirection(direction);
      }
    },

    // 获取总帧数
    getTotalFrames() {
      return this.anim ? this.anim.totalFrames : 0;
    },

    // 获取当前帧
    getCurrentFrame() {
      return this.anim ? this.anim.currentFrame : 0;
    },

    destroyAnimation() {
      if (this.anim) {
        this.anim.destroy();
        this.anim = null;
        this.isPlaying = false;
      }
    }
  }
};
</script>

<style scoped>
.lottie-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx solid var(--bg-tertiary);
  padding: 20rpx;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;
  min-width: 300rpx;
  padding: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-tertiary);
}

.error-text {
  font-size: 28rpx;
  color: var(--error);
  text-align: center;
}

.lottie-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 播放控制 */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--bg-tertiary);
  width: 100%;
}

.control-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #f5e6c8 0%, #e8d4b0 100%);
  border-radius: 50%;
  border: 2rpx solid #d4b896;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.15);
  transition: all 0.2s ease;
}

.control-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(139, 69, 19, 0.1);
}

.control-icon {
  font-size: 32rpx;
}

.control-icon.active {
  color: #c82506;
}
</style>
