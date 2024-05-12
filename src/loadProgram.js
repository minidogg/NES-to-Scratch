const preprocessing = require("./preprocessing.js");
const interpreting = require("./interpreting.js");
const util = require("./util.js");

(async()=>{
    var debug_output = util.genFolder("../debug_output", true);

    var preprocessed_data = await preprocessing.preprocess_load(debug_output);
    var interpreted_data = await interpreting.interpreting_load(preprocessed_data, debug_output);
})();