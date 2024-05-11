const path = require("path")
const fs = require('fs')

if(fs.existsSync("../dist"))fs.rmdirSync("../dist")
fs.mkdirSync("../dist")