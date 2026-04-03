<template>
  <view class="container page-enter">
    <!-- 动态祥云背景层 -->
    <view class="cloud-background"></view>

    <!-- 侧边栏及遮罩组件 -->
    <ChatSidebar
      :showSidebar="showSidebar"
      :sessionList="sessionList"
      :currentSessionId="currentSessionId"
      @toggle-sidebar="toggleSidebar"
      @create-new="createNewChat"
      @switch-session="switchSession"
      @delete-session="deleteSession"
    />
    
    <!-- 顶部标题 -->
    <view class="header">
      <!-- 侧边栏切换按钮 -->
      <view class="sidebar-toggle" @click="toggleSidebar">
        <text class="toggle-icon">☰</text>
      </view>

      <!-- 搜索模式下的返回按钮 -->
      <view v-if="showSearch" class="sidebar-toggle" @click="closeSearch">
        <text class="toggle-icon">←</text>
      </view>

      <!-- 标题或搜索框 -->
      <view v-if="!showSearch" class="header-center">
        <view class="header-decoration"></view>
        <text class="title">🏯 古建筑AI导览</text>
        <view class="header-decoration"></view>
      </view>

      <!-- 搜索输入框 -->
      <view v-else class="header-search">
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索历史消息..."
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="performSearch"
          @input="onSearchInput"
          focus
        />
        <view v-if="searchQuery" class="search-clear" @click="clearSearch">
          <text class="clear-icon">×</text>
        </view>
      </view>

      <!-- 搜索按钮 / 清空按钮 -->
      <button v-if="!showSearch && messages.length > 0" class="clear-btn" @click="openSearch">🔍</button>
      <button v-else-if="showSearch" class="clear-btn" @click="performSearch">搜索</button>
    </view>

    <!-- 快捷入口 -->
    <view v-if="messages.length === 0" class="quick-actions">
      <button class="quick-btn" @click="goToMap">🗺️ 浏览古建筑名录</button>
      <button class="quick-btn secondary" @click="goToDevSettings">
        ⚙️ 开发设置
      </button>
    </view>

    <!-- 搜索结果面板组件 -->
    <SearchResults
      :showSearch="showSearch"
      :searchResults="searchResults"
      :searchQuery="searchQuery"
      @close-search="closeSearch"
      @jump-to-message="jumpToMessage"
    />

    <!-- 消息区域 -->
    <view
      class="message-area"
      :class="{ 'with-search-results': showSearch && searchResults.length > 0 }"
    >
      <!-- 全新欢迎页设计组件 -->
      <WelcomeHero v-if="messages.length === 0" :welcomeFeatures="welcomeFeatures" />

      <!-- 使用虚拟列表渲染消息 -->
      <virtual-message-list
        v-else
        ref="messageList"
        :messages="messages"
        :container-height="messageAreaHeight"
        :item-height="120"
        :buffer-size="3"
        @go-to-detail="goToDetail"
        @regenerate="regenerateResponse"
      />

      <!-- 加载状态 -->
      <view v-if="loading && !hasPendingAiMessage" class="message-wrapper ai loading-wrapper">
        <view class="avatar ai-avatar">
          <text class="avatar-icon">🏯</text>
        </view>
        <view class="message-content">
          <view class="message-header">
            <text class="message-sender">古建筑助手</text>
          </view>
          <view class="message ai loading-msg">
            <view class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
            <text class="loading-text">{{ loadingTips }}</text>
          </view>
        </view>
      </view>

      <!-- 错误重试提示 -->
      <view v-if="lastError" class="error-retry">
        <text class="error-text">{{ lastError }}</text>
        <button class="retry-btn" @click="retryLastQuestion">重新发送</button>
      </view>
    </view>

    <!-- 输入区域组件 -->
    <ChatInputArea
      :inputText="inputText"
      :isSending="isSending"
      :loading="loading"
      :hasPendingAiMessage="hasPendingAiMessage"
      :keyboardHeight="keyboardHeight"
      :canSend="canSend"
      :exampleQuestions="exampleQuestions"
      @update:inputText="inputText = $event"
      @quick-question="quickQuestion"
      @send="handleSend"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @linechange="onLineChange"
    />
  </view>
