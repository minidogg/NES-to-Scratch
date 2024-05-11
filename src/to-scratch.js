const scratch = require("./scratch.js");
const {blockOpcodes} = require("./scratch.js");
const fs = require("fs")
const path = require("path")

module.exports.convert = (projectDist,intructionData)=>{

    var project = new scratch.project(); //make a project

    var costume1 = new scratch.costume(fs.readFileSync("../costumes/backdrop.svg")) ///make backdrop costume
    costume1.save(path.resolve(projectDist)) //save the costume
    var stage = new scratch.target({isStage:true,name:"Stage"}) //make a sprite that is the stage
    stage.json.costumes.push(costume1.json) //add the costume to the sprite
    project.json.targets.push(stage.json) //add the stage to the project

    var costume2 = new scratch.costume(fs.readFileSync("../costumes/cat.svg")) //make a costume
    costume2.save(path.resolve(projectDist)) //save the costume
    var sprite1 = new scratch.target({isStage:false,name:"Jim"}) //create a sprite named "Jim"

    //creates a chain of blocks
    var blocks1 = new scratch.blockChain() 
    blocks1.addBlock(blockOpcodes.event_whenflagclicked,{})
    blocks1.addBlock(blockOpcodes.motion_movesteps,{inputs:{
        "SUBSTACK":new scratch.substackInput(scratch.lastBlockId+2)
    }})
    blocks1.addBlock(blockOpcodes.motion_movesteps,{inputs:{
        "STEPS":new scratch.input(1,scratch.inputTypes.Number,10).json
    }})

    sprite1.json.blocks = Object.assign(sprite1.json.blocks,blocks1.json) //adds blocks to sprite


    sprite1.json.costumes.push(costume2.json) //adds costume to sprite
    project.json.targets.push(sprite1.json) //adds sprite to project


    return project.json
}