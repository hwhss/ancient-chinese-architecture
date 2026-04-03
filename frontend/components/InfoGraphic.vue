<template>
  <view class="info-graphic-container">
    <view v-if="loading" class="loading-state">
      <text class="loading-text">正在加载关系图...</text>
    </view>
    <view v-else-if="error" class="error-state">
      <text class="error-text">{{ error }}</text>
    </view>
    <view v-else class="graph-wrapper">
      <view :id="containerId" class="graph-container"></view>
    </view>
  </view>
</template>

<script>
// G6 CDN 地址
const G6_CDN = 'https://cdn.jsdelivr.net/npm/@antv/g6@4.8.21/dist/g6.min.js';

// 加载脚本（复用viewer页面的逻辑）
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is not available'));
      return;
    }

    const found = document.querySelector(`script[data-g6-src="${src}"]`);
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
    script.setAttribute('data-g6-src', src);
    script.onload = () => {
      script.setAttribute('data-loaded', '1');
      resolve();
    };
    script.onerror = () => reject(new Error(`load failed: ${src}`));
    document.head.appendChild(script);
  });
}

let g6ReadyPromise = null;

function ensureG6Lib() {
  if (g6ReadyPromise) {
    return g6ReadyPromise;
  }
  g6ReadyPromise = loadScriptOnce(G6_CDN);
  return g6ReadyPromise;
}

