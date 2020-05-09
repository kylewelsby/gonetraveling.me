const glob = require("glob");
const fs = require("fs");

const files = glob.sync("content/posts/**/index.md");
const exp = new RegExp(
  /(?<cap>\\?\[caption.*\((?<src>images\/.*)\)\s?(?<title>.*)\\\[\/caption\\?\])/
);

(async function main() {
  let counter = 0;
  for (let file of files) {
    let contents = fs.readFileSync(file, "utf-8");
    const matched = contents.match(exp);
    if (matched) {
      contents = contents.replace(
        matched.groups.cap,
        `{{<img src="${matched.groups.src}" title="${matched.groups.title}">}}`
      );
      fs.writeFileSync(file, contents, "utf-8");
      counter++;
    }
  }
  console.log(`Fixed (${counter}) files`);
})();
