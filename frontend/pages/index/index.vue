<template>
  <view class="container page-enter">
    <!-- 动态祥云背景层 -->
    <view class="cloud-background"></view>

    <!-- 顶部标题 -->
    <view class="header rice-paper">
      <view class="page-container">
        <view class="header-inner">
          <!-- 侧边栏切换按钮 -->
          <view class="sidebar-toggle btn-ink" @click="toggleSidebar">
            <TraditionalIcon name="chat" size="36" color="var(--secondary)" />
          </view>

          <!-- 搜索模式下的返回按钮 -->
          <view v-if="showSearch" class="sidebar-toggle btn-ink" @click="closeSearch">
            <TraditionalIcon name="arrow-left" size="36" color="var(--secondary)" />
          </view>

          <!-- 标题或搜索框 -->
          <view v-if="!showSearch" class="header-center">
            <text class="title ink-pressed">古建AI导览</text>
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
              <TraditionalIcon name="close" size="24" color="var(--text-muted)" />
            </view>
          </view>

          <!-- 搜索按钮 / 清空按钮 -->
          <view v-if="!showSearch && messages.length > 0" class="header-action-icon" @click="openSearch">
            <TraditionalIcon name="search" size="40" color="var(--secondary)" />
          </view>
          <view v-else-if="showSearch" class="search-confirm-text" @click="performSearch">搜索</view>
        </view>
      </view>
    </view>

    <!-- 布局容器 -->
    <view class="layout-wrapper" :class="{ 'sidebar-open': showSidebar && !isMobile }">
      <!-- 侧边栏及遮罩组件 -->
      <ChatSidebar
        :showSidebar="showSidebar"
        :sessionList="sessionList"
        :currentSessionId="currentSessionId"
        :isMobile="isMobile"
        @toggle-sidebar="toggleSidebar"
        @create-new="createNewChat"
        @switch-session="switchSession"
        @delete-session="deleteSession"
      />
      
      <!-- 主内容区域 -->
      <view class="main-content">
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
          <view class="page-container">
            <!-- 全新欢迎页设计组件 -->
            <WelcomeHero v-if="messages.length === 0" :welcomeFeatures="welcomeFeatures" />

            <!-- 使用虚拟列表渲染消息 -->
            <virtual-message-list
              v-else
              ref="messageList"
              :messages="messages"
              @go-to-detail="goToDetail"
              @regenerate="regenerateResponse"
              @skip-typing="skipTypingEffect"
            />
          </view>

          <!-- 加载状态 -->
          <view v-if="loading && !hasPendingAiMessage" class="message-wrapper ai loading-wrapper">
            <view class="avatar ai-avatar rice-paper brush-border-ink">
              <TraditionalIcon name="palace" size="36" color="var(--primary)" />
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
          <view v-if="lastError" class="error-retry" :class="'error-' + lastErrorType">
            <view class="error-icon">
              <TraditionalIcon 
                :name="getErrorIcon()" 
                size="48" 
                :color="getErrorColor()" 
              />
            </view>
            <view class="error-content">
              <text class="error-text">{{ lastError }}</text>
              <text class="error-help">{{ getErrorHelp() }}</text>
            </view>
            <view class="error-actions">
              <button class="retry-btn" @click="retryLastQuestion">重新发送</button>
              <button v-if="showNetworkCheck()" class="help-btn" @click="openNetworkHelp">检查网络</button>
            </view>
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
    </view>
  </view>
</template>

