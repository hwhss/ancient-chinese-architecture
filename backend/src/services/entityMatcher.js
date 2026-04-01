const fs = require('fs');
const path = require('path');
const config = require('../config');
const { getBuildings } = require('../repositories/dataRepository');

const DEFAULT_MIN_CONFIDENCE = 0.35;
const DEFAULT_MIN_GAP = 0.08;

let cachedAliasRules = null;

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

function clamp(value, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function readAliasRulesFile() {
  const filePath = path.join(__dirname, '..', '..', 'data', 'entity_alias_rules.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('⚠️ entity_alias_rules.json 解析失败，已回退默认行为:', error.message);
    return [];
  }
}

function getAliasRules() {
  if (!cachedAliasRules) {
    cachedAliasRules = readAliasRulesFile();
  }
  return cachedAliasRules;
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
  const name = String(item.name || '').trim();
  const tokens = getCandidateTokens(item);

  let lexical = 0;
  let context = 0;
  const reasons = [];

  if (name && hasText(answerText, name)) {
    lexical += 0.65;
    reasons.push(`answer:name:${name}`);
  }
  if (name && hasText(questionText, name)) {
    lexical += 0.45;
    reasons.push(`question:name:${name}`);
  }

  for (const token of tokens) {
    if (!token || token === name) {
      continue;
    }
    if (hasText(answerText, token)) {
      lexical += 0.18;
      reasons.push(`answer:token:${token}`);
    }
    if (hasText(questionText, token)) {
      lexical += 0.12;
      reasons.push(`question:token:${token}`);
    }
  }

  if (hasText(answerText, item.location)) {
    context += 0.1;
    reasons.push(`answer:location:${item.location}`);
  }

  const lexicalScore = clamp(lexical, 0, 1);
  const contextScore = clamp(context, 0, 1);
  const finalScore = clamp((lexicalScore * 0.85) + (contextScore * 0.15), 0, 1);

  return {
    id: item.id,
    name,
    confidence: Number(finalScore.toFixed(4)),
    lexicalScore: Number(lexicalScore.toFixed(4)),
    contextScore: Number(contextScore.toFixed(4)),
    reasons
  };
}

function resolveByAliasRule(buildings, questionText, answerText) {
  const aliasRules = getAliasRules();

  for (const rule of aliasRules) {
    const aliases = toArray(rule.aliases).map((item) => String(item).trim()).filter(Boolean);
    if (!aliases.length) {
      continue;
    }

    const matchedAlias = aliases.find((alias) => hasText(questionText, alias) || hasText(answerText, alias));
    if (!matchedAlias) {
      continue;
    }

    const preferredNames = toArray(rule.preferredNames).map((item) => normalizeText(item));
    const fallbackIds = toArray(rule.fallbackIds).map((item) => String(item));

    const byName = buildings.find((item) => preferredNames.includes(normalizeText(item.name)));
    const byId = buildings.find((item) => fallbackIds.includes(item.id));
    const matchedBuilding = byName || byId;

    if (!matchedBuilding) {
      continue;
    }

    return {
      id: matchedBuilding.id,
      name: matchedBuilding.name,
      confidence: clamp(Number(rule.confidence), 0.85, 1),
      matchedBy: 'alias_rule',
      matchedText: matchedAlias,
      deterministic: Boolean(rule.strict),
      ruleName: String(rule.name || 'alias-rule').trim()
    };
  }

  return null;
}

function toEntitySummary(item) {
  return {
    id: item.id,
    name: item.name,
    confidence: Number(item.confidence.toFixed(3)),
    matchedBy: 'text_score',
    matchedText: item.reasons[0] || '',
    score: {
      lexical: item.lexicalScore,
      context: item.contextScore
    }
  };
}

function decidePrimaryFromScores(scored, minConfidence, minGap) {
  const top1 = scored[0];
  const top2 = scored[1] || null;

  if (!top1) {
    return {
      accepted: false,
      reason: 'no_entity_candidate',
      primary: null
    };
  }

  if (top1.confidence < minConfidence) {
    return {
      accepted: false,
      reason: 'low_entity_confidence',
      primary: null
    };
  }

  if (top2 && (top1.confidence - top2.confidence) < minGap) {
    return {
      accepted: false,
      reason: 'entity_ambiguous_low_gap',
      primary: null
    };
  }

  return {
    accepted: true,
    reason: 'entity_score_accept',
    primary: {
      id: top1.id,
      name: top1.name,
      confidence: Number(top1.confidence.toFixed(3)),
      matchedBy: 'text_score',
      matchedText: top1.reasons[0] || ''
    }
  };
}

async function resolveBuildingEntities(question, answer, options = {}) {
  const buildings = await getBuildings();
  const questionText = String(question || '').trim();
  const answerText = String(answer || '').trim();

  if (!buildings.length || (!questionText && !answerText)) {
    return {
      primary: null,
      entities: [],
      decision: {
        accepted: false,
        reason: 'empty_input_or_data',
        confidence: 0,
        fallback: 'none'
      }
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
  const minGap = Number.isFinite(Number(config.chatEntityMinGap))
    ? Number(config.chatEntityMinGap)
    : DEFAULT_MIN_GAP;

  const topEntities = scored.slice(0, 3).map(toEntitySummary);

  if (aliasHit && aliasHit.deterministic) {
    return {
      primary: {
        id: aliasHit.id,
        name: aliasHit.name,
        confidence: Number(aliasHit.confidence.toFixed(3)),
        matchedBy: aliasHit.matchedBy,
        matchedText: aliasHit.matchedText
      },
      entities: topEntities,
      decision: {
        accepted: true,
        reason: 'deterministic_alias_rule',
        confidence: Number(aliasHit.confidence.toFixed(3)),
        fallback: 'none',
        ruleName: aliasHit.ruleName
      }
    };
  }

  const scoredDecision = decidePrimaryFromScores(scored, minConfidence, minGap);
  let primary = scoredDecision.primary;

  if (!primary && aliasHit) {
    primary = {
      id: aliasHit.id,
      name: aliasHit.name,
      confidence: Number(aliasHit.confidence.toFixed(3)),
      matchedBy: aliasHit.matchedBy,
      matchedText: aliasHit.matchedText
    };
  }

  if (!primary && options.preferredId) {
    const preferred = buildings.find((item) => item.id === options.preferredId);
    if (preferred) {
      primary = {
        id: preferred.id,
        name: preferred.name,
        confidence: 0.8,
        matchedBy: 'preferred_id',
        matchedText: options.preferredId
      };
    }
  }

  const accepted = Boolean(primary);
  const confidence = accepted ? Number(primary.confidence || 0) : Number((scored[0] && scored[0].confidence) || 0);

  return {
    primary,
    entities: topEntities,
    decision: {
      accepted,
      reason: accepted ? (scoredDecision.reason || 'entity_accept') : (scoredDecision.reason || 'entity_reject'),
      confidence: Number(confidence.toFixed(3)),
      fallback: accepted ? 'none' : (topEntities.length ? 'show_top_entities' : 'none')
    }
  };
}

module.exports = {
  resolveBuildingEntities
};
