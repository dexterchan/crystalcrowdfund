const rlp = require("rlp");
const BN = require("bn.js");
const assert = require("assert");
const secp256k1 = require("secp256k1");
const {
  stripHexPrefix,
  stripZeros,
  toBuffer,
  padToEven,
  keccak256
} = require("../utils/utility");
// secp256k1n/2
const N_DIV_2 = new BN(
  "7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",
  16
);
/*
 *
 *
 * @property {Buffer} raw The raw rlp encoded transaction
 * @param {Buffer} data.nonce nonce number
 * @param {Buffer} data.gasLimit transaction gas limit
 * @param {Buffer} data.gasPrice transaction gas price
 * @param {Buffer} data.to to the to address
 * @param {Buffer} data.value the amount of ether sent
 * @param {Buffer} data.data this will contain the data of the message or the init of a contract
 * @param {Buffer} data.v EC recovery ID
 * @param {Buffer} data.r EC signature parameter
 * @param {Buffer} data.s EC signature parameter
 * @param {Number} data.chainId EIP 155 chainId - mainnet: 1, ropsten: 3
 *
 * @param {Array} opts Options
 * @param {String|Number} opts.chain The chain for the block [default: 'mainnet']
 * @param {String} opts.hardfork Hardfork for the block [default: null, block number-based behaviour]
 * @param {Object} opts.common Alternatively pass a Common instance (ethereumjs-common) instead of setting chain/hardfork directly
 * */

class EthSimpleTxn {
  // Define Properties
  getFields() {
    return [
      {
        name: "nonce",
        length: 32,
        allowLess: true,
        default: Buffer.from([])
      },
      {
        name: "gasPrice",
        length: 32,
        allowLess: true,
        default: Buffer.from([]) //Buffer.from([])
      },
      {
        name: "gasLimit",
        alias: "gas",
        length: 32,
        allowLess: true,
        default: Buffer.from([])
      },
      {
        name: "to",
        allowZero: true,
        length: 20,
        default: Buffer.from([])
      },
      {
        name: "value",
        length: 32,
        allowLess: true,
        default: Buffer.from([])
      },
      {
        name: "data",
        alias: "input",
        allowZero: true,
        default: Buffer.from([])
      },
      {
        name: "v",
        allowZero: true,
        default: Buffer.from([0x1c])
      },
      {
        name: "r",
        length: 32,
        allowZero: true,
        allowLess: true,
        default: Buffer.from([])
      },
      {
        name: "s",
        length: 32,
        allowZero: true,
        allowLess: true,
        default: Buffer.from([])
      }
    ];
  }

  initialize(data) {
    this._fields = [];
    this.raw = {};
    const fields = this.getFields();
    fields.forEach((field, i) => {
      this._fields.push(field.name);
      function getter() {
        return this.raw[i];
      }
      function setter(v) {
        v = toBuffer(v);

        if (v.toString("hex") === "00" && !field.allowZero) {
          v = Buffer.allocUnsafe(0);
        }

        if (field.allowLess && field.length) {
          v = stripZeros(v);
          assert(
            field.length >= v.length,
            `The field ${field.name} must not have more ${field.length} bytes`
          );
        } else if (!(field.allowZero && v.length === 0) && field.length) {
          assert(
            field.length === v.length,
            `The field ${field.name} must have byte length of ${field.length}`
          );
        }

        this.raw[i] = v;
      }

      Object.defineProperty(this, field.name, {
        enumerable: true,
        configurable: true,
        get: getter,
        set: setter
      });

      if (field.default) {
        this[field.name] = field.default;
      }

      // attach alias
      if (field.alias) {
        Object.defineProperty(this, field.alias, {
          enumerable: false,
          configurable: true,
          set: setter,
          get: getter
        });
      }
    });
    // if the constuctor is passed data
    if (data) {
      if (typeof data === "string") {
        data = Buffer.from(stripHexPrefix(data), "hex");
      }

      if (Buffer.isBuffer(data)) {
        data = rlp.decode(data);
      }

      if (Array.isArray(data)) {
        if (data.length > this._fields.length) {
          throw new Error("wrong number of fields in data");
        }

        // make sure all the items are buffers
        data.forEach((d, i) => {
          this[this._fields[i]] = toBuffer(d);
        });
      } else if (typeof data === "object") {
        const keys = Object.keys(data);
        fields.forEach(field => {
          if (keys.indexOf(field.name) !== -1)
            this[field.name] = data[field.name];
          if (keys.indexOf(field.alias) !== -1)
            this[field.alias] = data[field.alias];
        });
      } else {
        throw new Error("invalid data");
      }
    }
  }