</template>

<script>
import { chat } from "../../services/api";
import { parseMarkdown, renderToHtml, containsMarkdown } from "../../utils/markdown.js";
import VirtualMessageList from "../../components/VirtualMessageList.vue";
import ChatSidebar from "../../components/chat/ChatSidebar.vue";
import WelcomeHero from "../../components/chat/WelcomeHero.vue";
import SearchResults from "../../components/chat/SearchResults.vue";
import ChatInputArea from "../../components/chat/ChatInputArea.vue";

// 缓存键
const CACHE_KEY = "CHAT_HISTORY";
// 最大缓存条数
const MAX_HISTORY_LENGTH = 15;

// 后端返回materialId后优先使用，仅作为降级兜底保留关键词映射
const KEYWORD_MAPPING = {
  // 皇宫 (palace.json)
  太和殿: "taihe_dian", 乾清宫: "qiankun_gong", 中和殿: "zhonghe_dian", 保和殿: "baohe_dian", 养心殿: "yangxin_dian",
  御花园: "yuhua_yuan", 午门: "wumen", 天安门: "tiananmen", 故宫: "taihe_dian", 紫禁城: "taihe_dian",
  沈阳故宫: "dazheng_dian", 大政殿: "dazheng_dian", 沈阳故宫大政殿: "dazheng_dian", 布达拉宫: "potala_palace",
  佛光寺: "foguang_temple", 佛光寺东大殿: "foguang_temple", 南禅寺: "nanchan_temple", 南禅寺大殿: "nanchan_temple", 天坛: "temple_of_heaven",
  // 桥梁 (bridge.json)
  赵州桥: "zhaozhou_bridge", 卢沟桥: "lugou_bridge", 广济桥: "guangji_bridge", 洛阳桥: "luoyang_bridge", 安平桥: "anping_bridge",
  // 园林 (garden.json)
  拙政园: "zhuozheng_garden", 颐和园: "yihe_yuan", 留园: "liu_yuan", 承德避暑山庄: "bishu_shanzhuang", 避暑山庄: "bishu_shanzhuang",
  苏州园林: "zhuozheng_garden", 狮子林: "shizi_lin", 沧浪亭: "canglang_ting", 网师园: "wangshi_yuan", 环秀山庄: "huanxiu_shanzhuang",
  // 城防 (defense.json)
  西安城墙: "xian_wall", 南京城墙: "nanjing_wall", 平遥古城: "pingyao_city", 丽江古城: "lijiang_city", 凤凰古城: "fenghuang_city",
  // 民居 (residence.json)
  福建土楼: "fujian_tulou", 土楼: "fujian_tulou", 乔家大院: "qiaojia_dayuan", 王家大院: "wangjia_dayuan", 四合院: "siheyuan",
  北京四合院: "siheyuan", 徽派建筑: "huizhou_house", 宏村: "hongcun", 西递: "xidi", 窑洞: "yaodong", 吊脚楼: "diaojiaolou",
  // 楼阁 (tower.json)
  岳阳楼: "yueyang_tower", 黄鹤楼: "huanghe_tower", 滕王阁: "tengwang_ge", 孔庙: "qufu_kongmiao", 曲阜孔庙: "qufu_kongmiao",
  应县木塔: "yingxian_muta", 佛宫寺释迦塔: "yingxian_muta", 嵩岳寺塔: "songyue_tower",
  // 水利 (water.json)
  都江堰: "dujiangyan", 坎儿井: "kanerjing", 京杭大运河: "grand_canal", 大运河: "grand_canal", 灵渠: "lingqu",
};

// 加载提示语
const LOADING_TIPS = [
  "正在查阅古籍资料...", "正在梳理建筑历史...", "正在分析建筑特色...", "正在整理文化背景...",
  "正在为您准备答案...", "正在穿越时空...", "正在解读千年智慧..."
];

