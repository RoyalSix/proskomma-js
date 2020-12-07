const {utf8ByteArrayToString, stringToUtf8ByteArray} = require('utf8-string-bytes');
const base64 = require("base64-js");

class ByteArray {

    constructor(initialArraySize, initialLength) {
        initialArraySize = initialArraySize || 64;
        initialLength = initialLength || 0;
        this.growMax = 1024 * 16;
        this.length = initialLength;
        this.byteArray = new Uint8Array(initialArraySize);
    }

    byte(n) {
        if (n > this.length - 1) {
            throw Error(`Attempt to read byte ${n} of ByteArray of length ${this.length}`);
        }
        return this.byteArray[n];
    }

    bytes(n, l) {
        if ((n + l) > this.length) {
            throw Error(`Attempt to read ${l} bytes from start ${n} of ByteArray of length ${this.length}`);
        }
        return this.byteArray.subarray(n, n + l);
    }

    setByte(n, v) {
        if (n > this.length - 1) {
            throw Error(`Attempt to set byte ${n} of ByteArray of length ${this.length}`);
        }
        if (typeof (v) !== "number" || v < 0 || v > 255) {
            throw Error(`Expected value 0-255 when setting ByteArray, found ${v}`);
        }
        this.byteArray[n] = v;
    }

    setBytes(n, v) {
        if ((n + v.length) > this.length) {
            throw Error(`Attempt to set ${v.length} bytes from start ${n} of ByteArray of length ${this.length}`);
        }
        this.byteArray.set(v, n);
    }

    pushByte(v) {
        if (typeof (v) !== "number" || v < 0 || v > 255) {
            throw Error(`Expected value 0-255 when pushing to ByteArray, found ${v}`);
        }
        if (this.length === this.byteArray.length) {
            this.grow();
        }
        this.byteArray[this.length] = v;
        this.length++;
    }

    grow() {
        const newBytes = new Uint8Array(
            this.byteArray.length + (
                Math.min(
                    this.growMax,
                    Math.max(
                        16,
                        this.byteArray.length
                    )
                )
            )
        );
        newBytes.set(this.byteArray);
        this.byteArray = newBytes;
    }

    trim() {
        const newBytes = new Uint8Array(this.length);
        newBytes.set(this.byteArray.subarray(0, this.length));
        this.byteArray = newBytes;
    }

    pushBytes(v) {
        for (const ve of v) {
            this.pushByte(ve);
        }
    }

    pushNByte(v) {
        // Low byte(s) first
        if (typeof (v) !== "number" || v < 0) {
            throw Error(`Expected positive number in pushNByte, found ${v}`);
        }
        if (v < 128) {
            this.pushByte(v + 128);
        } else {
            const modulo = v % 128;
            this.pushByte(modulo);
            this.pushNByte(v >> 7);
        }
    }

    nByte(n) {
        if (n > this.length - 1) {
            throw Error(`Attempt to read nByte ${n} of ByteArray of length ${this.length}`);
        }
        const v = this.byteArray[n];
        if (v > 127) {
            return v - 128;
        } else {
            return v + (128 * this.nByte(n + 1));
        }
    }

    nByteLength(v) {
        if (v >= 128 ** 4) {
            throw new Error("> 4 bytes found in nByteLength");
        }
        let ret = 1;
        while (v > 127) {
            v = v >> 7;
            ret += 1;
        }
        return ret;
    }

    pushCountedString(s) {
        const sA = stringToUtf8ByteArray(s);
        this.pushByte(sA.length);
        this.pushBytes(sA);
    }

    countedString(n) {
        const sLength = this.byte(n);
        return utf8ByteArrayToString(this.bytes(n + 1, sLength));
    }

    clear() {
        this.byteArray.fill(0);
        this.length = 0;
    }

    base64() {
        return base64.fromByteArray(this.byteArray);
    }

    fromBase64(s) {
        this.byteArray = base64.toByteArray(s);
        this.length = this.byteArray.length;
    }

}

module.exports = ByteArray