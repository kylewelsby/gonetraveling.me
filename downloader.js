const http = require("http");
const https = require("https");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ids =
"1416,1415,1426,1417,1418,1419,1420,1429,1427,1428,1421,1422,1423,1433,1430,1432,1435,1434,1424,1425,1437,1436,1438,1439,1431,1443,1440,1441,1442,1414,1446,1448,1445,1447,1444";
const id ="2014-09-28-da-lat"
const dir = `content/posts/${id}/images/`;
let md = path.resolve(dir.replace("/images/", "/index.md"));

let urls = [];
ids
  .split(",")
  .forEach((id) =>
    urls.push(`http://gonetraveling.me/wp-json/wp/v2/media/${id}`)
  );

(async function main() {
  let instance = axios.create({
    timeout: 30000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });

  fs.appendFileSync(md, `{{<gallery>}}\n`);

  for (let url of urls) {
    let req = await axios.get(url).then(async (resp) => {
      let filepath = path.resolve(dir, path.basename(resp.data.source_url));
      console.log(`Downloading ${resp.data.source_url} to ${filepath}`);
      let writer = fs.createWriteStream(filepath);
      let stream = await axios.get(resp.data.source_url, {
        responseType: "stream"
      });
      stream.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      let src = `src="images/${path.basename(resp.data.source_url)}"`;
      let title = "";
      let oriantation = "";
      if (resp.data.caption.rendered) {
        title = ` title="${resp.data.caption.rendered.replace(
          /<p>(.*)<\/p>\n/,
          "$1"
        )}"`;
      }
      if (resp.data.media_details.height > resp.data.media_details.width) {
        oriantation = ' oriantation="portrait"';
      }
      if (
        resp.data.media_details.width * 2 ===
        resp.data.media_details.height
      ) {
        oriantation = ' oriantation="pano"';
      }
      console.log(`Appending ${src}${title}${oriantation}`);
      fs.appendFileSync(md, `  {{<img ${src}${title}${oriantation}>}}\n`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
  }
  fs.appendFileSync(md, `{{</gallery>}}\n`);

  console.log("Download complete");
})();
