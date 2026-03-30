#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

process.env.DATA_SOURCE = process.env.DATA_SOURCE || 'postgres';
process.env.ENABLE_VECTOR_RETRIEVAL = process.env.ENABLE_VECTOR_RETRIEVAL || 'true';

const { getChatResponse } = require('../src/services/chatService');

const CASES = [
  {
    name: '错别字-太和殿',
    question: '太和店的功能是啥',
    expectMaterialId: 'gugong_01'
  },
  {
    name: '别名-紫禁城最大殿',
    question: '紫禁城最大的大殿高度是多少',
    expectMaterialId: 'gugong_01'
  },
  {
    name: '口语-故宫建成时间',
    question: '故宫啥时候建好的',
    expectMaterialId: 'gugong_01'
  }
];

async function runCase(item) {
  const result = await getChatResponse(item.question);
  const passSource = result.source !== 'ai';
  const passMaterial = !item.expectMaterialId || result.materialId === item.expectMaterialId;
  const passed = passSource && passMaterial;

  const score = (result.debug && result.debug.matchScore) || {};

  console.log(`\n[${passed ? 'PASS' : 'FAIL'}] ${item.name}`);
  console.log(`Q: ${item.question}`);
  console.log(`source: ${result.source}`);
  console.log(`materialId: ${result.materialId || 'null'}`);
  console.log(`keywordScore: ${score.keywordScore || 0}`);
  console.log(`vectorSimilarity: ${score.vectorSimilarity || 0}`);
  console.log(`hybridScore: ${score.hybridScore || 0}`);
  console.log(`answer: ${String(result.answer || '').slice(0, 120)}...`);

  return passed;
}

async function main() {
  console.log('\n🧪 Chat 错别字/别名回归测试');
  let passCount = 0;

  for (const c of CASES) {
    const passed = await runCase(c);
    if (passed) {
      passCount += 1;
    }
  }

  console.log(`\n结果: ${passCount}/${CASES.length} 通过`);

  if (passCount !== CASES.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ test-chat-regression failed:', error.message);
  process.exit(1);
});
