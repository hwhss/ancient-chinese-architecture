<script>
export default {
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  }
};
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f8f4e9;
}

/* 优化滚动性能 */
scroll-view {
  -webkit-overflow-scrolling: touch;
}
</style>
