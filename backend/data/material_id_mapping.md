# Material ID 素材映射表

本表用于约定本地素材目录结构与 Material ID 的对应关系。

图片加载顺序固定为：

1. `overview`（总览）
2. `classification`（分类）
3. `structure`（结构）
4. `timeline`（时间线）
5. `function`（功能）
6. `infographic`（图形表）

命名规则建议：

- `<prefix>-overview.png`
- `<prefix>-classification.png`
- `<prefix>-structure.png`
- `<prefix>-timeline.png`
- `<prefix>-function.png`
- `<prefix>-infographic.png`

| Material ID         | 目录/前缀（示例总览图）                                      |
| ------------------- | ------------------------------------------------------------ |
| badaling_great_wall | badaling-great-wall/badaling-great-wall-overview.png         |
| baohe_dian          | baohe-place/baohe-palace-overview.png                        |
| beijing_siheyuan    | beijing-siheyuan/beijing-siheyuan-overview.png               |
| canglang_ting       | canglang-pavilion/canglang-ting-overview.png                 |
| chengde_resort      | chengde-mountain-resort/chengde-bishushanzhuang-overview.png |
| dazheng_dian        | dazheng-dian/dazheng-dian-overview.png                       |
| dujiangyan          | dujiangyan-irrigation/dujiangyan-overview.png                |
| fujian_tulou        | fujian-tulou/fujian-tulou-overview.png                       |
| grand_canal         | jinghang-grand-canal/jinghang-grand-canal-overview.png       |
| guangji_bridge      | guangji-bridge/guangjiqiao-overview.png                      |
| huizhou_residence   | huipai-architecture/huipai-jianzhu-overview.png              |
| jiayuguan           | jiayuguan-pass/jiayuguan-overview.png                        |
| lingqu_canal        | lingqu-canal/lingqu-overview.png                             |
| liu_garden          | suzhou-liuyuan-garden/suzhou-liuyuan-garden-overview.png     |
| lugou_bridge        | lugou-bridge/lugou-bridge-overview.png                       |
| luoyang_bridge      | luoyang-bridge/luoyang-bridge-overview.png                   |
| qiao_courtyard      | qiao-family-compound/qiao-family-compound-overview.png       |
| shanhaiguan         | shanhai-pass/shanhai-pass-overview.png                       |
| shizi_garden        | shizi-lin/shizi-lin-overview.png                             |
| taihe_dian          | taihe-palace/taihe-palace-overview.png                       |
| wang_courtyard      | wang-family-compound/wang-family-compound-overview.png       |
| wangshi_garden      | wangshi-garden/wangshi-garden-overview.png                   |
| yihe_garden         | summer-palace/summer-palace-overview.png                     |
| zhaozhou_bridge     | zhaozhou-bridge/zhaozhou-bridge-overview.png                 |
| zhuozheng_garden    | zhuozheng-garden/zhuozheng-garden-overview.png               |
| zhonghe_dian        | zhonghe-palace/zhonghe-palace-overview.png                   |

兼容映射（旧 ID / 补充 ID）已在 `backend/src/config/localImageMap.js` 中保留：

- `yihe_yuan -> yihe_garden`
- `qiaojia_dayuan -> qiao_courtyard`
- 以及 `pingyao_city/qiankun_gong/qufu_kongmiao/xian_wall/nanjing_wall/yueyang_tower/kanerjing` 的保底路径
