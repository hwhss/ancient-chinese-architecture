require('dotenv').config();
const axios = require('axios');
const qiniu = require('qiniu');

(async () => {
  try {
    const mac = new qiniu.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);
    const bucket = process.env.QINIU_BUCKET || 'ancientarc';
    const url = `https://api.qiniu.com/v6/domain/list?tbl=${encodeURIComponent(bucket)}`;
    const token = qiniu.util.generateAccessToken(mac, url);
    const resp = await axios.get(url, { headers: { Authorization: token }, timeout: 20000 });
    console.log('DOMAINS', JSON.stringify(resp.data));
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
