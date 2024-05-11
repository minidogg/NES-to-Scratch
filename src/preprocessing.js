const path = require("path");
const fs = require('fs');
const util = require('./util.js');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const files = fs.readdirSync(util.genFolder("../ROM", false), {withFileTypes: true})
              .filter(item => item.isFile())
              .filter(item => item.name.endsWith(".nes"));

const mirroringModes = Object.freeze({
    HORIZONTAL: Symbol("horizontal"),
    VERTICAL: Symbol("vertical"),
    FOUR_SCREEN: Symbol("four screen")
});
module.exports.mirroringModes = mirroringModes;

async function load() {
    if (files.length < 1) {
        console.log("ERROR: no ROMs detected! Make sure your ROM file is of type *.nes");
        return {
            success: false,
            header: null,
            trainer: null,
            PRGROMs: null,
            CHRROMs: null
        }
    }
    for (let i = 0; i < files.length; i++) {
        console.log(`(${i}) ${files[i].name}`);
    }

    var selectedFile = null;
    while (selectedFile == null) {
        const response = await new Promise(resolve => {
            rl.question("> ", resolve)
        })
        if (response in files) {
            selectedFile = Number.parseInt(response);
        } else {
            console.log(`ERROR: Invalid option "${response}"`)
        }
    }

    const bytes = fs.readFileSync(files[selectedFile].path + "/" + files[selectedFile].name + "/");
    
    if (bytes.length < 16) {
        console.log("ERROR: Invalid NES file! File smaller than header length!");
        return {
            success: false,
            header: null,
            trainer: null,
            PRGROMs: null,
            CHRROMs: null
        }
    }

    var currentPosition = 0;
    console.log("currentPosition =", currentPosition, `(${currentPosition.toString(16)})`);

    var header = {
        identifier: bytes.subarray(0, 4).toString(), // Identifier, should be 'NES\x1A'
        numPRGROM: bytes.readUint8(4), // Number of 16 KB (16384 bytes) PRG-ROM banks. 
        numCHRROM: bytes.readUint8(5), // Number of 8 KB (8192 bytes) CHR-ROM banks.
        mirroringMode: null, // Indicates the type of mirroring
        batteryBackedRAM: null, // Indicates the presence of battery-backed RAM 
                                // at memory locations $6000-$7FFF. 
        byteTrainer: null, // Indicates the presence of a 512-byte trainer at
                        // memory locations $7000-$71FF.
        mapperNumber: null, // Memory mapper number, 
                            // info can be found on page 36 of https://www.nesdev.org/NESDoc.pdf
        numRAMbanks: Math.max(bytes.readUint8(8), 1)
    }

    var controlByte1 = bytes.readUint8(6);
    var controlByte2 = bytes.readUint8(7);

    if (util.readBit(controlByte1, 3)) { // check for 4-screen mirroring
        header.mirroringMode = mirroringModes.FOUR_SCREEN
    } else if (util.readBit(controlByte1, 0)) { // check for vertical mirroring
        header.mirroringMode = mirroringModes.VERTICAL
    } else { // otherwise assume horizontal mirroring
        header.mirroringMode = mirroringModes.HORIZONTAL
    }


    header.batteryBackedRAM = util.readBit(controlByte1, 1);
    header.byteTrainer = util.readBit(controlByte1, 2);


    header.mapperNumber = (controlByte2 & 0b11110000) + ((controlByte1 >> 4) & 0b00001111)

    currentPosition += 16;

    if (header.identifier != 'NES\x1A') {
        console.log("ERROR: Invalid NES file! Wrong identifier!");
        return {
            success: false,
            header: null,
            trainer: null,
            PRGROMs: null,
            CHRROMs: null
        }
    }

    var expectedLength = 16 + header.numPRGROM * 16384 + header.numCHRROM * 8192;
    if (expectedLength != bytes.length) {
        console.log(`ERROR: Invalid NES file! Expected a length of ${expectedLength}, got a length of ${bytes.length}`);
    }

    console.log("header =", header);
    console.log("currentPosition =", currentPosition, `(${currentPosition.toString(16)})`);
    
    var trainer = null;
    if (header.byteTrainer) {
        trainer = bytes.subarray(currentPosition, currentPosition + 512);
        currentPosition += 512;
    }
    
    console.log("trainer =", trainer);
    console.log("currentPosition =", currentPosition, `(${currentPosition.toString(16)})`);

    var PRGROMs = [];
    for (let i = 0; i < header.numPRGROM; i++) {
        PRGROMs.push(bytes.subarray(currentPosition, currentPosition + 16384));
        currentPosition += 16384;
    }
    console.log("PRGROMs =", PRGROMs);
    console.log("currentPosition =", currentPosition, `(${currentPosition.toString(16)})`);

    
    var CHRROMs = [];
    for (let i = 0; i < header.numCHRROM; i++) {
        CHRROMs.push(bytes.subarray(currentPosition, currentPosition + 8192));
        currentPosition += 8192;
    }
    console.log("CHRROMs =", CHRROMs);
    console.log("currentPosition =", currentPosition, `(${currentPosition.toString(16)})`);
    return {
        success: true, 
        header,
        trainer,
        PRGROMs,
        CHRROMs
    }
}

var debug_output = util.genFolder("../debug_output", true);

module.exports.preprocess_load = async () => {
    var data = await load();
    if (!data.success) {
        console.log("Loading failed unsuccessfully!");
    } else {
        console.log("Loading succeeded successfully!");
        fs.writeFileSync(debug_output + "/" + "preprocessing.json", 
                         JSON.stringify(data));
    }
    return data;
};