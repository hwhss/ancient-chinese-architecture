#!/usr/bin/env node

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.DATA_SOURCE = process.env.DATA_SOURCE || 'json';

const { resolveBuildingEntities } = require('../src/services/entityMatcher');

const CASES = [
  {
    name: '故宫泛称映射到实景条目',
    question: '中国最有名的古建筑是哪个？',
    answer: '通常会提到故宫（紫禁城），它是中国最具代表性的古建筑群之一。',
    expectOneOf: ['taihe_dian']
  },
  {
    name: '明确建筑名直连',
    question: '赵州桥有什么特点？',
    answer: '赵州桥是世界现存最早的敞肩石拱桥。',
    expectOneOf: ['zhaozhou_bridge']
  },
  {
    name: '弱相关场景拒绝主实体并返回候选',
    question: '太和殿和中和殿哪个更有代表性？',
    answer: '太和殿和中和殿都很有代表性，二者在礼制与空间功能上各有侧重。',
    expectPrimaryNull: true,
    expectHasCandidates: true
  }
];

async function runCase(item) {
  const result = await resolveBuildingEntities(item.question, item.answer);
  const actualId = result && result.primary ? result.primary.id : null;
  const passById = Array.isArray(item.expectOneOf)
    ? Boolean(actualId) && item.expectOneOf.includes(actualId)
    : true;
  const passByNull = item.expectPrimaryNull ? actualId === null : true;
  const passByCandidates = item.expectHasCandidates
    ? Array.isArray(result.entities) && result.entities.length > 0
    : true;
  const pass = passById && passByNull && passByCandidates;

  console.log(`\n[${pass ? 'PASS' : 'FAIL'}] ${item.name}`);
  console.log(`question: ${item.question}`);
  console.log(`answer: ${item.answer}`);
  console.log(`primary.id: ${actualId || 'null'}`);
  console.log(`primary.name: ${(result.primary && result.primary.name) || 'null'}`);
  console.log(`decision: ${JSON.stringify(result.decision || {})}`);
  console.log(`entities: ${(result.entities || []).map((e) => `${e.id}:${e.confidence}`).join(', ') || 'none'}`);

  return pass;
}

async function main() {
  console.log('🧪 Chat 回答后二次实体匹配回归测试');
  let passCount = 0;

  for (const c of CASES) {
    const pass = await runCase(c);
    if (pass) {
      passCount += 1;
    }
  }

  console.log(`\n结果: ${passCount}/${CASES.length} 通过`);
  if (passCount !== CASES.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ test-chat-entity-post-match failed:', error.message);
  process.exit(1);
});