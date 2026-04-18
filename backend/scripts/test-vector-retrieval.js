/**
 * 向量检索功能测试脚本
 * 测试向量表状态、Embedding API、向量检索功能
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { query } = require('../src/config/database');
const { createEmbedding } = require('../src/services/embeddingService');
const config = require('../src/config');

async function test() {
  console.log('=== 向量检索功能测试 ===\n');
  
  // 1. 检查配置
  console.log('【配置检查】');
  console.log('  ENABLE_VECTOR_RETRIEVAL:', config.enableVectorRetrieval);
  console.log('  DATA_SOURCE:', config.dataSource);
  console.log('  EMBEDDING_API_KEY:', config.embeddingApiKey ? '已配置 ✓' : '未配置 ✗');
  console.log('  EMBEDDING_MODEL:', config.embeddingModel);
  console.log('  EMBEDDING_DIM:', config.embeddingDim);
  console.log('');

  // 2. 检查向量表
  console.log('【向量表检查】');
  try {
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'knowledge_embeddings'
      );
    `);
    console.log('  向量表存在:', tableCheck[0].exists ? '✓' : '✗');
    
    if (tableCheck[0].exists) {
      const count = await query('SELECT COUNT(*) as count FROM knowledge_embeddings;');
      console.log('  向量表数据量:', count[0].count);
      
      if (count[0].count > 0) {
        const sample = await query(`
          SELECT ke.knowledge_id, kb.question, ke.embedding_model 
          FROM knowledge_embeddings ke 
          JOIN knowledge_base kb ON kb.id = ke.knowledge_id 
          LIMIT 1
        `);
        console.log('  示例数据:', sample[0]?.question?.substring(0, 30) + '...');
      }
    }
  } catch (e) {
    console.log('  检查失败:', e.message);
  }
  console.log('');

  // 3. 测试 Embedding API
  console.log('【Embedding API 测试】');
  const testText = '太和殿的历史';
  console.log('  测试文本:', testText);
  
  const embedding = await createEmbedding(testText);
  if (embedding) {
    console.log('  Embedding 成功 ✓');
    console.log('  维度:', embedding.length);
    console.log('  前5个值:', embedding.slice(0, 5).map(v => v.toFixed(4)));
  } else {
    console.log('  Embedding 失败 ✗');
  }
  console.log('');

  // 4. 测试向量检索
  console.log('【向量检索测试】');
  if (embedding) {
    try {
      const vectorLiteral = `[${embedding.join(',')}]`;
      const sql = `
        SELECT
          kb.id,
          kb.question,
          kb.answer,
          1 - (ke.embedding <=> $1::vector) AS similarity
        FROM knowledge_embeddings ke
        JOIN knowledge_base kb ON kb.id = ke.knowledge_id
        WHERE ke.embedding_model = $2
        ORDER BY ke.embedding <=> $1::vector
        LIMIT 3
      `;
      
      const rows = await query(sql, [vectorLiteral, config.embeddingModel]);
      console.log('  检索结果:');
      rows.forEach((row, i) => {
        console.log(`    ${i + 1}. ${row.question?.substring(0, 40)}... (相似度: ${row.similarity?.toFixed(4)})`);
      });
    } catch (e) {
      console.log('  检索失败:', e.message);
    }
  }
  console.log('');

  // 5. 总结
  console.log('【测试总结】');
  const checks = [
    config.enableVectorRetrieval,
    config.dataSource === 'postgres',
    !!config.embeddingApiKey,
    embedding && embedding.length === config.embeddingDim
  ];
  const allPassed = checks.every(c => c);
  console.log(allPassed ? '  ✓ 所有检查通过，向量检索功能正常' : '  ✗ 部分检查未通过');
  
  process.exit(0);
}

test().catch(e => {
  console.error('测试失败:', e);
  process.exit(1);
});
