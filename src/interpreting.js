var instructions = require("./6502_instructions.json");
const fs = require('fs');
const util = require("./util.js");

for (let i = 0; i < instructions.length; i++) {
    instructions[i].bytes = Number.parseInt(instructions[i].bytes);
}

function getInstructionFromOPCode(opcode) {
    var formatted_opcode = util.formatToHex(opcode);
    for (let i = 0; i < instructions.length; i++) {
        var instruction = instructions[i];
        if (instruction.opcode == formatted_opcode) {
            return instruction;
        }
    }
    return null;
}

module.exports.interpreting_load = async function(data, debug_output) {
    const bytes = data.bytes;

    var position = 0;
    var parsed_instructions = {
        num_valid:0,
        num_invalid:0,
        parsed:[]
    };
    
    while (position < bytes.length) {
        let instruction = getInstructionFromOPCode(bytes[position]);
        parsed_instructions.parsed.push({
            instruction,
            arguments: instruction==null?[]:Array.from(bytes.subarray(position, position + instruction.bytes - 1))
        });
        if (instruction == null) {
            parsed_instructions.num_invalid++;
            console.warn(`Invalid instruction ${util.formatToHex(bytes[position])} at address ${util.formatToHex(position, 2)}`);
        } else {
            parsed_instructions.num_valid++;
        }
        position += instruction==null?1:instruction.bytes;
    }
    fs.writeFileSync(debug_output + "/" + "interpreting.json", 
                     JSON.stringify(parsed_instructions));
    return parsed_instructions;
}