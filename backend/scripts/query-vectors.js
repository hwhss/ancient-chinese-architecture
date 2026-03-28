#!/usr/bin/env node

const path = require('path');
const readline = require('readline');
const axios = require('axios');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { query } = require('../src/config/database');
const config = require('../src/config');

let rl = null;

function getReadline() {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return rl;
}

function prompt(question) {
  return new Promise((resolve) => {
    getReadline().question(question, resolve);
  });
}

async function createEmbedding(text) {
  if (!config.embeddingApiUrl || !config.embeddingApiKey || !config.embeddingModel) {
    throw new Error('Embedding 配置不完整');
  }

  try {
    const response = await axios.post(
      `${config.embeddingApiUrl}/embeddings`,
      {
        model: config.embeddingModel,
        input: text
      },
      {
        headers: {
          Authorization: `Bearer ${config.embeddingApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.data && response.data.data[0] && response.data.data[0].embedding) {
      return response.data.data[0].embedding;
    }

    throw new Error('响应格式异常');
  } catch (error) {
    console.error('❌ Embedding 生成失败:', error.message);
    return null;
  }
}

function formatVectorLiteral(embedding) {
  return `[${embedding.join(',')}]`;
}

async function searchSimilarKnowledge(question) {
  if (config.dataSource !== 'postgres') {
    console.error('❌ 仅支持 PostgreSQL 查询\n');
    return;
  }

  console.log('\n🔍 生成问题向量中...');

  const embedding = await createEmbedding(question);
  if (!embedding) {
    console.error('❌ 生成向量失败\n');
    return;
  }

  console.log('📊 执行相似度检索...\n');

  const vectorLiteral = formatVectorLiteral(embedding);
  const topK = config.chatVectorTopK || 5;
  const threshold = config.chatVectorSimilarityThreshold || 0.78;

  const sql = `
    SELECT
      kb.id,
      kb.question,
      kb.answer,
      kb.keywords,
      1 - (ke.embedding <=> $1::vector) AS similarity
    FROM knowledge_embeddings ke
    JOIN knowledge_base kb ON kb.id = ke.knowledge_id
    WHERE ke.embedding_model = $2
    ORDER BY ke.embedding <=> $1::vector
    LIMIT $3
  `;

  try {
    const rows = await query(sql, [vectorLiteral, config.embeddingModel, topK]);

    if (!rows.length) {
      console.warn('⚠️  未找到匹配的知识点\n');
      return;
    }

    console.log(`📋 找到 ${rows.length} 条相关知识点：\n`);
    console.log('-'.repeat(80));

    let matched = 0;

    rows.forEach((row, idx) => {
      const similarity = Number(row.similarity);
      const isMatched = similarity >= threshold;

      if (isMatched) {
        matched++;
      }

      const marker = isMatched ? '✅' : '⏳';
      const status = isMatched ? `(命中，相似度${(similarity * 100).toFixed(1)}%)` : `(未达阈值${(similarity * 100).toFixed(1)}% < ${(threshold * 100).toFixed(1)}%)`;

      console.log(`${marker} 结果 ${idx + 1}  ${status}`);
      console.log(`   原问题: ${row.question}`);
      console.log(`   答案: ${row.answer.substring(0, 100)}${row.answer.length > 100 ? '...' : ''}`);

      if (Array.isArray(row.keywords) && row.keywords.length) {
        console.log(`   关键词: ${row.keywords.join(', ')}`);
      }

      console.log();
    });

    console.log('-'.repeat(80));
    console.log(`\n检索结果：${matched} 条命中（阈值: ${(threshold * 100).toFixed(1)}%）\n`);
  } catch (error) {
    if (error.code === '42P01') {
      console.error('❌ knowledge_embeddings 表不存在');
      console.error('   请先执行：npm run import:vectors\n');
    } else {
      console.error('❌ 查询异常:', error.message, '\n');
    }
  }
}

async function main() {
  console.log('\n🧪 向量检索测试工具\n');

  console.log('配置信息：');
  console.log(`  数据源: ${config.dataSource}`);
  console.log(`  Model: ${config.embeddingModel}`);
  console.log(`  TopK: ${config.chatVectorTopK}`);
  console.log(`  阈值: ${(config.chatVectorSimilarityThreshold * 100).toFixed(1)}%\n`);

  if (!process.stdin.isTTY) {
    const chunks = [];
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }

    const inputText = chunks.join('').trim();
    const lines = inputText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.toLowerCase() === 'exit') {
        break;
      }
      await searchSimilarKnowledge(line);
    }

    console.log('👋 测试完成\n');
    return;
  }

  let continueTest = true;

  while (continueTest) {
    const question = await prompt('输入待测试的问题 (输入 exit 退出): ');

    if (question.toLowerCase() === 'exit' || !question.trim()) {
      continueTest = false;
      break;
    }

    await searchSimilarKnowledge(question.trim());
  }

  getReadline().close();
  console.log('👋 测试完成\n');
}

main().catch((error) => {
  console.error('❌ 异常:', error);
  if (rl) {
    rl.close();
  }
  process.exit(1);
});
