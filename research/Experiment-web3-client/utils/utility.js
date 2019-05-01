const Keccak = require("keccak");
const BN = require("bn.js");
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
function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) {
    return false;
  }

  return true;
}
function padToEven(value) {
  var a = value; // eslint-disable-line

  if (typeof a !== "string") {
    throw new Error(
      `while padding to even, value must be string, is currently ${typeof a}, while padToEven.`
    );
  }

  if (a.length % 2) {
    a = `0${a}`;
  }

  return a;
}
module.exports.padToEven = padToEven;
const isHexPrefixed = v => {
  if (typeof v !== "string") {
    throw new Error(
      "[is-hex-prefixed] value must be type 'string', is currently type " +
        typeof v +
        ", while checking isHexPrefixed."
    );
  }
  if (v.length < 2) {
    return false;
  }
  return v.slice(0, 2) === "0x";
};
module.exports.isHexString = isHexString;
const stripHexPrefix = str => {
  if (typeof str !== "string") {
    return str;
  }
  return isHexPrefixed(str) ? str.slice(2) : str;
};

module.exports.stripHexPrefix = stripHexPrefix;

module.exports.keccak256 = msg => {
  return Keccak("keccak256")
    .update(msg)
    .digest();
};

module.exports.stripZeros = a => {
  a = stripHexPrefix(a);
  let first = a[0];
  while (a.length > 0 && first.toString() === "0") {
    a = a.slice(1);
    first = a[0];
  }
  return a;
};

function int2Hex(i) {
  var hex = i.toString(16); // eslint-disable-line

  return `0x${hex}`;
}
module.exports.int2Hex = int2Hex;

const int2Buffer = i => {
  const v = i.toString(16);
  return Buffer.from(padToEven(v, "hex"));
};
module.exports.int2Buffer = int2Buffer;
module.exports.toBuffer = v => {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v);
    } else if (typeof v === "string") {
      if (isHexString(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), "hex");
      } else {
        v = Buffer.from(v);
      }
    } else if (typeof v === "number") {
      v = int2Buffer(v);
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0);
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer);
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray());
    } else {
      throw new Error("invalid type");
    }
  }
  return v;
};
