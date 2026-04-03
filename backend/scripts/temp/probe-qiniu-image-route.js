const http = require('http');
const url = 'http://localhost:9527/api/qiniu/image?key=test%2FGemini_Generated_Image_kfeykakfeykakfey_clean.png';
http.get(url, (res) => {
  let size = 0;
  res.on('data', (chunk) => { size += chunk.length; });
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('CTYPE', res.headers['content-type'] || '');
    console.log('LEN', size);
  });
}).on('error', (err) => {
  console.log('ERR', err.message);
  process.exit(1);
});
