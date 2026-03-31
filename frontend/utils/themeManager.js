/**
 * 主题管理器
 * 支持浅色/深色主题切换，可手动设置或跟随系统
 */

const THEME_KEY = 'APP_THEME_SETTING'
const THEME_MODE_KEY = 'APP_THEME_MODE' // 'light' | 'dark' | 'auto'

// 主题配置
export const themes = {
  light: {
    name: '浅色',
    // 主色调
    primary: '#c41e3a',
    primaryDark: '#8b0000',
    primaryLight: '#d6455a',
    // 辅助色
    secondary: '#8b4513',
    secondaryDark: '#6b3410',
    secondaryLight: '#a67c52',
    // 文字色
    textPrimary: '#3c2a1d',
    textSecondary: '#6b5643',
    textTertiary: '#8b7355',
    textMuted: '#a89078',
    // 背景色
    bgPrimary: '#f8f4e8',
    bgSecondary: '#f0e9d8',
    bgTertiary: '#e8dcc8',
    bgCard: '#ffffff',
    // 边框色
    border: '#e8dcc8',
    borderLight: '#dcc8b0',
    // 功能色
    error: '#b85450',
    success: '#5b8c5a',
    warning: '#e8b860',
    // 阴影
    shadow: 'rgba(139, 69, 19, 0.12)',
    shadowPrimary: 'rgba(196, 30, 58, 0.3)',
    // 渐变
    gradientBg: 'linear-gradient(180deg, #f8f4e8 0%, #f0e9d8 50%, #e8dcc8 100%)',
    gradientHeader: 'linear-gradient(135deg, #8b4513 0%, #6b3410 100%)'
  },
  dark: {
    name: '深色',
    // 主色调
    primary: '#e84a5f',
    primaryDark: '#c41e3a',
    primaryLight: '#f06b7d',
    // 辅助色
    secondary: '#c4956a',
    secondaryDark: '#a67c52',
    secondaryLight: '#d4a87a',
    // 文字色
    textPrimary: '#f5f0e6',
    textSecondary: '#d4c8b8',
    textTertiary: '#b8a898',
    textMuted: '#8b7d6b',
    // 背景色
    bgPrimary: '#1a1612',
    bgSecondary: '#242018',
    bgTertiary: '#2e2820',
    bgCard: '#363028',
    // 边框色
    border: '#4a4035',
    borderLight: '#5a5045',
    // 功能色
    error: '#e57373',
    success: '#81c784',
    warning: '#ffb74d',
    // 阴影
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowPrimary: 'rgba(232, 74, 95, 0.4)',
    // 渐变
    gradientBg: 'linear-gradient(180deg, #1a1612 0%, #242018 50%, #2e2820 100%)',
    gradientHeader: 'linear-gradient(135deg, #5a4030 0%, #4a3020 100%)'
  }
}

class ThemeManager {
  constructor() {
    this.currentTheme = 'light'
    this.themeMode = 'auto' // 'light' | 'dark' | 'auto'
    this.systemDarkMode = false
    this.listeners = []
  }

  // 初始化主题
  init() {
    // 加载保存的主题设置
    this.loadThemeSetting()
    
    // 监听系统主题变化
    this.listenSystemThemeChange()
    
    // 应用当前主题
    this.applyTheme()
    
    return this
  }

  // 加载主题设置
  loadThemeSetting() {
    try {
      const savedMode = uni.getStorageSync(THEME_MODE_KEY)
      if (savedMode) {
        this.themeMode = savedMode
      }
      
      // 如果不是自动模式，加载具体主题
      if (this.themeMode !== 'auto') {
        this.currentTheme = this.themeMode
      } else {
        // 自动模式，检测系统主题
        this.detectSystemTheme()
      }
    } catch (e) {
      console.warn('加载主题设置失败:', e)
    }
  }

  // 保存主题设置
  saveThemeSetting() {
    try {
      uni.setStorageSync(THEME_MODE_KEY, this.themeMode)
      uni.setStorageSync(THEME_KEY, this.currentTheme)
    } catch (e) {
      console.warn('保存主题设置失败:', e)
    }
  }

