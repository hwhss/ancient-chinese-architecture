/**
 * 字体加载优化工具
 * 提供字体子集加载和性能优化功能
 */

// 字体加载状态
const fontLoadStatus = new Map();

/**
 * 动态加载字体
 * @param {string} fontFamily - 字体名称
 * @param {string} fontUrl - 字体URL
 * @param {Object} options - 配置选项
 */
export function loadFont(fontFamily, fontUrl, options = {}) {
  const { 
    weight = 'normal',
    style = 'normal',
    display = 'swap'
  } = options;
  
  // 检查是否已加载
  if (fontLoadStatus.has(fontFamily)) {
    return fontLoadStatus.get(fontFamily);
  }
  
  // 创建字体加载Promise
  const loadPromise = new Promise((resolve, reject) => {
    // 使用FontFace API加载字体
    if ('FontFace' in window) {
      const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
        weight,
        style,
        display
      });
      
      fontFace.load()
        .then((loadedFace) => {
          document.fonts.add(loadedFace);
          resolve(loadedFace);
        })
        .catch(reject);
    } else {
      // 降级方案：使用CSS方式加载
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('woff2');
          font-weight: ${weight};
          font-style: ${style};
          font-display: ${display};
        }
      `;
      document.head.appendChild(styleEl);
      
      // 简单延迟后认为加载完成
      setTimeout(resolve, 100);
    }
  });
  
  fontLoadStatus.set(fontFamily, loadPromise);
  return loadPromise;
}

/**
 * 预加载字体
 * @param {string} fontUrl - 字体URL
 */
export function preloadFont(fontUrl) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = fontUrl;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/**
 * 使用系统字体栈（性能最优）
 */
export const systemFontStack = {
  // 中文系统字体栈
  chinese: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
  
  // 衬线字体栈（用于标题）
  serif: `'Noto Serif SC', 'Songti SC', 'SimSun', 'STSong', 'FangSong', serif`,
  
  // 无衬线字体栈（用于正文）
  sansSerif: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`,
  
  // 等宽字体栈
  mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Source Code Pro', monospace`
};

/**
 * 字体子集配置
 * 按需加载不同字符集的字体
 */
export const fontSubsets = {
  // 基础拉丁字符集
  latin: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    size: 'small'
  },
  
  // 常用中文字符集（约3500字）
  chineseCommon: {
    chars: '', // 实际使用时填充常用汉字
    size: 'medium'
  },
  
  // 古建筑相关特殊字符
  architecture: {
    chars: '建筑殿楼阁台亭榭廊轩斋舫坊牌楼塔刹顶檐斗拱梁枋柱础石木砖瓦漆彩画雕刻',
    size: 'small'
  }
};

/**
 * 生成字体子集CSS
 * @param {string} fontFamily - 字体名称
 * @param {string} subset - 字符子集
 * @returns {string} - CSS文本
 */
export function generateSubsetFontCSS(fontFamily, subset) {
  return `
    @font-face {
      font-family: '${fontFamily}';
      src: local('${fontFamily}');
      unicode-range: ${generateUnicodeRange(subset)};
      font-display: swap;
    }
  `;
}

/**
 * 生成Unicode范围
 * @param {string} chars - 字符集
 * @returns {string} - Unicode范围
 */
function generateUnicodeRange(chars) {
  const codePoints = [...chars].map(char => {
    const code = char.charCodeAt(0).toString(16).toUpperCase();
    return `U+${code}`;
  });
  
  // 合并连续的Unicode范围
  return codePoints.join(', ');
}

/**
 * 优化字体加载策略
 * 1. 优先使用系统字体
 * 2. 异步加载自定义字体
 * 3. 使用font-display: swap避免FOIT
 */
export function optimizeFontLoading() {
  // 添加字体加载优化CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* 使用系统字体作为初始渲染 */
    body {
      font-family: ${systemFontStack.chinese};
    }
    
    /* 自定义字体加载完成后的样式 */
    .fonts-loaded body {
      font-family: 'CustomFont', ${systemFontStack.chinese};
    }
    
    /* 防止字体加载期间的布局偏移 */
    html {
      font-display: optional;
    }
  `;
  document.head.appendChild(styleEl);
  
  // 监听字体加载完成
  if (document.fonts) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

/**
 * 检查字体是否已加载
 * @param {string} fontFamily - 字体名称
 * @returns {boolean} - 是否已加载
 */
export function isFontLoaded(fontFamily) {
  if (!document.fonts) {
    return true; // 无法检测时默认已加载
  }
  
  return document.fonts.check(`12px "${fontFamily}"`);
}

/**
 * 等待字体加载完成
 * @param {string} fontFamily - 字体名称
 * @returns {Promise} - 加载Promise
 */
export function waitForFont(fontFamily) {
  if (!document.fonts) {
    return Promise.resolve();
  }
  
  return document.fonts.load(`12px "${fontFamily}"`);
}