<script>
import { chat } from "../../services/api";
import { parseMarkdown, renderToHtml, containsMarkdown } from "../../utils/markdown.js";
import { goToDetail } from "../../utils/navigation.js";
import VirtualMessageList from "../../components/VirtualMessageList.vue";
import ChatSidebar from "../../components/chat/ChatSidebar.vue";
import WelcomeHero from "../../components/chat/WelcomeHero.vue";
import SearchResults from "../../components/chat/SearchResults.vue";
import ChatInputArea from "../../components/chat/ChatInputArea.vue";
import TraditionalIcon from "../../components/shared/TraditionalIcon.vue";

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
    ChatInputArea,
    TraditionalIcon
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
      lastErrorType: null,
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
      isMobile: false,
      // 打字效果配置
      typingConfig: {
        baseSpeed: 30,
        fastSpeed: 15,
        skipable: true,
        batchSize: 5
      },
      skipTyping: false
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
      
      // 如果当前会话有未发送内容，先保存
      if (this.inputText.trim()) {
        uni.showModal({
          title: '保存草稿',
          content: '当前会话有未发送的内容，是否保存后切换？',
          confirmText: '保存并切换',
          cancelText: '不保存',
          confirmColor: '#c82506',
          success: (res) => {
            if (res.confirm) {
              this.saveCurrentDraft();
            }
            this.doSwitchSession(sessionId);
          }
        });
      } else {
        this.doSwitchSession(sessionId);
      }
    },

    doSwitchSession(sessionId) {
      this.saveHistory();
      this.currentSessionId = sessionId;
      this.saveSessionList();
      const cacheKey = this.getSessionCacheKey(sessionId);
      try {
        const cached = uni.getStorageSync(cacheKey);
        if (cached && Array.isArray(cached)) {
          this.messages = cached.filter(m => !m.isTyping);
          // 尝试加载该会话的草稿
          this.$nextTick(() => {
            this.loadCurrentDraft();
          });
        } else {
          // 显示空会话提示
          this.messages = [];
          this.inputText = "";
          uni.showToast({
            title: '这是一个新会话',
            icon: 'none',
            duration: 1500
          });
        }
      } catch (e) {
        this.messages = [];
        this.inputText = "";
      }
      this.showSidebar = false;
      this.scrollToBottom();
    },

    // 保存当前草稿
    saveCurrentDraft() {
      if (!this.inputText.trim()) return;
      
      const draftKey = 'DRAFT_' + this.currentSessionId;
      try {
        uni.setStorageSync(draftKey, {
          content: this.inputText,
          time: Date.now()
        });
      } catch (e) {
        console.warn('保存草稿失败:', e);
      }
    },

    // 加载草稿
    loadCurrentDraft() {
      const draftKey = 'DRAFT_' + this.currentSessionId;
      try {
        const draft = uni.getStorageSync(draftKey);
        if (draft && draft.content) {
          // 询问是否恢复草稿
          uni.showModal({
            title: '恢复草稿',
            content: '发现未发送的草稿，是否恢复？',
            confirmText: '恢复',
            cancelText: '删除',
            confirmColor: '#c82506',
            success: (res) => {
              if (res.confirm) {
                this.inputText = draft.content;
              } else {
                // 删除草稿
                this.clearCurrentDraft();
              }
            }
          });
        }
      } catch (e) {
        console.warn('加载草稿失败:', e);
      }
    },

    // 清除当前草稿
    clearCurrentDraft() {
      const draftKey = 'DRAFT_' + this.currentSessionId;
      try {
        uni.removeStorageSync(draftKey);
      } catch (e) {
        console.warn('删除草稿失败:', e);
      }
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
              // 删除会话消息缓存
              const cacheKey = this.getSessionCacheKey(sessionId);
              uni.removeStorageSync(cacheKey);
              // 删除会话草稿
              const draftKey = 'DRAFT_' + sessionId;
              try {
                uni.removeStorageSync(draftKey);
              } catch (e) {
                console.warn('删除会话草稿失败:', e);
              }
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

      // 发送前先清除当前会话的草稿
      this.clearCurrentDraft();

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
        // 只有后端明确返回匹配的建筑信息，且是从用户问题中匹配到的，才显示"查看实景资料"按钮
        // 避免从AI回答内容中误匹配建筑
        let materialId = data.materialId || (data.matchedEntity && data.matchedEntity.id);
        
        // 检查matchedEntity，如果是从answer中匹配到的（而非question），则不显示按钮
        if (materialId && data.matchedEntity && data.matchedEntity.matchedText) {
          const matchedText = String(data.matchedEntity.matchedText);
          // 如果matchedText以"answer:"开头，说明是从AI回答中匹配到的，不是用户明确询问的
          if (matchedText.startsWith('answer:')) {
            materialId = null;
          }
        }
        
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
        this.handleError(error);
        
        const mockAnswer = this.getMockAnswer(question);
        // 错误降级时也不使用前端关键词匹配，避免误匹配
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          content: mockAnswer,
          displayContent: "",
          materialId: null,
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
      const speed = fullText.length > 200 
        ? this.typingConfig.fastSpeed 
        : this.typingConfig.baseSpeed;
      const batchSize = this.typingConfig.batchSize;

      this.clearTypingTimer();
      this.skipTyping = false;

      let lastScrollTime = 0;
      const scrollInterval = 300;
      
      const typeNext = () => {
        if (this.skipTyping || index >= fullText.length) {
          this.$set(this.messages[msgIndex], 'isTyping', false);
          this.$set(this.messages[msgIndex], 'displayContent', fullText);
          this.scrollToBottom();
          this.saveHistory();
          return;
        }
        
        const batch = Math.min(batchSize, fullText.length - index);
        index += batch;
        this.$set(this.messages[msgIndex], 'displayContent', fullText.slice(0, index));
        
        const now = Date.now();
        if (now - lastScrollTime > scrollInterval) {
          this.scrollToBottom();
          lastScrollTime = now;
        }
        this.typingTimer = setTimeout(typeNext, speed);
      };

      typeNext();
    },

    skipTypingEffect() {
      this.skipTyping = true;
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

    // 分类处理错误
    handleError(error) {
      console.error("请求失败:", error);
      
      let errorType = 'unknown';
      let errorMessage = '网络异常，请稍后重试';
      
      const errorMsg = error.message || '';
      const errorStr = String(error).toLowerCase();
      
      if (errorMsg.includes('timeout') || errorMsg.includes('超时') || errorStr.includes('timeout')) {
        errorType = 'timeout';
        errorMessage = '请求超时，请检查网络后重试';
      } else if (errorMsg.includes('network') || errorMsg.includes('网络') || errorStr.includes('network')) {
        errorType = 'network';
        errorMessage = '网络连接异常，请检查网络设置';
      } else if (errorMsg.includes('500') || errorMsg.includes('服务器') || errorStr.includes('500') || errorStr.includes('server')) {
        errorType = 'api';
        errorMessage = '服务器暂时不可用，请稍后再试';
      } else if (errorMsg.includes('401') || errorMsg.includes('403') || errorStr.includes('401') || errorStr.includes('403') || errorStr.includes('auth')) {
        errorType = 'auth';
        errorMessage = '授权异常，请重新进入';
      }
      
      this.lastError = errorMessage;
      this.lastErrorType = errorType;
    },

    // 获取错误图标
    getErrorIcon() {
      const iconMap = {
        'timeout': 'arrow-right',
        'network': 'chat',
        'api': 'palace',
        'auth': 'search',
        'unknown': 'search'
      };
      return iconMap[this.lastErrorType] || 'search';
    },

    // 获取错误颜色
    getErrorColor() {
      const colorMap = {
        'timeout': '#f5a623',
        'network': '#e74c3c',
        'api': '#9b59b6',
        'auth': '#3498db',
        'unknown': '#8b7355'
      };
      return colorMap[this.lastErrorType] || '#8b7355';
    },

    // 获取错误帮助信息
    getErrorHelp() {
      const helpMap = {
        'timeout': '建议：检查网络连接后重试',
        'network': '建议：检查WiFi或移动数据',
        'api': '建议：稍后再试或联系客服',
        'auth': '建议：重新打开小程序',
        'unknown': '建议：稍后再试'
      };
      return helpMap[this.lastErrorType] || '建议：稍后再试';
    },

    // 是否显示检查网络按钮
    showNetworkCheck() {
      return this.lastErrorType === 'network' || this.lastErrorType === 'timeout';
    },

    // 打开网络帮助
    openNetworkHelp() {
      uni.showModal({
        title: '网络诊断',
        content: '请检查您的网络连接：\n\n1. 确认WiFi或移动数据已开启\n2. 尝试切换网络\n3. 检查路由器是否正常\n4. 确认其他应用能正常上网',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#c82506'
      });
    },

    retryLastQuestion() {
      if (this.lastQuestion && !this.isSending) {
        this.lastError = "";
        this.lastErrorType = null;
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
      // VirtualMessageList 内部已通过 watch 自动处理滚动
      // 保留此方法仅为兼容性
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
      const inputAreaHeight = this.keyboardHeight > 0 ? this.keyboardHeight + 60 : 160;
      const exampleAreaHeight = 0; // Removed example question area if needed, but keeping buffer
      const padding = 20;
      const rpxToPx = this.windowWidth / 750;
      const totalRpxHeight = headerHeight + inputAreaHeight + padding;
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
      if (!materialId) {
        uni.showToast({
          title: '无法获取建筑信息',
          icon: 'none'
        });
        return;
      }
      goToDetail(materialId);
    },

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
  overflow: hidden;
}

.layout-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 5;
  background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
              linear-gradient(180deg, #faf6ed 0%, #f5f0e1 100%);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.header {
  background: linear-gradient(135deg, 
    var(--bg-card) 0%, 
    rgba(255, 248, 230, 0.95) 50%, 
    var(--bg-card) 100%);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
  border-bottom: 4rpx solid var(--border);
  box-shadow: 0 4rpx 20rpx var(--shadow);
  animation: headerIn 0.6s ease-out;
}

@keyframes headerIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, var(--secondary), transparent);
  opacity: 0.3;
}

