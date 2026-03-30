# 后端字段&接口完整方案（适配前端四类可视化，直接可用）
我把你四类可视化**后端必须提供的字段、接口规范、数据结构**全部整理成标准化版本，后端直接照着开发即可，完全匹配前端渲染需求，无歧义、无遗漏。

---

## 一、通用基础规范（所有接口统一）
1. **统一返回格式**
```json
{
  "code": 200,        // 状态码：200成功
  "msg": "success",   // 提示信息
  "data": {}          // 可视化核心数据
}
```
2. **接口命名统一**
`/api/visual/info-graphic` 信息图形
`/api/visual/mg-animation` MG动画
`/api/visual/3d-model` 3D模型展示
`/api/visual/chart` 数据图表

---

## 二、四类可视化 后端必填字段+完整数据结构
### ① 信息图形设计（Info-graphic）
**适用场景**：古建筑结构、朝代时间线、架构图、关系图
**后端核心字段**：
```json
{
  "type": "infographic",
  "title": "古建筑结构体系",
  "layout": "vertical", // 布局：horizontal横向/vertical纵向/hierarchy层级
  "nodes": [
    {
      "id": "1",          // 节点唯一ID
      "name": "台基",      // 节点名称
      "desc": "支撑结构",  // 描述（可选）
      "style": {}         // 样式配置（可选，前端可覆盖）
    }
  ],
  "edges": [
    {
      "source": "1",    // 起始节点ID
      "target": "2",    // 目标节点ID
      "relation": "支撑" // 关系文本
    }
  ],
  "labels": ["结构分类", "构造说明"], // 文本标签
  "links": [           // 跳转链接（可选）
    {
      "nodeId": "1",
      "url": "/detail/1"
    }
  ]
}
```

---

### ② 动态信息影像（MG 动画）
**适用场景**：建造过程、水流动画、历史演变
**后端核心字段**：**只做控制，不做帧数据**
```json
{
  "animationId": "build_process_001", // 动画唯一ID
  "title": "古建筑建造流程动画",
  "duration": 15000,        // 总时长（毫秒，可选）
  "lottieUrl": "https://xxx/build.json", // AE导出的Lottie文件地址
  "autoPlay": true,         // 是否自动播放
  "loop": false,            // 是否循环
  "keyPoints": [            // 关键帧触发点（可选）
    {
      "time": 5000,
      "desc": "搭建梁柱"
    }
  ]
}
```

---

### ③ 交互信息设计（3D/模型展示）
**适用场景**：Three.js 3D模型、标注、交互
**后端核心字段**：
```json
{
  "modelId": "ancient_building_01",
  "modelName": "唐代大殿",
  "modelUrl": "https://xxx/model.glb", // 模型地址（.glb/.gltf）
  "initConfig": {
    "autoRotate": true,    // 自动旋转
    "rotationX": 0,       // 初始旋转角度
    "rotationY": 0.5,
    "cameraZ": 10         // 相机距离
  },
  "markers": [ // 标注点（点击弹窗）
    {
      "id": "m1",
      "name": "斗拱",
      "position": [1.2, 0.8, 0.5], // 三维坐标 x/y/z
      "desc": "核心受力构件",
      "linkUrl": "/detail/arch"
    }
  ]
}
```

---

### ④ 数据可视化（图表）
**适用场景**：柱状图、折线图、饼图等 ECharts 图表
**后端核心字段**：**标准 ECharts 结构**
```json
{
  "title": "历代建筑数量统计",
  "unit": "座", // 数据单位
  "xAxis": ["唐", "宋", "元", "明", "清"], // X轴数据
  "series": [
    {
      "name": "宫殿建筑",
      "data": [32, 45, 28, 67, 89],
      "type": "bar" // 图表类型
    }
  ],
  "legend": ["宫殿建筑", "民居建筑"], // 图例
  "tooltip": true // 是否开启提示框
}
```

---

## 三、后端极简总结（开发必看）
1. **只提供结构化JSON数据，不做任何渲染、样式、动效**
2. **3D模型/Lottie文件**：后端只存**URL地址**，文件放OSS/静态资源
3. **关系图/图表**：严格按前端需要的字段返回，不冗余、不缺失
4. **所有接口统一返回格式**，方便前端封装、异常处理

---

### 总结
1. 四类可视化**后端字段全部标准化**，无自定义歧义，直接对接前端
2. 后端职责：**提供数据 + 地址 + 配置**，渲染/动效/交互全由前端处理
3. 接口、字段、数据结构可直接复制给后端开发，1:1匹配需求