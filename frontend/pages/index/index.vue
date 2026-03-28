<template>
  <view class="container">
    <!-- 动态祥云背景层 -->
    <view class="cloud-background"></view>
    <!-- 顶部标题 -->
    <view class="header">
      <view class="header-decoration"></view>
      <text class="title">🏯 古建筑AI导览</text>
      <view class="header-decoration"></view>
      <!-- 清空聊天按钮 -->
      <button v-if="messages.length > 0" class="clear-btn" @click="clearChat">清空聊天</button>
    </view>

    <!-- 快捷入口 -->
    <view v-if="messages.length === 0" class="quick-actions">
      <button class="quick-btn" @click="goToMap">🗺️ 浏览古建筑名录</button>
      <button class="quick-btn secondary" @click="goToDevSettings">
        ⚙️ 开发设置
      </button>
    </view>

    <!-- 消息区域 -->
    <scroll-view 
      class="message-area" 
      scroll-y 
      :scroll-into-view="scrollId"
      :scroll-with-animation="true"
      :scroll-top="scrollTop"
      @scroll="onScroll"
    >
      <!-- 欢迎消息 -->
      <view v-if="messages.length === 0" class="welcome">
        <view class="welcome-divider">
          <text class="welcome-title">欢迎使用</text>
        </view>
        <text class="welcome-text">您好！我是您的古建筑导览助手</text>
        <text class="welcome-sub">可以问我关于古建筑的问题</text>
        <text class="welcome-hint">💡 或点击下方示例问题快速开始</text>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, index) in messages"
        :key="msg.id"
        :id="'msg-' + index"
        class="message-wrapper"
        :class="msg.role"
      >
        <view class="message" :class="msg.role">
          <text class="message-text">
            {{ msg.displayContent || msg.content }}
            <text v-if="msg.isTyping" class="cursor">|</text>
          </text>
          <button
            v-if="msg.materialId && !msg.isTyping"
            class="view-btn"
            @click="goToDetail(msg.materialId)"
          >
            查看实景资料 →
          </button>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading && !hasPendingAiMessage" class="message-wrapper ai">
        <view class="message ai loading-msg">
          <view class="loading-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
          <text class="loading-text">正在思考中</text>
        </view>
      </view>

      <!-- 错误重试提示 -->
      <view v-if="lastError" class="error-retry">
        <text class="error-text">{{ lastError }}</text>
        <button class="retry-btn" @click="retryLastQuestion">重新发送</button>
      </view>

      <view class="scroll-bottom"></view>
    </scroll-view>

    <!-- 示例问题区域（永久显示） -->
    <view class="example-questions-area">
      <text class="example-title">常见问题：</text>
      <view class="example-list">
        <text 
          v-for="(q, idx) in exampleQuestions" 
          :key="idx" 
          class="example-tag"
          @click="quickQuestion(q)"
        >{{ q }}</text>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-area" :class="{ 'keyboard-active': keyboardHeight > 0 }">
      <input
        v-model="inputText"
        class="input"
        placeholder="请输入问题..."
        confirm-type="send"
        :disabled="isSending"
        @confirm="handleSend"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
      <button
        class="send-btn"
        :disabled="!canSend || isSending"
        :class="{ 'sending': isSending }"
        @click="handleSend"
      >
        {{ isSending ? '发送中' : '发送' }}
      </button>
    </view>
  </view>
</template>

<script>
import { chat } from "../../services/api";

// 缓存键
const CACHE_KEY = "CHAT_HISTORY";
// 最大缓存条数
const MAX_HISTORY_LENGTH = 15;

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

// 示例问题
const EXAMPLE_QUESTIONS = [
  "太和殿的历史是什么？",
  "赵州桥的建筑特色？",
  "拙政园的造园手法？",
  "故宫的布局特点？"
];

// 根据问题匹配materialId
function matchMaterialId(question) {
  for (const keyword in KEYWORD_MAPPING) {
    if (question.includes(keyword)) {
      return KEYWORD_MAPPING[keyword];
    }
  }
  return null;
}

