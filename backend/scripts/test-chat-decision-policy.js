#!/usr/bin/env node

const {
  decideKnowledgeCandidate
} = require('../src/services/retrieval/hybridRetriever');

const CASES = [
  {
    name: '强关键词规则直接通过',
    candidates: [
      {
        keywordScore: 78,
        vectorSimilarity: 0.12,
        hybridScore: 0.5,
        decisionScore: 0.51,
        question: '太和殿是什么',
        answer: '...',
        materialId: 'taihe_dian'
      }
    ],
    expectAccepted: true,
    expectReason: 'strong_keyword_rule'
  },
  {
    name: '向量单腿低可靠拒绝',
    candidates: [
      {
        keywordScore: 0,
        vectorSimilarity: 0.6,
        hybridScore: 0.42,
        decisionScore: 0.5,
        question: '候选1',
        answer: '...'
      }
    ],
    expectAccepted: false,
    expectReason: 'vector_only_not_reliable'
  },
  {
    name: '分差太小拒绝',
    candidates: [
      {
        keywordScore: 22,
        vectorSimilarity: 0.83,
        hybridScore: 0.58,
        decisionScore: 0.56,
        question: '候选1',
        answer: '...'
      },
      {
        keywordScore: 20,
        vectorSimilarity: 0.81,
        hybridScore: 0.57,
        decisionScore: 0.52,
        question: '候选2',
        answer: '...'
      }
    ],
    expectAccepted: false,
    expectReason: 'decision_gap_too_small'
  }
];

function runCase(item) {
  const result = decideKnowledgeCandidate(item.candidates);
  const pass = result.accepted === item.expectAccepted && result.reason === item.expectReason;

  console.log(`\n[${pass ? 'PASS' : 'FAIL'}] ${item.name}`);
  console.log(`accepted: ${result.accepted}`);
  console.log(`reason: ${result.reason}`);
  return pass;
}

function main() {
  console.log('🧪 检索决策层策略测试');
  let passCount = 0;

  for (const c of CASES) {
    if (runCase(c)) {
      passCount += 1;
    }
  }

  console.log(`\n结果: ${passCount}/${CASES.length} 通过`);
  if (passCount !== CASES.length) {
    process.exit(1);
  }
}

main();