export default {
  name: 'InfoGraphic',
  props: {
    // 节点数据
    nodes: {
      type: Array,
      default: () => []
    },
    // 边数据
    edges: {
      type: Array,
      default: () => []
    },
    // 布局类型
    layout: {
      type: String,
      default: 'force' // force, radial, circular, dagre
    },
    // 容器高度
    height: {
      type: Number,
      default: 600
    },
    // 是否支持缩放
    zoomable: {
      type: Boolean,
      default: true
    },
    // 是否支持拖拽画布
    draggable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      containerId: `g6-container-${Date.now()}`,
      loading: false,
      error: '',
      graph: null,
      isH5: false
    };
  },
  computed: {
    // 中式主题配色
    themeColors() {
      return {
        // 木色背景
        nodeFill: '#f5e6c8',
        // 棕色边框
        nodeStroke: 'var(--secondary)',
        // 深棕色文字
        textFill: 'var(--text-primary)',
        // 边颜色
        edgeStroke: '#b8956a',
        // 激活状态
        activeFill: '#fff8d8',
        activeStroke: '#c82506',
        // 画布背景
        background: 'var(--bg-primary)'
      };
    }
  },
  mounted() {
    this.isH5 = typeof window !== 'undefined';
    if (this.isH5 && this.nodes.length > 0) {
      this.initGraph();
    }
  },
  beforeDestroy() {
    this.destroyGraph();
  },
  watch: {
    nodes: {
      handler(newVal) {
        if (this.isH5 && newVal.length > 0) {
          this.$nextTick(() => {
            this.initGraph();
          });
        }
      },
      deep: true
    },
    edges: {
      handler() {
        if (this.graph) {
          this.refreshGraph();
        }
      },
      deep: true
    }
  },
  methods: {
    async initGraph() {
      if (!this.isH5) {
        this.error = '当前环境不支持 G6 渲染，请切换到 H5 预览';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        await ensureG6Lib();
        this.renderGraph();
      } catch (err) {
        console.error('G6 初始化失败:', err);
        this.error = '关系图加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    renderGraph() {
      const G6 = window.G6;
      if (!G6) {
        this.error = 'G6 库未加载成功';
        return;
      }

      // 销毁旧实例
      this.destroyGraph();

      const container = document.getElementById(this.containerId);
      if (!container) {
        this.error = '容器未找到';
        return;
      }

      const { themeColors } = this;
      const width = container.clientWidth || 320;
      const height = this.height;

      // 处理节点数据
      const processedNodes = this.nodes.map(node => ({
        ...node,
        label: node.label || node.name || node.id,
        style: {
          fill: themeColors.nodeFill,
          stroke: themeColors.nodeStroke,
          lineWidth: 2,
          ...node.style
        },
        labelCfg: {
          style: {
            fill: themeColors.textFill,
            fontSize: 14,
            fontWeight: 500,
            ...node.labelCfg?.style
          }
        }
      }));

      // 处理边数据
      const processedEdges = this.edges.map(edge => ({
        ...edge,
        style: {
          stroke: themeColors.edgeStroke,
          lineWidth: 2,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: themeColors.edgeStroke
          },
          ...edge.style
        },
        labelCfg: {
          style: {
            fill: themeColors.textFill,
            fontSize: 12,
            ...edge.labelCfg?.style
          }
        }
      }));

      // 布局配置
      const layoutConfig = this.getLayoutConfig();

      // 创建图实例
      this.graph = new G6.Graph({
        container: this.containerId,
        width,
        height,
        modes: {
          default: [
            ...(this.zoomable ? ['zoom-canvas'] : []),
            ...(this.draggable ? ['drag-canvas', 'drag-node'] : []),
            'click-select'
          ]
        },
        layout: layoutConfig,
        defaultNode: {
          type: 'circle',
          size: 60,
          style: {
            fill: themeColors.nodeFill,
            stroke: themeColors.nodeStroke,
            lineWidth: 2,
            cursor: 'pointer'
          },
          labelCfg: {
            position: 'bottom',
            offset: 10,
            style: {
              fill: themeColors.textFill,
              fontSize: 14,
              fontWeight: 500
            }
          }
        },
        defaultEdge: {
          type: 'line',
          style: {
            stroke: themeColors.edgeStroke,
            lineWidth: 2,
            endArrow: {
              path: G6.Arrow.triangle(8, 10, 0),
              fill: themeColors.edgeStroke
            }
          },
          labelCfg: {
            autoRotate: true,
            style: {
              fill: themeColors.textFill,
              fontSize: 12
            }
          }
        },
        nodeStateStyles: {
          selected: {
            fill: themeColors.activeFill,
            stroke: themeColors.activeStroke,
            lineWidth: 3,
            shadowColor: themeColors.activeStroke,
            shadowBlur: 10
          },
          hover: {
            fill: themeColors.activeFill,
            stroke: themeColors.activeStroke,
            lineWidth: 3
          }
        },
        edgeStateStyles: {
          selected: {
            stroke: themeColors.activeStroke,
            lineWidth: 3
          }
        },
        background: {
          fill: themeColors.background
        },
        fitView: true,
        fitViewPadding: [20, 20, 20, 20]
      });

      // 渲染数据
      this.graph.data({
        nodes: processedNodes,
        edges: processedEdges
      });

      this.graph.render();

      // 绑定点击事件
      this.graph.on('node:click', (evt) => {
        const { item } = evt;
        const model = item.getModel();
        
        // 触发点击事件
        this.$emit('node-click', model);
        
        // 如果有 link 字段，自动跳转
        if (model.link) {
          uni.navigateTo({
            url: model.link
          });
        }
      });

      // 绑定悬停效果
      this.graph.on('node:mouseenter', (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, 'hover', true);
      });

      this.graph.on('node:mouseleave', (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, 'hover', false);
      });

      // 监听窗口大小变化
      this.handleResize = () => {
        if (this.graph) {
          const newWidth = container.clientWidth || 320;
          this.graph.changeSize(newWidth, this.height);
          this.graph.fitView();
        }
      };
      window.addEventListener('resize', this.handleResize);
    },

    getLayoutConfig() {
      const configs = {
        force: {
          type: 'force',
          preventOverlap: true,
          linkDistance: 150,
          nodeStrength: -100,
          edgeStrength: 0.5,
          collideStrength: 0.8
        },
        radial: {
          type: 'radial',
          preventOverlap: true,
          linkDistance: 150,
          maxIteration: 1000
        },
        circular: {
          type: 'circular',
          radius: 200,
          startAngle: 0,
          endAngle: 2 * Math.PI,
          clockwise: true
        },
        dagre: {
          type: 'dagre',
          rankdir: 'TB',
          align: 'DL',
          nodesep: 50,
          ranksep: 80
        }
      };
      return configs[this.layout] || configs.force;
    },

    refreshGraph() {
      if (this.graph) {
        this.graph.changeData({
          nodes: this.nodes,
          edges: this.edges
        });
      }
    },

    destroyGraph() {
      if (this.handleResize) {
        window.removeEventListener('resize', this.handleResize);
        this.handleResize = null;
      }

      if (this.graph) {
        this.graph.destroy();
        this.graph = null;
      }
    }
  }
};
</script>

<style scoped>
.info-graphic-container {
  width: 100%;
  background: var(--bg-primary);
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx solid var(--bg-tertiary);
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
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

.graph-wrapper {
  width: 100%;
}

.graph-container {
  width: 100%;
  min-height: 600rpx;
}
</style>
