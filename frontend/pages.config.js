/**
 * 页面配置 - 支持分包加载
 * 优化首屏加载速度
 */

module.exports = {
  // 主包页面
  mainPages: [
    {
      path: 'pages/home/home',
      style: {
        navigationBarTitleText: '中华古建筑导览',
        navigationStyle: 'custom'
      }
    },
    {
      path: 'pages/map/map',
      style: {
        navigationBarTitleText: '古建筑名录'
      }
    }
  ],
  
  // 分包配置
  subPackages: [
    {
      root: 'package-detail',
      pages: [
        {
          path: 'pages/detail/detail',
          style: {
            navigationBarTitleText: '素材详情'
          }
        },
        {
          path: 'pages/viewer/viewer',
          style: {
            navigationBarTitleText: '3D导览'
          }
        }
      ]
    },
    {
      root: 'package-user',
      pages: [
        {
          path: 'pages/favorites/favorites',
          style: {
            navigationBarTitleText: '我的收藏',
            navigationStyle: 'custom'
          }
        },
        {
          path: 'pages/settings/settings',
          style: {
            navigationBarTitleText: '设置',
            navigationStyle: 'custom'
          }
        }
      ]
    },
    {
      root: 'package-other',
      pages: [
        {
          path: 'pages/index/index',
          style: {
            navigationBarTitleText: '古建筑AI导览'
          }
        },
        {
          path: 'pages/dev-settings/dev-settings',
          style: {
            navigationBarTitleText: '开发设置'
          }
        }
      ]
    }
  ],
  
  // 预加载规则
  preloadRule: {
    'pages/home/home': {
      network: 'all',
      packages: ['package-detail']
    },
    'pages/map/map': {
      network: 'all',
      packages: ['package-detail']
    }
  },
  
  // 全局样式
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#F8F8F8',
    backgroundColor: '#F8F8F8',
    backgroundTextStyle: 'dark'
  },
  
  // TabBar配置（如有需要）
  tabBar: null,
  
  // 网络超时配置
  networkTimeout: {
    request: 10000,
    downloadFile: 10000,
    uploadFile: 10000,
    connectSocket: 10000
  },
  
  // 调试配置
  debug: false,
  
  // 性能优化配置
  optimization: {
    // 是否开启分包优化
    subPackages: true,
    // 是否开启TreeShaking
    treeShaking: {
      enable: true
    }
  }
};
