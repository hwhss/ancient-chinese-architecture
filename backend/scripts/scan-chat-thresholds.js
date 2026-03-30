#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const CASES = [
  {
    name: '错别字-太和殿',
    question: '太和店的功能是啥',
    expectedMaterialId: 'gugong_01',
    expectedNonAi: true
  },
  {
    name: '别名-紫禁城最大殿',
    question: '紫禁城最大的大殿高度是多少',
    expectedMaterialId: 'gugong_01',
    expectedNonAi: true
  },
  {
    name: '口语-故宫建成时间',
    question: '故宫啥时候建好的',
    expectedMaterialId: 'gugong_01',
    expectedNonAi: true
  },
  {
    name: '无关问题-天气',
    question: '今天北京天气怎么样',
    expectedNonAi: false
  }
];

const VECTOR_GRID = [0.15, 0.2, 0.25, 0.3];
const HYBRID_GRID = [0.15, 0.2, 0.25, 0.3];

function clearAppModuleCache() {
  const root = path.join(__dirname, '..');
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(root)) {
      delete require.cache[key];
    }
  });
}

async function evaluateOneGrid(vectorThreshold, hybridThreshold) {
  process.env.DATA_SOURCE = 'postgres';
  process.env.ENABLE_VECTOR_RETRIEVAL = 'true';
  process.env.CHAT_DEBUG_ENABLED = 'true';
  process.env.ENABLE_CHAT_REWRITE = 'false';
  process.env.ENABLE_QUESTION_NORMALIZE = 'true';
  process.env.CHAT_VECTOR_SIMILARITY_THRESHOLD = String(vectorThreshold);
  process.env.CHAT_HYBRID_SCORE_THRESHOLD = String(hybridThreshold);

  clearAppModuleCache();
  const { getChatResponse } = require('../src/services/chatService');

  let passCount = 0;
  let falsePositiveCount = 0;
  const details = [];

  for (const c of CASES) {
    const result = await getChatResponse(c.question);
    const isAi = result.source === 'ai';
    const passIntent = c.expectedNonAi ? !isAi : isAi;
    const passMaterial = !c.expectedMaterialId || result.materialId === c.expectedMaterialId;
    const passed = passIntent && passMaterial;

    if (c.expectedNonAi === false && !isAi) {
      falsePositiveCount += 1;
    }
    if (passed) {
      passCount += 1;
    }

    details.push({
      name: c.name,
      source: result.source,
      materialId: result.materialId || 'null',
      passed,
      score: (result.debug && result.debug.matchScore) || {}
    });
  }

  return {
    vectorThreshold,
    hybridThreshold,
    passCount,
    total: CASES.length,
    falsePositiveCount,
    details
  };
}

function formatRatio(n, d) {
  if (!d) {
    return '0.00%';
  }
  return `${((n / d) * 100).toFixed(2)}%`;
}

async function main() {
  console.log('\n🧪 Chat 阈值小扫描（vector/hybrid）\n');
  console.log(`样本数: ${CASES.length}`);
  console.log(`vector阈值网格: ${VECTOR_GRID.join(', ')}`);
  console.log(`hybrid阈值网格: ${HYBRID_GRID.join(', ')}\n`);

  const all = [];

  for (const v of VECTOR_GRID) {
    for (const h of HYBRID_GRID) {
      const result = await evaluateOneGrid(v, h);
      all.push(result);
      console.log(
        `vector=${v.toFixed(2)} hybrid=${h.toFixed(2)} => pass ${result.passCount}/${result.total}` +
        ` (${formatRatio(result.passCount, result.total)}), falsePositive=${result.falsePositiveCount}`
      );
    }
  }

  const sorted = all.slice().sort((a, b) => {
    if (b.passCount !== a.passCount) {
      return b.passCount - a.passCount;
    }
    if (a.falsePositiveCount !== b.falsePositiveCount) {
      return a.falsePositiveCount - b.falsePositiveCount;
    }
    return (a.vectorThreshold + a.hybridThreshold) - (b.vectorThreshold + b.hybridThreshold);
  });

  const best = sorted[0];

  console.log('\n📌 最优候选阈值:');
  console.log(`CHAT_VECTOR_SIMILARITY_THRESHOLD=${best.vectorThreshold.toFixed(2)}`);
  console.log(`CHAT_HYBRID_SCORE_THRESHOLD=${best.hybridThreshold.toFixed(2)}`);
  console.log(`pass=${best.passCount}/${best.total}, falsePositive=${best.falsePositiveCount}\n`);

  console.log('📋 最优阈值样本明细:');
  best.details.forEach((d) => {
    const s = d.score || {};
    console.log(
      `- ${d.passed ? 'PASS' : 'FAIL'} ${d.name} | source=${d.source} | materialId=${d.materialId}` +
      ` | keyword=${Number(s.keywordScore || 0).toFixed(3)}` +
      ` | vector=${Number(s.vectorSimilarity || 0).toFixed(3)}` +
      ` | hybrid=${Number(s.hybridScore || 0).toFixed(3)}`
    );
  });
  console.log();
}

main().catch((error) => {
  console.error('❌ scan-chat-thresholds failed:', error.message);
  process.exit(1);
});
