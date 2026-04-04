# 古建漫游 - 视觉主题系统文档 (Ancient Architecture - Visual Theme System)

本文档旨在说明“古建漫游”小程序全新的“古雅微黄”视觉系统。为了营造沉浸式的“国风”体验，我们对全局色彩、组件结构、图形语言进行了全面的重塑。

## 1. 核心设计理念 (Design Philosophy)

*   **古韵 (Antique)**：模拟古代书法绢本、生宣纸张的微黄底色，营造历史厚重感。
*   **墨染 (Ink Wash)**：利用 CSS 滤镜与渐变模拟墨水滴入水中或纸上的晕染效果。
*   **雅致 (Muted)**：摒弃高饱和度的现代色彩，采用低饱和、高对比的中国传统色。

## 2. 色彩系统 (Color Palette)

系统采用 CSS 变量定义在 `App.vue` 中，支持全局继承与组件局部覆盖。

| 变量名 | 颜色值 | 用途说明 |
| :--- | :--- | :--- |
| `--primary` | `#a63131` | **故宫红**。用于核心按钮、点亮状态及重要标识。 |
| `--secondary` | `#725a3d` | **古铜棕**。用于主要标题、强调文本及传统边框。 |
| `--bg-primary` | `#f2ead3` | **绢本色**。全局页面背景，模拟生宣纸张质感。 |
| `--bg-card` | `#f9f5e8` | **熟宣色**。卡片背景，比背景略浅以突出层次。 |
| `--text-primary` | `#2c1e13` | **焦墨黑**。主标题及核心阅读文本。 |
| `--text-tertiary`| `#8b7355` | **赭石色**。辅助描述说明文本。 |
| `--warning` | `#d49c4d` | **佛金** |

## 3. 图形语言 (Visual Language)

### 3.1 传统图标系统 (`TraditionalIcon`)
全面移除 Emoji，采用自定义 SVG 图标。
*   **用法**: `<TraditionalIcon name="palace" size="48" />`
*   **库**: `palace` (宫殿), `garden` (园林), `bridge` (桥梁), `tower` (楼阁), `defense` (城防), `chat` (对话), `map` (地图) 等。

### 3.2 质感样式类 (Utility Classes)
*   `.rice-paper`: 为容器添加颗粒感明显的宣纸纹理。
*   `.brush-border-ink`: 模拟毛笔运笔的干湿浓淡边框效果。
*   `.ink-pressed`: 为标题添加“力透背纸”的墨迹压印视觉效果。
*   `.card-ink`: 卡片悬停/激活时的墨迹晕染过渡动效。

## 4. 组件规范 (Component Standards)

### 4.1 HeroSection (首屏)
*   采用“朱砂印章”式标题。
*   分类入口采用传统窗棂格栅布局。
*   统计数据卡片使用半透明“绢帛”背景。

### 4.2 DailyBuilding (每日推荐)
*   核心卡片采用“冰裂纹”或“磨砂玻璃”结合宣纸的复合质感。
*   交互按钮使用朱砂红墨迹填充效果。

---
*系统版本：v2.0 (Aesthetic Refurbishment)*
*更新日期：2026-04-04*
