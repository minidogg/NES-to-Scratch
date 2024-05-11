const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const fs = require("fs")
const path = require("path")

class project{
    constructor(options={}){

        this.json = {targets:[],monitors:[],extensions:[],"meta": {
            "semver": "3.0.0",
            "vm": "2.3.0",
            "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
        }}
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

module.exports = {project,target,costume}