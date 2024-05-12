const fs = require('fs');

/**    
 * @name readBit()
 * @brief Allows to read the value of a bit in a byte. 
 * @param byte The byte to read the bit from.
 * @param bitIndex The zero-based cardinal index of the bit to read from the byte. Bits reading is from right to left.
 * @return The bit value.
 */
module.exports.readBit = function (byte, bitIndex) {
    return ((byte >> bitIndex) & 1) == 1;
}

module.exports.genFolder = function (location, erase_if_exists) {
    if (fs.existsSync(location)) {
        if (erase_if_exists) {
            fs.rmSync(location,{recursive:true});
            fs.mkdirSync(location);
        }
    } else {
        fs.mkdirSync(location);
    }
    return location;
}

module.exports.formatToHex=(num,bytes=1)=>(bytes==1?"$":"0x")+num.toString(16).padStart(1<<bytes,'0').toUpperCase();