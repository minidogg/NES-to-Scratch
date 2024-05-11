const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const fs = require("fs")
const path = require("path")

const inputTypes = {
    Substack:2,
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
const blockOpcodes = {"control_repeat":"control_repeat","control_repeat_until":"control_repeat_until","control_while":"control_while","control_for_each":"control_for_each","control_forever":"control_forever","control_wait":"control_wait","control_wait_until":"control_wait_until","control_if":"control_if","control_if_else":"control_if_else","control_stop":"control_stop","control_create_clone_of":"control_create_clone_of","control_delete_this_clone":"control_delete_this_clone","control_get_counter":"control_get_counter","control_incr_counter":"control_incr_counter","control_clear_counter":"control_clear_counter","control_all_at_once":"control_all_at_once","data_variable":"data_variable","data_setvariableto":"data_setvariableto","data_changevariableby":"data_changevariableby","data_hidevariable":"data_hidevariable","data_showvariable":"data_showvariable","data_listcontents":"data_listcontents","data_addtolist":"data_addtolist","data_deleteoflist":"data_deleteoflist","data_deletealloflist":"data_deletealloflist","data_insertatlist":"data_insertatlist","data_replaceitemoflist":"data_replaceitemoflist","data_itemoflist":"data_itemoflist","data_itemnumoflist":"data_itemnumoflist","data_lengthoflist":"data_lengthoflist","data_listcontainsitem":"data_listcontainsitem","data_hidelist":"data_hidelist","data_showlist":"data_showlist","event_whentouchingobject":"event_whentouchingobject","event_broadcast":"event_broadcast","event_broadcastandwait":"event_broadcastandwait","event_whengreaterthan":"event_whengreaterthan","event_whenflagclicked":"event_whenflagclicked","event_whenkeypressed":"event_whenkeypressed","event_whenthisspriteclicked":"event_whenthisspriteclicked","event_whenstageclicked":"event_whenstageclicked","event_whenbackdropswitchesto":"event_whenbackdropswitchesto","event_whenbroadcastreceived":"event_whenbroadcastreceived","looks_say":"looks_say","looks_sayforsecs":"looks_sayforsecs","looks_think":"looks_think","looks_thinkforsecs":"looks_thinkforsecs","looks_show":"looks_show","looks_hide":"looks_hide","looks_hideallsprites":"looks_hideallsprites","looks_switchcostumeto":"looks_switchcostumeto","looks_switchbackdropto":"looks_switchbackdropto","looks_switchbackdroptoandwait":"looks_switchbackdroptoandwait","looks_nextcostume":"looks_nextcostume","looks_nextbackdrop":"looks_nextbackdrop","looks_changeeffectby":"looks_changeeffectby","looks_seteffectto":"looks_seteffectto","looks_cleargraphiceffects":"looks_cleargraphiceffects","looks_changesizeby":"looks_changesizeby","looks_setsizeto":"looks_setsizeto","looks_gotofrontback":"looks_gotofrontback","looks_goforwardbackwardlayers":"looks_goforwardbackwardlayers","looks_size":"looks_size","looks_costumenumbername":"looks_costumenumbername","looks_backdropnumbername":"looks_backdropnumbername","motion_movesteps":"motion_movesteps","motion_gotoxy":"motion_gotoxy","motion_goto":"motion_goto","motion_turnright":"motion_turnright","motion_turnleft":"motion_turnleft","motion_pointindirection":"motion_pointindirection","motion_pointtowards":"motion_pointtowards","motion_glidesecstoxy":"motion_glidesecstoxy","motion_glideto":"motion_glideto","motion_ifonedgebounce":"motion_ifonedgebounce","motion_setrotationstyle":"motion_setrotationstyle","motion_changexby":"motion_changexby","motion_setx":"motion_setx","motion_changeyby":"motion_changeyby","motion_sety":"motion_sety","motion_xposition":"motion_xposition","motion_yposition":"motion_yposition","motion_direction":"motion_direction","operator_add":"operator_add","operator_subtract":"operator_subtract","operator_multiply":"operator_multiply","operator_divide":"operator_divide","operator_lt":"operator_lt","operator_equals":"operator_equals","operator_gt":"operator_gt","operator_and":"operator_and","operator_or":"operator_or","operator_not":"operator_not","operator_random":"operator_random","operator_join":"operator_join","operator_letter_of":"operator_letter_of","operator_length":"operator_length","operator_contains":"operator_contains","operator_mod":"operator_mod","operator_round":"operator_round","operator_mathop":"operator_mathop","procedures_definition":"procedures_definition","procedures_call":"procedures_call","argument_reporter_string_number":"argument_reporter_string_number","argument_reporter_boolean":"argument_reporter_boolean","sensing_touchingobject":"sensing_touchingobject","sensing_touchingcolor":"sensing_touchingcolor","sensing_coloristouchingcolor":"sensing_coloristouchingcolor","sensing_distanceto":"sensing_distanceto","sensing_timer":"sensing_timer","sensing_resettimer":"sensing_resettimer","sensing_of":"sensing_of","sensing_mousex":"sensing_mousex","sensing_mousey":"sensing_mousey","sensing_setdragmode":"sensing_setdragmode","sensing_mousedown":"sensing_mousedown","sensing_keypressed":"sensing_keypressed","sensing_current":"sensing_current","sensing_dayssince2000":"sensing_dayssince2000","sensing_loudness":"sensing_loudness","sensing_loud":"sensing_loud","sensing_askandwait":"sensing_askandwait","sensing_answer":"sensing_answer","sensing_username":"sensing_username","sound_play":"sound_play","sound_playuntildone":"sound_playuntildone","sound_stopallsounds":"sound_stopallsounds","sound_seteffectto":"sound_seteffectto","sound_changeeffectby":"sound_changeeffectby","sound_cleareffects":"sound_cleareffects","sound_sounds_menu":"sound_sounds_menu","sound_beats_menu":"sound_beats_menu","sound_effects_menu":"sound_effects_menu","sound_setvolumeto":"sound_setvolumeto","sound_changevolumeby":"sound_changevolumeby","sound_volume":"sound_volume"}

let lastBlockId = 0
const genBlockId = ()=>{
    lastBlockId++
    return lastBlockId.toString()
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

class input{
    constructor(position,type,value){
        this.json = [
            position,
            [
                type,
                value
            ]
        ]
    }
}
class substackInput{
    constructor(blockId){
        this.json = [
            inputTypes.Substack,
            blockId
        ]
    }
}

module.exports = {project,target,costume,block,blockChain,input,substackInput,inputTypes,blockOpcodes,lastBlockId}