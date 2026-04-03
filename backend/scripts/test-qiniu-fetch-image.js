require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { fetchBinaryFromQiniu } = require('../src/services/qiniuService');

(async () => {
  const key = 'test/Gemini_Generated_Image_kfeykakfeykakfey_clean.png';
  const result = await fetchBinaryFromQiniu(key);
  const outDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'qiniu-test-image.png');
  fs.writeFileSync(outPath, result.body);

  console.log('FETCH_OK', result.key);
  console.log('CONTENT_TYPE', result.contentType);
  console.log('BYTES', result.body.length);
  console.log('OUT', outPath);
})();