@media (min-width: 768px) {
  .layout-wrapper {
    flex-direction: row;
  }
}

.header-search {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: 40rpx;
  padding: 12rpx 30rpx;
  margin: 0 20rpx;
  border: 1rpx solid var(--border);
  box-shadow: inset 0 2rpx 6rpx rgba(0,0,0,0.05);
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
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
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  border: 1rpx solid var(--border);
  background: var(--bg-card);
  box-shadow: 2rpx 2rpx 10rpx var(--shadow);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle:hover {
  transform: translateY(-2rpx) scale(1.05);
  box-shadow: 0 8rpx 24rpx rgba(200, 37, 6, 0.25);
  border-color: var(--primary);
}

.sidebar-toggle:active {
  transform: translateY(0) scale(0.98);
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-decoration {
  height: 4rpx;
  width: 40rpx;
  background: var(--secondary);
  opacity: 0.3;
  margin-top: 4rpx;
}

.title {
  color: var(--text-primary);
  font-size: 38rpx;
  font-weight: bold;
  font-family: 'TsangerJinKai', serif;
  letter-spacing: 4rpx;
  position: relative;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleIn 0.8s ease-out 0.2s both;
}

@keyframes titleIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
    letter-spacing: 12rpx;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    letter-spacing: 4rpx;
  }
}