// 缓存mock回答
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
      scrollId: "",
      scrollTop: 0,
      loading: false,
      isSending: false,
      keyboardHeight: 0,
      lastError: "",
      lastQuestion: "",
      typingTimer: null,
      exampleQuestions: EXAMPLE_QUESTIONS
    };
  },

  computed: {
    canSend() {
      return this.inputText.trim().length > 0;
    },
    hasPendingAiMessage() {
      return this.messages.some(m => m.isTyping);
    }
  },

  onLoad() {
    this.loadHistory();
  },

  onUnload() {
    this.clearTypingTimer();
  },

  onHide() {
    this.saveHistory();
  },

  methods: {
    // 加载历史记录
    loadHistory() {
      try {
        const cached = uni.getStorageSync(CACHE_KEY);
        if (cached && Array.isArray(cached)) {
          // 只加载最近的15条记录
          const filtered = cached.filter(m => !m.isTyping);
          this.messages = filtered.slice(-MAX_HISTORY_LENGTH);
        }
      } catch (e) {
        console.warn("加载聊天历史失败:", e);
      }
    },

    // 保存历史记录
    saveHistory() {
      try {
        const historyToSave = this.messages.filter(m => !m.isTyping);
        // 只保存最近的15条记录
        const trimmedHistory = historyToSave.slice(-MAX_HISTORY_LENGTH);
        uni.setStorageSync(CACHE_KEY, trimmedHistory);
      } catch (e) {
        console.warn("保存聊天历史失败:", e);
      }
    },

    // 清空聊天记录
    clearChat() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有聊天记录吗？',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.lastError = '';
            this.saveHistory();
          }
        }
      });
    },

    // 裁剪消息列表，保持最多15条
    trimMessages() {
      if (this.messages.length > MAX_HISTORY_LENGTH) {
        // 删除最旧的消息
        const removeCount = this.messages.length - MAX_HISTORY_LENGTH;
        this.messages.splice(0, removeCount);
      }
    },

    // 快速问题
    quickQuestion(question) {
      this.inputText = question;
      this.handleSend();
    },

    // 处理发送（带防重复）
    handleSend() {
      if (this.isSending) return;
      if (!this.canSend) return;
      
      this.send();
    },

    async send() {
      const question = this.inputText.trim();
      if (!question) return;

      this.inputText = "";
      this.lastError = "";
      this.lastQuestion = question;

      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        role: "user",
        content: question,
        displayContent: question,
        isTyping: false
      };
      this.messages.push(userMsg);
      // 限制消息数量，超过15条则删除最旧的
      this.trimMessages();
      this.scrollToBottom();
      this.saveHistory();

      this.loading = true;
      this.isSending = true;

      try {
        const data = await chat(question);
        const materialId = data.materialId || matchMaterialId(question);
        
        // 添加AI消息
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          content: data.answer,
          displayContent: "",
          materialId,
          isTyping: true
        };
        this.messages.push(aiMsg);
        // 限制消息数量，超过15条则删除最旧的
        this.trimMessages();
        this.scrollToBottom();
        
        // 开始打字机效果
        this.startTypingEffect(this.messages.length - 1);
        
      } catch (error) {
        console.error("请求失败:", error);
        this.lastError = error.message || "网络异常，请稍后重试";
        
        // Mock模式：接口不通时返回模拟数据
        const mockAnswer = this.getMockAnswer(question);
        const materialId = matchMaterialId(question);
        
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          content: mockAnswer,
          displayContent: "",
          materialId,
          isTyping: true
        };
        this.messages.push(aiMsg);
        // 限制消息数量，超过15条则删除最旧的
        this.trimMessages();
        this.scrollToBottom();
        
        this.startTypingEffect(this.messages.length - 1);
        
      } finally {
        this.loading = false;
        this.isSending = false;
      }
    },

    // 打字机效果（优化版）
    startTypingEffect(msgIndex) {
      const msg = this.messages[msgIndex];
      if (!msg) return;
      
      const fullText = msg.content;
      let index = 0;
      const speed = 50; // 稍微放慢一点，更流畅

      this.clearTypingTimer();

      const typeNext = () => {
        if (index < fullText.length) {
          // 批量更新，每5个字符更新一次，减少渲染压力
          const batchSize = Math.min(3, fullText.length - index);
          index += batchSize;
          
          // 使用 Vue 的响应式更新方式
          this.$set(this.messages[msgIndex], 'displayContent', fullText.slice(0, index));
          
          // 只在需要时滚动到底部
          if (index % 10 === 0 || index >= fullText.length) {
            this.scrollToBottom();
          }
          
          this.typingTimer = setTimeout(typeNext, speed);
        } else {
          // 完成打字
          this.$set(this.messages[msgIndex], 'isTyping', false);
          this.$set(this.messages[msgIndex], 'displayContent', fullText);
          this.scrollToBottom();
          this.saveHistory();
        }
      };

      // 立即开始
      typeNext();
    },

    clearTypingTimer() {
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
        this.typingTimer = null;
      }
    },

    // 重试上次问题
    retryLastQuestion() {
      if (this.lastQuestion && !this.isSending) {
        this.lastError = "";
        this.inputText = this.lastQuestion;
        this.send();
      }
    },

    // Mock回答
    getMockAnswer(question) {
      for (const key in MOCK_ANSWERS) {
        if (question.includes(key)) {
          return MOCK_ANSWERS[key];
        }
      }
      return `这是一个很有价值的问题。${question}涉及丰富的历史文化内涵。建议您参考相关历史资料获取更详细的信息。`;
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          this.scrollId = "msg-" + (this.messages.length - 1);
        }
      });
    },

    onScroll(e) {
      this.scrollTop = e.detail.scrollTop;
    },

    // 键盘聚焦
    onInputFocus() {
      // 键盘弹起时，延迟调整滚动
      setTimeout(() => {
        this.scrollToBottom();
      }, 300);
    },

    onInputBlur() {
      this.keyboardHeight = 0;
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

<style scoped>
/* 动态祥云背景层 */
.cloud-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='%238b4513' d='M400,100 Q300,50 200,100 Q100,150 200,200 Q300,250 400,200 Q500,150 600,200 Q700,250 600,100 Q500,50 400,100'/%3E%3C/svg%3E");
  background-size: 400rpx 400rpx;
  background-repeat: repeat;
  opacity: 0.06;
  animation: cloudMove 30s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes cloudMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 800rpx 400rpx;
  }
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #faf6ed;
  position: relative;
}

