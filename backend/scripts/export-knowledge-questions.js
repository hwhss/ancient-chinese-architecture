/**
 * 导出知识库所有问题（用于演示测试）
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { query } = require('../src/config/database');

async function exportQuestions() {
  console.log('=== 古建筑知识库演示问题列表 ===\n');
  
  try {
    const rows = await query(`
      SELECT 
        id,
        question,
        answer,
        keywords,
        material_id
      FROM knowledge_base
      ORDER BY id
    `);
    
    console.log(`共 ${rows.length} 条知识点\n`);
    console.log('='.repeat(80));
    
    rows.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.question}`);
      console.log(`   ID: ${item.id}`);
      if (item.material_id) {
        console.log(`   关联素材ID: ${item.material_id}`);
      }
      console.log(`   关键词: ${Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}`);
      console.log(`   答案: ${item.answer?.substring(0, 80)}${item.answer?.length > 80 ? '...' : ''}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n演示测试建议:');
    console.log('1. 【直接匹配】使用与问题完全相同的文字提问');
    console.log('   例: "赵州桥有什么特点？"');
    console.log('');
    console.log('2. 【语义相似】使用同义词或不同表达方式提问');
    console.log('   例: "赵州桥的特色是什么" → 应匹配 "赵州桥有什么特点？"');
    console.log('');
    console.log('3. 【关键词匹配】使用问题中的关键词提问');
    console.log('   例: "赵州桥" → 应匹配包含该关键词的问题');
    console.log('');
    console.log('4. 【向量检索】使用语义相关但文字不同的提问');
    console.log('   例: "河北的古代石桥" → 应通过向量相似度匹配 "赵州桥"');
    console.log('');
    console.log('5. 【AI兜底】提问知识库外的问题');
    console.log('   例: "故宫的猫叫什么名字" → 应触发 AI 回答');
    
  } catch (e) {
    console.error('导出失败:', e.message);
  }
  
  process.exit(0);
}

exportQuestions();