  hash(option) {
    let items;
    const onEIP155BlockOrLater = true; //this._common.gteHardfork('spuriousDragon')

    //bypass EIP155 here
    /*
    const v = ethUtil.bufferToInt(this.v);
    const vAndChainIdMeetEIP155Conditions =
      v === this._chainId * 2 + 35 || v === this._chainId * 2 + 36;
    if (vAndChainIdMeetEIP155Conditions && onEIP155BlockOrLater) {
      const raw = this.raw.slice();
      this.v = this._chainId;
      this.r = 0;
      this.s = 0;
      items = this.raw;
      this.raw = raw;
    } else */ {
      items = this.raw.slice(0, 6);
      //debug("raw:" + Buffer.from(this.raw).toString("hex"));
    }

    // create hash
    return ethUtil.rlphash(items);
  }

  /*
export const ecsign = function(
  msgHash: Buffer,
  privateKey: Buffer,
  chainId?: number,
): ECDSASignature {
  const sig = secp256k1.sign(msgHash, privateKey)
  const recovery: number = sig.recovery

  const ret = {
    r: sig.signature.slice(0, 32),
    s: sig.signature.slice(32, 64),
    v: chainId ? recovery + (chainId * 2 + 35) : recovery + 27,
  }

  return ret
}
  */
  constructor(data) {
    data = data || {};
  }
}
/*
export const defineProperties = function(self: any, fields: any, data: any) {
    self.raw = []
    self._fields = []
  
    // attach the `toJSON`
    self.toJSON = function(label: boolean = false) {
      if (label) {
        type Dict = { [key: string]: string }
        const obj: Dict = {}
        self._fields.forEach((field: string) => {
          obj[field] = `0x${self[field].toString('hex')}`
        })
        return obj
      }
      return baToJSON(self.raw)
    }
  
    self.serialize = function serialize() {
      return rlp.encode(self.raw)
    }
  
    fields.forEach((field: any, i: number) => {
      self._fields.push(field.name)
      function getter() {
        return self.raw[i]
      }
      function setter(v: any) {
        v = toBuffer(v)
  
        if (v.toString('hex') === '00' && !field.allowZero) {
          v = Buffer.allocUnsafe(0)
        }
  
        if (field.allowLess && field.length) {
          v = stripZeros(v)
          assert(
            field.length >= v.length,
            `The field ${field.name} must not have more ${field.length} bytes`,
          )
        } else if (!(field.allowZero && v.length === 0) && field.length) {
          assert(
            field.length === v.length,
            `The field ${field.name} must have byte length of ${field.length}`,
          )
        }
  
        self.raw[i] = v
      }
  
      Object.defineProperty(self, field.name, {
        enumerable: true,
        configurable: true,
        get: getter,
        set: setter,
      })
  
      if (field.default) {
        self[field.name] = field.default
      }
  
      // attach alias
      if (field.alias) {
        Object.defineProperty(self, field.alias, {
          enumerable: false,
          configurable: true,
          set: setter,
          get: getter,
        })
      }
    })
  
    // if the constuctor is passed data
    if (data) {
      if (typeof data === 'string') {
        data = Buffer.from(ethjsUtil.stripHexPrefix(data), 'hex')
      }
  
      if (Buffer.isBuffer(data)) {
        data = rlp.decode(data)
      }
  
      if (Array.isArray(data)) {
        if (data.length > self._fields.length) {
          throw new Error('wrong number of fields in data')
        }
  
        // make sure all the items are buffers
        data.forEach((d, i) => {
          self[self._fields[i]] = toBuffer(d)
        })
      } else if (typeof data === 'object') {
        const keys = Object.keys(data)
        fields.forEach((field: any) => {
          if (keys.indexOf(field.name) !== -1) self[field.name] = data[field.name]
          if (keys.indexOf(field.alias) !== -1) self[field.alias] = data[field.alias]
        })
      } else {
        throw new Error('invalid data')
      }
    }
  }

  */

module.exports = EthSimpleTxn;
