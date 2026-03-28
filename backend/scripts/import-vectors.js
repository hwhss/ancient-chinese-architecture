#!/usr/bin/env node

const path = require('path');
const axios = require('axios');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { query } = require('../src/config/database');
const config = require('../src/config');

const BATCH_SIZE = 5;

async function createEmbeddingBatch(texts) {
  if (!texts.length) {
    return null;
  }

  if (!config.embeddingApiUrl || !config.embeddingApiKey || !config.embeddingModel) {
    throw new Error('Embedding 配置不完整：EMBEDDING_API_URL / EMBEDDING_API_KEY / EMBEDDING_MODEL');
  }

  try {
    const response = await axios.post(
      `${config.embeddingApiUrl}/embeddings`,
      {
        model: config.embeddingModel,
        input: texts
      },
      {
        headers: {
          Authorization: `Bearer ${config.embeddingApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error('响应格式异常:', JSON.stringify(response.data));
      return null;
    }

    return response.data.data.map((item) => ({
      embedding: item.embedding,
      index: item.index
    }));
  } catch (error) {
    console.error(`Embedding API 调用失败 (${texts.length} 条):`, error.message);
    throw error;
  }
}

async function checkVectorTableExists() {
  try {
    const result = await query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'knowledge_embeddings'
       )`,
      []
    );

    return result[0].exists;
  } catch (error) {
    return false;
  }
}

async function importVectors() {
  console.log('\n🧪 开始向量入库流程\n');

  console.log('配置信息：');
  console.log(`  数据源: ${config.dataSource}`);
  console.log(`  Embedding Provider: ${config.embeddingProvider}`);
  console.log(`  Model: ${config.embeddingModel}`);
  console.log(`  Dimension: ${config.embeddingDim}\n`);

  if (config.dataSource !== 'postgres') {
    console.error('❌ 向量入库仅支持 PostgreSQL 数据源，请先切换 DATA_SOURCE=postgres\n');
    process.exit(1);
  }

  const tableExists = await checkVectorTableExists();
  if (!tableExists) {
    console.error(
      `❌ knowledge_embeddings 表不存在！\n` +
      `   请先执行: psql -U postgres -d ancient_architecture -f migrations/003_add_vector_retrieval.template.sql\n`
    );
    process.exit(1);
  }

  try {
    const knowledgeList = await query('SELECT id, question FROM knowledge_base ORDER BY id ASC', []);

    if (!knowledgeList.length) {
      console.warn('⚠️  知识库为空，无需导入\n');
      return;
    }

    console.log(`📊 检测到 ${knowledgeList.length} 条知识点\n`);

    const existingEmbeddings = await query(
      `SELECT knowledge_id FROM knowledge_embeddings WHERE embedding_model = $1`,
      [config.embeddingModel]
    );

    const existingIds = new Set(existingEmbeddings.map((row) => row.knowledge_id));
    const toProcess = knowledgeList.filter((row) => !existingIds.has(row.id));

    console.log(`ℹ️  已有向量: ${existingIds.size}`);
    console.log(`⏳ 待处理: ${toProcess.length}\n`);

    if (!toProcess.length) {
      console.log('✅ 所有知识点已向量化，无需再处理\n');
      return;
    }

    let processed = 0;
    let failed = 0;

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      const batch = toProcess.slice(i, i + BATCH_SIZE);
      const batchQuestions = batch.map((row) => row.question);

      console.log(`处理批次 ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toProcess.length / BATCH_SIZE)}...`);

      try {
        const embeddings = await createEmbeddingBatch(batchQuestions);

        if (!embeddings || embeddings.length !== batch.length) {
          console.warn(`  ⚠️  预期 ${batch.length} 个向量，实际得到 ${embeddings ? embeddings.length : 0}`);
          failed += batch.length;
          continue;
        }

        const insertSql = `
          INSERT INTO knowledge_embeddings
            (knowledge_id, embedding_model, embedding_dim, embedding, question_text)
          VALUES
            ${batch
              .map(
                (_, idx) => `($${idx * 5 + 1}::int, $${idx * 5 + 2}, $${idx * 5 + 3}::int, $${idx * 5 + 4}::vector, $${idx * 5 + 5})`
              )
              .join(',')}
          ON CONFLICT (knowledge_id, embedding_model) DO UPDATE SET
            embedding = EXCLUDED.embedding,
            updated_at = NOW()
        `;

        const params = [];
        batch.forEach((row, idx) => {
          params.push(
            row.id,
            config.embeddingModel,
            config.embeddingDim,
            `[${embeddings[idx].embedding.join(',')}]`,
            row.question
          );
        });

        await query(insertSql, params);

        processed += batch.length;
        console.log(`  ✅ 成功: ${processed}/${toProcess.length}`);

        if (i + BATCH_SIZE < toProcess.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (batchError) {
        console.error(`  ❌ 批次失败:`, batchError.message);
        failed += batch.length;
      }
    }

    console.log();
    console.log('📊 入库统计：');
    console.log(`  成功: ${processed}`);
    console.log(`  失败: ${failed}`);
    console.log(`  总计: ${processed + failed}\n`);

    if (failed === 0) {
      console.log('✅ 所有知识点向量化完成！\n');
    } else {
      console.warn(`⚠️  部分知识点失败，请检查日志后重试\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 入库流程异常:', error.message, '\n');
    process.exit(1);
  }
}

importVectors().catch((error) => {
  console.error('❌ 未捕获异常:', error);
  process.exit(1);
});
