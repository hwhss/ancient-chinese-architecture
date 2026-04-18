const path = require('path');

module.exports = {
  transpileDependencies: ['@dcloudio/uni-ui'],
  
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      }
    },
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  },
  
  chainWebpack: (config) => {
    // 生产环境优化
    if (process.env.NODE_ENV === 'production') {
      // 启用JS压缩
      config.optimization.minimize(true);
      
      // 启用Gzip压缩
      config.plugin('compression').use(require('compression-webpack-plugin'), [{
        algorithm: 'gzip',
        test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i,
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false
      }]);
    }
    
    // 图片压缩
    config.module
      .rule('images')
      .use('url-loader')
      .tap(options => ({
        ...options,
        limit: 8192,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'static/img/[name].[hash:8].[ext]'
          }
        }
      }));
  },
  
  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false,
    loaderOptions: {
      scss: {
        additionalData: `@use "sass:math";`
      }
    }
  },
  
  devServer: {
    proxy: {
      '/api': {
        target: process.env.UNI_APP_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || 'http://localhost:9527',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
};
