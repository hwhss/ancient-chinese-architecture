#!/usr/bin/env node

const path = require('path');
const axios = require('axios');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testEmbedding() {
  const apiUrl = process.env.EMBEDDING_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const apiKey = process.env.DASHSCOPE_API_KEY || process.env.EMBEDDING_API_KEY;
  const model = process.env.EMBEDDING_MODEL || 'text-embedding-v4';

  console.log('\n🧪 开始测试 DashScope Embedding\n');
  console.log('配置信息：');
  console.log(`  API URL: ${apiUrl}`);
  console.log(`  Model: ${model}`);
  console.log(`  API Key: ${apiKey ? '✓ 已配置' : '❌ 未配置'}\n`);

  if (!apiKey) {
    console.error('❌ DASHSCOPE_API_KEY 未配置，请在 .env 中设置。\n');
    console.log('示例：');
    console.log('  DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx');
    process.exit(1);
  }

  const testTexts = [
    '太和殿有多高？',
    '故宫最大那个殿它的高度是多少啊？',
    '故宫是什么时候建成的？'
  ];

  try {
    console.log('发送测试请求...\n');

    for (const text of testTexts) {
      console.log(`📝 测试文本: "${text}"`);

      try {
        const response = await axios.post(
          `${apiUrl}/embeddings`,
          {
            model,
            input: text
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        if (!response.data.data || !Array.isArray(response.data.data) || !response.data.data[0].embedding) {
          console.error('❌ 响应格式异常：');
          console.error(JSON.stringify(response.data, null, 2));
          continue;
        }

        const embedding = response.data.data[0].embedding;
        const dim = embedding.length;

        console.log(`  ✅ 成功`);
        console.log(`  维度: ${dim}`);
        console.log(`  向量样本: [${embedding.slice(0, 5).map((v) => v.toFixed(4)).join(', ')}, ...]`);
        console.log(`  响应时间: ${response.headers['x-cost-usage'] || 'N/A'}\n`);

        // 验证维度
        if (dim !== 1536 && dim !== 1024) {
          console.warn(`⚠️  维度 ${dim} 与预期不符，请在 .env 中更新 EMBEDDING_DIM=${dim}\n`);
        }
      } catch (innerError) {
        if (innerError.response) {
          console.error(`  ❌ API 返回错误 (${innerError.response.status}):`);
          console.error(`     ${JSON.stringify(innerError.response.data)}`);
        } else {
          console.error(`  ❌ 请求失败: ${innerError.message}`);
        }
        console.log();
      }
    }

    console.log('✅ 测试完成。\n');
  } catch (error) {
    console.error('❌ 测试异常:', error.message, '\n');
  }
}

testEmbedding().catch((error) => {
  console.error('❌ 未捕获异常:', error);
  process.exit(1);
});
