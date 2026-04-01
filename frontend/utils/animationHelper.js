/**
 * 动画辅助工具函数 - 中式交互动效
 * 墨水滴波纹、毛笔书写动画等
 */

/**
 * 触发元素的动画类
 * 为元素添加 'animate' 类来触发动画
 * @param {String|Element} element - 元素选择器或元素对象
 * @param {Number} delay - 延迟时间（毫秒）
 */
export function triggerAnimation(element, delay = 0) {
  setTimeout(() => {
    if (typeof element === 'string') {
      const el = document.querySelector(element)
      if (el) el.classList.add('animate')
    } else if (element && element.classList) {
      element.classList.add('animate')
    }
  }, delay)
}

/**
 * 批量触发动画
 * 为一组元素依次添加动画
 * @param {String} selector - 元素选择器
 * @param {Number} baseDelay - 基础延迟（毫秒）
 * @param {Number} itemDelay - 每项延迟（毫秒）
 */
export function triggerBatchAnimation(selector, baseDelay = 100, itemDelay = 80) {
  const items = document.querySelectorAll(selector)
  items.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('animate')
    }, baseDelay + (index * itemDelay))
  })
}

/**
 * 观察元素进入视口并触发动画
 * 使用 Intersection Observer API
 * @param {String} selector - 要观察的元素选择器
 * @param {Object} options - 配置选项
 */
export function observeAndAnimate(selector, options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -30px 0px',
    once = true
  } = options
  
  // 降级处理
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    const items = document.querySelectorAll(selector)
    items.forEach(el => el.classList.add('animate'))
    return
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate')
        if (once) observer.unobserve(entry.target)
      }
    })
  }, { threshold, rootMargin })
  
  document.querySelectorAll(selector).forEach(el => observer.observe(el))
  return observer
}

/**
 * 初始化页面滚动动画
 * 自动为带有特定类的元素添加滚动触发动画
 */
export function initScrollAnimations() {
  if (typeof document === 'undefined') return
  
  setTimeout(() => {
    // 段落毛笔书写效果
    observeAndAnimate('.brush-paragraph', { threshold: 0.15 })
    // 列表项滑入
    observeAndAnimate('.list-item-ink', { threshold: 0.1, itemDelay: 60 })
    // 毛笔书写文字
    observeAndAnimate('.brush-write-text', { threshold: 0.2 })
  }, 100)
}

/**
 * 初始化所有中式动画
 */
export function initChineseAnimations() {
  // #ifdef H5
  initScrollAnimations()
  // #endif
}

/**
 * UniApp 兼容：为列表数据添加动画状态
 * @param {Array} list - 列表数据
 * @param {Number} baseDelay - 基础延迟
 * @returns {Array} 添加了动画状态的数据
 */
export function withAnimationState(list, baseDelay = 50) {
  if (!Array.isArray(list)) return []
  return list.map((item, index) => ({
    ...item,
    _animateClass: '',
    _animateDelay: baseDelay + (index * 60)
  }))
}

/**
 * UniApp 兼容：触发动画（通过修改数据）
 * @param {Object} vm - Vue 实例
 * @param {String} arrayKey - 数组键名
 * @param {Number} index - 索引
 */
export function triggerItemAnimation(vm, arrayKey, index) {
  const key = `${arrayKey}[${index}]._animateClass`
  vm.$set(vm[arrayKey][index], '_animateClass', 'animate')
}

/**
 * 毛笔书写 - 将文本拆分为带延迟的字符数组
 * 适用于 UniApp 的 v-for 渲染
 * @param {String} text - 文本内容
 * @param {Number} startDelay - 开始延迟（秒）
 * @returns {Array} 字符数组
 */
export function splitTextForBrush(text, startDelay = 0) {
  if (!text || typeof text !== 'string') return []
  // 限制长度保证性能
  const maxLen = 30
  const processed = text.length > maxLen ? text.slice(0, maxLen) + '...' : text
  
  return processed.split('').map((char, i) => ({
    char,
    delay: startDelay + (i * 0.05),
    className: `char-delay-${(i % 10) + 1}`
  }))
}

export default {
  triggerAnimation,
  triggerBatchAnimation,
  observeAndAnimate,
  initScrollAnimations,
  initChineseAnimations,
  withAnimationState,
  triggerItemAnimation,
  splitTextForBrush
}