  // 检测系统主题
  detectSystemTheme() {
    // #ifdef H5
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemDarkMode = mediaQuery.matches
      this.currentTheme = mediaQuery.matches ? 'dark' : 'light'
    }
    // #endif

    // #ifdef APP-PLUS
    try {
      const systemInfo = uni.getSystemInfoSync()
      this.systemDarkMode = systemInfo.theme === 'dark'
      this.currentTheme = this.systemDarkMode ? 'dark' : 'light'
    } catch (e) {
      console.warn('检测系统主题失败:', e)
    }
    // #endif

    // #ifdef MP-WEIXIN
    try {
      const systemInfo = uni.getSystemInfoSync()
      this.systemDarkMode = systemInfo.theme === 'dark'
      this.currentTheme = this.systemDarkMode ? 'dark' : 'light'
    } catch (e) {
      console.warn('检测系统主题失败:', e)
    }
    // #endif
  }

  // 监听系统主题变化
  listenSystemThemeChange() {
    // #ifdef H5
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (this.themeMode === 'auto') {
          this.systemDarkMode = e.matches
          this.currentTheme = e.matches ? 'dark' : 'light'
          this.applyTheme()
          this.notifyListeners()
        }
      })
    }
    // #endif

    // #ifdef APP-PLUS || MP-WEIXIN
    // 小程序和App通过 onThemeChange 监听
    uni.onThemeChange?.((res) => {
      if (this.themeMode === 'auto') {
        this.systemDarkMode = res.theme === 'dark'
        this.currentTheme = res.theme === 'dark' ? 'dark' : 'light'
        this.applyTheme()
        this.notifyListeners()
      }
    })
    // #endif
  }

  // 设置主题模式
  setThemeMode(mode) {
    if (['light', 'dark', 'auto'].includes(mode)) {
      this.themeMode = mode
      
      if (mode === 'auto') {
        this.detectSystemTheme()
      } else {
        this.currentTheme = mode
      }
      
      this.saveThemeSetting()
      this.applyTheme()
      this.notifyListeners()
    }
  }

  // 切换主题
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.setThemeMode(newTheme)
  }

  // 应用主题
  applyTheme() {
    const theme = themes[this.currentTheme]
    if (!theme) return

    // #ifdef H5
    // H5 环境通过 CSS 变量应用
    const root = document.documentElement
    Object.keys(theme).forEach(key => {
      if (typeof theme[key] === 'string' && !key.includes('gradient')) {
        root.style.setProperty(`--${this.camelToKebab(key)}`, theme[key])
      }
    })
    
    // 设置 data-theme 属性用于 CSS 选择器
    document.body.setAttribute('data-theme', this.currentTheme)
    // #endif

    // 更新页面背景色
    this.updatePageBackground()
  }

  // 更新页面背景色
  updatePageBackground() {
    const theme = themes[this.currentTheme]
    // #ifdef H5
    document.body.style.backgroundColor = theme.bgPrimary
    // #endif
  }

  // 获取当前主题
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      mode: this.themeMode,
      colors: themes[this.currentTheme],
      isDark: this.currentTheme === 'dark'
    }
  }

  // 获取主题颜色值
  getColor(key) {
    const theme = themes[this.currentTheme]
    return theme?.[key] || themes.light[key]
  }

  // 添加主题变化监听
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback)
    }
  }

  // 移除主题变化监听
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  notifyListeners() {
    const themeInfo = this.getCurrentTheme()
    this.listeners.forEach(callback => {
      try {
        callback(themeInfo)
      } catch (e) {
        console.error('主题监听回调执行失败:', e)
      }
    })
  }

  // 驼峰转短横线
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}

// 创建单例
const themeManager = new ThemeManager()

export default themeManager

// 便捷方法
export const initTheme = () => themeManager.init()
export const setThemeMode = (mode) => themeManager.setThemeMode(mode)
export const toggleTheme = () => themeManager.toggleTheme()
export const getCurrentTheme = () => themeManager.getCurrentTheme()
export const getThemeColor = (key) => themeManager.getColor(key)
export const onThemeChange = (callback) => themeManager.addListener(callback)
export const offThemeChange = (callback) => themeManager.removeListener(callback)
