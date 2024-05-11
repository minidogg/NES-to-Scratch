const path = require("path");
const fs = require('fs');
const util = require('./util.js');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (!fs.existsSync("../ROM")) fs.mkdirSync("../ROM");

const files = fs.readdirSync("../ROM", {withFileTypes: true})
              .filter(item => item.isFile())
              .filter(item => item.name.endsWith(".nes"));

const mirroringModes = Object.freeze({
    HORIZONTAL: Symbol("horizontal"),
    VERTICAL: Symbol("vertical"),
    FOUR_SCREEN: Symbol("four screen")
});

async function load() {
    if (files.length < 1) {
        console.log("ERROR: no ROMs detected! Make sure your ROM file is of type *.nes");
    } else {
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

        const binary = fs.readFileSync(files[selectedFile].path + "/" + files[selectedFile].name + "/");

        var header = {
            identifier: binary.subarray(0, 4).toString(), // Identifier, should be 'NES\x1A'
            numPRGROM: binary.readUint8(4), // Number of 16 KB PRG-ROM banks. 
            numCHRROM: binary.readUint8(5), // Number of 8 KB CHR-ROM banks.
            mirroringMode: null, // Indicates the type of mirroring
            batteryBackedRAM: null, // Indicates the presence of battery-backed RAM 
                                    // at memory locations $6000-$7FFF. 
            byteTrainer: null, // Indicates the presence of a 512-byte trainer at
                            // memory locations $7000-$71FF.
            mapperNumber: null, // Memory mapper number, 
                                // info can be found on page 36 of https://www.nesdev.org/NESDoc.pdf
            numRAMbanks: Math.max(binary.readUint8(8), 1)
        }

        var controlByte1 = binary.readUint8(6);
        var controlByte2 = binary.readUint8(7);

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

        if (header.identifier != 'NES\x1A') {
            console.log("ERROR: Invalid NES file!")
        } else {
            console.log(header);
        }
    }
}
load();