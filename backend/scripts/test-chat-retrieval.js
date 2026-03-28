#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

process.env.DATA_SOURCE = process.env.DATA_SOURCE || 'postgres';
process.env.ENABLE_VECTOR_RETRIEVAL = process.env.ENABLE_VECTOR_RETRIEVAL || 'true';

const { getChatResponse } = require('../src/services/chatService');

async function main() {
  const questions = [
    '太和殿的功能是什么？',
    '故宫最大那个殿它的高度是多少啊？',
    '故宫是什么时候建成的？'
  ];

  for (const q of questions) {
    const result = await getChatResponse(q);
    console.log(`\nQ: ${q}`);
    console.log(`source: ${result.source}`);
    console.log(`materialId: ${result.materialId || 'null'}`);
    console.log(`answer: ${String(result.answer || '').slice(0, 120)}...`);
  }
}

main().catch((error) => {
  console.error('❌ test-chat-retrieval failed:', error.message);
  process.exit(1);
});
