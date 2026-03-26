<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="title">🏯 古建筑AI导览</text>
    </view>

    <!-- 快捷入口 -->
    <view v-if="messages.length === 0" class="quick-actions">
      <button class="quick-btn" @click="goToMap">
        🗺️ 浏览古建筑地图
      </button>
    </view>

    <!-- 消息区域 -->
    <scroll-view class="message-area" scroll-y :scroll-into-view="scrollId">
      <!-- 欢迎消息 -->
      <view v-if="messages.length === 0" class="welcome">
        <text class="welcome-text">您好！我是您的古建筑导览助手</text>
        <text class="welcome-sub">可以问我关于故宫的问题，如"太和殿的历史"</text>
        <text class="welcome-hint">💡 或直接点击上方「浏览古建筑地图」查看全部</text>
      </view>

      <!-- 消息列表 -->
      <view v-for="(msg, index) in messages" :key="index" class="message-wrapper" :class="msg.role">
        <view class="message" :class="msg.role">
          <text class="message-text">{{ msg.content }}</text>
          <button v-if="msg.materialId" class="view-btn" @click="goToDetail(msg.materialId)">
            查看实景/动画 →
          </button>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="message-wrapper ai">
        <view class="message ai">
          <text class="loading-text">AI思考中...</text>
        </view>
      </view>

      <view :id="scrollId" class="scroll-bottom"></view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <input
        v-model="inputText"
        class="input"
        placeholder="请输入问题..."
        confirm-type="send"
        @confirm="send"
      />
      <button class="send-btn" :disabled="!inputText.trim() || loading" @click="send">
        发送
      </button>
    </view>
  </view>
</template>

<script>
// 本地关键词映射表 - 20个代表性古建筑
const keywordMapping = {
  // 皇宫
  '太和殿': 'gugong_01',
  '乾清宫': 'gugong_02',
  '中和殿': 'gugong_03',
  '保和殿': 'gugong_04',
  '养心殿': 'gugong_05',
  '御花园': 'gugong_06',
  '午门': 'gugong_07',
  '天安门': 'gugong_08',
  '故宫': 'gugong_01',
  '紫禁城': 'gugong_01',
  '沈阳故宫': 'shenyang_01',
  // 桥梁
  '赵州桥': 'zhaozhou_01',
  '卢沟桥': 'lugou_01',
  '广济桥': 'guangji_01',
  // 园林
  '拙政园': 'zhuozheng_01',
  '颐和园': 'yiheyuan_01',
  '苏州园林': 'zhuozheng_01',
  // 城防
  '西安城墙': 'xian_01',
  '南京城墙': 'nanjing_01',
  // 民居
  '福建土楼': 'tulou_01',
  '土楼': 'tulou_01',
  '乔家大院': 'qiaojia_01',
  '平遥古城': 'pingyao_01',
  '丽江古城': 'lijiang_01',
  // 楼阁
  '岳阳楼': 'yueyang_01',
  '孔庙': 'kongmiao_01',
  '曲阜孔庙': 'kongmiao_01',
  // 水利
  '都江堰': 'dujiangyan_01',
  '坎儿井': 'kanerjing_01',
};

// 根据问题匹配materialId
function matchMaterialId(question) {
  for (const keyword in keywordMapping) {
    if (question.includes(keyword)) {
      return keywordMapping[keyword];
    }
  }
  return null;
}

export default {
  data() {
    return {
      messages: [],
      inputText: '',
      scrollId: 'msg-end',
      loading: false,
      // 后端接口地址
      apiBaseUrl: 'http://localhost:8080'
    };
  },
  methods: {
    async send() {
      const question = this.inputText.trim();
      if (!question || this.loading) return;

      this.inputText = '';

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: question
      });
      this.scrollToBottom();

      this.loading = true;

      try {
        // 调用后端接口
        const response = await uni.request({
          url: `${this.apiBaseUrl}/api/chat`,
          method: 'POST',
          data: { question }
        });

        const result = response.data;

        if (result.code === 200) {
          const materialId = matchMaterialId(question);
          this.messages.push({
            role: 'ai',
            content: result.data.answer,
            materialId: materialId
          });
        } else {
          this.messages.push({
            role: 'ai',
            content: '抱歉，服务暂时不可用，请稍后再试。'
          });
        }
      } catch (error) {
        console.error('请求失败:', error);
        // Mock模式：接口不通时返回模拟数据
        const mockAnswer = this.getMockAnswer(question);
        const materialId = matchMaterialId(question);
        this.messages.push({
          role: 'ai',
          content: mockAnswer,
          materialId: materialId
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },

    // Mock回答（用于演示）
    getMockAnswer(question) {
      if (question.includes('太和殿')) {
        return '太和殿建成于明永乐十八年（1420年），是故宫规模最大、等级最高的建筑，用于举行大典。殿高35.05米，建筑面积2377平方米，是中国现存最大的木结构大殿。';
      }
      if (question.includes('乾清宫')) {
        return '乾清宫是明清皇帝的寝宫，建于明永乐十八年。清代雍正帝后，皇帝移居养心殿，乾清宫改为皇帝处理日常政务的场所。';
      }
      return '这是一个很有价值的问题。' + question + '涉及丰富的历史文化内涵。建议您参考相关历史资料获取更详细的信息。';
    },

    scrollToBottom() {
      this.scrollId = 'msg-' + Date.now();
    },

    goToDetail(materialId) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${materialId}`
      });
    },

    goToMap() {
      uni.navigateTo({
        url: '/pages/map/map'
      });
    }
  }
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  padding: 40rpx 30rpx;
  text-align: center;
}

.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.message-area {
  flex: 1;
  padding: 20rpx;
}

.welcome {
  text-align: center;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.welcome-sub {
  display: block;
  font-size: 26rpx;
  color: #666;
}

.message-wrapper {
  margin-bottom: 20rpx;
  display: flex;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.ai {
  justify-content: flex-start;
}

.message {
  max-width: 70%;
  padding: 24rpx;
  border-radius: 20rpx;
  word-wrap: break-word;
}

.message.user {
  background-color: #95EC69;
  border-bottom-right-radius: 4rpx;
}

.message.ai {
  background-color: #fff;
  border-bottom-left-radius: 4rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.message-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.view-btn {
  margin-top: 16rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: #fff;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: none;
}

.input-area {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #e5e5e5;
}

.input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin-right: 20rpx;
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}

.send-btn[disabled] {
  background: #ccc;
}

.scroll-bottom {
  height: 1rpx;
}

/* 快捷入口 */
.quick-actions {
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.quick-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
}

.welcome-hint {
  display: block;
  font-size: 24rpx;
  color: #8B4513;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #ddd;
}
</style>
