require('dotenv').config();
const axios = require('axios');
const qiniu = require('qiniu');

(async () => {
  try {
    const ak = process.env.QINIU_ACCESS_KEY;
    const sk = process.env.QINIU_SECRET_KEY;
    if (!ak || !sk) {
      throw new Error('Missing QINIU_ACCESS_KEY or QINIU_SECRET_KEY');
    }

    const mac = new qiniu.auth.digest.Mac(ak, sk);
    const bucketsUrl = 'https://rs.qiniuapi.com/v2/buckets';
    const token = qiniu.util.generateAccessToken(mac, bucketsUrl);

    const bucketResp = await axios.get(bucketsUrl, {
      headers: { Authorization: token },
      timeout: 20000
    });

    const buckets = Array.isArray(bucketResp.data) ? bucketResp.data : [];
    console.log('BUCKET_COUNT', buckets.length);
    console.log('BUCKETS', JSON.stringify(buckets));

    if (buckets.length === 0) {
      return;
    }

    const bucket = buckets[0];
    const listUrl = `https://rsf.qiniuapi.com/list?bucket=${encodeURIComponent(bucket)}&limit=10`;
    const listToken = qiniu.util.generateAccessToken(mac, listUrl);
    const listResp = await axios.post(listUrl, null, {
      headers: { Authorization: listToken },
      timeout: 20000
    });

    const items = (listResp.data && listResp.data.items) || [];
    console.log('FIRST_BUCKET', bucket);
    console.log('ITEM_COUNT', items.length);
    if (items[0]) {
      console.log('FIRST_KEY', items[0].key || '');
      console.log('FIRST_MIME', items[0].mimeType || '');
      console.log('FIRST_SIZE', items[0].fsize || 0);
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
