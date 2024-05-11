const path = require("path")
const fs = require('fs')
const scratch = require("./scratch.js")

if(fs.existsSync("../dist"))fs.rmSync("../dist",{recursive:true})
fs.mkdirSync("../dist")

var project = new scratch.project()


fs.writeFileSync("../dist/project.json",JSON.stringify(project.json),"utf-8")