.header-action-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-action-icon:hover {
  transform: rotate(15deg) scale(1.1);
}

.search-confirm-text {
  font-size: 28rpx;
  color: var(--primary);
  font-weight: bold;
  padding: 0 10rpx;
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
  padding-bottom: 40rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.message-area.with-search-results {
  margin-top: 520rpx;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    max-width: 900px;
    margin: 0 auto;
  }
  .title {
    font-size: 42rpx;
  }
  .layout-wrapper {
    flex-direction: row;
  }
  .main-content {
    padding: 0 40rpx;
  }
  .message-area {
    padding: 30rpx 20rpx;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }
  .layout-wrapper {
    flex-direction: row;
  }
  .main-content {
    padding: 0 60rpx;
  }
  .message-area {
    padding: 40rpx 30rpx;
  }
  .title {
    font-size: 46rpx;
    letter-spacing: 6rpx;
  }
}

@media (min-width: 1440px) {
  .container {
    max-width: 1300px;
    margin: 0 auto;
  }
  .main-content {
    padding: 0 80rpx;
  }
  .message-area {
    padding: 50rpx 40rpx;
  }
  .title {
    font-size: 50rpx;
    letter-spacing: 8rpx;
  }
}

@media (max-width: 767px) {
  .header {
    padding: 24rpx 16rpx;
  }
  
  .title {
    font-size: 32rpx;
    letter-spacing: 2rpx;
  }
  
  .sidebar-toggle,
  .header-action-icon {
    width: 60rpx;
    height: 60rpx;
  }
}

.error-retry {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background: linear-gradient(135deg, #fff8f0 0%, #ffe8d8 100%);
  border: 2rpx solid #e8a060;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx 20rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(200, 160, 100, 0.15);
  animation: errorShake 0.4s ease-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4rpx); }
  40% { transform: translateX(4rpx); }
  60% { transform: translateX(-2rpx); }
  80% { transform: translateX(2rpx); }
}

/* 不同错误类型的样式 */
.error-retry.error-network {
  background: linear-gradient(135deg, #fff0f0 0%, #ffe8e8 100%);
  border-color: #e8a0a0;
}

.error-retry.error-timeout {
  background: linear-gradient(135deg, #fff8e0 0%, #ffe8b8 100%);
  border-color: #e8c060;
}

.error-retry.error-api {
  background: linear-gradient(135deg, #f8f0ff 0%, #e8d8ff 100%);
  border-color: #c0a0e8;
}

.error-retry.error-auth {
  background: linear-gradient(135deg, #f0f8ff 0%, #d8e8ff 100%);
  border-color: #a0c0e8;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  margin: 0 auto 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  text-align: center;
}

.error-text {
  font-size: 28rpx;
  color: #6b4423;
  font-weight: 600;
  line-height: 1.5;
}

.error-help {
  font-size: 24rpx;
  color: #8b6b4b;
  line-height: 1.4;
}

.error-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.help-btn {
  padding: 14rpx 32rpx;
  font-size: 26rpx;
  border-radius: 40rpx;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0) translateY(0);
}

.retry-btn {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  color: #fff8e6;
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.3);
}

.retry-btn:hover {
  transform: translateY(-3rpx);
  box-shadow: 0 6rpx 16rpx rgba(200, 37, 6, 0.4);
}

.retry-btn:active {
  transform: translateY(-1rpx) scale(0.98);
  box-shadow: 0 3rpx 8rpx rgba(200, 37, 6, 0.25);
}

.help-btn {
  background: linear-gradient(135deg, #f5f0e1 0%, #e8e0d0 100%);
  color: #8b6b4b;
  border: 2rpx solid #d0c0b0;
  box-shadow: 0 2rpx 8rpx rgba(139, 107, 75, 0.15);
}

.help-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(139, 107, 75, 0.25);
  background: linear-gradient(135deg, #fff8e8 0%, #f0e8d8 100%);
}

.help-btn:active {
  transform: translateY(0) scale(0.98);
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
