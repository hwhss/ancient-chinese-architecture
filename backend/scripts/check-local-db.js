/**
 * 检查本地数据库表结构
 * 执行: node scripts/check-local-db.js
 */
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:123456@localhost:5432/ancient_architecture'
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('[SUCCESS] 数据库连接成功\n');

    // 获取所有表
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('=== 数据库表列表 ===');
    console.log(`总计: ${tablesResult.rows.length} 张表\n`);
    
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    // 统计各表数据量
    console.log('\n=== 表数据量统计 ===');
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        console.log(`${tableName}: ${countResult.rows[0].count} 条`);
      } catch (err) {
        console.log(`${tableName}: 无法统计 (${err.message})`);
      }
    }

    // 检查 buildings 表结构
    console.log('\n=== buildings 表结构 ===');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'buildings'
      ORDER BY ordinal_position
    `);
    
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    console.log('\n[SUCCESS] 数据库检查完成!');

  } catch (error) {
    console.error('[ERROR] 数据库检查失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDatabase();