.header {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 50%, #a81c07 100%);
  padding: 30rpx 30rpx 40rpx;
  text-align: center;
  position: relative;
  z-index: 1;
}

.header-decoration {
  height: 2rpx;
  width: 60%;
  margin: 10rpx auto;
  background: rgba(255, 248, 230, 0.4);
}

.title {
  color: #fff8e6;
  font-size: 38rpx;
  font-weight: bold;
  letter-spacing: 8rpx;
  display: block;
  line-height: 1.8;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 清空聊天按钮 */
.clear-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%) translateY(0);
  padding: 10rpx 24rpx;
  background: rgba(255, 248, 230, 0.15);
  color: #fff8e6;
  font-size: 24rpx;
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 248, 230, 0.4);
  line-height: 1.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.clear-btn:hover {
  transform: translateY(-50%) translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  background: rgba(255, 248, 230, 0.25);
}

.clear-btn:active {
  transform: translateY(-50%) translateY(-1px) scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.message-area {
  flex: 1;
  padding: 20rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.welcome {
  text-align: center;
  padding: 50rpx 40rpx;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 12rpx;
  margin: 20rpx 10rpx;
  border: 1rpx solid #e8d8c8;
  position: relative;
  z-index: 1;
}

.welcome-divider {
  margin-bottom: 30rpx;
}

.welcome-title {
  font-size: 28rpx;
  color: #c82506;
  font-weight: bold;
  position: relative;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: #2d2d2d;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.welcome-sub {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.welcome-hint {
  display: block;
  font-size: 24rpx;
  color: #c82506;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #e8d8c8;
}

/* 示例问题区域（永久显示） */
.example-questions-area {
  padding: 16rpx 20rpx;
  background: linear-gradient(180deg, #faf6ed 0%, #f7f1e6 100%);
  border-top: 1rpx solid #e8d8c8;
  border-bottom: 1rpx solid #e8d8c8;
  position: relative;
  z-index: 1;
}

.example-title {
  display: block;
  font-size: 24rpx;
  color: #c82506;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.example-tag {
  display: inline-block;
  padding: 10rpx 20rpx;
  background: #fff8d8;
  border: 1rpx solid #e8b860;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #c82506;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  transform: translateZ(0) translateY(0);
}

.example-tag:hover {
  background: #f5d56a;
  color: #a81c07;
  transform: translateY(-2px);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.12);
}

.example-tag:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 1rpx 4rpx rgba(200, 37, 6, 0.08);
}

.message-wrapper {
  margin-bottom: 24rpx;
  display: flex;
  animation: messageFadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes messageFadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.ai {
  justify-content: flex-start;
}

.message {
  max-width: 75%;
  padding: 28rpx 24rpx;
  border-radius: 12rpx;
  word-wrap: break-word;
  position: relative;
}

/* 用户消息 - 故宫朱红 */
.message.user {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-bottom-right-radius: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.3);
}

.message.user .message-text {
  color: #fff8e6;
}

/* AI消息 - 青瓦灰 */
.message.ai {
  background: linear-gradient(135deg, #e8e8ee 0%, #d8d8de 100%);
  border-bottom-left-radius: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(140, 146, 172, 0.2);
  border: 1rpx solid #c0c0cc;
}

.message-text {
  font-size: 30rpx;
  line-height: 1.8;
  color: #2d2d2d;
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  display: inline-block;
  animation: blink 0.8s infinite;
  font-weight: bold;
  margin-left: 2rpx;
  color: #c82506;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 加载动画 */
.loading-msg {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #c82506;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 28rpx;
  color: #8c92ac;
  font-style: italic;
}

.view-btn {
  margin-top: 20rpx;
  padding: 14rpx 28rpx;
  background: transparent;
  color: #c82506;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: 1rpx solid #c82506;
  text-align: left;
  transform: translateZ(0) translateY(0);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.view-btn:hover {
  background: #c82506;
  color: #fff8e6;
  transform: translateY(-2px);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.2);
}

.view-btn:active {
  transform: translateY(0) scale(0.96);
  box-shadow: 0 1rpx 4rpx rgba(200, 37, 6, 0.15);
}

.input-area {
  display: flex;
  padding: 20rpx;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  border-top: 1rpx solid #e8d8c8;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.keyboard-active {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.input {
  flex: 1;
  height: 80rpx;
  padding: 0 28rpx;
  background: #fffef9;
  border-radius: 40rpx;
  font-size: 30rpx;
  margin-right: 20rpx;
  border: 1rpx solid #d8c8b8;
  color: #2d2d2d;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #c82506;
}

.input::placeholder {
  color: #999;
}

.send-btn {
  width: 140rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  color: #fff8e6;
  font-size: 30rpx;
  border-radius: 40rpx;
  border: none;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.35);
  cursor: pointer;
}

.send-btn:hover:not([disabled]) {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.45);
}

.send-btn:active:not([disabled]) {
  transform: translateY(-1px) scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.3);
}

