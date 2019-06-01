const rlp = require("rlp");
const BN = require("bn.js");
const assert = require("assert");

var secp256k1 = require("secp256k1");
const {
  stripHexPrefix,
  stripZeros,
  toBuffer,
  padToEven,
  keccak256,
  bufferToInt
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

  initialize(data, url) {
    this.web3 = require("./web3")(url);
    this._fields = [];
    this.raw = [];
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

    // calculate chainId from signature
    let sigV = bufferToInt(this.v);
    let chainId = Math.floor((sigV - 35) / 2);
    if (chainId < 0) chainId = 0;
    this._chainId = chainId;
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
      //console.log(this.raw);
      items = this.raw.slice(0, 6);
      //debug("raw:" + Buffer.from(this.raw).toString("hex"));
    }

    // create hash
    return keccak256(rlp.encode(items));
  }

  sign(privateKey, chainId) {
    const msgHash = this.hash(false);
    const sig = secp256k1.sign(msgHash, privateKey);
    const recovery = sig.recovery;

    //console.log("recovery:" + recovery);
    const sigRet = {
      r: sig.signature.slice(0, 32),
      s: sig.signature.slice(32, 64),
      v: chainId ? recovery + (chainId * 2 + 35) : recovery + 27
    };

    if (this._chainId > 0) {
      sigRet.v += this._chainId * 2 + 8;
    }
    sigRet.v = Buffer.from(sigRet.v.toString(16), "hex");

    Object.assign(this, sigRet);
    //console.log("v:" + this.v + ",type:" + typeof this.v);

    this.from = this.getSenderAddress(privateKey);
  }

  async sendTransaction() {
    const serializedTxn = rlp.encode(this.raw);
    const receipt = await this.web3.eth.sendSignedTransaction(
      "0x" + serializedTxn.toString("hex")
    );
    return receipt;
  }

  getSenderAddress(privateKey) {
    let pubKey = this.getSenderPublicKey(privateKey);
    pubKey = toBuffer(pubKey);
    assert(pubKey.length === 64);
    // Only take the lower 160bits of the hash
    return keccak256(pubKey).slice(-20);
  }

  getSenderPublicKey(privateKey) {
    privateKey = toBuffer(privateKey);
    // skip the type flag and use the X, Y points
    return secp256k1.publicKeyCreate(privateKey, false).slice(1);
  }

  verifySignature() {
    const msgHash = this.hash(false);

    try {
      const v = bufferToInt(this.v);
      const useChainIdWhileRecoveringPubKey =
        v >= this._chainId * 2 + 35 &&
        this._common.gteHardfork("spuriousDragon");
      this._senderPubKey = ethUtil.ecrecover(
        msgHash,
        v,
        this.r,
        this.s,
        useChainIdWhileRecoveringPubKey && this._chainId
      );
    } catch (e) {
      return false;
    }

    return !!this._senderPubKey;
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

module.exports = EthSimpleTxn;
