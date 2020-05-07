const http = require("http");
const https = require("https");

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ids =
  "1527,1526,1525,1523,1522,1504,1520,1492,1447,1446,1443,1438,1435,1423,1434,1422,1429,1426,1425,1419,1414,1409,1415,1405,1403,1399,1400,1392,1391,1383,1381,1387,1355,1356,1325,1353,1323,1324,1444,1315,1313,1308,1307,1306,1302,1301,1299,1251,1231,1228,1227,1224,1213,1214,1219,1182,1183,1172,1173,1174,1175,1170,1168,1169,1131,1128,1065,1064,1061,1059,1054,1055,1050,1049,1045,1044,1046,1040,1036,1035,1029,1028,1025,1014,1018,1030";
const dir = "content/posts/2014-10-08-vietnam/images/";
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
