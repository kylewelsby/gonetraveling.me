const axios = require("axios");
const fs = require("fs");
const path = require("path");

(async function main() {
  let instance = axios.create({
    timeout: 30000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });

  const resp = await axios.get('http://gonetraveling.me/wp-json/wp/v2/posts');
  for(let item of resp.data) {
    let filepath = path.resolve(__dirname, 'content/posts', `${item.date.split('T')[0]}-${item.slug}`)
    if (fs.existsSync(filepath) ) {
      console.log('Yeah?')
    }
  }

  console.log("Download complete");
})();
