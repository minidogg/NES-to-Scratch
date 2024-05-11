//other stuffs
const path = require("path");
const fs = require('fs');
const scratch = require("./scratch.js");

if(fs.existsSync("../dist"))fs.rmSync("../dist",{recursive:true})
fs.mkdirSync("../dist")

var project = new scratch.project() //make a project

var costume1 = new scratch.costume(fs.readFileSync("../costumes/backdrop.svg")) ///make backdrop costume
costume1.save(path.resolve("../dist")) //save the costume
var stage = new scratch.target({isStage:true,name:"Stage"}) //make a sprite that is the stage
stage.json.costumes.push(costume1.json) //add the costume to the sprite
project.json.targets.push(stage.json) //add the stage to the project
let abc = project.addBroadcast("abc") //add broadcast

var costume2 = new scratch.costume(fs.readFileSync("../costumes/cat.svg")) //make a costume
costume2.save(path.resolve("../dist")) //save the costume
var sprite1 = new scratch.target({isStage:false,name:"Jim"}) //create a sprite named "Jim"

//creates a chain of blocks
var blocks = new scratch.blockChain() 
// blocks.addBlock("event_whenflagclicked",{})
blocks.addBlock("event_whenbroadcastreceived",{
    fields:{
        "BROADCAST_OPTION": [
          "abc",
          abc
        ]
      }
})
blocks.addBlock("looks_say",{
    inputs:{"MESSAGE": [
        1,
        [
            scratch.inputTypes.String,
            "Hello this is from a broadcast!"
        ]
    ]}
})
sprite1.json.blocks = Object.assign(sprite1.json.blocks,blocks.json) //adds blocks to sprite


var blocks2 = new scratch.blockChain() 
blocks2.addBlock("event_whenflagclicked",{})
blocks2.addBlock("event_broadcast",{
    inputs:{"BROADCAST_INPUT": [
        1,
        [
          scratch.inputTypes.Broadcast,
          "abc",
          abc
        ]
      ]}
})
sprite1.json.blocks = Object.assign(sprite1.json.blocks,blocks2.json) //adds blocks to sprite


sprite1.json.costumes.push(costume2.json) //adds costume to sprite
project.json.targets.push(sprite1.json) //adds sprite to project


//Writes project.json to the dist folder
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