const http = require("http");
const https = require("https");
const axios = require("axios");
const fs = require("fs");

const fb = require("./firebase.json");

(async function main() {
  let instance = axios.create({
    timeout: 30000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });

  const resp = await axios.get(
    "http://gonetraveling.me/wp-json/wp/v2/posts?per_page=100&page=1"
  );

  fb.redirects = [];
  for (let item of resp.data) {
    let dateParts = item.date.split("T")[0].split("-");
    fb.redirects.push({
      source: `/${item.slug}`,
      destination: `/posts/${dateParts[0]}-${dateParts[1]}-${item.slug}`,
      type: 301
    });
  }
  fs.writeFileSync("./firebase.json", JSON.stringify(fb, null, "  "), "utf-8");
})();
