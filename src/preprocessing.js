const fs = require('fs');
const util = require('./util.js');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const files = fs.readdirSync(util.genFolder("../ROM", false), {withFileTypes: true})
              .filter(item => item.isFile())
              .filter(item => item.name.endsWith(".bin") || item.name.endsWith(".a26"));

const mirroringModes = Object.freeze({
    HORIZONTAL: Symbol("horizontal"),
    VERTICAL: Symbol("vertical"),
    FOUR_SCREEN: Symbol("four screen")
});
module.exports.mirroringModes = mirroringModes;

async function load() {
    if (files.length < 1) {
        console.error("ERROR: no ROMs detected! Make sure your ROM file is of type *.bin or *.a26");
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
            console.warn(`ERROR: Invalid option "${response}"`)
        }
    }

    const bytes = fs.readFileSync(files[selectedFile].path + "/" + files[selectedFile].name + "/");

    return {
        success: true, 
        bytes
    }
}

module.exports.preprocess_load = async (debug_output) => {
    var data = await load();
    if (!data.success) {
        console.warn("Loading failed unsuccessfully!");
    } else {
        console.log("Loading succeeded successfully!");
        fs.writeFileSync(debug_output + "/" + "preprocessing.json", 
                         JSON.stringify(data));
    }
    return data;
};