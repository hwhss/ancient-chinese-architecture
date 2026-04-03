require('dotenv').config();
const axios = require('axios');
const qiniu = require('qiniu');

(async () => {
  const ak = process.env.QINIU_ACCESS_KEY;
  const sk = process.env.QINIU_SECRET_KEY;
  const mac = new qiniu.auth.digest.Mac(ak, sk);
  const hosts = [
    'https://uc.qbox.me/v2/buckets',
    'https://uc.qiniuapi.com/v2/buckets',
    'https://rs.qiniuapi.com/v2/buckets',
    'https://uc.qbox.me/buckets'
  ];

  for (const url of hosts) {
    try {
      const token = qiniu.util.generateAccessToken(mac, url);
      const resp = await axios.get(url, { headers: { Authorization: token }, timeout: 15000 });
      console.log('OK_URL', url);
      console.log('DATA', JSON.stringify(resp.data));
      return;
    } catch (error) {
      const status = error.response ? error.response.status : 'NO_STATUS';
      const data = error.response ? JSON.stringify(error.response.data) : String(error.message || error);
      console.log('FAIL_URL', url, status, data);
    }
  }

  process.exit(1);
})();
