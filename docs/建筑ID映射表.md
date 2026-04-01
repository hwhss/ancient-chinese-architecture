# 建筑ID新旧映射表

> 本文档记录古建筑项目中所有新旧ID的对应关系，供前后端开发人员参考。
>
> 更新时间：2026-04-01

---

## 映射规则说明

| 规则 | 旧格式 | 新格式 |
|------|--------|--------|
| 格式 | `{pinyin}_{序号}` | `{建筑拼音}` |
| 示例 | `gugong_01` | `taihe_dian` |
| 说明 | 前缀+序号，无实际语义 | 直接使用建筑名称拼音，可读性更强 |

---

## 完整映射表

### 宫殿类 (palace)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `taihe_dian` | `gugong_01` | 太和殿 | 北京故宫 | 外朝正殿 |
| `qiankun_gong` | `gugong_02` | 乾清宫 | 北京故宫 | 内廷正殿 |
| `dazheng_dian` | `shenyang_01` | 大政殿 | 沈阳故宫 | 盛京皇宫主殿 |
| `qufu_kongmiao` | `kongmiao_01` | 曲阜孔庙 | 山东曲阜 | 祭祀孔子庙宇 |

### 园林类 (garden)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `zhuozheng_garden` | `zhuozheng_01` | 拙政园 | 江苏苏州 | 江南古典园林代表 |

### 桥梁类 (bridge)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `zhaozhou_bridge` | `zhaozhou_01` | 赵州桥 | 河北赵县 | 世界最古老石拱桥 |

### 楼阁类 (tower)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `yueyang_tower` | `yueyang_01` | 岳阳楼 | 湖南岳阳 | 江南三大名楼 |

### 防御类 (defense)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `xian_wall` | `xian_01` | 西安城墙 | 陕西西安 | 明代城墙遗存 |

### 民居类 (residence)

| 新ID | 旧ID | 建筑名称 | 地点 | 备注 |
|------|------|----------|------|------|
| `fujian_tulou` | `tulou_01` | 福建土楼 | 福建龙岩 | 客家传统民居 |

---

## 快速查询

### 按旧ID查找

```javascript
const ID_MAPPING = {
  'gugong_01': 'taihe_dian',
  'gugong_02': 'qiankun_gong',
  'zhuozheng_01': 'zhuozheng_garden',
  'zhaozhou_01': 'zhaozhou_bridge',
  'yueyang_01': 'yueyang_tower',
  'xian_01': 'xian_wall',
  'shenyang_01': 'dazheng_dian',
  'kongmiao_01': 'qufu_kongmiao',
  'tulou_01': 'fujian_tulou',
};
```

### 按建筑名称查找

```javascript
const NAME_TO_ID = {
  '太和殿': 'taihe_dian',
  '乾清宫': 'qiankun_gong',
  '大政殿': 'dazheng_dian',
  '曲阜孔庙': 'qufu_kongmiao',
  '拙政园': 'zhuozheng_garden',
  '赵州桥': 'zhaozhou_bridge',
  '岳阳楼': 'yueyang_tower',
  '西安城墙': 'xian_wall',
  '福建土楼': 'fujian_tulou',
};
```

---

## 前端使用说明

### 1. 页面跳转时使用新ID

```javascript
// ✅ 正确
uni.navigateTo({
  url: `/pages/detail/detail?id=taihe_dian`
});

// ❌ 错误（旧格式已废弃）
uni.navigateTo({
  url: `/pages/detail/detail?id=gugong_01`
});
```

### 2. AI Chat返回的materialId直接使用

```javascript
// Chat接口返回的materialId已经是新格式，可直接使用
const materialId = response.data.materialId; // "taihe_dian"
```

### 3. 精选建筑配置

```javascript
// frontend/pages/home/home.vue
const previewBuildings = [
  { id: 'taihe_dian', name: '太和殿' },
  { id: 'zhuozheng_garden', name: '拙政园' },
  // ... 其他建筑
];
```

---

## 后端数据文件

以下数据文件已全部更新为新ID格式：

| 文件路径 | 说明 |
|----------|------|
| `backend/data/buildings.json` | 建筑基础数据 |
| `backend/data/building_profiles.json` | 建筑档案数据 |
| `backend/data/material_links.json` | 素材链接数据 |
| `backend/data/knowledge_base.json` | 知识库数据 |
| `backend/data/entity_alias_rules.json` | 实体别名规则 |
| `backend/data-jsondb/buildings/*.json` | 单个建筑详情 |
| `backend/data-jsondb/knowledge/qa.json` | 问答对数据 |

---

## 数据库迁移

如需更新 PostgreSQL 数据库中的ID，执行以下命令：

```bash
# 验证当前状态
npm run db:verify-material-ids

# 执行迁移更新
npm run db:update-material-ids

# 或重新导入全部数据
npm run db:seed
```

迁移脚本位置：
- `backend/migrations/007_update_material_ids.js`
- `backend/scripts/verify-material-id-consistency.js`

---

## 注意事项

1. **不要再使用旧ID格式**，所有地方统一使用新ID
2. **接口文档已更新**，示例中的ID已全部替换为新格式
3. **数据库迁移已完成**，线上数据已与代码保持一致
4. 如需添加新建筑，直接按 `{建筑拼音}` 格式命名ID
