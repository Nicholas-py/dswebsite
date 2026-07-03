"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var TextDecoder_exports = {};
__export(TextDecoder_exports, {
  StringToUtf32: () => StringToUtf32,
  Utf8ToUtf32: () => Utf8ToUtf32,
  stringFromCodePoint: () => stringFromCodePoint,
  utf32ToString: () => utf32ToString
});
module.exports = __toCommonJS(TextDecoder_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function stringFromCodePoint(codePoint) {
  if (codePoint > 65535) {
    codePoint -= 65536;
    return String.fromCharCode((codePoint >> 10) + 55296) + String.fromCharCode(codePoint % 1024 + 56320);
  }
  return String.fromCharCode(codePoint);
}
function utf32ToString(data, start = 0, end = data.length) {
  let result = "";
  for (let i = start; i < end; ++i) {
    let codepoint = data[i];
    if (codepoint > 65535) {
      codepoint -= 65536;
      result += String.fromCharCode((codepoint >> 10) + 55296) + String.fromCharCode(codepoint % 1024 + 56320);
    } else {
      result += String.fromCharCode(codepoint);
    }
  }
  return result;
}
class StringToUtf32 {
  constructor() {
    this._interim = 0;
  }
  /**
   * Clears interim and resets decoder to clean state.
   */
  clear() {
    this._interim = 0;
  }
  /**
   * Decode JS string to UTF32 codepoints.
   * The methods assumes stream input and will store partly transmitted
   * surrogate pairs and decode them with the next data chunk.
   * Note: The method does no bound checks for target, therefore make sure
   * the provided input data does not exceed the size of `target`.
   * Returns the number of written codepoints in `target`.
   */
  decode(input, target) {
    const length = input.length;
    if (!length) {
      return 0;
    }
    let size = 0;
    let startPos = 0;
    if (this._interim) {
      const second = input.charCodeAt(startPos++);
      if (56320 <= second && second <= 57343) {
        target[size++] = (this._interim - 55296) * 1024 + second - 56320 + 65536;
      } else {
        target[size++] = this._interim;
        target[size++] = second;
      }
      this._interim = 0;
    }
    for (let i = startPos; i < length; ++i) {
      const code = input.charCodeAt(i);
      if (55296 <= code && code <= 56319) {
        if (++i >= length) {
          this._interim = code;
          return size;
        }
        const second = input.charCodeAt(i);
        if (56320 <= second && second <= 57343) {
          target[size++] = (code - 55296) * 1024 + second - 56320 + 65536;
        } else {
          target[size++] = code;
          target[size++] = second;
        }
        continue;
      }
      if (code === 65279) {
        continue;
      }
      target[size++] = code;
    }
    return size;
  }
}
class Utf8ToUtf32 {
  constructor() {
    this.interim = new Uint8Array(3);
  }
  /**
   * Clears interim bytes and resets decoder to clean state.
   */
  clear() {
    this.interim.fill(0);
  }
  /**
   * Decodes UTF8 byte sequences in `input` to UTF32 codepoints in `target`.
   * The methods assumes stream input and will store partly transmitted bytes
   * and decode them with the next data chunk.
   * Note: The method does no bound checks for target, therefore make sure
   * the provided data chunk does not exceed the size of `target`.
   * Returns the number of written codepoints in `target`.
   */
  decode(input, target) {
    const length = input.length;
    if (!length) {
      return 0;
    }
    let size = 0;
    let byte1;
    let byte2;
    let byte3;
    let byte4;
    let codepoint = 0;
    let startPos = 0;
    if (this.interim[0]) {
      let discardInterim = false;
      let cp = this.interim[0];
      cp &= (cp & 224) === 192 ? 31 : (cp & 240) === 224 ? 15 : 7;
      let pos = 0;
      let tmp;
      while ((tmp = this.interim[++pos] & 63) && pos < 4) {
        cp <<= 6;
        cp |= tmp;
      }
      const type = (this.interim[0] & 224) === 192 ? 2 : (this.interim[0] & 240) === 224 ? 3 : 4;
      const missing = type - pos;
      while (startPos < missing) {
        if (startPos >= length) {
          return 0;
        }
        tmp = input[startPos++];
        if ((tmp & 192) !== 128) {
          startPos--;
          discardInterim = true;
          break;
        } else {
          this.interim[pos++] = tmp;
          cp <<= 6;
          cp |= tmp & 63;
        }
      }
      if (!discardInterim) {
        if (type === 2) {
          if (cp < 128) {
            startPos--;
          } else {
            target[size++] = cp;
          }
        } else if (type === 3) {
          if (cp < 2048 || cp >= 55296 && cp <= 57343 || cp === 65279) {
          } else {
            target[size++] = cp;
          }
        } else {
          if (cp < 65536 || cp > 1114111) {
          } else {
            target[size++] = cp;
          }
        }
      }
      this.interim.fill(0);
    }
    const fourStop = length - 4;
    let i = startPos;
    while (i < length) {
      while (i < fourStop && !((byte1 = input[i]) & 128) && !((byte2 = input[i + 1]) & 128) && !((byte3 = input[i + 2]) & 128) && !((byte4 = input[i + 3]) & 128)) {
        target[size++] = byte1;
        target[size++] = byte2;
        target[size++] = byte3;
        target[size++] = byte4;
        i += 4;
      }
      byte1 = input[i++];
      if (byte1 < 128) {
        target[size++] = byte1;
      } else if ((byte1 & 224) === 192) {
        if (i >= length) {
          this.interim[0] = byte1;
          return size;
        }
        byte2 = input[i++];
        if ((byte2 & 192) !== 128) {
          i--;
          continue;
        }
        codepoint = (byte1 & 31) << 6 | byte2 & 63;
        if (codepoint < 128) {
          i--;
          continue;
        }
        target[size++] = codepoint;
      } else if ((byte1 & 240) === 224) {
        if (i >= length) {
          this.interim[0] = byte1;
          return size;
        }
        byte2 = input[i++];
        if ((byte2 & 192) !== 128) {
          i--;
          continue;
        }
        if (i >= length) {
          this.interim[0] = byte1;
          this.interim[1] = byte2;
          return size;
        }
        byte3 = input[i++];
        if ((byte3 & 192) !== 128) {
          i--;
          continue;
        }
        codepoint = (byte1 & 15) << 12 | (byte2 & 63) << 6 | byte3 & 63;
        if (codepoint < 2048 || codepoint >= 55296 && codepoint <= 57343 || codepoint === 65279) {
          continue;
        }
        target[size++] = codepoint;
      } else if ((byte1 & 248) === 240) {
        if (i >= length) {
          this.interim[0] = byte1;
          return size;
        }
        byte2 = input[i++];
        if ((byte2 & 192) !== 128) {
          i--;
          continue;
        }
        if (i >= length) {
          this.interim[0] = byte1;
          this.interim[1] = byte2;
          return size;
        }
        byte3 = input[i++];
        if ((byte3 & 192) !== 128) {
          i--;
          continue;
        }
        if (i >= length) {
          this.interim[0] = byte1;
          this.interim[1] = byte2;
          this.interim[2] = byte3;
          return size;
        }
        byte4 = input[i++];
        if ((byte4 & 192) !== 128) {
          i--;
          continue;
        }
        codepoint = (byte1 & 7) << 18 | (byte2 & 63) << 12 | (byte3 & 63) << 6 | byte4 & 63;
        if (codepoint < 65536 || codepoint > 1114111) {
          continue;
        }
        target[size++] = codepoint;
      } else {
      }
    }
    return size;
  }
}
//# sourceMappingURL=TextDecoder.js.map
