import { createSSRApp } from 'vue';
import App from './App.vue';
import { optimizeFontLoading } from './utils/fontLoader.js';
import { cleanExpiredCache } from './utils/cache.js';

// 性能优化：清理过期缓存
cleanExpiredCache();

// 性能优化：字体加载优化（仅在H5环境）
// #ifdef H5
if (typeof window !== 'undefined') {
  optimizeFontLoading();
}
// #endif

// 性能监控（仅在开发环境）
// #ifdef DEBUG
if (typeof uni !== 'undefined' && uni.getPerformance) {
  const performance = uni.getPerformance();
  performance.createObserver((entry) => {
    console.log('Performance Entry:', entry);
  }).observe({ entryTypes: ['render', 'script'] });
}
// #endif

export function createApp() {
  const app = createSSRApp(App);
  
  // 全局性能优化指令
  app.directive('lazy', {
    mounted(el, binding) {
      const src = binding.value;
      if (!src) return;
      
      // 设置占位图或背景色
      el.style.backgroundColor = '#f0f0f0';
      
      // 使用 IntersectionObserver 实现懒加载
      // #ifdef H5
      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (el.tagName === 'IMG') {
                el.src = src;
              } else {
                el.style.backgroundImage = `url(${src})`;
              }
              observer.unobserve(el);
            }
          });
        }, {
          rootMargin: '100px 0px',
          threshold: 0.01
        });
        
        observer.observe(el);
        el._lazyObserver = observer;
      } else {
        // 降级方案
        if (el.tagName === 'IMG') {
          el.src = src;
        } else {
          el.style.backgroundImage = `url(${src})`;
        }
      }
      // #endif
      
      // #ifndef H5
      // 小程序环境直接使用
      if (el.tagName === 'IMG' || el.tagName === 'IMAGE') {
        el.src = src;
      } else {
        el.style.backgroundImage = `url(${src})`;
      }
      // #endif
    },
    
    unmounted(el) {
      // #ifdef H5
      if (el._lazyObserver) {
        el._lazyObserver.disconnect();
        delete el._lazyObserver;
      }
      // #endif
    }
  });
  
  // 全局混入：页面性能优化
  app.mixin({
    onLoad() {
      // 页面加载时记录时间
      this._pageLoadTime = Date.now();
    },
    
    onReady() {
      // 页面就绪时计算加载时间
      if (this._pageLoadTime) {
        const loadTime = Date.now() - this._pageLoadTime;
        // #ifdef DEBUG
        console.log(`[Performance] Page load time: ${loadTime}ms`);
        // #endif
      }
    },
    
    onUnload() {
      // 页面卸载时清理资源
      this._pageLoadTime = null;
    }
  });
  
  return {
    app
  };
}
