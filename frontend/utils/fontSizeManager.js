/**
 * 字体大小管理器
 * 支持全局字体大小调整
 */

const FONT_SIZE_KEY = 'APP_FONT_SIZE'

// 字体大小配置
const fontSizeScales = {
  small: 0.875,    // 87.5%
  medium: 1,       // 100% (默认)
  large: 1.125,    // 112.5%
  xlarge: 1.25     // 125%
}

// 基础字体大小（rpx）
const baseFontSizes = {
  xs: 20,    // 10px
  sm: 24,    // 12px
  base: 28,  // 14px
  lg: 32,    // 16px
  xl: 36,    // 18px
  '2xl': 40, // 20px
  '3xl': 48, // 24px
  '4xl': 56  // 28px
}

class FontSizeManager {
  constructor() {
    this.currentSize = 'medium'
    this.scale = 1
    this.listeners = []
  }

  // 初始化
  init() {
    this.loadFontSize()
    this.applyFontSize()
    return this
  }

  // 加载字体大小设置
  loadFontSize() {
    try {
      const savedSize = uni.getStorageSync(FONT_SIZE_KEY)
      if (savedSize && fontSizeScales[savedSize]) {
        this.currentSize = savedSize
        this.scale = fontSizeScales[savedSize]
      }
    } catch (e) {
      console.warn('加载字体大小设置失败:', e)
    }
  }

  // 保存字体大小设置
  saveFontSize() {
    try {
      uni.setStorageSync(FONT_SIZE_KEY, this.currentSize)
    } catch (e) {
      console.warn('保存字体大小设置失败:', e)
    }
  }

  // 设置字体大小
  setFontSize(size) {
    if (fontSizeScales[size]) {
      this.currentSize = size
      this.scale = fontSizeScales[size]
      this.saveFontSize()
      this.applyFontSize()
      this.notifyListeners()
      return true
    }
    return false
  }

  // 应用字体大小到页面
  applyFontSize() {
    // #ifdef H5
    const root = document.documentElement
    root.style.setProperty('--font-scale', this.scale)
    root.setAttribute('data-font-size', this.currentSize)
    // #endif

    // #ifndef H5
    // 小程序/App 环境通过全局变量或事件通知页面更新
    getApp().globalData = getApp().globalData || {}
    getApp().globalData.fontScale = this.scale
    getApp().globalData.fontSize = this.currentSize
    // #endif
  }

  // 获取字体大小值（用于动态计算）
  getFontSize(baseSize) {
    return Math.round(baseSize * this.scale)
  }

  // 获取当前字体大小配置
  getCurrentFontSize() {
    return {
      size: this.currentSize,
      scale: this.scale,
      label: this.getSizeLabel(this.currentSize)
    }
  }

  // 获取字体大小标签
  getSizeLabel(size) {
    const labels = {
      small: '小',
      medium: '标准',
      large: '大',
      xlarge: '超大'
    }
    return labels[size] || '标准'
  }

  // 添加监听
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback)
    }
  }

  // 移除监听
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  notifyListeners() {
    const fontInfo = this.getCurrentFontSize()
    this.listeners.forEach(callback => {
      try {
        callback(fontInfo)
      } catch (e) {
        console.error('字体大小监听回调执行失败:', e)
      }
    })
  }

  // 获取带缩放的样式对象（用于内联样式）
  getScaledStyle(baseSize, unit = 'rpx') {
    return {
      fontSize: `${this.getFontSize(baseSize)}${unit}`
    }
  }
}

// 创建单例
const fontSizeManager = new FontSizeManager()

export default fontSizeManager

// 便捷方法
export const initFontSize = () => fontSizeManager.init()
export const setFontSize = (size) => fontSizeManager.setFontSize(size)
export const getCurrentFontSize = () => fontSizeManager.getCurrentFontSize()
export const getFontSize = (baseSize) => fontSizeManager.getFontSize(baseSize)
export const onFontSizeChange = (callback) => fontSizeManager.addListener(callback)
export const offFontSizeChange = (callback) => fontSizeManager.removeListener(callback)
export const getScaledStyle = (baseSize, unit) => fontSizeManager.getScaledStyle(baseSize, unit)
