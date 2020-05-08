const http = require("http");
const https = require("https");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

(async function main() {
  let instance = axios.create({
    timeout: 30000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });

  const resp = await axios.get(
    "http://gonetraveling.me/wp-json/wp/v2/posts?per_page=1&page=1"
  );
  const catResp = await axios.get(
    `http://gonetraveling.me/wp-json/wp/v2/categories?per_page=100`
  );
  const tagResp = await axios.get(
    `http://gonetraveling.me/wp-json/wp/v2/tags?per_page=100`
  );

  for (let item of catResp.data) {
    if (item.description.length > 0) {
      let fm = matter("");
      fm.data.title = item.name;
      fm.data.url = `/${item.slug}`;
      fm.content = item.description;
      let filepath = path.resolve(
        __dirname,
        `content/categories/${item.slug}/_index.md`
      );
      try {
        fs.mkdirSync(
          path.resolve(__dirname, `content/categories/${item.slug}`)
        );
      } catch (e) {}
      fs.writeFileSync(filepath, matter.stringify(fm), "utf-8");
    }
  }

  for (let item of resp.data) {
    // let filepath = glob.sync(`content/posts/*-${item.slug}/index.md`)
    let dir = path.resolve(
      __dirname,
      "content/posts",
      `${item.date.split("T")[0]}-${item.slug}`
    );
    let filepath = path.resolve(dir, `index.md`);
    if (filepath.length > 0) {
      try {
        fs.mkdirSync(path.resolve(dir, 'images/'));
      } catch (err) {}
      let writer = fs.createWriteStream(path.resolve(dir, 'images/', 'artwork.jpg'));
      let stream = await axios.get(item.jetpack_featured_media_url, {
        responseType: "stream"
      });
      stream.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      let categories = item.categories
        .map((id) => catResp.data.find((item) => item.id === id))
        .filter(Boolean);
      let tags = item.tags
        .map((id) => tagResp.data.find((item) => item.id === id))
        .filter(Boolean);

      let fm = matter.read(filepath);
      fm.data.url = `/${item.slug}`;
      fm.data.artwork = 'images/artwork.jpg'
      fm.data.categories = categories.map((c) => c.name);
      fm.data.tags = tags.map((c) => c.name);
      fs.writeFileSync(filepath, matter.stringify(fm), "utf-8");
    }
  }

  console.log("Download complete");
})();
