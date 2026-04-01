#!/usr/bin/env node

const assert = require('assert');

process.env.LLM_API_KEY = process.env.LLM_API_KEY || 'mock-prefix-regression-key';
process.env.LLM_API_URL = process.env.LLM_API_URL || 'https://mock.llm.local/v1';

const axios = require('axios');
const { normalizeQuestion, rewriteKnowledgeAnswer } = require('../services/aiService');

const originalPost = axios.post;

function mockChatOutputs(outputs) {
  let index = 0;

  axios.post = async () => {
    if (index >= outputs.length) {
      throw new Error('No mocked LLM output left for this test case');
    }

    const content = outputs[index++];
    return {
      data: {
        choices: [
          {
            message: {
              content
            }
          }
        ]
      }
    };
  };
}

async function run() {
  console.log('\n🧪 AI 前缀清洗回归测试');

  mockChatOutputs(['问题纠正：太和殿在哪里']);
  const normalized = await normalizeQuestion('太和店在那');
  assert.strictEqual(normalized, '太和殿在哪里', 'normalizeQuestion 应去掉“问题纠正：”前缀');
  console.log('✅ normalizeQuestion 去前缀通过');

  mockChatOutputs(['回答：太和殿建于明永乐十八年（1420年）。']);
  const rewritten = await rewriteKnowledgeAnswer('太和殿什么时候建成？', '太和殿建于明永乐十八年（1420年）。');
  assert.strictEqual(
    rewritten,
    '太和殿建于明永乐十八年（1420年）。',
    'rewriteKnowledgeAnswer 应去掉“回答：”前缀'
  );
  console.log('✅ rewriteKnowledgeAnswer 去前缀通过');

  mockChatOutputs(['答案：']);
  const rewriteFallback = await rewriteKnowledgeAnswer('故宫建成时间？', '故宫建成于明永乐十八年（1420年）。');
  assert.strictEqual(
    rewriteFallback,
    '故宫建成于明永乐十八年（1420年）。',
    '清洗后为空时应回退知识库原答案'
  );
  console.log('✅ 空结果回退通过');

  console.log('\n🎉 前缀清洗回归测试全部通过');
}

run()
  .catch((error) => {
    console.error('\n❌ test-ai-prefix-regression failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    axios.post = originalPost;
  });
