const axios = require('axios');
const config = require('../src/config');

// ==================== 配置区域 ====================

function buildChatCompletionsUrl(baseUrl) {
  const normalized = String(baseUrl || '').replace(/\/$/, '');
  if (normalized.endsWith('/chat/completions')) {
    return normalized;
  }
  return `${normalized}/chat/completions`;
}

function hasUsableApiKey() {
  return Boolean(String(config.llmApiKey || '').trim());
}

async function requestChatCompletion({
  userContent,
  systemPrompt = SYSTEM_PROMPT,
  temperature = 0.4,
  maxTokens = 500
}) {
  if (!hasUsableApiKey()) {
    return null;
  }

  const apiUrl = buildChatCompletionsUrl(config.llmApiUrl);
  const response = await axios.post(
    apiUrl,
    {
      model: config.llmChatModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature,
      max_tokens: maxTokens
    },
    {
      headers: {
        Authorization: `Bearer ${config.llmApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 12000
    }
  );

  return response && response.data
    && response.data.choices
    && response.data.choices[0]
    && response.data.choices[0].message
    ? String(response.data.choices[0].message.content || '').trim()
    : '';
}

// ==================== 系统提示词 ====================

const SYSTEM_PROMPT = `你是一个专业的中国古建筑导览助手，专门为用户提供故宫、苏州园林等古建筑的讲解服务。

回答要求：
1. 回答简洁明了，控制在150-200字以内
2. 内容准确，基于历史事实
3. 语言通俗易懂，适合游客理解
4. 如果问题与古建筑无关，礼貌引导用户提问相关问题
5. 如果问题超出知识范围，诚实地告知用户

你可以回答的问题类型：
- 古建筑的历史背景
- 建筑特色和结构
- 著名事件和故事
- 参观建议和文化内涵

请始终以友好、专业的态度回答用户的问题。`;

// ==================== 核心函数 ====================

/**
 * 调用AI API获取回答
 * @param {string} question - 用户问题
 * @returns {Promise<string>} - AI回答
 */
async function getAIAnswer(question) {
  if (!hasUsableApiKey()) {
    console.log('⚠️ API Key未配置，返回模拟回答');
    return getMockAnswer(question);
  }

  try {
    const answer = await requestChatCompletion({
      userContent: question,
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 500
    });

    if (!answer) {
      return getMockAnswer(question);
    }

    console.log('✅ AI API调用成功');
    return answer;
  } catch (error) {
    console.error('❌ AI API调用失败:', error.message);
    // API调用失败时返回模拟回答
    return getMockAnswer(question);
  }
}

/**
 * 获取模拟回答（用于演示或API未配置时）
 * @param {string} question - 用户问题
 * @returns {string} - 模拟回答
 */
function getMockAnswer(question) {
  const lowerQuestion = question.toLowerCase();

  // 故宫相关问题
  if (lowerQuestion.includes('太和殿')) {
    return '太和殿建成于明永乐十八年（1420年），是故宫规模最大、等级最高的建筑，用于举行大典。殿高35.05米，建筑面积2377平方米，是中国现存最大的木结构大殿。殿内装饰华丽，金龙和玺彩画，宝座前设有日晷、嘉量等器物。';
  }
  if (lowerQuestion.includes('乾清宫')) {
    return '乾清宫是明清皇帝的寝宫，建于明永乐十八年。清代雍正帝后，皇帝移居养心殿，乾清宫改为皇帝处理日常政务的场所。殿内悬挂"正大光明"匾额，是清代秘密立储制度的见证。';
  }
  if (lowerQuestion.includes('中和殿')) {
    return '中和殿位于太和殿与保和殿之间，是一座平面呈方形的建筑。皇帝在举行大典前，在此休息并接受执事官员朝拜。殿名取自《礼记·中庸》："中也者，天下之本也；和也者，天下之达道也。"';
  }
  if (lowerQuestion.includes('保和殿')) {
    return '保和殿是故宫外朝三大殿之一，建于明永乐十八年。明代皇帝常在此更衣，清代改为举行宴会和殿试的场所。殿后的云龙石雕是故宫最大的石雕，重达250吨。';
  }
  if (lowerQuestion.includes('御花园')) {
    return '御花园位于紫禁城中轴线上，坤宁宫后方，是明清两代帝后游赏的地方。园内建筑对称布局，有钦安殿、浮碧亭、万春亭等建筑，古柏参天，环境幽雅。';
  }
  if (lowerQuestion.includes('午门')) {
    return '午门是故宫的正门，因位于紫禁城南北轴线的南面而得名。门楼采用重檐庑殿顶，是中国古代建筑最高等级的屋顶形式。明代皇帝常在午门举行献俘仪式。';
  }
  if (lowerQuestion.includes('天安门')) {
    return '天安门始建于明永乐十五年（1417年），原名承天门，清顺治八年（1651年）重修后改为现名。天安门是明清两代皇城的正门，1949年10月1日，毛泽东主席在此宣告中华人民共和国成立。';
  }
  if (lowerQuestion.includes('故宫') || lowerQuestion.includes('紫禁城')) {
    return '故宫，旧称紫禁城，是明清两代的皇家宫殿，位于北京中轴线的中心。建成于明永乐十八年（1420年），占地面积72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，房屋九千余间。是世界上现存规模最大、保存最为完整的木质结构古建筑之一。';
  }

  // 通用回答
  return `感谢您的提问！"${question}"涉及丰富的古建筑文化知识。

目前我的知识库正在完善中。建议您：
1. 咨询现场导游获取更详细的讲解
2. 查阅相关历史文献资料
3. 参观时关注建筑上的说明牌

如果您有其他关于故宫的问题，欢迎继续提问！`;
}

async function normalizeQuestion(question) {
  const rawQuestion = String(question || '').trim();
  if (!rawQuestion || !hasUsableApiKey()) {
    return rawQuestion;
  }

  const normalizePrompt = `你是中文古建筑问答系统的输入纠错器。请仅做轻量纠错与标准化，不扩写、不解释。
要求：
1. 修正明显错别字和常见口误。
2. 保留原问题意图。
3. 只返回一句纠正后的问题文本，不要任何额外说明。`;

  try {
    const normalized = await requestChatCompletion({
      userContent: rawQuestion,
      systemPrompt: normalizePrompt,
      temperature: 0,
      maxTokens: 120
    });

    return String(normalized || rawQuestion).trim() || rawQuestion;
  } catch (error) {
    console.warn('⚠️ 问题纠正失败，回退原问题:', error.message);
    return rawQuestion;
  }
}

async function rewriteKnowledgeAnswer(question, knowledgeAnswer) {
  const q = String(question || '').trim();
  const a = String(knowledgeAnswer || '').trim();

  if (!q || !a || !hasUsableApiKey()) {
    return a;
  }

  const rewritePrompt = `你是古建筑导览讲解编辑器。
请把“知识库原答案”润色成更自然、简洁、对游客友好的中文回答。
要求：
1. 忠于原答案事实，不新增未经给出的事实。
2. 控制在120-220字。
3. 语气自然，适合前端直接展示。
4. 只返回最终答案，不要解释过程。`;

  try {
    const content = `用户问题：${q}\n\n知识库原答案：${a}`;
    const rewritten = await requestChatCompletion({
      userContent: content,
      systemPrompt: rewritePrompt,
      temperature: 0.3,
      maxTokens: 320
    });

    return String(rewritten || a).trim() || a;
  } catch (error) {
    console.warn('⚠️ 答案润色失败，回退原答案:', error.message);
    return a;
  }
}

/**
 * 测试AI服务
 */
async function testAIService() {
  const testQuestions = [
    '太和殿的历史是什么？',
    '故宫是什么时候建成的？',
    '乾清宫有什么特色？'
  ];

  console.log('\n🧪 开始测试AI服务...\n');

  for (const question of testQuestions) {
    console.log(`Q: ${question}`);
    try {
      const answer = await getAIAnswer(question);
      console.log(`A: ${answer.substring(0, 100)}...\n`);
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}\n`);
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  testAIService();
}

module.exports = {
  getAIAnswer,
  normalizeQuestion,
  rewriteKnowledgeAnswer,
  getMockAnswer,
  testAIService
};
