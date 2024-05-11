//other stuffs
const path = require("path");
const fs = require('fs');
const scratch = require("./scratch.js");
const util = require("./util.js");

util.genFolder("../dist", true);

var project = new scratch.project();

var costume1 = new scratch.costume(fs.readFileSync("../costumes/backdrop.svg"))
var backdrop = new scratch.target({isStage:true,name:"Stage"})
backdrop.json.costumes.push(costume1.json)
project.json.targets.push(backdrop.json)
costume1.save(path.resolve("../dist"))

var costume2 = new scratch.costume(fs.readFileSync("../costumes/cat.svg"))
var sprite1 = new scratch.target({isStage:false,name:"Jim"})

var blocks = new scratch.blockChain()
blocks.addBlock("event_whenflagclicked",{})
blocks.addBlock("control_wait",{
    inputs:{"DURATION": [
        1,
        [
            scratch.inputTypes.PositiveInteger,
            10
        ]
    ]}
})
sprite1.json.blocks = Object.assign(sprite1.json.blocks,blocks.json)

sprite1.json.costumes.push(costume2.json)
project.json.targets.push(sprite1.json)
costume2.save(path.resolve("../dist"))



fs.writeFileSync("../dist/project.json",JSON.stringify(project.json),"utf-8")


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
  zipDirectory(path.resolve("../dist"),path.resolve("../project.sb3"))