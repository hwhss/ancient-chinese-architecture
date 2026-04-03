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
        secondary: 'var(--secondary)',
        secondaryLight: 'var(--secondary-light)',
        // 背景色
        background: 'var(--bg-primary)',
        // 文字色
        text: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        // 网格线
        gridLine: 'var(--bg-tertiary)',
        // 数据色板
        colorPalette: [
          '#c82506', // 主红
          'var(--secondary)', // 棕色
          'var(--warning)', // 金色
          'var(--success)', // 绿色
          '#b8956a', // 浅棕
          'var(--primary-light)', // 粉红
          'var(--secondary-dark)', // 深棕
          '#f5e6c8'  // 米色
        ]
      };
    }
  },
  mounted() {
    this.isH5 = typeof window !== 'undefined';
    if (this.isH5) {
      this.$nextTick(() => {
        this.initChart();
      });
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

      // 使用 $nextTick 后再查找容器，并添加重试机制
      let retryCount = 0;
      const maxRetries = 3;
      const findContainer = () => {
        const container = document.getElementById(this.containerId);
        if (container) {
          this.initChartInstance(echarts, container);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(findContainer, 100);
        } else {
          this.error = '容器未找到，请刷新页面重试';
          console.error(`VisualChart: Container #${this.containerId} not found after ${maxRetries} retries`);
        }
      };

      findContainer();
    },

    initChartInstance(echarts, container) {
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
            tooltip: {
              trigger: 'item',
              backgroundColor: 'rgba(248, 244, 233, 0.95)',
              borderColor: colors.secondary,
              borderWidth: 1,
              textStyle: {
                color: colors.text
              },
              formatter: function(params) {
                return `<div style="padding: 8px;">
                  <b style="color: ${params.color}; font-size: 14px;">${params.name}</b><br/>
                  <span style="color: var(--text-secondary);">数量: ${params.value}处</span><br/>
                  <span style="color: #c82506; font-weight: bold;">占比: ${params.percent}%</span>
                </div>`;
              }
            },
            legend: {
              top: '3%',
              left: 'center',
              textStyle: {
                color: colors.text,
                fontSize: 13,
                fontWeight: 'bold'
              },
              itemGap: 20,
              itemWidth: 16,
              itemHeight: 16,
              icon: 'circle'
            },
            series: [{
              type: 'pie',
              radius: ['35%', '60%'],
              center: ['50%', '55%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 10,
                borderColor: colors.background,
                borderWidth: 3,
                shadowBlur: 5,
                shadowColor: 'rgba(0, 0, 0, 0.1)'
              },
              label: {
                show: true,
                color: colors.text,
                fontSize: 12,
                fontWeight: 'bold',
                formatter: '{b}\n{d}%',
                padding: [6, 0]
              },
              labelLine: {
                show: true,
                length: 12,
                length2: 8,
                lineStyle: {
                  color: colors.secondary,
                  width: 1.5
                }
              },
              emphasis: {
                scale: true,
                scaleSize: 10,
                itemStyle: {
                  shadowBlur: 20,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  borderWidth: 4,
                  borderColor: '#fff'
                },
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: colors.primary
                }
              },
              data: data.series || [],
              animationType: 'scale',
              animationEasing: 'elasticOut',
              animationDelay: function (idx) {
                return Math.random() * 200;
              }
            }]
          };

        case 'radar':
          return {
            ...baseOption,
            radar: {
              indicator: data.indicator || [],
              shape: 'polygon',
              splitNumber: 5,
              radius: '65%',
              center: ['50%', '55%'],
              axisName: {
                color: colors.text,
                fontSize: 12,
                padding: [5, 5]
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              },
              splitArea: {
                show: true,
                areaStyle: {
                  color: ['rgba(248, 244, 233, 0.02)', 'rgba(248, 244, 233, 0.05)', 'rgba(248, 244, 233, 0.08)', 'rgba(248, 244, 233, 0.12)', 'rgba(248, 244, 233, 0.15)']
                }
              },
              axisLine: {
                lineStyle: {
                  color: colors.gridLine
                }
              }
            },
            series: [{
              type: 'radar',
              data: data.series || [],
              lineStyle: {
                width: 2
              },
              areaStyle: {
                opacity: 0.3
              },
              emphasis: {
                lineStyle: {
                  width: 3
                },
                areaStyle: {
                  opacity: 0.5
                }
              }
            }]
          };

        case 'bar':
          return {
            ...baseOption,
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(248, 244, 233, 0.95)',
              borderColor: colors.secondary,
              borderWidth: 1,
              textStyle: {
                color: colors.text
              },
              axisPointer: {
                type: 'shadow',
                shadowStyle: {
                  color: 'rgba(200, 37, 6, 0.1)'
                }
              }
            },
            legend: {
              show: false
            },
            grid: {
              left: '15%',
              right: '10%',
              top: '12%',
              bottom: '15%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: data.xAxis || [],
              axisLabel: {
                color: colors.text,
                fontSize: 13,
                interval: 0,
                rotate: 0,
                fontWeight: 'bold'
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              },
              axisTick: {
                show: false
              }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text,
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine,
                  type: 'dashed'
                }
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              }
            },
            series: [{
              type: 'bar',
              data: (data.colors && data.series && data.series.length > 0)
                ? data.series.map((value, index) => ({
                    value,
                    itemStyle: {
                      color: data.colors[index] || colors.colorPalette[index % colors.colorPalette.length],
                      borderRadius: [8, 8, 0, 0]
                    }
                  }))
                : (data.series || []).map((value, index) => ({
                    value,
                    itemStyle: {
                      color: colors.colorPalette[index % colors.colorPalette.length],
                      borderRadius: [8, 8, 0, 0]
                    }
                  })),
              itemStyle: {
                borderRadius: [8, 8, 0, 0]
              },
              label: {
                show: true,
                position: 'top',
                color: colors.text,
                fontSize: 13,
                fontWeight: 'bold',
                formatter: '{c}处'
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(200, 37, 6, 0.5)'
                },
                label: {
                  fontSize: 15,
                  color: colors.primary
                }
              },
              barWidth: '55%',
              animationDelay: function (idx) {
                return idx * 100;
              }
            }]
          };

        case 'scatter':
          return {
            ...baseOption,
            tooltip: {
              trigger: 'item',
              backgroundColor: 'rgba(248, 244, 233, 0.95)',
              borderColor: colors.secondary,
              borderWidth: 1,
              textStyle: {
                color: colors.text
              },
              formatter: function(params) {
                return `<div style="padding: 8px;"><b style="color: #c82506;">${params.name}</b><br/>经度: ${params.value[0]}°E<br/>纬度: ${params.value[1]}°N</div>`;
              }
            },
            legend: {
              show: data.legend && data.legend.length > 0,
              top: '3%',
              left: 'center',
              textStyle: {
                color: colors.text,
                fontSize: 12
              },
              itemGap: 20,
              itemWidth: 14,
              itemHeight: 14
            },
            grid: {
              left: '12%',
              right: '6%',
              top: data.legend && data.legend.length > 0 ? '15%' : '10%',
              bottom: '12%',
              containLabel: true
            },
            xAxis: {
              type: 'value',
              min: 73,
              max: 135,
              axisLabel: {
                color: colors.text,
                formatter: '{value}°E',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine,
                  type: 'dashed'
                }
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              }
            },
            yAxis: {
              type: 'value',
              min: 18,
              max: 54,
              axisLabel: {
                color: colors.text,
                formatter: '{value}°N',
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine,
                  type: 'dashed'
                }
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              }
            },
            series: data.series || []
          };

        case 'line':
          return {
            ...baseOption,
            tooltip: {
              trigger: 'axis',
              backgroundColor: 'rgba(248, 244, 233, 0.95)',
              borderColor: colors.secondary,
              borderWidth: 1,
              textStyle: {
                color: colors.text
              }
            },
            grid: {
              left: '15%',
              right: '10%',
              top: '12%',
              bottom: '15%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: data.xAxis || [],
              boundaryGap: false,
              axisLabel: {
                color: colors.text,
                fontSize: 13,
                fontWeight: 'bold'
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              },
              axisTick: {
                show: false
              }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                color: colors.text,
                fontSize: 11
              },
              splitLine: {
                lineStyle: {
                  color: colors.gridLine,
                  type: 'dashed'
                }
              },
              axisLine: {
                lineStyle: {
                  color: colors.secondary,
                  width: 2
                }
              }
            },
            series: [{
              type: 'line',
              data: data.series || [],
              smooth: true,
              symbol: 'circle',
              symbolSize: 12,
              lineStyle: {
                width: 3,
                color: '#c82506'
              },
              itemStyle: {
                color: '#c82506',
                borderColor: '#fff',
                borderWidth: 2
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(200, 37, 6, 0.3)' },
                    { offset: 1, color: 'rgba(200, 37, 6, 0.05)' }
                  ]
                }
              },
              label: {
                show: true,
                position: 'top',
                color: colors.text,
                fontSize: 13,
                fontWeight: 'bold',
                formatter: '{c}处'
              },
              emphasis: {
                scale: 1.5,
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(200, 37, 6, 0.5)'
                }
              }
            }]
          };

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
          textColor: 'var(--text-primary)',
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

.chart-wrapper {
  width: 100%;
}

.chart-container {
  width: 100%;
  min-height: 400rpx;
}
</style>
