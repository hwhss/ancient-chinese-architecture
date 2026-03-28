-- PostgreSQL 初始化脚本 - 古建筑 AI 导览
-- 执行: psql -U postgres -d ancient_architecture -f migrations/001_initial_schema.sql

-- 1. 建筑基础信息表
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    location VARCHAR(200),
    province VARCHAR(100),
    city VARCHAR(100),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    heritage_level VARCHAR(50),
    open_status VARCHAR(50),
    main_era_start INTEGER,
    main_era_end INTEGER,
    description TEXT,
    image VARCHAR(500),
    tags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE buildings ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS heritage_level VARCHAR(50);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS open_status VARCHAR(50);
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS main_era_start INTEGER;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS main_era_end INTEGER;

-- 2. 建筑详细档案表
CREATE TABLE IF NOT EXISTS building_profiles (
    building_id VARCHAR(50) PRIMARY KEY REFERENCES buildings(id) ON DELETE CASCADE,
    era VARCHAR(100),
    style VARCHAR(100),
    overview_summary TEXT,
    history TEXT,
    cultural_value TEXT,
    key_points JSONB,
    architecture_highlights JSONB,
    model3d_status VARCHAR(20),
    model3d_viewer_type VARCHAR(50),
    model3d_poster VARCHAR(500),
    model3d_note TEXT,
    model3d_preload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 3D 模型版本表
CREATE TABLE IF NOT EXISTS model_versions (
    id SERIAL PRIMARY KEY,
    building_id VARCHAR(50) REFERENCES buildings(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    label VARCHAR(100),
    format VARCHAR(20),
    allowed_roles JSONB,
    model_url VARCHAR(500),
    draco BOOLEAN DEFAULT FALSE,
    ktx2 BOOLEAN DEFAULT FALSE,
    preload JSONB,
    camera JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, version)
);

-- 4. 模型 LOD（细节层次）表
CREATE TABLE IF NOT EXISTS model_lods (
    id SERIAL PRIMARY KEY,
    model_version_id INTEGER REFERENCES model_versions(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    model_url VARCHAR(500),
    extra JSONB,
    UNIQUE(model_version_id, level)
);

-- 5. 热点标注表
CREATE TABLE IF NOT EXISTS model_hotspots (
    id SERIAL PRIMARY KEY,
    model_version_id INTEGER REFERENCES model_versions(id) ON DELETE CASCADE,
    hotspot_key VARCHAR(50),
    title VARCHAR(200),
    name VARCHAR(100),
    description TEXT,
    narration TEXT,
    position JSONB,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(model_version_id, hotspot_key)
);

-- 6. 素材链接表
CREATE TABLE IF NOT EXISTS material_links (
    id SERIAL PRIMARY KEY,
    material_id VARCHAR(50) NOT NULL,
    type VARCHAR(50),
    url VARCHAR(500),
    source VARCHAR(200),
    tags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_material_id ON material_links(material_id);
CREATE INDEX IF NOT EXISTS idx_material_type ON material_links(type);

-- 7. 知识库问答表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    question TEXT,
    answer TEXT,
    material_id VARCHAR(50),
    keywords JSONB,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加触发器
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'buildings', 'building_profiles', 'model_versions',
        'model_lods', 'model_hotspots', 'material_links', 'knowledge_base'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trigger_updated_at ON %I;',
            tbl
        );
        EXECUTE format(
            'CREATE TRIGGER trigger_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            tbl
        );
    END LOOP;
END $$;

-- 插入成功标记
SELECT 'Database schema initialized successfully!' AS status;
