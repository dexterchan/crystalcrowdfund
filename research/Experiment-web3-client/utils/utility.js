const Keccak = require("keccak");
const isHex = str => {
  if (str.length % 2 === 0 && str.match(/^[0-9a-f]+$/i)) return true;
  return false;
};
const isBase64 = str => {
  var index;
  if (str.length % 4 > 0 || str.match(/[^0-9a-z+\/=]/i)) return false;
  index = str.indexOf("=");
  if (index === -1 || str.slice(index).match(/={1,2}/)) return true;
  return false;
};

module.exports.str2buf = (str, enc) => {
  if (!str || str.constructor !== String) return str;
  if (!enc && isHex(str)) enc = "hex";
  if (!enc && isBase64(str)) enc = "base64";
  return Buffer.from(str, enc);
};

module.exports.keccak256 = msg => {
  return Keccak("keccak256")
    .update(msg)
    .digest();
};
