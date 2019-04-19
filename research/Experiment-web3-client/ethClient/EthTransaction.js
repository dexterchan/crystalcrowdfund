const ethUtil = require("ethereumjs-util");
const Common = require("ethereumjs-common").default;
const debug = require("debug")("app:debug");
const BN = ethUtil.BN;

// secp256k1n/2
const N_DIV_2 = new BN(
  "7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0",
  16
);

/*
 * For Object and Arrays each of the elements can either be a Buffer, a hex-prefixed (0x) String , Number, or an object with a toBuffer method such as Bignum
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

class EthTransaction {
  constructor(data, opts) {
    opts = opts || {};

    // instantiate Common class instance based on passed options
    if (opts.common) {
      if (opts.chain) {
        throw new Error(
          "Instantiation with both opts.common and opts.chain parameter not allowed!"
        );
      }
      this._common = opts.common;
    } else {
      let chain = opts.chain ? opts.chain : "mainnet";
      let hardfork = opts.hardfork ? opts.hardfork : "byzantium";
      this._common = new Common(chain, hardfork);
    }

    data = data || {};
    // Define Properties
    const fields = [
      {
        name: "nonce",
        length: 32,
        allowLess: true,
        default: new Buffer([])
      },
      {
        name: "gasPrice",
        length: 32,
        allowLess: true,
        default: new Buffer([])
      },
      {
        name: "gasLimit",
        alias: "gas",
        length: 32,
        allowLess: true,
        default: new Buffer([])
      },
      {
        name: "to",
        allowZero: true,
        length: 20,
        default: new Buffer([])
      },
      {
        name: "value",
        length: 32,
        allowLess: true,
        default: new Buffer([])
      },
      {
        name: "data",
        alias: "input",
        allowZero: true,
        default: new Buffer([])
      },
      {
        name: "v",
        allowZero: true,
        default: new Buffer([0x1c])
      },
      {
        name: "r",
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([])
      },
      {
        name: "s",
        length: 32,
        allowZero: true,
        allowLess: true,
        default: new Buffer([])
      }
    ];

    // attached serialize
    //debug("before define properties");
    //debug(this);
    ethUtil.defineProperties(this, fields, data);

    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(this, "from", {
      enumerable: true,
      configurable: true,
      get: this.getSenderAddress.bind(this)
    });
    debug("after define properties");
    debug(this);
    // calculate chainId from signature
    let sigV = ethUtil.bufferToInt(this.v);
    let chainId = Math.floor((sigV - 35) / 2);
    if (chainId < 0) chainId = 0;

    // set chainId
    if (opts.chain || opts.common) {
      this._chainId = this._common.chainId();
    } else {
      this._chainId = chainId || data.chainId || 0;
    }
  }

  hash(option) {
    let items;
    const onEIP155BlockOrLater = true; //this._common.gteHardfork('spuriousDragon')
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
    } else {
      items = this.raw.slice(0, 6);
      //debug("raw:" + Buffer.from(this.raw).toString("hex"));
    }

    // create hash
    return ethUtil.rlphash(items);
  }
  getSenderAddress() {
    if (this._from) {
      return this._from;
    }
    const pubkey = this.getSenderPublicKey();
    this._from = ethUtil.publicToAddress(pubkey);
    return this._from;
  }

  /**
   * returns the public key of the sender
   * @return {Buffer}
   */
  getSenderPublicKey() {
    if (!this._senderPubKey || !this._senderPubKey.length) {
      if (!this.verifySignature()) throw new Error("Invalid Signature");
    }
    return this._senderPubKey;
  }
  verifySignature() {
    const msgHash = this.hash(false);
    debug("verify signature msgHash:" + Buffer.from(msgHash).toString("hex"));
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    if (
      this._common.gteHardfork("homestead") &&
      new BN(this.s).cmp(N_DIV_2) === 1
    ) {
      return false;
    }
    debug({
      v: Buffer.from(this.v).toString("hex"),
      r: Buffer.from(this.r).toString("hex"),
      s: Buffer.from(this.s).toString("hex")
    });
    try {
      const v = ethUtil.bufferToInt(this.v);
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

  /**
   * sign a transaction with a given private key
   * @param {Buffer} privateKey Must be 32 bytes in length
   */
  sign(privateKey) {
    const msgHash = this.hash(false);
    debug("before sign msgHash:" + Buffer.from(msgHash).toString("hex"));
    debug("chainid:" + this._chainId);
    const sig = ethUtil.ecsign(msgHash, privateKey);
    if (this._chainId > 0) {
      sig.v += this._chainId * 2 + 8;
    }
    debug("Before signature, (v,r,s):");
    debug({
      v: Buffer.from(this.v).toString("hex"),
      r: Buffer.from(this.r).toString("hex"),
      s: Buffer.from(this.s).toString("hex")
    });
    Object.assign(this, sig);
    debug("After signature, (v,r,s):");
    debug({
      v: Buffer.from(this.v).toString("hex"),
      r: Buffer.from(this.r).toString("hex"),
      s: Buffer.from(this.s).toString("hex")
    });
  }
}

module.exports = EthTransaction;
