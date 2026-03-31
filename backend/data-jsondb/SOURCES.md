# 数据来源说明

## 一、官方来源（优先级最高）

| 来源名称 | 来源URL | 数据类型 | 置信度 |
|---------|---------|---------|--------|
| 国家文物局 | http://www.ncha.gov.cn | 文物保护单位名录、世界遗产 | high |
| 中国文物信息咨询中心 | http://www.cchicc.org.cn | 文物基础信息、数字成果 | high |
| 国家文物资源大数据库 | http://www.cchicc.org.cn/col/col412/index.html | 文物大数据平台 | high |
| 故宫博物院官网 | https://www.dpm.org.cn | 故宫建筑详细数据 | high |
| 北京市政府官网 | https://www.beijing.gov.cn | 北京地区文物数据 | high |

## 二、权威机构来源

| 来源名称 | 来源URL | 数据类型 | 置信度 |
|---------|---------|---------|--------|
| 百度百科 | https://baike.baidu.com | 古建筑百科信息 | medium |
| 各省文旅厅/文物局 | 各省官网 | 地方文物保护单位 | high |

## 三、数据采集规范

### 3.1 必须记录的元信息
- sourceUrl：数据来源URL
- sourceName：数据来源名称
- collectedAt：采集日期
- confidence：置信度（low/medium/high）

### 3.2 合规要求
1. 不抓取需要登录且无授权的数据
2. 不直接复制受限版权全文到知识库
3. 对争议信息要加 confidence=low 并标注来源

## 四、数据批次信息

| 批次编号 | 采集日期 | 建筑条目 | 问答条目 | 可视化数据 | 说明 |
|---------|---------|---------|---------|-----------|------|
| data-batch-20260330-01 | 2026-03-30 | 33 | 23 | - | 初始采集批次 |
| data-batch-20260331-01 | 2026-03-31 | - | - | 4类 | 可视化数据创建：信息图形、MG动画、3D模型、图表 |

## 五、可视化数据说明

| 类型 | 文件 | 数据内容 | 适用场景 |
|-----|------|---------|---------|
| Info-graphic | visualization/info-graphic.json | 古建筑结构体系节点关系图 | 结构图、关系图展示 |
| MG Animation | visualization/mg-animation.json | 建造流程动画关键帧配置 | 建造过程动画演示 |
| 3D Model | visualization/3d-model.json | 4座代表性建筑模型标注点 | Three.js 3D交互展示 |
| Chart | visualization/chart.json | 5类统计图表数据 | ECharts图表展示 |

## 六、数据质量检查

### 5.1 数据完整性
- ✅ 关键字段（name/category/province/city）均已填写
- ✅ 地理坐标（lat/lng）均为合法数值
- ✅ 时间字段（main_era_start <= main_era_end）
- ✅ 分类字段均符合枚举值范围

### 5.2 风险备注
- 部分建筑年代存在学术争议，已采用主流观点
- 坐标数据为大致位置，精确坐标需进一步核实

---

**文档更新时间**: 2026-03-31
