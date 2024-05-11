const path = require("path");
const fs = require('fs');

if (!fs.existsSync("../ROM")) fs.mkdirSync("../ROM");

const files = fs.readdirSync("../ROM", {withFileTypes: true})
              .filter(item => item.isFile())
              .filter(item => item.name.endsWith(".nes"));

if (files.length > 1) {
    console.log("ERROR: multiple ROMs detected!");
} else if (files.length < 1) {
    console.log("ERROR: no ROMs detected! Make sure your ROM file is of type *.nes");
} else {
    const binary = fs.readFileSync(files[0].path + "/" + files[0].name + "/");
    console.log(binary);
}