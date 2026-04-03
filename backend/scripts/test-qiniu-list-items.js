require('dotenv').config();
const axios = require('axios');
const qiniu = require('qiniu');

(async () => {
  try {
    const ak = process.env.QINIU_ACCESS_KEY;
    const sk = process.env.QINIU_SECRET_KEY;
    const mac = new qiniu.auth.digest.Mac(ak, sk);
    const bucket = 'ancientarc';

    const listUrl = `https://rsf.qbox.me/list?bucket=${encodeURIComponent(bucket)}&limit=100`;
    const token = qiniu.util.generateAccessToken(mac, listUrl);

    const resp = await axios.get(listUrl, {
      headers: { Authorization: token },
      timeout: 20000
    });

    const items = (resp.data && resp.data.items) || [];
    console.log('BUCKET', bucket);
    console.log('ITEM_COUNT', items.length);

    const img = items.find((it) => String(it.mimeType || '').startsWith('image/')) || items[0];
    if (img) {
      console.log('TEST_KEY', img.key || '');
      console.log('TEST_MIME', img.mimeType || '');
      console.log('TEST_SIZE', img.fsize || 0);
    }
  } catch (error) {
    if (error.response) {
      console.error('HTTP_STATUS', error.response.status);
      console.error('HTTP_DATA', JSON.stringify(error.response.data));
    } else {
      console.error('ERROR', error.message || String(error));
    }
    process.exit(1);
  }
})();
