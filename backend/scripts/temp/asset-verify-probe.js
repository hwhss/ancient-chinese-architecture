const { verifyAssetOwnership } = require('../../src/services/assetVerification');
const samples = [
  { url: 'https://cdn.example.com/images/xian_wall_01.jpg', entity: { id: 'xian_wall', name: '西安城墙', tags: ['城防'] } },
  { url: 'https://cdn.example.com/images/great_wall_badaling.png', entity: { id: 'great_wall', name: '长城', tags: ['城防'] } },
  { url: 'https://cdn.example.com/images/random-001.png', entity: { id: 'xian_wall', name: '西安城墙', tags: ['城防'] } }
];
for (const item of samples) {
  const result = verifyAssetOwnership(item.url, item.entity, { kind: 'building' });
  console.log(JSON.stringify({ url: item.url, verified: result.verified, matchedToken: result.matchedToken, assetName: result.assetName, reason: result.reason }));
}
