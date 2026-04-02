/**
 * 性能监控工具
 * 提供性能指标收集、分析和报告功能
 */

// 性能指标存储
const performanceMetrics = {
  pageLoad: [],
  apiCalls: [],
  renderTime: [],
  memoryUsage: [],
  errors: []
};

// 配置
const CONFIG = {
  maxMetricsCount: 100,
  reportThreshold: 10,
  enableLogging: process.env.NODE_ENV !== 'production'
};

/**
 * 记录页面加载时间
 * @param {string} pageName - 页面名称
 * @param {number} loadTime - 加载时间（毫秒）
 */
export function recordPageLoad(pageName, loadTime) {
  const metric = {
    type: 'pageLoad',
    pageName,
    loadTime,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
  
  performanceMetrics.pageLoad.push(metric);
  
  // 限制存储数量
  if (performanceMetrics.pageLoad.length > CONFIG.maxMetricsCount) {
    performanceMetrics.pageLoad.shift();
  }
  
  if (CONFIG.enableLogging) {
    console.log(`[Performance] Page "${pageName}" loaded in ${loadTime}ms`);
  }
  
  // 慢页面警告
  if (loadTime > 3000) {
    console.warn(`[Performance Warning] Slow page load detected: ${pageName} took ${loadTime}ms`);
  }
}

/**
 * 记录API调用性能
 * @param {string} apiName - API名称
 * @param {number} duration - 调用时长（毫秒）
 * @param {boolean} success - 是否成功
 * @param {number} dataSize - 数据大小（字节）
 */
export function recordApiCall(apiName, duration, success = true, dataSize = 0) {
  const metric = {
    type: 'apiCall',
    apiName,
    duration,
    success,
    dataSize,
    timestamp: Date.now()
  };
  
  performanceMetrics.apiCalls.push(metric);
  
  if (performanceMetrics.apiCalls.length > CONFIG.maxMetricsCount) {
    performanceMetrics.apiCalls.shift();
  }
  
  if (CONFIG.enableLogging) {
    console.log(`[Performance] API "${apiName}" ${success ? 'succeeded' : 'failed'} in ${duration}ms`);
  }
  
  // 慢API警告
  if (duration > 5000) {
    console.warn(`[Performance Warning] Slow API call detected: ${apiName} took ${duration}ms`);
  }
}

/**
 * 记录渲染时间
 * @param {string} componentName - 组件名称
 * @param {number} renderTime - 渲染时间（毫秒）
 */
export function recordRenderTime(componentName, renderTime) {
  const metric = {
    type: 'render',
    componentName,
    renderTime,
    timestamp: Date.now()
  };
  
  performanceMetrics.renderTime.push(metric);
  
  if (performanceMetrics.renderTime.length > CONFIG.maxMetricsCount) {
    performanceMetrics.renderTime.shift();
  }
  
  if (CONFIG.enableLogging && renderTime > 100) {
    console.warn(`[Performance] Slow render detected: ${componentName} took ${renderTime}ms`);
  }
}

/**
 * 记录内存使用情况
 */
export function recordMemoryUsage() {
  // #ifdef H5
  if (typeof performance !== 'undefined' && performance.memory) {
    const memory = performance.memory;
    const metric = {
      type: 'memory',
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };
    
    performanceMetrics.memoryUsage.push(metric);
    
    if (performanceMetrics.memoryUsage.length > CONFIG.maxMetricsCount) {
      performanceMetrics.memoryUsage.shift();
    }
    
    // 内存警告
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      console.warn(`[Performance Warning] High memory usage: ${usagePercent.toFixed(2)}%`);
    }
  }
  // #endif
}

/**
 * 记录错误
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 */
export function recordError(error, context = '') {
  const metric = {
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now()
  };
  
  performanceMetrics.errors.push(metric);
  
  if (performanceMetrics.errors.length > CONFIG.maxMetricsCount) {
    performanceMetrics.errors.shift();
  }
}

/**
 * 获取性能报告
 * @returns {Object} - 性能报告
 */
