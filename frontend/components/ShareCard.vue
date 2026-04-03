<template>
  <view class="share-card-overlay" v-if="visible" @click="closeOnOverlay && close()">
    <view class="share-card-container" @click.stop>
      <!-- 卡片主体 -->
      <view class="share-card" id="share-card">
        <!-- 顶部装饰 -->
        <view class="card-header-decoration">
          <view class="corner top-left"></view>
          <view class="corner top-right"></view>
          <view class="header-line"></view>
        </view>

        <!-- 印章 -->
        <view class="seal-mark">古建</view>

        <!-- 图片区域 -->
        <view class="card-image-wrapper">
          <image
            v-if="hasImage"
            class="card-image"
            :src="building.image"
            mode="aspectFill"
            @error="onImageError"
          />
          <view v-else class="card-image card-image-empty">
            <text class="card-image-empty-icon">🏛️</text>
            <text class="card-image-empty-text">后端未下发图片</text>
          </view>
          <view class="image-overlay"></view>
          <view class="building-name-overlay">
            <text class="overlay-name">{{ building.name }}</text>
          </view>
        </view>

        <!-- 内容区域 -->
        <view class="card-content">
          <view class="content-header">
            <text class="building-name">{{ building.name }}</text>
            <view class="dynasty-badge" v-if="building.dynasty">
              <text class="dynasty-text">{{ building.dynasty }}</text>
            </view>
          </view>

          <view class="location-row">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ building.location || '中国' }}</text>
          </view>

          <text class="building-desc" :class="{ 'expanded': descExpanded }">
            {{ displayDescription }}
          </text>

          <view class="tags-row" v-if="building.tags && building.tags.length">
            <text v-for="(tag, index) in displayTags" :key="index" class="tag">{{ tag }}</text>
          </view>
        </view>

        <!-- 底部信息 -->
        <view class="card-footer">
          <view class="footer-line"></view>
          <view class="footer-content">
            <view class="brand-section">
              <text class="brand-icon">🏯</text>
              <view class="brand-text">
                <text class="brand-name">中华古建筑导览</text>
                <text class="brand-slogan">探索千年文明，感受建筑之美</text>
              </view>
            </view>
            <view class="qr-placeholder">
              <view class="qr-code">
                <text class="qr-text">扫码探索</text>
              </view>
            </view>
          </view>
          <view class="footer-decoration">
            <view class="corner bottom-left"></view>
            <view class="corner bottom-right"></view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn save-btn" @click="saveCard">
          <text class="btn-icon">💾</text>
          <text class="btn-text">保存卡片</text>
        </view>
        <view class="action-btn share-btn" @click="shareCard">
          <text class="btn-icon">📤</text>
          <text class="btn-text">分享好友</text>
        </view>
        <view class="action-btn close-btn" @click="close">
          <text class="btn-icon">✕</text>
          <text class="btn-text">关闭</text>
        </view>
      </view>
    </view>

    <!-- 隐藏的 canvas 用于生成分享图片 (小程序/App) -->
    <!-- #ifndef H5 -->
    <canvas
      canvas-id="shareCanvas"
      id="shareCanvas"
      class="share-canvas"
      style="width: 600px; height: 900px;"
    ></canvas>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  name: 'ShareCard',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    building: {
      type: Object,
      default: () => ({
        name: '',
        image: '',
        location: '',
        dynasty: '',
        description: '',
        tags: []
      })
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      descExpanded: false,
      imageFailed: false
    }
  },
  computed: {
    hasImage() {
      return Boolean(String(this.building.image || '').trim()) && !this.imageFailed
    },
    displayDescription() {
      const desc = this.building.description || '暂无介绍'
      if (this.descExpanded || desc.length <= 60) {
        return desc
      }
      return desc.substring(0, 60) + '...'
    },
    displayTags() {
      const tags = this.building.tags || []
      return tags.slice(0, 3)
    }
  },
  watch: {
    'building.image'() {
      this.imageFailed = false;
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    onImageError() {
      this.imageFailed = true
    },
    saveCard() {
      // 保存卡片功能 - 使用画布生成图片
      this.generateCardImage()
    },

    shareCard() {
      // 构建分享内容
      const shareData = {
        title: `${this.building.name} - 中华古建筑导览`,
        desc: this.building.description || '探索千年文明，感受建筑之美',
        path: `/pages/detail/detail?materialId=${this.building.id}&name=${encodeURIComponent(this.building.name)}`,
        imageUrl: this.building.image
      }

      // 触发分享事件给父组件
      this.$emit('share', shareData)

      // 使用 uni.share 进行分享
      // #ifdef APP-PLUS
      uni.share({
        provider: 'weixin',
        scene: 'WXSceneSession',
        type: 0,
        href: `https://your-domain.com/pages/detail/detail?materialId=${this.building.id}`,
        title: shareData.title,
        summary: shareData.desc,
        imageUrl: this.building.image,
        success: () => {
          uni.showToast({ title: '分享成功', icon: 'success' })
        },
        fail: (err) => {
          console.error('分享失败:', err)
          uni.showToast({ title: '分享失败', icon: 'none' })
        }
      })
      // #endif

      // #ifdef MP-WEIXIN
      // 微信小程序使用转发功能
      uni.showToast({
        title: '点击右上角转发',
        icon: 'none',
        duration: 2000
      })
      // #endif

      // #ifdef H5
      // H5 环境尝试使用 Web Share API
      if (navigator.share) {
        navigator.share({
          title: shareData.title,
          text: shareData.desc,
          url: window.location.href
        }).then(() => {
          uni.showToast({ title: '分享成功', icon: 'success' })
        }).catch((err) => {
          console.log('分享取消或失败:', err)
          // 复制链接到剪贴板
          this.copyShareLink(shareData)
        })
      } else {
        // 复制链接到剪贴板
        this.copyShareLink(shareData)
      }
      // #endif
    },

    copyShareLink(shareData) {
      // #ifdef H5
      const shareUrl = `${window.location.origin}${shareData.path}`
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          uni.showToast({
            title: '链接已复制到剪贴板',
            icon: 'success',
            duration: 2000
          })
        }).catch(() => {
          this.fallbackCopy(shareUrl)
        })
      } else {
        this.fallbackCopy(shareUrl)
      }
      // #endif

      // #ifndef H5
      uni.setClipboardData({
        data: shareData.path,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success',
            duration: 2000
          })
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          })
        }
      })
      // #endif
    },

    fallbackCopy(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        uni.showToast({
          title: '链接已复制到剪贴板',
          icon: 'success',
          duration: 2000
        })
      } catch (err) {
        uni.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
      document.body.removeChild(textarea)
    },

    generateCardImage() {
      uni.showLoading({ title: '生成中...' })

      // #ifdef H5
      // H5 环境使用 html2canvas
      if (typeof html2canvas !== 'undefined') {
        const cardElement = document.querySelector('.share-card')
        if (cardElement) {
          html2canvas(cardElement, {
            backgroundColor: 'var(--bg-primary)',
            scale: 2,
            useCORS: true,
            allowTaint: true
          }).then(canvas => {
            const imageData = canvas.toDataURL('image/png')
            this.downloadImage(imageData)
            uni.hideLoading()
          }).catch(err => {
            console.error('生成图片失败:', err)
            uni.hideLoading()
            uni.showToast({ title: '生成失败', icon: 'none' })
          })
        } else {
          uni.hideLoading()
          uni.showToast({ title: '未找到卡片元素', icon: 'none' })
        }
      } else {
        // 如果没有 html2canvas，提示用户
        uni.hideLoading()
        uni.showToast({
          title: '请使用截图保存',
          icon: 'none',
          duration: 2000
        })
      }
      // #endif

      // #ifndef H5
      // 小程序/App 环境使用 canvas 绘制
      this.drawCardWithCanvas()
      // #endif
    },

    drawCardWithCanvas() {
      const ctx = uni.createCanvasContext('shareCanvas', this)

      // 设置背景
      ctx.setFillStyle('var(--bg-primary)')
      ctx.fillRect(0, 0, 600, 900)

      // 绘制边框装饰
      ctx.setStrokeStyle('#c82506')
      ctx.setLineWidth(3)
      ctx.strokeRect(20, 20, 560, 860)

      // 绘制标题背景
      ctx.setFillStyle('rgba(200, 37, 6, 0.1)')
      ctx.fillRect(30, 30, 540, 80)

      // 绘制建筑名称
      ctx.setFillStyle('var(--text-primary)')
      ctx.setFontSize(32)
      ctx.setTextAlign('center')
      ctx.fillText(this.building.name || '古建筑', 300, 85)

      // 绘制图片区域（如果有图片）
      if (this.building.image) {
        uni.getImageInfo({
          src: this.building.image,
          success: (imageInfo) => {
            ctx.drawImage(imageInfo.path, 50, 130, 500, 300)

            // 继续绘制其他内容
            this.drawCardContent(ctx)
          },
          fail: () => {
            // 图片加载失败，继续绘制其他内容
            this.drawCardContent(ctx)
          }
        })
      } else {
        this.drawCardContent(ctx)
      }
    },

    drawCardContent(ctx) {
      // 绘制描述
      ctx.setFillStyle('#5a4a3a')
      ctx.setFontSize(24)
      ctx.setTextAlign('left')

      const desc = this.building.description || '暂无介绍'
      const maxLength = 60
      const displayDesc = desc.length > maxLength ? desc.substring(0, maxLength) + '...' : desc

      // 简单的文本换行处理
      const lines = this.wrapText(ctx, displayDesc, 500, 24)
      let y = 480
      lines.forEach(line => {
        ctx.fillText(line, 50, y)
        y += 36
      })

      // 绘制底部信息
      ctx.setFillStyle('var(--text-tertiary)')
      ctx.setFontSize(20)
      ctx.fillText('中华古建筑导览', 50, 820)
      ctx.setFontSize(16)
      ctx.fillText('探索千年文明，感受建筑之美', 50, 850)

      // 绘制二维码占位区域
      ctx.setStrokeStyle('#e0d0c0')
      ctx.setLineWidth(2)
      ctx.strokeRect(450, 780, 100, 100)
      ctx.setFillStyle('var(--text-tertiary)')
      ctx.setFontSize(14)
      ctx.setTextAlign('center')
      ctx.fillText('扫码探索', 500, 835)

      // 保存并导出
      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            success: (res) => {
              uni.hideLoading()
              this.saveImageToAlbum(res.tempFilePath)
            },
            fail: (err) => {
              console.error('导出图片失败:', err)
              uni.hideLoading()
              uni.showToast({ title: '保存失败', icon: 'none' })
            }
          }, this)
        }, 500)
      })
    },

    wrapText(ctx, text, maxWidth, fontSize) {
      const chars = text.split('')
      const lines = []
      let currentLine = ''

      chars.forEach(char => {
        const testLine = currentLine + char
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine !== '') {
          lines.push(currentLine)
          currentLine = char
        } else {
          currentLine = testLine
        }
      })
      lines.push(currentLine)
      return lines
    },

    saveImageToAlbum(filePath) {
      // #ifdef APP-PLUS
      uni.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: (err) => {
          console.error('保存到相册失败:', err)
          uni.showToast({ title: '保存失败', icon: 'none' })
        }
      })
      // #endif

      // #ifdef MP-WEIXIN
      uni.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        },
        fail: () => {
          // 需要授权
          uni.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.writePhotosAlbum']) {
                uni.authorize({
                  scope: 'scope.writePhotosAlbum',
                  success: () => {
                    this.saveImageToAlbum(filePath)
                  },
                  fail: () => {
                    uni.showModal({
                      title: '提示',
                      content: '需要授权保存到相册',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
                          uni.openSetting()
                        }
                      }
                    })
                  }
                })
              }
            }
          })
        }
      })
      // #endif
    },

    downloadImage(dataUrl) {
      // H5环境下载图片
      // #ifdef H5
      const link = document.createElement('a')
      link.download = `${this.building.name || '古建筑'}_分享卡片.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      uni.showToast({
        title: '图片已下载',
        icon: 'success',
        duration: 2000
      })
      // #endif
    }
  }
}
</script>

<style scoped>
/* 遮罩层 */
.share-card-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 容器 */
.share-card-container {
  width: 90%;
  max-width: 600rpx;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(60rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 卡片主体 */
.share-card {
  background: linear-gradient(145deg, #fffef9 0%, #faf6ed 50%, #f5ede0 100%);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow:
    0 32rpx 64rpx rgba(0, 0, 0, 0.3),
    0 12rpx 24rpx rgba(0, 0, 0, 0.2);
  position: relative;
  border: 3rpx solid #e8d8c8;
}

/* 顶部装饰 */
.card-header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  z-index: 10;
}

.header-line {
  position: absolute;
  top: 20rpx;
  left: 60rpx;
  right: 60rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #c82506, transparent);
}

.corner {
  position: absolute;
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid #c82506;
}

.corner.top-left {
  top: 12rpx;
  left: 12rpx;
  border-right: none;
  border-bottom: none;
}

.corner.top-right {
  top: 12rpx;
  right: 12rpx;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 12rpx;
  left: 12rpx;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 12rpx;
  right: 12rpx;
  border-left: none;
  border-top: none;
}

/* 印章 */
.seal-mark {
  position: absolute;
  top: 40rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%);
  color: #fff8e6;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  transform: rotate(-15deg);
  z-index: 20;
  box-shadow: 0 4rpx 12rpx rgba(139, 0, 0, 0.3);
  border: 2rpx solid rgba(255, 248, 230, 0.3);
  font-family: 'ZCOOL XiaoWei', serif;
}

/* 图片区域 */
.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fbf4e8 0%, #ead9c2 100%);
}

.card-image-empty-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.card-image-empty-text {
  font-size: 26rpx;
  color: rgba(75, 52, 27, 0.7);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: linear-gradient(transparent, rgba(60, 42, 29, 0.7));
}

.building-name-overlay {
  position: absolute;
  bottom: 20rpx;
  left: 24rpx;
  right: 24rpx;
}

.overlay-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 8rpx;
}

/* 内容区域 */
.card-content {
  padding: 28rpx 24rpx;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.building-name {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 4rpx;
}

.dynasty-badge {
  background: linear-gradient(135deg, #c82506 0%, #a81c07 100%);
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.25);
}

.dynasty-text {
  font-size: 24rpx;
  color: #fff8e6;
  font-weight: bold;
  letter-spacing: 4rpx;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.location-icon {
  font-size: 24rpx;
}

.location-text {
  font-size: 26rpx;
  color: var(--text-tertiary);
}

.building-desc {
  font-size: 28rpx;
  color: #5a4a3a;
  line-height: 1.7;
  margin-bottom: 20rpx;
  text-align: justify;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  font-size: 22rpx;
  color: var(--text-tertiary);
  background: linear-gradient(135deg, #f7f1e6 0%, #ebe4d6 100%);
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e0d4c0;
}

/* 底部区域 */
.card-footer {
  background: linear-gradient(180deg, transparent 0%, rgba(232, 184, 96, 0.1) 100%);
  padding: 20rpx 24rpx 24rpx;
  position: relative;
}

.footer-line {
  height: 2rpx;
  background: linear-gradient(90deg, transparent, var(--warning), transparent);
  margin-bottom: 20rpx;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-icon {
  font-size: 48rpx;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
  font-family: 'ZCOOL XiaoWei', serif;
  letter-spacing: 2rpx;
}

.brand-slogan {
  font-size: 22rpx;
  color: var(--text-tertiary);
  margin-top: 4rpx;
}

.qr-placeholder {
  width: 100rpx;
  height: 100rpx;
}

.qr-code {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
  border: 2rpx solid #e0d0c0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-text {
  font-size: 18rpx;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.3;
}

.footer-decoration {
  position: absolute;
  bottom: 12rpx;
  left: 12rpx;
  right: 12rpx;
  height: 30rpx;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
  padding: 0 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 0;
  border-radius: 16rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:active {
  transform: scale(0.96);
}

.save-btn {
  background: linear-gradient(145deg, var(--success) 0%, #4a7a49 100%);
  box-shadow: 0 6rpx 18rpx rgba(91, 140, 90, 0.35);
}

.save-btn:active {
  box-shadow: 0 3rpx 10rpx rgba(91, 140, 90, 0.25);
}

.share-btn {
  background: linear-gradient(145deg, #c82506 0%, #a81c07 100%);
  box-shadow: 0 6rpx 18rpx rgba(200, 37, 6, 0.35);
}

.share-btn:active {
  box-shadow: 0 3rpx 10rpx rgba(200, 37, 6, 0.25);
}

.close-btn {
  background: linear-gradient(145deg, var(--text-tertiary) 0%, var(--text-secondary) 100%);
  box-shadow: 0 6rpx 18rpx rgba(139, 115, 85, 0.35);
}

.close-btn:active {
  box-shadow: 0 3rpx 10rpx rgba(139, 115, 85, 0.25);
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* 隐藏的 canvas */
.share-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
}
</style>
