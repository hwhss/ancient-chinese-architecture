<template>
  <view class="container page-enter">
    <!-- 动态祥云背景层 -->
    <view class="cloud-background"></view>

    <!-- 侧边栏遮罩 -->
    <view 
      class="sidebar-mask" 
      :class="{ 'show': showSidebar }"
      @click="toggleSidebar"
    ></view>
    
    <!-- 侧边栏历史会话 -->
    <view class="sidebar" :class="{ 'show': showSidebar }">
      <view class="sidebar-header">
        <text class="sidebar-title">💬 历史会话</text>
        <view class="sidebar-close" @click="toggleSidebar">
          <text class="close-icon">✕</text>
        </view>
      </view>
      
      <scroll-view class="sidebar-content" scroll-y>
        <!-- 新建会话按钮 -->
        <view class="new-chat-btn" @click="createNewChat">
          <text class="new-chat-icon">+</text>
          <text class="new-chat-text">新建会话</text>
        </view>
        
        <!-- 会话列表 -->
        <view class="session-list">
          <view 
            v-for="(session, index) in sessionList" 
            :key="session.id"
            class="session-item"
            :class="{ 'active': currentSessionId === session.id }"
            @click="switchSession(session.id)"
          >
            <view class="session-icon">💭</view>
            <view class="session-info">
              <text class="session-title">{{ session.title }}</text>
              <text class="session-time">{{ formatSessionTime(session.time) }}</text>
            </view>
            <view class="session-actions">
              <text class="session-delete" @click.stop="deleteSession(session.id)">🗑️</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="sessionList.length === 0" class="sidebar-empty">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无历史会话</text>
          <text class="empty-hint">点击上方按钮开始新对话</text>
        </view>
      </scroll-view>
      
      <!-- 侧边栏底部 -->
      <view class="sidebar-footer">
        <text class="footer-text">共 {{ sessionList.length }} 个会话</text>
      </view>
    </view>
    
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

    <!-- 搜索结果面板 -->
    <view v-if="showSearch && searchResults.length > 0" class="search-results-panel">
      <view class="search-results-header">
        <text class="search-results-title">搜索结果 ({{ searchResults.length }})</text>
        <text class="search-results-close" @click="closeSearch">✕</text>
      </view>
      <scroll-view class="search-results-list" scroll-y>
        <view
          v-for="(result, index) in searchResults"
          :key="result.id"
          class="search-result-item"
          :class="{ 'ai': result.role === 'ai', 'user': result.role === 'user' }"
          @click="jumpToMessage(result.id)"
        >
          <view class="result-role">
            <text class="role-icon">{{ result.role === 'ai' ? '🏯' : '👤' }}</text>
            <text class="role-text">{{ result.role === 'ai' ? 'AI' : '我' }}</text>
          </view>
          <view class="result-content">
            <rich-text :nodes="highlightText(result.content, searchQuery)"></rich-text>
          </view>
          <view class="result-time">{{ formatTime(result.id) }}</view>
        </view>
      </scroll-view>
    </view>

    <!-- 消息区域 -->
    <scroll-view
      class="message-area"
      :class="{ 'with-search-results': showSearch && searchResults.length > 0 }"
      scroll-y
      :scroll-into-view="scrollId"
      :scroll-with-animation="true"
      @scroll="onScroll"
    >
      <!-- 全新欢迎页设计 -->
      <view v-if="messages.length === 0" class="welcome-container">
        <!-- 装饰性背景元素 -->
        <view class="welcome-bg-decoration">
          <view class="cloud cloud-1"></view>
          <view class="cloud cloud-2"></view>
          <view class="cloud cloud-3"></view>
        </view>
        
        <!-- 主视觉区域 -->
        <view class="welcome-hero">
          <view class="hero-icon-wrapper">
            <view class="hero-icon-ring"></view>
            <text class="hero-icon">🏯</text>
            <view class="hero-glow"></view>
          </view>
          <view class="hero-title-wrapper">
            <text class="hero-title">古建筑AI导览</text>
            <view class="title-decoration">
              <view class="title-line"></view>
              <text class="title-icon">◆</text>
              <view class="title-line"></view>
            </view>
          </view>
          <text class="hero-subtitle">千年智慧 · 一语道破</text>
        </view>
        
        <!-- 功能特性展示 -->
        <view class="welcome-features">
          <view class="feature-item" v-for="(feature, idx) in welcomeFeatures" :key="idx" :style="{ animationDelay: idx * 0.15 + 's' }">
            <view class="feature-icon-wrapper">
              <text class="feature-icon">{{ feature.icon }}</text>
            </view>
            <text class="feature-title">{{ feature.title }}</text>
            <text class="feature-desc">{{ feature.desc }}</text>
          </view>
        </view>
        
        <!-- 引导提示 -->
        <view class="welcome-guide">
          <view class="guide-line"></view>
          <view class="guide-content">
            <text class="guide-icon">💡</text>
            <text class="guide-text">点击下方问题或输入您想了解的古建筑知识</text>
          </view>
          <view class="guide-line"></view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, index) in messages"
        :key="msg.id"
        :id="'msg-' + index"
        class="message-wrapper"
        :class="msg.role"
      >
        <!-- AI 头像 -->
        <view v-if="msg.role === 'ai'" class="avatar ai-avatar">
          <text class="avatar-icon">🏯</text>
        </view>
        
        <view class="message-content">
          <!-- 消息头部：名称和时间 -->
          <view class="message-header">
            <text class="message-sender">{{ msg.role === 'ai' ? '古建筑助手' : '我' }}</text>
            <text class="message-time">{{ formatTime(msg.id) }}</text>
          </view>
          
          <!-- 消息主体 -->
          <view class="message" :class="msg.role">
            <!-- AI消息使用Markdown渲染 -->
            <view v-if="msg.role === 'ai' && !msg.isTyping" class="message-rich-text">
              <rich-text :nodes="renderMarkdown(msg.displayContent || msg.content)"></rich-text>
            </view>
            <!-- 打字中或用户消息使用普通文本 -->
            <text v-else class="message-text">
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
          
          <!-- 消息操作栏 -->
          <view v-if="!msg.isTyping" class="message-actions">
            <view class="action-btn" @click="copyMessage(msg.content)" title="复制">
              <text class="action-icon">📋</text>
              <text class="action-text">复制</text>
            </view>
            <view v-if="msg.role === 'ai'" class="action-btn" @click="regenerateResponse(index)" title="重新生成">
              <text class="action-icon">🔄</text>
              <text class="action-text">重新生成</text>
            </view>
          </view>
        </view>
        
        <!-- 用户头像 -->
        <view v-if="msg.role === 'user'" class="avatar user-avatar">
          <text class="avatar-icon">👤</text>
        </view>
      </view>

      <!-- 加载状态 - 优化版 -->
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
          :class="{ 'disabled': isSending || loading || hasPendingAiMessage }"
          @click="!isSending && !loading && !hasPendingAiMessage && quickQuestion(q)"
        >{{ q }}</text>
      </view>
    </view>

    <!-- 输入区域 - 升级为多行文本域 -->
    <view class="input-area" :class="{ 'keyboard-active': keyboardHeight > 0 }">
      <view class="input-wrapper">
        <textarea
          v-model="inputText"
          class="textarea"
          placeholder="请输入问题，点击发送按钮发送..."
          :disabled="isSending"
          :maxlength="500"
          auto-height
          confirm-type="send"
          @focus="onInputFocus"
          @blur="onInputBlur"
          @linechange="onLineChange"
          @confirm="handleSend"
        />
        <text class="char-count" :class="{ 'near-limit': inputText.length > 450 }">{{ inputText.length }}/500</text>
      </view>
      <button
        class="send-btn"
        :disabled="!canSend || isSending"
        :class="{ 'sending': isSending, 'has-content': canSend }"
        @click="handleSend"
      >
        <text class="send-icon">➤</text>
      </button>
    </view>
  </view>