// 示例问题
const EXAMPLE_QUESTIONS = [
  "太和殿的历史是什么？", "赵州桥的建筑特色？", "拙政园的造园手法？", "故宫的布局特点？"
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
  太和殿: "## 太和殿简介\n\n**太和殿**建成于明永乐十八年（1420年），是故宫*规模最大、等级最高*的建筑。\n\n### 主要特点\n\n- 殿高**35.05米**，建筑面积**2377平方米**\n- 采用重檐庑殿顶，是中国现存最大的木结构大殿\n- 用于举行皇帝登基、大婚等重大典礼\n\n> 太和殿俗称金銮殿，位于紫禁城南北主轴线的显要位置\n\n想了解更多可以`查看实景资料`或访问详情页面。",
  乾清宫: "## 乾清宫\n\n**乾清宫**是明清皇帝的寝宫，建于明永乐十八年。\n\n### 历史变迁\n\n1. **明代**：皇帝寝宫\n2. **清代雍正前**：皇帝寝宫\n3. **清代雍正后**：改为处理政务的场所\n\n> 乾清宫与交泰殿、坤宁宫合称后三宫\n\n皇帝移居**养心殿**后，乾清宫的功能发生了重要变化。",
};

export default {
  components: {
    VirtualMessageList,
    ChatSidebar,
    WelcomeHero,
    SearchResults,
    ChatInputArea
  },
  
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
      exampleQuestions: EXAMPLE_QUESTIONS,
      loadingTips: "正在思考中...",
      loadingTipTimer: null,
      welcomeFeatures: [
        { icon: '📚', title: '知识问答', desc: '解答古建筑历史、结构、文化等各类问题' },
        { icon: '🗺️', title: '实景导览', desc: '一键跳转查看古建筑详细资料与实景图片' },
        { icon: '✨', title: '智能推荐', desc: '根据您的兴趣推荐相关古建筑知识' }
      ],
      // 侧边栏相关
      showSidebar: false,
      sessionList: [],
      currentSessionId: null,
      // 搜索相关
      showSearch: false,
      searchQuery: "",
      searchResults: [],
      isSearching: false,
      highlightedMessageId: null,
      // 响应式设计
      messageAreaHeight: 600,
      windowHeight: 0,
      windowWidth: 0,
      isMobile: false
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
    this.loadSessionList();
    if (!this.currentSessionId) {
      this.createNewSession();
    }
    this.initResponsiveDesign();
    uni.onWindowResize(this.handleWindowResize);
  },

  onUnload() {
    uni.offWindowResize(this.handleWindowResize);
  },

  onHide() {
    this.saveHistory();
    this.saveSessionList();
  },

  methods: {
    getSessionCacheKey(sessionId) {
      return 'CHAT_HISTORY_' + (sessionId || this.currentSessionId);
    },

    loadHistory() {
      try {
        const cacheKey = this.getSessionCacheKey();
        const cached = uni.getStorageSync(cacheKey);
        if (cached && Array.isArray(cached)) {
          this.messages = cached.filter(m => !m.isTyping);
        }
      } catch (e) {
        console.warn("加载聊天历史失败:", e);
      }
    },

    saveHistory() {
      try {
        const historyToSave = this.messages.filter(m => !m.isTyping);
        const cacheKey = this.getSessionCacheKey();
        uni.setStorageSync(cacheKey, historyToSave);
        this.updateCurrentSession();
      } catch (e) {
        console.warn("保存聊天历史失败:", e);
      }
    },

    loadSessionList() {
      try {
        const cached = uni.getStorageSync('CHAT_SESSIONS');
        if (cached && Array.isArray(cached)) {
          this.sessionList = cached;
        }
        const currentId = uni.getStorageSync('CURRENT_SESSION_ID');
        if (currentId) {
          this.currentSessionId = currentId;
        }
      } catch (e) {
        console.warn("加载会话列表失败:", e);
      }
    },

    saveSessionList() {
      try {
        uni.setStorageSync('CHAT_SESSIONS', this.sessionList);
        uni.setStorageSync('CURRENT_SESSION_ID', this.currentSessionId);
      } catch (e) {
        console.warn("保存会话列表失败:", e);
      }
    },

    createNewSession() {
      const newSession = {
        id: 'session_' + Date.now(),
        title: '新对话 ' + (this.sessionList.length + 1),
        time: Date.now(),
        messageCount: 0
      };
      this.sessionList.unshift(newSession);
      this.currentSessionId = newSession.id;
      this.messages = [];
      this.saveSessionList();
    },

    updateCurrentSession() {
      const session = this.sessionList.find(s => s.id === this.currentSessionId);
      if (session) {
        session.messageCount = this.messages.length;
        session.time = Date.now();
        const firstUserMsg = this.messages.find(m => m.role === 'user');
        if (firstUserMsg && session.title.startsWith('新对话')) {
          session.title = firstUserMsg.content.slice(0, 15) + (firstUserMsg.content.length > 15 ? '...' : '');
        }
        this.saveSessionList();
      }
    },

    switchSession(sessionId) {
      if (sessionId === this.currentSessionId) {
        this.showSidebar = false;
        return;
      }
      this.saveHistory();
      this.currentSessionId = sessionId;
      this.saveSessionList();
      const cacheKey = this.getSessionCacheKey(sessionId);
      try {
        const cached = uni.getStorageSync(cacheKey);
        if (cached && Array.isArray(cached)) {
          this.messages = cached.filter(m => !m.isTyping);
        } else {
          this.messages = [];
        }
      } catch (e) {
        this.messages = [];
      }
      this.showSidebar = false;
      this.scrollToBottom();
    },

    deleteSession(sessionId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个会话吗？',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            const index = this.sessionList.findIndex(s => s.id === sessionId);
            if (index > -1) {
              const cacheKey = this.getSessionCacheKey(sessionId);
              uni.removeStorageSync(cacheKey);
              this.sessionList.splice(index, 1);
              if (this.currentSessionId === sessionId) {
                if (this.sessionList.length > 0) {
                  this.switchSession(this.sessionList[0].id);
                } else {
                  this.createNewSession();
                }
              }
              this.saveSessionList();
            }
          }
        }
      });
    },

    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },

    createNewChat() {
      this.createNewSession();
      this.showSidebar = false;
    },

    openSearch() {
      this.showSearch = true;
      this.searchQuery = "";
      this.searchResults = [];
    },

    closeSearch() {
      this.showSearch = false;
      this.searchQuery = "";
      this.searchResults = [];
      this.isSearching = false;
    },

    onSearchInput(e) {
      this.searchQuery = e.detail.value;
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        this.isSearching = false;
      }
    },

    clearSearch() {
      this.searchQuery = "";
      this.searchResults = [];
      this.isSearching = false;
    },

    performSearch() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        this.searchResults = [];
        this.isSearching = false;
        return;
      }
      this.isSearching = true;
      const results = this.messages.filter(msg => {
        const content = (msg.content || "").toLowerCase();
        return content.includes(query);
      });
      this.searchResults = results;
      if (results.length > 0) {
        uni.showToast({
          title: `找到 ${results.length} 条结果`,
          icon: 'none',
          duration: 2000
        });
      } else {
        uni.showToast({
          title: '未找到相关消息',
          icon: 'none',
          duration: 2000
        });
      }
    },

    jumpToMessage(messageId) {
      const index = this.messages.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        this.scrollId = '';
        setTimeout(() => {
          this.scrollId = 'msg-' + index;
        }, 100);
        this.highlightedMessageId = messageId;
        setTimeout(() => {
          this.highlightedMessageId = null;
        }, 3000);
      }
    },

    quickQuestion(question) {
      this.inputText = question;
      this.handleSend();
    },

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

      const userMsg = {
        id: Date.now(),
        role: "user",
        content: question,
        displayContent: question,
        isTyping: false
      };
      this.messages.push(userMsg);
      this.scrollToBottom();
      this.saveHistory();

      this.loading = true;
      this.isSending = true;
      this.startLoadingTips();

      try {
        const data = await chat(question);
        const materialId = data.materialId || (data.matchedEntity && data.matchedEntity.id) || matchMaterialId(question);
        
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          content: data.answer,
          displayContent: "",
          materialId,
          entities: Array.isArray(data.entities) ? data.entities : [],
          entityDecision: data.entityDecision || null,
          isTyping: true
        };
        this.messages.push(aiMsg);
        this.scrollToBottom();
        this.startTypingEffect(this.messages.length - 1);
      } catch (error) {
        console.error("请求失败:", error);
        this.lastError = error.message || "网络异常，请稍后重试";
        
        const mockAnswer = this.getMockAnswer(question);
        const materialId = matchMaterialId(question);
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          content: mockAnswer,
          displayContent: "",
          materialId,
          entities: [],
          entityDecision: null,
          isTyping: true
        };
        this.messages.push(aiMsg);
        this.scrollToBottom();
        this.startTypingEffect(this.messages.length - 1);
      } finally {
        this.loading = false;
        this.isSending = false;
        this.stopLoadingTips();
      }
    },

    startTypingEffect(msgIndex) {
      const msg = this.messages[msgIndex];
      if (!msg) return;
      
      const fullText = msg.content;
      let index = 0;
      const speed = 50;

      this.clearTypingTimer();

      let lastScrollTime = 0;
      const scrollInterval = 300;
      
      const typeNext = () => {
        if (index < fullText.length) {
          const batchSize = Math.min(3, fullText.length - index);
          index += batchSize;
          this.$set(this.messages[msgIndex], 'displayContent', fullText.slice(0, index));
          
          const now = Date.now();
          if (now - lastScrollTime > scrollInterval) {
            this.scrollToBottom();
            lastScrollTime = now;
          }
          this.typingTimer = setTimeout(typeNext, speed);
        } else {
          this.$set(this.messages[msgIndex], 'isTyping', false);
          this.$set(this.messages[msgIndex], 'displayContent', fullText);
          this.scrollToBottom();
          this.saveHistory();
        }
      };

      typeNext();
    },

    clearTypingTimer() {
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
        this.typingTimer = null;
      }
    },

    startLoadingTips() {
      this.loadingTips = LOADING_TIPS[0];
      let index = 1;
      this.loadingTipTimer = setInterval(() => {
        this.loadingTips = LOADING_TIPS[index % LOADING_TIPS.length];
        index++;
      }, 2000);
    },

    stopLoadingTips() {
      if (this.loadingTipTimer) {
        clearInterval(this.loadingTipTimer);
        this.loadingTipTimer = null;
      }
      this.loadingTips = "正在思考中...";
    },

    retryLastQuestion() {
      if (this.lastQuestion && !this.isSending) {
        this.lastError = "";
        this.inputText = this.lastQuestion;
        this.send();
      }
    },

    getMockAnswer(question) {
      for (const key in MOCK_ANSWERS) {
        if (question.includes(key)) {
          return MOCK_ANSWERS[key];
        }
      }
      return `这是一个很有价值的问题。${question}涉及丰富的历史文化内涵。建议您参考相关历史资料获取更详细的信息。`;
    },

    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          if (this.$refs.messageList) {
            this.$refs.messageList.scrollToBottom();
          } else {
            const lastIndex = this.messages.length - 1;
            this.scrollId = '';
            setTimeout(() => {
              this.scrollId = 'msg-' + lastIndex;
            }, 50);
          }
        }
      });
    },

    async regenerateResponse(index) {
      let userIndex = index - 1;
      while (userIndex >= 0 && this.messages[userIndex].role !== 'user') {
        userIndex--;
      }
      if (userIndex < 0) return;
      
      const userQuestion = this.messages[userIndex].content;
      this.messages.splice(index, 1);
      this.saveHistory();
      this.inputText = userQuestion;
      await this.send();
    },

    initResponsiveDesign() {
      const systemInfo = uni.getSystemInfoSync();
      this.windowHeight = systemInfo.windowHeight;
      this.windowWidth = systemInfo.windowWidth;
      this.isMobile = systemInfo.windowWidth < 768;
      this.calculateMessageAreaHeight();
    },

    handleWindowResize(res) {
      this.windowHeight = res.size.windowHeight;
      this.windowWidth = res.size.windowWidth;
      this.isMobile = res.size.windowWidth < 768;
      this.calculateMessageAreaHeight();
    },

    calculateMessageAreaHeight() {
      const headerHeight = 100;
      const inputAreaHeight = this.keyboardHeight > 0 ? this.keyboardHeight + 60 : 180;
      const exampleAreaHeight = 120;
      const padding = 40;
      const rpxToPx = this.windowWidth / 750;
      const totalRpxHeight = headerHeight + inputAreaHeight + exampleAreaHeight + padding;
      const totalPxHeight = totalRpxHeight * rpxToPx;
      this.messageAreaHeight = Math.max(300, this.windowHeight - totalPxHeight);
    },

    onInputFocus(e) {
      if (e && e.detail && e.detail.height) {
        this.keyboardHeight = e.detail.height;
      } else {
        this.keyboardHeight = 300;
      }
      this.calculateMessageAreaHeight();
      setTimeout(() => {
        this.scrollToBottom();
      }, 300);
    },

    onInputBlur() {
      this.keyboardHeight = 0;
      this.calculateMessageAreaHeight();
    },

    onLineChange(e) {
      const lineCount = e && e.detail ? e.detail.lineCount : 1;
      if (lineCount > 1) {
        this.$nextTick(() => {
          this.calculateMessageAreaHeight();
        });
      }
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
    }
  }
};
</script>

