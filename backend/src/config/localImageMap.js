// Material ID -> 本地总览图相对路径
// 约定：同目录下还可存在 classification/structure/timeline/function/infographic 五类图。
const LOCAL_IMAGE_MAP = {
  badaling_great_wall: 'badaling-great-wall/badaling-great-wall-overview.png',
  baohe_dian: 'baohe-place/baohe-palace-overview.png',
  beijing_siheyuan: 'beijing-siheyuan/beijing-siheyuan-overview.png',
  canglang_ting: 'canglang-pavilion/canglang-ting-overview.png',
  chengde_resort: 'chengde-mountain-resort/chengde-bishushanzhuang-overview.png',
  dazheng_dian: 'shenyang-dazheng-dian/shenyang-dazheng-dian-photo (1).jpg',
  dujiangyan: 'dujiangyan-irrigation/dujiangyan-overview.png',
  fujian_tulou: 'fujian-tulou/fujian-tulou-overview.png',
  grand_canal: 'jinghang-grand-canal/jinghang-grand-canal-overview.png',
  guangji_bridge: 'guangji-bridge/guangjiqiao-overview.png',
  huizhou_residence: 'huipai-architecture/huipai-jianzhu-overview.png',
  jiayuguan: 'jiayuguan-pass/jiayuguan-overview.png',
  lingqu_canal: 'lingqu-canal/lingqu-overview.png',
  liu_garden: 'suzhou-liuyuan-garden/suzhou-liuyuan-garden-overview.png',
  lugou_bridge: 'lugou-bridge/lugou-bridge-overview.png',
  luoyang_bridge: 'luoyang-bridge/luoyang-bridge-overview.png',
  qiao_courtyard: 'qiao-family-compound/qiao-family-compound-overview.png',
  shanhaiguan: 'shanhai-pass/shanhai-pass-overview.png',
  shizi_garden: 'shizi-lin/shizi-lin-overview.png',
  taihe_dian: 'taihe-palace/taihe-palace-overview.png',
  wang_courtyard: 'wang-family-compound/wang-family-compound-overview.png',
  wangshi_garden: 'wangshi-garden/wangshi-garden-overview.png',
  yihe_garden: 'summer-palace/summer-palace-overview.png',
  zhaozhou_bridge: 'zhaozhou-bridge/zhaozhou-bridge-overview.png',
  zhuozheng_garden: 'zhuozheng-garden/zhuozheng-garden-overview.png',
  zhonghe_dian: 'zhonghe-palace/zhonghe-palace-overview.png',

  // 兼容旧/补充 ID
  shenyang_gugong_dazheng_dian: 'shenyang-dazheng-dian/shenyang-dazheng-dian-photo (1).jpg',
  yihe_yuan: 'summer-palace/summer-palace-overview.png',
  qiaojia_dayuan: 'qiao-family-compound/qiao-family-compound-overview.png',
  pingyao_city: 'pingyao-city/pingyao-city-overview.png',
  qiankun_gong: 'qiankun-gong/qiankun-gong-overview.png',
  qufu_kongmiao: 'qufu-kongmiao/qufu-kongmiao-overview.png',
  xian_wall: 'xian-wall/xian-wall-overview.png',
  nanjing_wall: 'nanjing-wall/nanjing-wall-overview.png',
  yueyang_tower: 'yueyang-tower/yueyang-tower-overview.png',
  kanerjing: 'kanerjing/kanerjing-overview.png'
};

function getLocalImageByBuildingId(buildingId) {
  const key = String(buildingId || '').trim();
  return LOCAL_IMAGE_MAP[key] || '';
}

function getLocalImageByMaterialId(materialId) {
  return getLocalImageByBuildingId(materialId);
}

module.exports = {
  LOCAL_IMAGE_MAP,
  getLocalImageByBuildingId,
  getLocalImageByMaterialId
};
