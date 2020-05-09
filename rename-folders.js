const glob = require("glob");
const fs = require("fs");

const folders = glob.sync("content/posts/*");

(async function main() {
  let counter = 0;
  for (let folder of folders) {
    console.log('rename to ', folder.replace(/(\d{4}-\d{2})-\d{2}-(.*)/, "$1-$2"))
    fs.renameSync(folder, folder.replace(/(\d{4}-\d{2})-\d{2}-(.*)/, "$1-$2"))
    
  }
  console.log(`Fixed (${counter}) files`);
})();
