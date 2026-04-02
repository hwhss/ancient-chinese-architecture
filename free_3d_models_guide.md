# 免费开源3D模型资源指南

## 一、综合开源3D模型平台

### 1. Sketchfab
- **网址**: https://sketchfab.com
- **特点**: 全球最大的3D模型社区之一，大量免费开源模型
- **搜索关键词**: "Chinese architecture", "ancient China", "traditional Chinese building"
- **许可类型**: CC0 (完全免费商用)、CC BY (署名即可)、CC BY-NC (非商用)
- **推荐筛选**: 选择"Free"和"Downloadable"选项

### 2. Poly Haven
- **网址**: https://polyhaven.com
- **特点**: 高质量PBR材质和3D模型，全部免费商用
- **许可类型**: CC0
- **适用场景**: 建筑材质、环境贴图

### 3. Archive3D
- **网址**: https://archive3d.net
- **特点**: 大量建筑和室内模型，支持多种格式
- **许可类型**: 多数免费商用

### 4. Clara.io
- **网址**: https://clara.io
- **特点**: 在线3D建模和模型库，部分免费模型
- **许可类型**: 部分CC0，部分需署名

### 5. 3D Warehouse (SketchUp)
- **网址**: https://3dwarehouse.sketchup.com
- **特点**: SketchUp官方模型库，大量建筑模型
- **许可类型**: 多数免费，需遵守各自许可

## 二、中国古建筑专项资源

### 1. 中国传统建筑3D模型库
- **GitHub仓库**: 搜索"Chinese traditional architecture 3D models"
- **特点**: 开源社区贡献的中国古建筑模型
- **格式**: 多为FBX、OBJ、GLTF格式

### 2. 文化遗产数字资源平台
- **国家图书馆数字资源**: 部分3D扫描模型免费开放
- **高校学术资源**: 部分高校数字博物馆提供免费3D模型

### 3. 开源中国古建筑模型
- **推荐搜索**: "开源 中国古建筑 3D模型"
- **社区**: CSDN、GitHub、知乎等平台有爱好者分享

## 三、模型格式与兼容性

### 推荐使用的格式
1. **GLTF/GLB**: Three.js原生支持，文件小，加载快
2. **OBJ**: 通用格式，兼容性好
3. **FBX**: 支持动画和复杂材质

### 格式转换工具
- **Blender**: 免费开源，支持所有主流格式转换
- **Assimp**: 开源模型导入库
- **Online 3D Converter**: 在线格式转换

## 四、模型轻量化处理

### 工具推荐
1. **Blender**: 自带简化工具，可减少多边形数量
2. **MeshLab**: 开源网格处理工具
3. **Draco压缩**: Three.js支持的压缩算法

### 处理步骤
1. 减少多边形数量（保留关键结构）
2. 优化材质和纹理
3. 使用LOD (Level of Detail)技术
4. 压缩模型文件

## 五、与项目集成步骤

### 1. 模型获取与准备
- 从开源平台下载适合的古建筑模型
- 检查模型许可，确保符合项目需求
- 转换为GLTF/GLB格式
- 进行轻量化处理

### 2. 前端集成
- 在`frontend/components`目录创建`ThreeModelViewer.vue`组件
- 使用Three.js加载和渲染模型
- 实现模型交互功能

### 3. 后端支持
- 在`backend/public/models`目录存储模型文件
- 提供模型元数据API
- 实现模型按需加载

## 六、最佳实践

### 1. 模型选择
- 优先选择低多边形(Low Poly)模型以保证性能
- 确保模型风格统一，符合项目整体设计
- 验证模型精度是否满足展示需求

### 2. 性能优化
- 实现模型懒加载
- 使用CDN加速模型文件传输
- 针对不同设备提供不同精度的模型

### 3. 版权管理
- 严格遵守模型许可协议
- 保留模型来源信息
- 对修改后的模型明确标注

### 4. 质量控制
- 测试模型在不同设备上的表现
- 优化模型加载时间
- 确保模型显示效果符合预期

## 七、推荐资源链接

1. **Sketchfab中国古建筑模型**: https://sketchfab.com/search?q=chinese%20ancient%20architecture&type=models
2. **Poly Haven材质库**: https://polyhaven.com/textures
3. **3D Warehouse建筑模型**: https://3dwarehouse.sketchup.com/browse?q=chinese%20temple
4. **Blender开源模型库**: https://www.blender.org/download/resources/
5. **GitHub中国古建筑模型**: https://github.com/search?q=chinese+architecture+3d+models

## 八、注意事项

1. **许可检查**: 确保所有使用的模型都符合开源许可要求
2. **模型质量**: 免费模型质量参差不齐，需要仔细筛选
3. **性能考量**: 移动端设备对3D模型性能要求较高，需特别优化
4. **文化准确性**: 确保模型符合中国古建筑的历史和文化特点
5. **持续更新**: 定期检查模型资源，保持资源库的新鲜度

通过以上资源和方法，您可以获取高质量的免费开源3D模型，为项目增添丰富的视觉体验。