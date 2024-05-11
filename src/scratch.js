const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const fs = require("fs")
const path = require("path")

const inputTypes = {
    Number:4,
    PositiveNumber:5,
    PositiveInteger:6,
    Integer:7,
    Angle:8,
    Color:9,
    String:10,
    Broadcast:11,
    Variable:12,
    List:13
}

let blockId = 0
const genBlockId = ()=>{
    blockId++
    return blockId.toString()
}

let broadcatsId = 0
const genBroadcatsId = ()=>{
    broadcatsId++
    return broadcatsId.toString()
}

class project{
    constructor(options={}){

        this.json = {targets:[],monitors:[],extensions:[],"meta": {
            "semver": "3.0.0",
            "vm": "2.3.0",
            "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
        }}
    }
    addBroadcast(name){
        let id = genBroadcatsId()
        this.json.targets.find(e=>e.isStage==true).broadcasts[id] = name
        return id
    }
}

let layer = 0
class target{
    constructor(options={}){
        this.json = {
            isStage:true,
            name:"Stage",
            variables:{},
            lists:{},
            broadcasts:{},
            blocks:{},
            comments:{},
            currentCostume:0,
            costumes:[],
            sounds:[],
            layerOrder:layer,
            volume:100,
            tempo:1,
        }
        layer++
        Object.keys(options).forEach(key=>{
            this.json[key] = options[key]
        })
        if(this.json.isStage == true){
            this.json = Object.assign(this.json,{
                videoState:"on",
                videoTransparency:50,
                textToSpeechLanguage:null
            })
        }else{
            this.json = Object.assign(this.json,{
                visible:true,
                x:0,
                y:0,
                size:100,
                direction:90,
                draggable:false,
                rotationStyle:"all around"
            })
        }
    }

}

class costume{
    constructor(data,options={}){
        this.data = data
        this.id = genRanHex(32)
        this.json = {
            name: "costume1",
            dataFormat: "svg",
            assetId: this.id,
            md5ext: "temp",
            rotationCenterX: 0,
            rotationCenterY: 0,
            "bitmapResolution": 1,
        }
        this.json.md5ext = this.id+"."+this.json.dataFormat
        Object.keys(options).forEach(key=>{
            this.json[key] = options[key]
        })
    }
    save(dirPath){
        fs.writeFileSync(path.join(dirPath,this.json.md5ext),this.data)
    }
}

class block{
    constructor(options={}){
        this.id = genBlockId()
        this.json = {
            "opcode": "motion_ifonedgebounce",
            "next": null,
            "parent": null,
            "inputs": {
                // "MESSAGE": [
                //     1,
                //     [
                //         10,
                //         "Hello!"
                //     ]
                // ]
            },
            "fields": {},
            "shadow": false,
            "topLevel": true
        }
        Object.keys(options).forEach(key=>{
            this.json[key] = options[key]
        })
        if(this.json.topLevel==true){
            this.json.x = 0
            this.json.y = 0
        }
    }
}

class blockChain{
    constructor(options={}){
        this.json = {}
        this.lastBlockId = null
    }
    addBlock(opcode,options={}){
        
        if(this.lastBlockId!=null){
            options.topLevel = false
            options.parent = this.lastBlockId
        }
        let blockItem = new block(options)
        if(this.lastBlockId!=null){
            this.json[this.lastBlockId].next = blockItem.id
        }
        blockItem.json.opcode = opcode
        this.json[blockItem.id] = blockItem.json
        this.lastBlockId = blockItem.id
    }
}

module.exports = {project,target,costume,block,blockChain,inputTypes}