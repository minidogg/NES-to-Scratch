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