<style scoped>
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
  0% { background-position: 0 0; }
  100% { background-position: 800rpx 400rpx; }
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
  padding: 30rpx 20rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 248, 230, 0.2);
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
  margin: 0 16rpx;
  border: 1rpx solid rgba(255, 248, 230, 0.3);
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #fff8e6;
  background: transparent;
  border: none;
  outline: none;
}

.search-placeholder {
  color: rgba(255, 248, 230, 0.6);
}

.search-clear {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 230, 0.3);
  border-radius: 50%;
  margin-left: 12rpx;
}

.sidebar-toggle {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 230, 0.15);
  border-radius: 50%;
  border: 1rpx solid rgba(255, 248, 230, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: rgba(255, 248, 230, 0.3);
  transform: scale(1.05);
}

.sidebar-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 32rpx;
  color: #fff8e6;
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20rpx;
}

.header-decoration {
  height: 2rpx;
  width: 60%;
  margin: 8rpx auto;
  background: rgba(255, 248, 230, 0.4);
}

.title {
  color: #fff8e6;
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 6rpx;
  line-height: 1.6;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.clear-btn {
  padding: 10rpx 20rpx;
  background: rgba(255, 248, 230, 0.15);
  color: #fff8e6;
  font-size: 24rpx;
  border-radius: 30rpx;
  border: 1rpx solid rgba(255, 248, 230, 0.4);
  line-height: 1.4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(255, 248, 230, 0.3);
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.clear-btn:active {
  transform: translateY(0) scale(0.97);
}

.message-area {
  flex: 1;
  padding: 20rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.message-area.with-search-results {
  margin-top: 520rpx;
}

@media (min-width: 768px) {
  .container {
    max-width: 900px;
    margin: 0 auto;
  }
  .title {
    font-size: 42rpx;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1100px;
  }
}

@media (max-width: 375px) {
  .title {
    font-size: 30rpx;
    letter-spacing: 4rpx;
  }
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
  border: 1rpx solid var(--warning);
}

.quick-btn.secondary:hover {
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.2);
}

.quick-btn.secondary:active {
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.2);
}

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

/* 加载动画 - 优化版 */
.loading-wrapper {
  margin-top: 20rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: flex-start;
  opacity: 0.9;
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

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.ai-avatar {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  margin-right: 16rpx;
}

.avatar-icon {
  font-size: 36rpx;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  padding: 0 8rpx;
}

.message-sender {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.loading-msg {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border: 1rpx solid var(--bg-tertiary);
  border-radius: 16rpx;
  border-bottom-left-radius: 4rpx;
}

.loading-dots {
  display: flex;
  gap: 10rpx;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
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
  color: var(--text-tertiary);
  font-weight: 500;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
