<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-decoration"></view>
      <text class="title">🏯 古建筑AI导览</text>
      <view class="header-decoration"></view>
    </view>

    <!-- 快捷入口 -->
    <view v-if="messages.length === 0" class="quick-actions">
      <button class="quick-btn" @click="goToMap">🗺️ 浏览古建筑名录</button>
      <button class="quick-btn secondary" @click="goToDevSettings">
        ⚙️ 开发设置
      </button>
    </view>

    <!-- 消息区域 -->
    <scroll-view class="message-area" scroll-y :scroll-into-view="scrollId">
      <!-- 欢迎消息 -->
      <view v-if="messages.length === 0" class="welcome">
        <view class="welcome-divider">
          <text class="welcome-title">欢迎使用</text>
        </view>
        <text class="welcome-text">您好！我是您的古建筑导览助手</text>
        <text class="welcome-sub">可以问我关于古建筑的问题，例如：</text>
        <view class="example-questions">
          <text class="example-item">"太和殿的历史是什么？"</text>
          <text class="example-item">"赵州桥的建筑特色？"</text>
        </view>
        <text class="welcome-hint">💡 或点击上方按钮浏览全部古建筑</text>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, index) in messages"
        :key="index"
        class="message-wrapper"
        :class="msg.role"
      >
        <view class="message" :class="msg.role">
          <text class="message-text">{{ msg.content }}</text>
          <button
            v-if="msg.materialId"
            class="view-btn"
            @click="goToDetail(msg.materialId)"
          >
            查看实景资料 →
          </button>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="message-wrapper ai">
        <view class="message ai">
          <text class="loading-text">正在思考中...</text>
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
      <button
        class="send-btn"
        :disabled="!inputText.trim() || loading"
        @click="send"
      >
        发送
      </button>
    </view>
  </view>
</template>

<script>
import { chat } from "../../services/api";

// 后端返回materialId后优先使用，仅作为降级兜底保留关键词映射
const KEYWORD_MAPPING = {
  // 皇宫
  太和殿: "gugong_01",
  乾清宫: "gugong_02",
  中和殿: "gugong_03",
  保和殿: "gugong_04",
  养心殿: "gugong_05",
  御花园: "gugong_06",
  午门: "gugong_07",
  天安门: "gugong_08",
  故宫: "gugong_01",
  紫禁城: "gugong_01",
  沈阳故宫: "shenyang_01",
  // 桥梁
  赵州桥: "zhaozhou_01",
  卢沟桥: "lugou_01",
  广济桥: "guangji_01",
  // 园林
  拙政园: "zhuozheng_01",
  颐和园: "yiheyuan_01",
  苏州园林: "zhuozheng_01",
  // 城防
  西安城墙: "xian_01",
  南京城墙: "nanjing_01",
  // 民居
  福建土楼: "tulou_01",
  土楼: "tulou_01",
  乔家大院: "qiaojia_01",
  平遥古城: "pingyao_01",
  丽江古城: "lijiang_01",
  // 楼阁
  岳阳楼: "yueyang_01",
  孔庙: "kongmiao_01",
  曲阜孔庙: "kongmiao_01",
  // 水利
  都江堰: "dujiangyan_01",
  坎儿井: "kanerjing_01",
};

// 根据问题匹配materialId - 纯函数优化
function matchMaterialId(question) {
  for (const keyword in KEYWORD_MAPPING) {
    if (question.includes(keyword)) {
      return KEYWORD_MAPPING[keyword];
    }
  }
  return null;
}

// 缓存mock回答避免重复创建字符串
const MOCK_ANSWERS = {
  太和殿:
    "太和殿建成于明永乐十八年（1420年），是故宫规模最大、等级最高的建筑，用于举行大典。殿高35.05米，建筑面积2377平方米，是中国现存最大的木结构大殿。",
  乾清宫:
    "乾清宫是明清皇帝的寝宫，建于明永乐十八年。清代雍正帝后，皇帝移居养心殿，乾清宫改为皇帝处理日常政务的场所。",
};

