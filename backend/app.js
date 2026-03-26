const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// 导入AI服务
const { getAIAnswer } = require('./services/aiService');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 读取本地数据文件
const knowledgeBasePath = path.join(__dirname, 'data', 'knowledge_base.json');
const materialLinksPath = path.join(__dirname, 'data', 'material_links.json');

let knowledgeBase = [];
let materialLinks = [];

// 加载数据
try {
  if (fs.existsSync(knowledgeBasePath)) {
    knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
    console.log(`✅ 知识库加载完成，共 ${knowledgeBase.length} 条数据`);
  } else {
    console.log('⚠️ 知识库文件不存在，使用空数组');
  }

  if (fs.existsSync(materialLinksPath)) {
    materialLinks = JSON.parse(fs.readFileSync(materialLinksPath, 'utf8'));
    console.log(`✅ 素材链接加载完成，共 ${materialLinks.length} 条数据`);
  } else {
    console.log('⚠️ 素材链接文件不存在，使用空数组');
  }
} catch (error) {
  console.error('❌ 加载数据文件失败:', error.message);
}

// ========== 路由 ==========

// 测试接口
app.get('/test', (req, res) => {
  res.json({
    code: 200,
    msg: 'success',
    data: {
      message: '古建筑AI导览服务运行正常',
      timestamp: new Date().toISOString()
    }
  });
});

// 问答接口
app.post('/api/chat', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.json({
        code: 400,
        msg: '问题不能为空'
      });
    }

    console.log(`📝 收到问题: ${question}`);

    // 先尝试从本地知识库匹配
    const localAnswer = findAnswerInKnowledgeBase(question);
    if (localAnswer) {
      console.log('✅ 从知识库匹配到答案');
      return res.json({
        code: 200,
        msg: 'success',
        data: {
          answer: localAnswer,
          question: question,
          source: 'knowledge_base'
        }
      });
    }

    // 知识库未匹配到，调用AI API
    console.log('🤖 调用AI API获取回答');
    const aiAnswer = await getAIAnswer(question);

    res.json({
      code: 200,
      msg: 'success',
      data: {
        answer: aiAnswer,
        question: question,
        source: 'ai'
      }
    });
  } catch (error) {
    console.error('❌ 问答接口错误:', error.message);
    res.json({
      code: 500,
      msg: '服务异常，请重试',
      error: error.message
    });
  }
});

// 素材查询接口
app.get('/api/material', (req, res) => {
  try {
    const { materialId } = req.query;

    if (!materialId) {
      return res.json({
        code: 400,
        msg: 'materialId不能为空'
      });
    }

    // 查找素材
    const material = materialLinks.find(m => m.materialId === materialId);

    if (!material) {
      return res.json({
        code: 404,
        msg: '素材不存在'
      });
    }

    res.json({
      code: 200,
      msg: 'success',
      data: {
        url: material.url,
        type: material.type,
        source: material.source
      }
    });
  } catch (error) {
    console.error('❌ 素材查询接口错误:', error.message);
    res.json({
      code: 500,
      msg: '服务异常'
    });
  }
});

// 获取知识库列表（管理用）
app.get('/api/knowledge', (req, res) => {
  res.json({
    code: 200,
    msg: 'success',
    data: knowledgeBase
  });
});

// 获取素材列表（管理用）
app.get('/api/materials', (req, res) => {
  res.json({
    code: 200,
    msg: 'success',
    data: materialLinks
  });
});

// ========== 辅助函数 ==========

// 在知识库中查找答案（简单关键词匹配）
function findAnswerInKnowledgeBase(question) {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    return null;
  }

  // 提取问题中的关键词进行匹配
  for (const item of knowledgeBase) {
    if (item.keywords && item.keywords.length > 0) {
      const match = item.keywords.some(keyword =>
        question.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) {
        return item.answer;
      }
    }
    // 问题文本包含匹配
    if (question.toLowerCase().includes(item.question.toLowerCase()) ||
        item.question.toLowerCase().includes(question.toLowerCase())) {
      return item.answer;
    }
  }
  return null;
}

// 启动服务器
app.listen(port, () => {
  console.log('\n🏯 古建筑AI导览服务已启动');
  console.log(`📍 本地访问: http://localhost:${port}`);
  console.log(`📍 测试接口: http://localhost:${port}/test`);
  console.log(`📍 问答接口: http://localhost:${port}/api/chat`);
  console.log(`📍 素材接口: http://localhost:${port}/api/material?materialId=gugong_01\n`);
});

module.exports = app;