</template>

<script>
import { chat } from "../../services/api";
import { parseMarkdown, renderToHtml, containsMarkdown } from "../../utils/markdown.js";

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

// 加载提示语
const LOADING_TIPS = [
  "正在查阅古籍资料...",
  "正在梳理建筑历史...",
  "正在分析建筑特色...",
  "正在整理文化背景...",
  "正在为您准备答案...",
  "正在穿越时空...",
  "正在解读千年智慧..."
];

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
    "## 太和殿简介\n\n**太和殿**建成于明永乐十八年（1420年），是故宫*规模最大、等级最高*的建筑。\n\n### 主要特点\n\n- 殿高**35.05米**，建筑面积**2377平方米**\n- 采用重檐庑殿顶，是中国现存最大的木结构大殿\n- 用于举行皇帝登基、大婚等重大典礼\n\n> 太和殿俗称金銮殿，位于紫禁城南北主轴线的显要位置\n\n想了解更多可以`查看实景资料`或访问详情页面。",
  乾清宫:
    "## 乾清宫\n\n**乾清宫**是明清皇帝的寝宫，建于明永乐十八年。\n\n### 历史变迁\n\n1. **明代**：皇帝寝宫\n2. **清代雍正前**：皇帝寝宫\n3. **清代雍正后**：改为处理政务的场所\n\n> 乾清宫与交泰殿、坤宁宫合称后三宫\n\n皇帝移居**养心殿**后，乾清宫的功能发生了重要变化。",
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
      highlightedMessageId: null
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
    // 如果没有当前会话，创建一个新的
    if (!this.currentSessionId) {
      this.createNewSession();
    }
  },

  onHide() {
    this.saveHistory();
    this.saveSessionList();
  },

  methods: {
    // 获取当前会话的缓存key
    getSessionCacheKey(sessionId) {
      return 'CHAT_HISTORY_' + (sessionId || this.currentSessionId);
    },

    // 加载历史记录
    loadHistory() {
      try {
        const cacheKey = this.getSessionCacheKey();
        const cached = uni.getStorageSync(cacheKey);
        if (cached && Array.isArray(cached)) {
          // 加载所有记录，不再限制15条
          this.messages = cached.filter(m => !m.isTyping);
        }
      } catch (e) {
        console.warn("加载聊天历史失败:", e);
      }
    },

    // 保存历史记录
    saveHistory() {
      try {
        const historyToSave = this.messages.filter(m => !m.isTyping);
        // 保存所有记录到当前会话的存储中
        const cacheKey = this.getSessionCacheKey();
        uni.setStorageSync(cacheKey, historyToSave);
        // 同时更新当前会话
        this.updateCurrentSession();
      } catch (e) {
        console.warn("保存聊天历史失败:", e);
      }
    },

    // 加载会话列表
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

    // 保存会话列表
    saveSessionList() {
      try {
        uni.setStorageSync('CHAT_SESSIONS', this.sessionList);
        uni.setStorageSync('CURRENT_SESSION_ID', this.currentSessionId);
      } catch (e) {
        console.warn("保存会话列表失败:", e);
      }
    },

    // 创建新会话
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
      // 不再使用全局CACHE_KEY，每个会话有自己的存储
    },

    // 更新当前会话信息
    updateCurrentSession() {
      const session = this.sessionList.find(s => s.id === this.currentSessionId);
      if (session) {
        session.messageCount = this.messages.length;
        session.time = Date.now();
        // 如果有消息，用第一条用户消息作为标题
        const firstUserMsg = this.messages.find(m => m.role === 'user');
        if (firstUserMsg && session.title.startsWith('新对话')) {
          session.title = firstUserMsg.content.slice(0, 15) + (firstUserMsg.content.length > 15 ? '...' : '');
        }
        this.saveSessionList();
      }
    },

    // 切换会话
    switchSession(sessionId) {
      if (sessionId === this.currentSessionId) {
        this.showSidebar = false;
        return;
      }

      // 保存当前会话
      this.saveHistory();

      // 切换到新会话
      this.currentSessionId = sessionId;
      this.saveSessionList();

      // 加载新会话的消息 - 加载所有记录，不再限制15条
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

    // 删除会话
    deleteSession(sessionId) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个会话吗？',
        confirmColor: '#c82506',
        success: (res) => {
          if (res.confirm) {
            const index = this.sessionList.findIndex(s => s.id === sessionId);
            if (index > -1) {
              // 删除会话存储的消息
              const cacheKey = this.getSessionCacheKey(sessionId);
              uni.removeStorageSync(cacheKey);

              // 从列表中移除
              this.sessionList.splice(index, 1);

              // 如果删除的是当前会话，切换到第一个或新建
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

    // 切换侧边栏显示
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },

    // 新建聊天（从侧边栏）
    createNewChat() {
      this.createNewSession();
      this.showSidebar = false;
    },

    // ========== 搜索功能 ==========

    // 打开搜索
    openSearch() {
      this.showSearch = true;
      this.searchQuery = "";
      this.searchResults = [];
    },

    // 关闭搜索
    closeSearch() {
      this.showSearch = false;
      this.searchQuery = "";
      this.searchResults = [];
      this.isSearching = false;
    },

    // 搜索输入
    onSearchInput(e) {
      this.searchQuery = e.detail.value;
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        this.isSearching = false;
      }
    },

    // 清空搜索
    clearSearch() {
      this.searchQuery = "";
      this.searchResults = [];
      this.isSearching = false;
    },

    // 执行搜索
    performSearch() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        this.searchResults = [];
        this.isSearching = false;
        return;
      }

      this.isSearching = true;

      // 在当前会话的所有消息中搜索
      const results = this.messages.filter(msg => {
        const content = (msg.content || "").toLowerCase();
        return content.includes(query);
      });

      this.searchResults = results;

      // 显示搜索结果提示
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

    // 跳转到指定消息
    jumpToMessage(messageId) {
      const index = this.messages.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        this.scrollId = '';
        setTimeout(() => {
          this.scrollId = 'msg-' + index;
        }, 100);

        // 高亮显示该消息（可以添加高亮样式）
        this.highlightedMessageId = messageId;
        setTimeout(() => {
          this.highlightedMessageId = null;
        }, 3000);
      }
    },

    // 高亮搜索关键词
    highlightText(text, query) {
      if (!text || !query) return text;

      // 截取包含关键词的片段（前后各30个字符）
      const lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();
      const index = lowerText.indexOf(lowerQuery);

      if (index === -1) return text;

      // 计算截取范围
      const start = Math.max(0, index - 30);
      const end = Math.min(text.length, index + query.length + 30);
      let snippet = text.substring(start, end);

      // 添加省略号
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';

      // 高亮关键词
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlighted = snippet.replace(regex, '<span style="background: #c82506; color: #fff; padding: 2px 4px; border-radius: 4px;">$1</span>');

      return `<span style="font-size: 28rpx; line-height: 1.6; color: #2d2d2d;">${highlighted}</span>`;
    },

    // 格式化会话时间
    formatSessionTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // 小于1分钟
      if (diff < 60000) {
        return '刚刚';
      }
      // 小于1小时
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 小于24小时
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      // 小于7天
      if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前';
      }
      
      // 显示日期
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}-${day}`;
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
            this.updateCurrentSession();
          }
        }
      });
    },

    // 裁剪消息列表（已取消15条限制，保留方法用于兼容性）
    trimMessages() {
      // 历史会话功能启用后，不再限制消息数量
      // 每个会话可以保存完整的聊天记录
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
      this.startLoadingTips();

      try {
        const data = await chat(question);
        const materialId = data.materialId || (data.matchedEntity && data.matchedEntity.id) || matchMaterialId(question);
        
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
        this.stopLoadingTips();
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

      let lastScrollTime = 0;
      const scrollInterval = 300; // 每300ms滚动一次
      
      const typeNext = () => {
        if (index < fullText.length) {
          // 批量更新，每3个字符更新一次
          const batchSize = Math.min(3, fullText.length - index);
          index += batchSize;
          
          // 使用 Vue 的响应式更新方式
          this.$set(this.messages[msgIndex], 'displayContent', fullText.slice(0, index));
          
          // 控制滚动频率，避免过于频繁
          const now = Date.now();
          if (now - lastScrollTime > scrollInterval) {
            this.scrollToBottom();
            lastScrollTime = now;
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

    // 开始加载提示轮播
    startLoadingTips() {
      this.loadingTips = LOADING_TIPS[0];
      let index = 1;
      this.loadingTipTimer = setInterval(() => {
        this.loadingTips = LOADING_TIPS[index % LOADING_TIPS.length];
        index++;
      }, 2000);
    },

    // 停止加载提示轮播
    stopLoadingTips() {
      if (this.loadingTipTimer) {
        clearInterval(this.loadingTipTimer);
        this.loadingTipTimer = null;
      }
      this.loadingTips = "正在思考中...";
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

    // 滚动到底部 - 优化版
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.messages.length > 0) {
          // 使用 scroll-into-view 滚动到最后一条消息
          const lastIndex = this.messages.length - 1;
          this.scrollId = '';
          setTimeout(() => {
            this.scrollId = 'msg-' + lastIndex;
          }, 50);
        }
      });
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // 小于1分钟显示"刚刚"
      if (diff < 60000) {
        return '刚刚';
      }
      // 小于1小时显示分钟
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 小于24小时显示小时
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      
      // 否则显示具体时间
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    // 渲染Markdown为HTML
    renderMarkdown(content) {
      if (!content) return '';
      // 如果内容包含Markdown语法，则解析渲染
      if (containsMarkdown(content)) {
        const nodes = parseMarkdown(content);
        return renderToHtml(nodes);
      }
      // 否则返回普通文本（包裹在p标签中）
      return `<p style="margin: 0; line-height: 1.8; color: #2d2d2d;">${content.replace(/\n/g, '<br>')}</p>`;
    },

    // 复制消息内容
    copyMessage(content) {
      uni.setClipboardData({
        data: content,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },

    // 重新生成AI回复
    async regenerateResponse(index) {
      // 找到对应的用户问题
      let userIndex = index - 1;
      while (userIndex >= 0 && this.messages[userIndex].role !== 'user') {
        userIndex--;
      }
      
      if (userIndex < 0) return;
      
      const userQuestion = this.messages[userIndex].content;
      
      // 删除当前AI回复及之后的所有消息
      this.messages.splice(index, 1);
      this.saveHistory();
      
      // 重新发送问题
      this.inputText = userQuestion;
      await this.send();
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

    // 处理行数变化
    onLineChange(e) {
      // 可以在这里处理行数变化的逻辑
      console.log('行数变化:', e.detail.lineCount);
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

/* ========== 侧边栏样式 ========== */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 100;
}

.sidebar-mask.show {
  opacity: 1;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 600rpx;
  height: 100vh;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: 4rpx 0 20rpx rgba(0, 0, 0, 0.15);
}

.sidebar.show {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-bottom: 1rpx solid #e8d8c8;
}

.sidebar-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff8e6;
  letter-spacing: 4rpx;
}

.sidebar-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 248, 230, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.25s ease;
}

.sidebar-close:hover {
  background: rgba(255, 248, 230, 0.35);
  transform: scale(1.05);
}

.close-icon {
  font-size: 28rpx;
  color: #fff8e6;
}

.sidebar-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

/* 新建会话按钮 */
.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  border: 2rpx dashed #e8b860;
  border-radius: 16rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.new-chat-btn:hover {
  background: linear-gradient(135deg, #f5d56a 0%, #e8c850 100%);
  border-style: solid;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.15);
}

.new-chat-icon {
  font-size: 32rpx;
  font-weight: bold;
  color: #c82506;
}

.new-chat-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #c82506;
}

/* 会话列表 */
.session-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fffef9;
  border-radius: 12rpx;
  border: 1rpx solid #e8d8c8;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.session-item:hover {
  background: #fff8d8;
  border-color: #e8b860;
  transform: translateX(4rpx);
  box-shadow: 0 2rpx 8rpx rgba(200, 37, 6, 0.1);
}

.session-item.active {
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  border-color: #c82506;
  border-left: 6rpx solid #c82506;
}

.session-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.session-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3c2a1d;
  margin-bottom: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 22rpx;
  color: #8b7355;
}

.session-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-delete {
  font-size: 28rpx;
  padding: 8rpx;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.session-delete:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 侧边栏空状态 */
.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #8b7355;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #a09080;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 20rpx;
  background: #f7f1e6;
  border-top: 1rpx solid #e8d8c8;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #8b7355;
}

/* ========== 顶部导航栏 ========== */
.header {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 50%, #a81c07 100%);
  padding: 30rpx 20rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

/* 搜索框 */
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

.clear-icon {
  font-size: 24rpx;
  color: #fff8e6;
  font-weight: bold;
}

/* ========== 搜索结果面板 ========== */
.search-results-panel {
  position: fixed;
  top: 140rpx;
  left: 20rpx;
  right: 20rpx;
  max-height: 500rpx;
  background: #fffef9;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  z-index: 50;
  display: flex;
  flex-direction: column;
  border: 1rpx solid #e8d8c8;
}

.search-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  border-radius: 16rpx 16rpx 0 0;
}

.search-results-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff8e6;
}

.search-results-close {
  font-size: 32rpx;
  color: #fff8e6;
  padding: 8rpx;
  cursor: pointer;
}

.search-results-list {
  max-height: 400rpx;
  padding: 16rpx;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  background: #faf6ed;
  border-radius: 12rpx;
  border-left: 4rpx solid #c82506;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:active {
  background: #f5e6c8;
  transform: scale(0.98);
}

.search-result-item.user {
  border-left-color: #8b4513;
}

.result-role {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.role-icon {
  font-size: 32rpx;
}

.role-text {
  font-size: 20rpx;
  color: #8b7355;
}

.result-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.result-time {
  font-size: 20rpx;
  color: #a09080;
  flex-shrink: 0;
}

/* 消息区域在有搜索结果时调整 */
.message-area.with-search-results {
  margin-top: 520rpx;
}

/* 侧边栏切换按钮 */
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

/* 清空聊天按钮 */
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
}

/* ========== 全新欢迎页样式 ========== */
.welcome-container {
  position: relative;
  padding: 40rpx 30rpx 60rpx;
  min-height: calc(100vh - 400rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

/* 装饰性背景云 */
.welcome-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.cloud {
  position: absolute;
  background: linear-gradient(135deg, rgba(200, 37, 6, 0.08) 0%, rgba(168, 28, 7, 0.04) 100%);
  border-radius: 50%;
  filter: blur(20rpx);
}

.cloud-1 {
  width: 300rpx;
  height: 150rpx;
  top: 10%;
  left: -50rpx;
  animation: floatCloud 20s ease-in-out infinite;
}

.cloud-2 {
  width: 200rpx;
  height: 100rpx;
  top: 30%;
  right: -30rpx;
  animation: floatCloud 25s ease-in-out infinite reverse;
}

.cloud-3 {
  width: 250rpx;
  height: 120rpx;
  bottom: 20%;
  left: 10%;
  animation: floatCloud 22s ease-in-out infinite;
  animation-delay: -5s;
}

@keyframes floatCloud {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(30rpx) translateY(-10rpx);
  }
  50% {
    transform: translateX(-20rpx) translateY(10rpx);
  }
  75% {
    transform: translateX(20rpx) translateY(-5rpx);
  }
}

/* 主视觉区域 */
.welcome-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  animation: heroFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-icon-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.hero-icon-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid rgba(200, 37, 6, 0.2);
  border-radius: 50%;
  animation: ringPulse 2s ease-in-out infinite;
}

.hero-icon-ring::before {
  content: '';
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  right: 10rpx;
  bottom: 10rpx;
  border: 2rpx solid rgba(200, 37, 6, 0.1);
  border-radius: 50%;
}

@keyframes ringPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
  }
}

.hero-glow {
  position: absolute;
  width: 140rpx;
  height: 140rpx;
  background: radial-gradient(circle, rgba(200, 37, 6, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.hero-icon {
  font-size: 80rpx;
  z-index: 1;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8rpx);
  }
}

.hero-title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.hero-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #c82506;
  letter-spacing: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(200, 37, 6, 0.2);
  margin-bottom: 16rpx;
}

.title-decoration {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.title-line {
  width: 60rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #c82506, transparent);
}

.title-icon {
  font-size: 16rpx;
  color: #c82506;
  animation: iconRotate 4s linear infinite;
}

@keyframes iconRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-subtitle {
  font-size: 28rpx;
  color: #8b7355;
  letter-spacing: 12rpx;
  font-weight: 500;
}

/* 功能特性展示 */
.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 50rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background: linear-gradient(135deg, #fffef9 0%, #faf6ed 100%);
  border-radius: 16rpx;
  border: 1rpx solid #e8d8c8;
  box-shadow: 0 4rpx 16rpx rgba(139, 69, 19, 0.08);
  animation: featureSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes featureSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-item:hover {
  transform: translateY(-4rpx) translateX(4rpx);
  box-shadow: 0 8rpx 24rpx rgba(139, 69, 19, 0.12);
  border-color: #d8c8b8;
}

.feature-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #c82506 0%, #a81c07 100%);
  border-radius: 16rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.25);
}

.feature-icon {
  font-size: 36rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3c2a1d;
  margin-bottom: 6rpx;
  display: block;
}

.feature-desc {
  font-size: 24rpx;
  color: #8b7355;
  display: block;
}

/* 引导提示 */
.welcome-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  margin-top: auto;
  padding-top: 30rpx;
  animation: guideFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
}

@keyframes guideFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.guide-line {
  width: 60rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #c82506, transparent);
}

.guide-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 28rpx;
  background: linear-gradient(135deg, #fff8d8 0%, #f5e6c8 100%);
  border-radius: 40rpx;
  border: 1rpx solid #e8b860;
}

.guide-icon {
  font-size: 28rpx;
  animation: iconBounce 1.5s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4rpx);
  }
}

.guide-text {
  font-size: 26rpx;
  color: #a81c07;
  font-weight: 500;
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

.example-tag.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.message-wrapper {
  margin-bottom: 32rpx;
  display: flex;
  align-items: flex-start;
  animation: messageFadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
  padding: 0 20rpx;
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

/* 头像样式 */
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
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
  margin-right: 16rpx;
}

.user-avatar {
  background: linear-gradient(135deg, #8b4513 0%, #6b3410 100%);
  margin-left: 16rpx;
}

.avatar-icon {
  font-size: 36rpx;
}

/* 消息内容区域 */
.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

/* 消息头部 */
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  padding: 0 8rpx;
}

.message-sender {
  font-size: 26rpx;
  font-weight: 600;
  color: #3c2a1d;
  margin-right: 12rpx;
}

.message-time {
  font-size: 22rpx;
  color: #8b7355;
}

/* 消息主体 */
.message {
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
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

/* Markdown富文本样式 */
.message-rich-text {
  font-size: 30rpx;
  line-height: 1.8;
  color: #2d2d2d;
  word-break: break-word;
}

/* 确保rich-text内的样式正确应用 */
.message-rich-text rich-text {
  display: block;
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

/* 消息操作栏 */
.message-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 12rpx;
  padding: 0 8rpx;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: rgba(139, 69, 19, 0.12);
  transform: translateY(-2rpx);
}

.action-btn:active {
  transform: translateY(0) scale(0.96);
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 22rpx;
  color: #8b7355;
}

/* 加载动画 - 优化版 */
.loading-wrapper {
  opacity: 0.9;
}

.loading-msg {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #f8f4e8 0%, #f0e9d8 100%);
  border: 1rpx solid #e8dcc8;
}

.loading-dots {
  display: flex;
  gap: 10rpx;
}

.dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
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
  color: #8b7355;
  font-weight: 500;
  animation: textFade 2s ease-in-out infinite;
}

@keyframes textFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
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
  align-items: flex-end;
  padding: 20rpx;
  background: linear-gradient(180deg, #fffef9 0%, #faf6ed 100%);
  border-top: 1rpx solid #e8d8c8;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  gap: 16rpx;
}

.keyboard-active {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

/* 输入框包装器 */
.input-wrapper {
  flex: 1;
  position: relative;
  background: #fffef9;
  border-radius: 24rpx;
  border: 1rpx solid #d8c8b8;
  padding: 16rpx 24rpx;
  padding-bottom: 40rpx;
  transition: border-color 0.2s, box-shadow 0.2s;
  max-height: 240rpx;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: #c82506;
  box-shadow: 0 0 0 2rpx rgba(200, 37, 6, 0.1);
}

.textarea {
  width: 100%;
  min-height: 48rpx;
  max-height: 160rpx;
  font-size: 30rpx;
  line-height: 1.6;
  color: #2d2d2d;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;
}

.textarea::placeholder {
  color: #999;
}

/* 字符计数 */
.char-count {
  position: absolute;
  right: 16rpx;
  bottom: 8rpx;
  font-size: 20rpx;
  color: #999;
  transition: color 0.2s;
}

.char-count.near-limit {
  color: #c82506;
  font-weight: 600;
}

/* 发送按钮 - 圆形图标按钮 */
.send-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
  border-radius: 50%;
  border: none;
  transform: translateZ(0) translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
  flex-shrink: 0;
}

.send-btn.has-content {
  background: linear-gradient(135deg, #e84a38 0%, #c82506 100%);
  box-shadow: 0 4rpx 12rpx rgba(200, 37, 6, 0.35);
}

.send-icon {
  font-size: 32rpx;
  color: #fff;
  transform: translateX(-2rpx);
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