export default {
  data() {
    return {
      messages: [],
      inputText: "",
      scrollId: "msg-end",
      loading: false,
    };
  },
  methods: {
    async send() {
      const question = this.inputText.trim();
      if (!question || this.loading) return;

      this.inputText = "";

      // 添加用户消息
      this.messages.push({
        role: "user",
        content: question,
      });
      this.scrollToBottom();

      this.loading = true;

      try {
        const data = await chat(question);
        const materialId = data.materialId || matchMaterialId(question);
        this.messages.push({
          role: "ai",
          content: data.answer,
          materialId,
        });
      } catch (error) {
        console.error("请求失败:", error);
        // Mock模式：接口不通时返回模拟数据
        const mockAnswer = this.getMockAnswer(question);
        const materialId = matchMaterialId(question);
        this.messages.push({
          role: "ai",
          content: mockAnswer,
          materialId: materialId,
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },

    // Mock回答（用于演示） - 使用缓存常量避免重复分配内存
    getMockAnswer(question) {
      for (const key in MOCK_ANSWERS) {
        if (question.includes(key)) {
          return MOCK_ANSWERS[key];
        }
      }
      return `这是一个很有价值的问题。${question}涉及丰富的历史文化内涵。建议您参考相关历史资料获取更详细的信息。`;
    },

    scrollToBottom() {
      this.scrollId = "msg-" + Date.now();
    },

    goToDetail(materialId) {
      uni.navigateTo({
        url: `/pages/detail/detail?materialId=${materialId}`,
      });
    },

    goToMap() {
      uni.navigateTo({
        url: "/pages/map/map",
      });
    },

    goToDevSettings() {
      uni.navigateTo({
        url: "/pages/dev-settings/dev-settings",
      });
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f4e9;
}

.header {
  background: #8b4513;
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
  position: relative;
}

.header-decoration {
  height: 2rpx;
  width: 60%;
  margin: 10rpx auto;
  background: rgba(255, 255, 255, 0.3);
}

.title {
  color: #fff;
  font-size: 38rpx;
  font-weight: bold;
  letter-spacing: 8rpx;
  display: block;
  line-height: 1.8;
}

.message-area {
  flex: 1;
  padding: 20rpx;
}

.welcome {
  text-align: center;
  padding: 50rpx 40rpx;
  background: #fff;
  border-radius: 12rpx;
  margin: 20rpx 10rpx;
  border: 1rpx solid #e8dcc8;
}

.welcome-divider {
  margin-bottom: 30rpx;
}

.welcome-title {
  font-size: 28rpx;
  color: #8b4513;
  font-weight: bold;
  position: relative;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: #3c2a1d;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.welcome-sub {
  display: block;
  font-size: 26rpx;
  color: #6b5643;
  margin-bottom: 20rpx;
}

.example-questions {
  margin: 10rpx 0 20rpx;
  text-align: left;
}

.example-item {
  display: block;
  font-size: 24rpx;
  color: #8b4513;
  padding: 8rpx 16rpx;
  margin: 8rpx 0;
  background: #f8f4e9;
  border-radius: 8rpx;
  border-left: 4rpx solid #8b4513;
}

.message-wrapper {
  margin-bottom: 24rpx;
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
  padding: 28rpx 24rpx;
  border-radius: 12rpx;
  word-wrap: break-word;
}

.message.user {
  background-color: #8b4513;
  border-bottom-right-radius: 4rpx;
}

.message.user .message-text {
  color: #fff;
}

.message.ai {
  background-color: #fff;
  border-bottom-left-radius: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(139, 69, 19, 0.15);
  border: 1rpx solid #e8dcc8;
}

.message-text {
  font-size: 30rpx;
  line-height: 1.7;
  color: #3c2a1d;
}

.loading-text {
  font-size: 28rpx;
  color: #8b4513;
  font-style: italic;
}

.view-btn {
  margin-top: 20rpx;
  padding: 14rpx 28rpx;
  background: transparent;
  color: #8b4513;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: 1rpx solid #8b4513;
  text-align: left;
  transform: translateZ(0);
  transition: all 0.2s;
}

.view-btn:active {
  transform: scale(0.96);
  background: #8b4513;
  color: #fff;
}

.input-area {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #e8dcc8;
}

.input {
  flex: 1;
  height: 80rpx;
  padding: 0 28rpx;
  background: #f8f4e9;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin-right: 20rpx;
  border: 1rpx solid #e8dcc8;
  color: #3c2a1d;
}

.input::placeholder {
  color: #a08a76;
}

.send-btn {
  width: 140rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #8b4513;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  transform: translateZ(0);
  transition:
    transform 0.2s,
    background-color 0.2s;
}

.send-btn:active:not([disabled]) {
  transform: scale(0.95);
}

.send-btn[disabled] {
  background: #c4b8a8;
  color: #f0ebe4;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 20rpx;
}

.quick-btn {
  flex: 1;
  background: #8b4513;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 26rpx;
  height: 74rpx;
  line-height: 74rpx;
}

.quick-btn.secondary {
  background: #fff;
  color: #8b4513;
  border: 1rpx solid #8b4513;
}

.scroll-bottom {
  height: 1rpx;
}

/* 快捷入口 */
.quick-actions {
  padding: 24rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #e8dcc8;
}

.quick-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: transparent;
  color: #8b4513;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: 2rpx solid #8b4513;
  transform: translateZ(0);
  transition: all 0.2s;
}

.quick-btn:active {
  transform: scale(0.98);
  background: #8b4513;
  color: #fff;
}

.welcome-hint {
  display: block;
  font-size: 24rpx;
  color: #8b4513;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e8dcc8;
}
</style>
