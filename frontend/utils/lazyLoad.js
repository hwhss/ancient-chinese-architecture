/**
 * 懒加载工具
 * 提供组件和资源的按需加载功能
 */

/**
 * 懒加载组件（用于路由级别代码分割）
 * @param {string} path - 组件路径
 * @returns {Function} - 懒加载函数
 */
export function lazyLoadComponent(path) {
  return () => import(/* webpackChunkName: "[request]" */ `${path}`);
}

/**
 * 预加载组件
 * @param {string} path - 组件路径
 */
export function preloadComponent(path) {
  // 使用requestIdleCallback在浏览器空闲时预加载
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      import(/* webpackPrefetch: true */ `${path}`);
    });
  } else {
    // 降级方案：使用setTimeout
    setTimeout(() => {
      import(/* webpackPrefetch: true */ `${path}`);
    }, 1000);
  }
}

/**
 * 懒加载图片
 * @param {string} src - 图片地址
 * @returns {Promise<string>} - 图片地址
 */
export function lazyLoadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * 图片懒加载指令（用于Vue）
 */
export const lazyImageDirective = {
  mounted(el, binding) {
    const src = binding.value;
    if (!src) return;
    
    // 使用IntersectionObserver实现懒加载
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.src = src;
            observer.unobserve(el);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      
      observer.observe(el);
      el._lazyObserver = observer;
    } else {
      // 降级方案：直接加载
      el.src = src;
    }
  },
  
  unmounted(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect();
      delete el._lazyObserver;
    }
  }
};

/**
 * 分批加载数据
 * @param {Array} items - 数据列表
 * @param {Function} callback - 每批数据的回调
 * @param {number} batchSize - 每批大小
 * @param {number} delay - 批次间隔（毫秒）
 */
export function batchLoad(items, callback, batchSize = 10, delay = 16) {
  let index = 0;
  
  function loadBatch() {
    const batch = items.slice(index, index + batchSize);
    if (batch.length === 0) return;
    
    callback(batch, index);
    index += batchSize;
    
    if (index < items.length) {
      setTimeout(loadBatch, delay);
    }
  }
  
  loadBatch();
}

/**
 * 虚拟列表计算
 * @param {Array} items - 完整数据列表
 * @param {number} scrollTop - 滚动位置
 * @param {number} containerHeight - 容器高度
 * @param {number} itemHeight - 每项高度
 * @param {number} buffer - 缓冲区大小
 * @returns {Object} - 渲染范围和偏移量
 */
export function calculateVirtualList(items, scrollTop, containerHeight, itemHeight, buffer = 5) {
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);
  const offsetY = startIndex * itemHeight;
  
  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    visibleItems: items.slice(startIndex, endIndex)
  };
}

/**
 * 防抖函数
 * @param {Function} fn - 目标函数
 * @param {number} delay - 延迟时间
 * @returns {Function} - 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  
  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn - 目标函数
 * @param {number} interval - 间隔时间
 * @returns {Function} - 节流后的函数
 */
export function throttle(fn, interval = 100) {
  let lastTime = 0;
  let timer = null;
  
  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 请求队列（限制并发数）
 */
export class RequestQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject
      });
      
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}

// 创建全局请求队列实例
export const requestQueue = new RequestQueue(5);
