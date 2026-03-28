-- 向量检索迁移模板（手动执行）
-- 说明：
-- 1) 当前文件是 template，不会被 npm run db:migrate 自动执行。
-- 2) 请在确认 pgvector 可用后再执行。
-- 3) DashScope text-embedding-v4 的维度是 1024（已验证）。

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
    id SERIAL PRIMARY KEY,
    knowledge_id INTEGER NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
    embedding_model VARCHAR(100) NOT NULL,
    embedding_dim INTEGER NOT NULL,
    embedding vector(1024) NOT NULL,
    question_text TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (knowledge_id, embedding_model)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_knowledge_id
    ON knowledge_embeddings(knowledge_id);

-- ivfflat 索引：数据量上来后会显著提升近邻检索速度
-- lists 参数可按数据量调整（小数据先 50，后续可增大）
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_embedding_ivfflat
    ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);

-- 自动维护 updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trigger_updated_at_knowledge_embeddings'
    ) THEN
        CREATE TRIGGER trigger_updated_at_knowledge_embeddings
        BEFORE UPDATE ON knowledge_embeddings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
