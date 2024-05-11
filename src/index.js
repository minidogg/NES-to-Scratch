//other stuffs
const path = require("path");
const fs = require('fs');
const util = require("./util.js");

util.genFolder("../dist", true);
util.genFolder("../dist/project", true);

const projectDist = path.resolve("../dist/project")
const toScratch = require("./to-scratch.js")

const data = toScratch.convert(projectDist)

//Writes project.json to the dist folder
fs.writeFileSync(path.join(projectDist,"/project.json"),JSON.stringify(data),"utf-8")


//finally commit archive
var archiver = require('archiver');

function zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(outPath);
  
    return new Promise((resolve, reject) => {
      archive
        .directory(sourceDir, false)
        .on('error', err => reject(err))
        .pipe(stream)
      ;
  
      stream.on('close', () => resolve());
      archive.finalize();
    });
  }
  zipDirectory(projectDist,path.resolve("../dist/project.sb3"))