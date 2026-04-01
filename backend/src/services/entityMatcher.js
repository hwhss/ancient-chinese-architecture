const config = require('../config');
const { getBuildings } = require('../repositories/dataRepository');

const DEFAULT_MIN_CONFIDENCE = 0.35;

// 针对常见泛称补充实体别名，优先映射到可展示的实景建筑条目
const SPECIAL_ALIAS_RULES = [
  {
    aliases: ['故宫', '紫禁城', '北京故宫', '故宫博物院'],
    preferredNames: ['太和殿'],
    fallbackIds: ['gugong_01', 'taihe_dian']
  },
  {
    aliases: ['苏州园林'],
    preferredNames: ['拙政园'],
    fallbackIds: ['zhuozheng_01', 'zhuozheng_garden']
  }
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function hasText(haystack, needle) {
  if (!needle) {
    return false;
  }
  return normalizeText(haystack).includes(normalizeText(needle));
}

function getCandidateTokens(item) {
  const tokens = [];

  if (item.name) {
    tokens.push(String(item.name).trim());
  }
  if (item.alias) {
    tokens.push(String(item.alias).trim());
  }
  for (const tag of toArray(item.tags)) {
    tokens.push(String(tag).trim());
  }

  return tokens.filter(Boolean);
}

function scoreCandidate(item, questionText, answerText) {
  let score = 0;
  const reasons = [];

  const name = String(item.name || '').trim();
  const tokens = getCandidateTokens(item);

  if (name) {
    if (hasText(answerText, name)) {
      score += 1.0;
      reasons.push(`answer:name:${name}`);
    }
    if (hasText(questionText, name)) {
      score += 0.7;
      reasons.push(`question:name:${name}`);
    }
  }

  for (const token of tokens) {
    if (token === name) {
      continue;
    }
    if (hasText(answerText, token)) {
      score += 0.35;
      reasons.push(`answer:token:${token}`);
    }
    if (hasText(questionText, token)) {
      score += 0.25;
      reasons.push(`question:token:${token}`);
    }
  }

  if (hasText(answerText, item.location)) {
    score += 0.2;
    reasons.push(`answer:location:${item.location}`);
  }

  return {
    id: item.id,
    name,
    confidence: Math.min(score, 1),
    reasons
  };
}

function resolveByAliasRule(buildings, questionText, answerText) {
  for (const rule of SPECIAL_ALIAS_RULES) {
    const triggered = rule.aliases.some((alias) => hasText(questionText, alias) || hasText(answerText, alias));
    if (!triggered) {
      continue;
    }

    const byName = buildings.find((item) =>
      rule.preferredNames.some((name) => normalizeText(item.name) === normalizeText(name))
    );
    if (byName) {
      return {
        id: byName.id,
        name: byName.name,
        confidence: 0.9,
        matchedBy: 'alias_rule',
        matchedText: rule.aliases.find((alias) => hasText(questionText, alias) || hasText(answerText, alias)) || ''
      };
    }

    const byId = buildings.find((item) => rule.fallbackIds.includes(item.id));
    if (byId) {
      return {
        id: byId.id,
        name: byId.name,
        confidence: 0.85,
        matchedBy: 'alias_rule',
        matchedText: rule.aliases.find((alias) => hasText(questionText, alias) || hasText(answerText, alias)) || ''
      };
    }
  }

  return null;
}

async function resolveBuildingEntities(question, answer, options = {}) {
  const buildings = await getBuildings();
  const questionText = String(question || '').trim();
  const answerText = String(answer || '').trim();

  if (!buildings.length || (!questionText && !answerText)) {
    return {
      primary: null,
      entities: []
    };
  }

  const aliasHit = resolveByAliasRule(buildings, questionText, answerText);
  const scored = buildings
    .map((item) => scoreCandidate(item, questionText, answerText))
    .filter((item) => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const minConfidence = Number.isFinite(Number(config.chatEntityMinConfidence))
    ? Number(config.chatEntityMinConfidence)
    : DEFAULT_MIN_CONFIDENCE;

  const topEntities = scored
    .filter((item) => item.confidence >= minConfidence)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.name,
      confidence: Number(item.confidence.toFixed(3)),
      matchedBy: 'text_score',
      matchedText: item.reasons[0] || ''
    }));

  const primary = aliasHit || topEntities[0] || null;

  if (options.preferredId && !primary) {
    const preferred = buildings.find((item) => item.id === options.preferredId);
    if (preferred) {
      return {
        primary: {
          id: preferred.id,
          name: preferred.name,
          confidence: 0.8,
          matchedBy: 'preferred_id',
          matchedText: options.preferredId
        },
        entities: topEntities
      };
    }
  }

  return {
    primary,
    entities: topEntities
  };
}

module.exports = {
  resolveBuildingEntities
};