const http = require("http");
const https = require("https");
const glob = require("glob");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

let files = glob.sync("content/posts/**/*.md");
// files = ["content/posts/2014-09-22-da-nang/index.md"];

async function post(file) {
  let filepath = path.resolve(__dirname, file);
  let contents = fs.readFileSync(filepath, "utf-8");
  const matched = contents.match(
    /(?<gal>\\\[gallery.*ids="(?<ids>[\d|,]+)".*\])/
  );
  if (matched) {
    const ids = (matched.groups.ids || "").split(",");
    await downloadGallery(file, ids)
    contents = fs.readFileSync(filepath, "utf-8");
    contents = contents.replace(matched.groups.gal, "");
    fs.writeFileSync(filepath, contents, "utf-8");
  }
}

async function downloadGallery(file, ids) {
  if (ids.length === 0) {
    return;
  }
  const dir = path.resolve(path.dirname(file), "images");
  const urls = ids.map(
    (id) => `http://gonetraveling.me/wp-json/wp/v2/media/${id}`
  );
  fs.appendFileSync(file, `{{<gallery>}}\n`);

  for (let url of urls) {
    let resp = await axios.get(url);
    try {
      fs.mkdirSync(dir);
    } catch (err) {}
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
    if (resp.data.media_details.width * 2 === resp.data.media_details.height) {
      oriantation = ' oriantation="pano"';
    }
    console.log(`Appending ${src}${title}${oriantation}`);
    fs.appendFileSync(file, `  {{<img ${src}${title}${oriantation}>}}\n`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  fs.appendFileSync(file, `{{</gallery>}}\n`);
}

(async function main() {
  let instance = axios.create({
    timeout: 30000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });

  for (let file of files) {
    await post(file);
  }

  console.log("Download complete");
})();
