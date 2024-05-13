var instructions = require("./6502_instructions.json");
const fs = require('fs');
const util = require("./util.js");

for (let i = 0; i < instructions.length; i++) {
    instructions[i].bytes = Number.parseInt(instructions[i].bytes);
    instructions[i].opcode = Number.parseInt(instructions[i].opcode.replace("$", "0x"));
}

const AddressModes = Object.freeze({
    IMMEDIATE: 'Immediate',
    ZERO_PAGE: 'ZeroPage',
    ZERO_PAGE_X: 'ZeroPage,X',
    ABSOLUTE: 'Absolute',
    ABSOLUTE_X: 'Absolute,X',
    ABSOLUTE_Y: 'Absolute,Y',
    INDIRECT_X: '(Indirect,X)',
    INDIRECT_Y: '(Indirect),Y',
    ACCUMULATOR: 'Accumulator',
    RELATIVE: 'Relative',
    IMPLIED: 'Implied',
    INDIRECT: 'Indirect',
    ZERO_PAGE_Y: 'ZeroPage,Y'
});

module.exports.AddressModes = AddressModes;

function getInstructionFromOPCode(opcode) {
    for (let i = 0; i < instructions.length; i++) {
        var instruction = instructions[i];
        if (instruction.opcode == opcode) {
            return instruction;
        }
    }
    return null;
}

module.exports.interpreting_load = async function(data, debug_output) {
    const bytes = data.bytes;

    var position = 0;

    var chunks = readChunks(bytes, 0, [], debug_output);

    fs.writeFileSync(debug_output + "/" + "interpreting.json", 
                     JSON.stringify(chunks, null, 2));
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        let start = chunk[0].address;
        let end = chunk[chunk.length - 1].nextAddress - 1;
        console.log(
            `Chunk ${i} spanning ${util.formatToHex(start,2)} (${start}) to ${util.formatToHex(end, 2)} (${end})`
        );
    }
    
    console.log("Successfully parsed data!");
    return chunks;
}

const startAddr = 61440;

function readChunks(bytes, position, chunks, debug_output) {
    console.log(`New call to position ${util.formatToHex(position, 2)} (${position})`);
    if (chunks.map(val=>val[0].address).includes(position)) {
        return chunks;
    }

    chunks.push([]);
    while (position < bytes.length) {
        let instruction = getInstructionFromOPCode(bytes[position]);
        if (instruction == null) {
            util.dump(chunks, debug_output);
            throw new TypeError(`ERROR: Invalid instruction ${util.formatToHex(bytes[position])} at address ${util.formatToHex(position, 2)}`);
        };
        if (instruction.mode == AddressModes.INDIRECT) {
            util.dump(chunks, debug_output);
            throw new TypeError(`ERROR: wuh woh! idk how to implement this!!1!!!`);
        }

        var data = {
            instruction,
            arguments: Array.from(bytes.subarray(position + 1, position + instruction.bytes)),
            address: position,
            nextAddress: position + instruction.bytes
        }
        chunks[chunks.length - 1].push(data);

        
        position += instruction.bytes;
        if (instruction.name == "JMP") {
            chunks = readChunks(
                bytes, 
                util.twoBytesToUInt16LE(data.arguments[0], data.arguments[1]) - startAddr, 
                chunks, 
                debug_output
            );
            
            return chunks;
        } else if (instruction.name == "JSR") {
            chunks = readChunks(
                bytes, 
                util.twoBytesToUInt16LE(data.arguments[0], data.arguments[1]) - startAddr, 
                chunks, 
                debug_output
            );
            
            chunks = readChunks(bytes, position, chunks, debug_output);
            return chunks;
        } else if (instruction.name == "RTS") {
            return chunks;
        } else if (instruction.mode == AddressModes.RELATIVE) {
            chunks = readChunks(
                bytes, 
                position + util.byteToInt8(data.arguments[1]), 
                chunks, 
                debug_output
            );
            
            chunks = readChunks(bytes, position, chunks, debug_output);
            return chunks;
        }
    }
    console.log("what... the PC reached the end???");
    if (chunks[chunks.length -1].length == 0) {
        chunks.pop()
    }
    return chunks;
}