.send-btn[disabled] {
  background: linear-gradient(135deg, #c8c8c8 0%, #b0b0b0 100%);
  color: #e8e8e8;
  box-shadow: none;
  cursor: not-allowed;
}

.send-btn.sending {
  opacity: 0.9;
}

.quick-actions {
  padding: 24rpx 30rpx;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  border-bottom: 1rpx solid #e8d8c8;
  display: flex;
  gap: 16rpx;
  position: relative;
  z-index: 1;
}

.quick-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: transparent;
  color: #8c92ac;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: 2rpx solid #8c92ac;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.quick-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(140, 146, 172, 0.25);
}

.quick-btn:active {
  transform: translateY(-1px) scale(0.97);
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  color: #fff8e6;
  border-color: #c82506;
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.25);
}

.quick-btn.secondary {
  background: #fffef9;
  color: #c82506;
  border: 1rpx solid #e8b860;
}

.quick-btn.secondary:hover {
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.2);
}

.quick-btn.secondary:active {
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.2);
}

.scroll-bottom {
  height: 1rpx;
}

/* 错误重试 */
.error-retry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%);
  border: 1rpx solid #e8a0a0;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin: 20rpx 10rpx;
  position: relative;
  z-index: 1;
}

.error-text {
  flex: 1;
  font-size: 26rpx;
  color: #a81c07;
  margin-right: 16rpx;
}

.retry-btn {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  color: #fff8e6;
  font-size: 24rpx;
  border-radius: 30rpx;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.25);
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.35);
}

.retry-btn:active {
  transform: translateY(-1px) scale(0.97);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.25);
}
</style>