export function getPerformanceReport() {
  const report = {
    summary: {
      totalPageLoads: performanceMetrics.pageLoad.length,
      totalApiCalls: performanceMetrics.apiCalls.length,
      totalRenders: performanceMetrics.renderTime.length,
      totalErrors: performanceMetrics.errors.length
    },
    averages: {},
    slowestPages: [],
    slowestApis: [],
    recentErrors: []
  };
  
  // 计算平均页面加载时间
  if (performanceMetrics.pageLoad.length > 0) {
    const avgLoadTime = performanceMetrics.pageLoad.reduce((sum, m) => sum + m.loadTime, 0) / performanceMetrics.pageLoad.length;
    report.averages.pageLoadTime = Math.round(avgLoadTime);
    
    // 最慢的页面
    report.slowestPages = [...performanceMetrics.pageLoad]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);
  }
  
  // 计算平均API调用时间
  if (performanceMetrics.apiCalls.length > 0) {
    const successfulCalls = performanceMetrics.apiCalls.filter(m => m.success);
    if (successfulCalls.length > 0) {
      const avgApiTime = successfulCalls.reduce((sum, m) => sum + m.duration, 0) / successfulCalls.length;
      report.averages.apiCallTime = Math.round(avgApiTime);
    }
    
    // 最慢的API
    report.slowestApis = [...performanceMetrics.apiCalls]
      .filter(m => m.success)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    // API成功率
    report.summary.apiSuccessRate = (successfulCalls.length / performanceMetrics.apiCalls.length * 100).toFixed(2);
  }
  
  // 最近的错误
  report.recentErrors = performanceMetrics.errors.slice(-10);
  
  return report;
}

/**
 * 打印性能报告到控制台
 */
export function printPerformanceReport() {
  const report = getPerformanceReport();
  
  console.group('📊 Performance Report');
  console.log('Summary:', report.summary);
  console.log('Averages:', report.averages);
  
  if (report.slowestPages.length > 0) {
    console.group('Slowest Pages:');
    report.slowestPages.forEach(p => {
      console.log(`  ${p.pageName}: ${p.loadTime}ms`);
    });
    console.groupEnd();
  }
  
  if (report.slowestApis.length > 0) {
    console.group('Slowest APIs:');
    report.slowestApis.forEach(a => {
      console.log(`  ${a.apiName}: ${a.duration}ms`);
    });
    console.groupEnd();
  }
  
  if (report.recentErrors.length > 0) {
    console.group('Recent Errors:');
    report.recentErrors.forEach(e => {
      console.log(`  [${new Date(e.timestamp).toLocaleTimeString()}] ${e.context}: ${e.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * 性能测量装饰器
 * @param {Function} fn - 目标函数
 * @param {string} name - 测量名称
 * @returns {Function} - 包装后的函数
 */
export function measurePerformance(fn, name) {
  return async function(...args) {
    const start = performance.now();
    try {
      const result = await fn.apply(this, args);
      const duration = performance.now() - start;
      recordApiCall(name, duration, true);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      recordApiCall(name, duration, false);
      throw error;
    }
  };
}

/**
 * 组件渲染性能测量
 * @param {Object} component - Vue组件
 * @returns {Object} - 包装后的组件
 */
export function measureComponentRender(component) {
  const name = component.name || 'AnonymousComponent';
  
  return {
    ...component,
    mounted() {
      const start = performance.now();
      this.$nextTick(() => {
        const duration = performance.now() - start;
        recordRenderTime(name, duration);
      });
      
      if (component.mounted) {
        component.mounted.call(this);
      }
    }
  };
}

/**
 * 定期报告性能数据
 * @param {number} interval - 报告间隔（毫秒）
 */
export function startPeriodicReporting(interval = 60000) {
  // 定期记录内存使用
  setInterval(() => {
    recordMemoryUsage();
  }, 30000);
  
  // 定期打印报告
  setInterval(() => {
    printPerformanceReport();
  }, interval);
}

/**
 * 清除所有性能数据
 */
export function clearPerformanceData() {
  performanceMetrics.pageLoad = [];
  performanceMetrics.apiCalls = [];
  performanceMetrics.renderTime = [];
  performanceMetrics.memoryUsage = [];
  performanceMetrics.errors = [];
}

// 导出性能指标存储（用于调试）
export { performanceMetrics };
