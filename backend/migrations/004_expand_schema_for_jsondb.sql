-- 扩展表结构以支持 data-jsondb 完整数据导入
-- 执行: PGPASSWORD=postgres123 psql -h 127.0.0.1 -U postgres -d ancient_architecture -f migrations/004_expand_schema_for_jsondb.sql

BEGIN;

-- ==================== 1. buildings 表补充字段 ====================
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS name_en VARCHAR(200);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS alias VARCHAR(200);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS source_name VARCHAR(200);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS confidence VARCHAR(20);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS area_sqm DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS height_m DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS length_m DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS length_km DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS width_m DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS span_m DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS diameter_m DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS floors INTEGER;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS architecture_highlights TEXT;

-- ==================== 2. knowledge_base 表补充字段 ====================
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS qa_id VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_kb_qa_id ON knowledge_base(qa_id);

-- ==================== 3. 可视化 - 信息图形表 ====================
CREATE TABLE IF NOT EXISTS info_graphics (
    id SERIAL PRIMARY KEY,
    graphic_id VARCHAR(50) UNIQUE,
    title VARCHAR(200),
    layout VARCHAR(50),
    nodes JSONB,
    edges JSONB,
    labels JSONB,
    links JSONB,
    source_url VARCHAR(500),
    source_name VARCHAR(200),
    confidence VARCHAR(20),
    collected_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 4. 可视化 - MG 动画表 ====================
CREATE TABLE IF NOT EXISTS mg_animations (
    id SERIAL PRIMARY KEY,
    animation_id VARCHAR(50) UNIQUE,
    title VARCHAR(200),
    duration INTEGER,
    lottie_url VARCHAR(500),
    auto_play BOOLEAN DEFAULT FALSE,
    loop BOOLEAN DEFAULT FALSE,
    key_points JSONB,
    phases JSONB,
    related_knowledge JSONB,
    source_url VARCHAR(500),
    source_name VARCHAR(200),
    confidence VARCHAR(20),
    collected_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 5. 可视化 - 3D 模型表 ====================
CREATE TABLE IF NOT EXISTS model_3d (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR(50) UNIQUE,
    model_name VARCHAR(200),
    model_url VARCHAR(500),
    init_config JSONB,
    markers JSONB,
    building_id VARCHAR(50) REFERENCES buildings(id) ON DELETE SET NULL,
    category VARCHAR(50),
    source_url VARCHAR(500),
    source_name VARCHAR(200),
    confidence VARCHAR(20),
    collected_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model3d_building ON model_3d(building_id);

-- ==================== 6. 可视化 - 图表数据表 ====================
CREATE TABLE IF NOT EXISTS chart_data (
    id SERIAL PRIMARY KEY,
    chart_id VARCHAR(50) UNIQUE,
    title VARCHAR(200),
    unit VARCHAR(50),
    x_axis JSONB,
    series JSONB,
    legend JSONB,
    tooltip BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chart_summary (
    id SERIAL PRIMARY KEY,
    total_buildings INTEGER,
    world_heritage INTEGER,
    national_heritage INTEGER,
    earliest_year INTEGER,
    latest_year INTEGER,
    top_province VARCHAR(100),
    top_dynasty VARCHAR(100),
    source_url VARCHAR(500),
    source_name VARCHAR(200),
    confidence VARCHAR(20),
    collected_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;
