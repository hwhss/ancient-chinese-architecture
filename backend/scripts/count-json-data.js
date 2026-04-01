/**
 * 统计 JSON 数据量
 * 执行: node scripts/count-json-data.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data-jsondb');

function countFileRecords(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data.length : 1;
  } catch (e) {
    return 0;
  }
}

function main() {
  console.log('=== JSON 数据量统计 ===\n');

  const categories = {
    'buildings': { files: [], total: 0 },
    'knowledge': { files: [], total: 0 },
    'visualization': { files: [], total: 0 }
  };

  // 遍历 data-jsondb 目录
  const dirs = ['buildings', 'knowledge', 'visualization'];
  
  for (const dir of dirs) {
    const dirPath = path.join(dataDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const count = countFileRecords(filePath);
      categories[dir].files.push({ name: file, count });
      categories[dir].total += count;
    }
  }

  // 输出统计
  let grandTotal = 0;
  
  for (const [category, info] of Object.entries(categories)) {
    if (info.total === 0) continue;
    
    console.log(`\n【${category}】总计: ${info.total} 条`);
    info.files.forEach(f => {
      console.log(`  - ${f.name}: ${f.count} 条`);
    });
    
    grandTotal += info.total;
  }

  console.log(`\n=== 总计: ${grandTotal} 条记录 ===`);
}

main();
