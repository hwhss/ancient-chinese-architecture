-- 补充缺失的 dynasty 字段
-- 执行: PGPASSWORD=your_password psql -U postgres -d ancient_architecture -f migrations/006_add_dynasty_field.sql

BEGIN;

-- 为 buildings 表添加 dynasty 字段
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS dynasty VARCHAR(100);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_buildings_dynasty ON buildings(dynasty);

COMMIT;
