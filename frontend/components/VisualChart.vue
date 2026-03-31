<template>
  <view class="visual-chart-container">
    <view v-if="loading" class="loading-state">
      <text class="loading-text">正在加载图表...</text>
    </view>
    <view v-else-if="error" class="error-state">
      <text class="error-text">{{ error }}</text>
    </view>
    <view v-else class="chart-wrapper">
      <view :id="containerId" class="chart-container"></view>
    </view>
  </view>
</template>

<script>
// ECharts CDN 地址
const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';

// 加载脚本（复用viewer页面的逻辑）
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is not available'));
      return;
    }

    const found = document.querySelector(`script[data-echarts-src="${src}"]`);
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
    script.setAttribute('data-echarts-src', src);
    script.onload = () => {
      script.setAttribute('data-loaded', '1');
      resolve();
    };
    script.onerror = () => reject(new Error(`load failed: ${src}`));
    document.head.appendChild(script);
  });
}

let echartsReadyPromise = null;

function ensureEchartsLib() {
  if (echartsReadyPromise) {
    return echartsReadyPromise;
  }
  echartsReadyPromise = loadScriptOnce(ECHARTS_CDN);
  return echartsReadyPromise;
}

export default {
  name: 'VisualChart',
  props: {
    // ECharts 配置项
    option: {
      type: Object,
      default: () => ({})
    },
    // 图表类型（简化配置时使用）
    type: {
      type: String,
      default: 'line' // line, bar, pie, scatter, radar
    },
    // 图表数据（简化配置时使用）
    data: {
      type: Object,
      default: () => ({
        xAxis: [],
        series: []
      })
    },
    // 容器高度
    height: {
      type: Number,
      default: 400
    },
    // 是否自动调整大小
    autoResize: {
      type: Boolean,
      default: true
    },
    // 主题色
    theme: {
      type: String,
      default: 'custom' // custom, dark, light
    }
  },
  data() {
    return {
      containerId: `echarts-container-${Date.now()}`,
      loading: false,
      error: '',
      chart: null,
      isH5: false,
      resizeHandler: null
    };
  },
  computed: {
    // 中式主题配色
    themeColors() {
      return {
        // 主色调
        primary: '#c82506',
        primaryLight: '#e84a38',
        // 辅助色
        secondary: '#8B4513',
        secondaryLight: '#a67c52',
        // 背景色
        background: '#f8f4e9',
        // 文字色
        text: '#3c2a1d',
        textSecondary: '#6b5643',
        // 网格线
        gridLine: '#e8dcc8',
        // 数据色板
        colorPalette: [
          '#c82506', // 主红
          '#8B4513', // 棕色
          '#e8b860', // 金色
          '#5b8c5a', // 绿色
          '#b8956a', // 浅棕
          '#d6455a', // 粉红
          '#6b3410', // 深棕
          '#f5e6c8'  // 米色
        ]
      };
    }
  },
  mounted() {
    this.isH5 = typeof window !== 'undefined';
    if (this.isH5) {
      this.initChart();
    }
  },
  beforeDestroy() {
    this.destroyChart();
  },
  watch: {
    option: {
      handler() {
        if (this.chart) {
          this.updateChart();
        }
      },
      deep: true
    },
    data: {
      handler() {
        if (this.chart) {
          this.updateChart();
        }
      },
      deep: true
    }
  },
  methods: {
    async initChart() {
      if (!this.isH5) {
        this.error = '当前环境不支持 ECharts 渲染，请切换到 H5 预览';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        await ensureEchartsLib();
        this.renderChart();
      } catch (err) {
        console.error('ECharts 初始化失败:', err);
        this.error = '图表加载失败，请稍后重试';
      } finally {
        this.loading = false;
      }
    },

    renderChart() {
      const echarts = window.echarts;
      if (!echarts) {
        this.error = 'ECharts 库未加载成功';
        return;
      }

      // 销毁旧实例
      this.destroyChart();

      const container = document.getElementById(this.containerId);
      if (!container) {
        this.error = '容器未找到';
        return;
      }

      const { themeColors } = this;

      // 注册自定义主题
      this.registerCustomTheme(echarts, themeColors);

      // 创建图表实例
      this.chart = echarts.init(container, this.theme === 'custom' ? 'ancient' : this.theme);

      // 设置配置项
      const chartOption = this.option && Object.keys(this.option).length > 0
        ? this.processOption(this.option, themeColors)
        : this.generateDefaultOption(themeColors);

      this.chart.setOption(chartOption);

      // 绑定点击事件
      this.chart.on('click', (params) => {
        this.$emit('click', params);
      });

      // 绑定悬停事件
      this.chart.on('mouseover', (params) => {
        this.$emit('mouseover', params);
      });

      // 自动调整大小
      if (this.autoResize) {
        this.resizeHandler = () => {
          if (this.chart) {
            this.chart.resize();
          }
        };
        window.addEventListener('resize', this.resizeHandler);
      }
    },

    registerCustomTheme(echarts, colors) {
      const customTheme = {
        color: colors.colorPalette,
        backgroundColor: colors.background,
        textStyle: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
        },
        title: {
          textStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold'
          },
          subtextStyle: {
            color: colors.textSecondary
          }
        },
        legend: {
          textStyle: {
            color: colors.text
          }
        },
        tooltip: {
          backgroundColor: 'rgba(248, 244, 233, 0.95)',
          borderColor: colors.secondary,
          borderWidth: 1,
          textStyle: {
            color: colors.text
          },
          extraCssText: 'box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.2);'
        },
        grid: {
          borderColor: colors.gridLine
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: colors.secondary
            }
          },
          axisLabel: {
            color: colors.text
          },
          splitLine: {
            lineStyle: {
              color: colors.gridLine
            }
          }
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: colors.secondary
            }
          },
          axisLabel: {
            color: colors.text
          },
          splitLine: {
            lineStyle: {
              color: colors.gridLine
            }
          }
        }
      };

      echarts.registerTheme('ancient', customTheme);
    },

    processOption(option, colors) {
      // 合并默认样式到配置项
      const processedOption = {
        backgroundColor: colors.background,
        ...option
      };

      // 处理 tooltip
      if (processedOption.tooltip) {
        processedOption.tooltip = {
          backgroundColor: 'rgba(248, 244, 233, 0.95)',
          borderColor: colors.secondary,
          borderWidth: 1,
          textStyle: {
            color: colors.text
          },
          ...processedOption.tooltip
        };
      }

      // 处理 series 颜色
      if (processedOption.series && Array.isArray(processedOption.series)) {
        processedOption.series = processedOption.series.map((series, index) => ({
          itemStyle: {
            color: colors.colorPalette[index % colors.colorPalette.length]
          },
          ...series
        }));
      }

      return processedOption;
    },

    generateDefaultOption(colors) {
      const { type, data } = this;

      // 基础配置
      const baseOption = {
        backgroundColor: colors.background,
        tooltip: {
          trigger: type === 'pie' ? 'item' : 'axis',
          backgroundColor: 'rgba(248, 244, 233, 0.95)',
          borderColor: colors.secondary,
          borderWidth: 1,
          textStyle: {
            color: colors.text
          }
        },
        legend: {
          textStyle: {
            color: colors.text
          }
        },
        color: colors.colorPalette
      };

      // 根据图表类型生成配置
      switch (type) {
        case 'pie':
          return {
            ...baseOption,
            series: [{
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: colors.background,
                borderWidth: 2
              },
              label: {
                show: true,
                color: colors.text
              },
              data: data.series || []
            }]
          };

        case 'radar':
          return {
            ...baseOption,
            radar: {
              indicator: data.indicator || [],
              axisName: {
                color: colors.text
              },
              splitArea: {
                areaStyle: {
                  color: ['rgba(232, 184, 96, 0.1)', 'rgba(232, 184, 96, 0.2)']
                }
              }
            },
            series: [{
              type: 'radar',
              data: data.series || []
            }]
          };

        case 'bar':
          return {
            ...baseOption,
            xAxis: {
              type: 'category',
              data: data.xAxis || [],
              axisLabel: {
                color: colors.text
              }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              }
            },
            series: [{
              type: 'bar',
              data: data.series || [],
              itemStyle: {
                borderRadius: [4, 4, 0, 0]
              }
            }]
          };

        case 'scatter':
          return {
            ...baseOption,
            xAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              }
            },
            series: [{
              type: 'scatter',
              data: data.series || [],
              symbolSize: 20
            }]
          };

        case 'line':
        default:
          return {
            ...baseOption,
            xAxis: {
              type: 'category',
              data: data.xAxis || [],
              boundaryGap: false,
              axisLabel: {
                color: colors.text
              }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              }
            },
            series: [{
              type: 'line',
              data: data.series || [],
              smooth: true,
              areaStyle: {
                opacity: 0.3
              }
            }]
          };
      }
    },

    updateChart() {
      if (this.chart) {
        const { themeColors } = this;
        const newOption = this.option && Object.keys(this.option).length > 0
          ? this.processOption(this.option, themeColors)
          : this.generateDefaultOption(themeColors);
        this.chart.setOption(newOption, true);
      }
    },

    // 获取图表实例（供外部调用）
    getChartInstance() {
      return this.chart;
    },

    // 设置配置项
    setOption(option, notMerge = false) {
      if (this.chart) {
        this.chart.setOption(option, notMerge);
      }
    },

    // 清空图表
    clear() {
      if (this.chart) {
        this.chart.clear();
      }
    },

    // 显示加载动画
    showLoading() {
      if (this.chart) {
        this.chart.showLoading({
          text: '加载中...',
          color: '#c82506',
          textColor: '#3c2a1d',
          maskColor: 'rgba(248, 244, 233, 0.8)'
        });
      }
    },

    // 隐藏加载动画
    hideLoading() {
      if (this.chart) {
        this.chart.hideLoading();
      }
    },

    // 调整大小
    resize() {
      if (this.chart) {
        this.chart.resize();
      }
    },

    destroyChart() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }

      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }
    }
  }
};
</script>

<style scoped>
.visual-chart-container {
  width: 100%;
  background: #f8f4e9;
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx solid #e8dcc8;
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
  color: #8b7355;
}

.error-text {
  font-size: 28rpx;
  color: #b85450;
  text-align: center;
}

.chart-wrapper {
  width: 100%;
}

.chart-container {
  width: 100%;
  min-height: 400rpx;
}
</style>
