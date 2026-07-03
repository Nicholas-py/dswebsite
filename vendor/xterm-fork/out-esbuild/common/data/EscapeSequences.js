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
var EscapeSequences_exports = {};
__export(EscapeSequences_exports, {
  C0: () => C0,
  C1: () => C1,
  C1_ESCAPED: () => C1_ESCAPED
});
module.exports = __toCommonJS(EscapeSequences_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var C0;
((C02) => {
  C02.NUL = "\0";
  C02.SOH = "";
  C02.STX = "";
  C02.ETX = "";
  C02.EOT = "";
  C02.ENQ = "";
  C02.ACK = "";
  C02.BEL = "\x07";
  C02.BS = "\b";
  C02.HT = "	";
  C02.LF = "\n";
  C02.VT = "\v";
  C02.FF = "\f";
  C02.CR = "\r";
  C02.SO = "";
  C02.SI = "";
  C02.DLE = "";
  C02.DC1 = "";
  C02.DC2 = "";
  C02.DC3 = "";
  C02.DC4 = "";
  C02.NAK = "";
  C02.SYN = "";
  C02.ETB = "";
  C02.CAN = "";
  C02.EM = "";
  C02.SUB = "";
  C02.ESC = "\x1B";
  C02.FS = "";
  C02.GS = "";
  C02.RS = "";
  C02.US = "";
  C02.SP = " ";
  C02.DEL = "\x7F";
})(C0 || (C0 = {}));
var C1;
((C12) => {
  C12.PAD = "\x80";
  C12.HOP = "\x81";
  C12.BPH = "\x82";
  C12.NBH = "\x83";
  C12.IND = "\x84";
  C12.NEL = "\x85";
  C12.SSA = "\x86";
  C12.ESA = "\x87";
  C12.HTS = "\x88";
  C12.HTJ = "\x89";
  C12.VTS = "\x8A";
  C12.PLD = "\x8B";
  C12.PLU = "\x8C";
  C12.RI = "\x8D";
  C12.SS2 = "\x8E";
  C12.SS3 = "\x8F";
  C12.DCS = "\x90";
  C12.PU1 = "\x91";
  C12.PU2 = "\x92";
  C12.STS = "\x93";
  C12.CCH = "\x94";
  C12.MW = "\x95";
  C12.SPA = "\x96";
  C12.EPA = "\x97";
  C12.SOS = "\x98";
  C12.SGCI = "\x99";
  C12.SCI = "\x9A";
  C12.CSI = "\x9B";
  C12.ST = "\x9C";
  C12.OSC = "\x9D";
  C12.PM = "\x9E";
  C12.APC = "\x9F";
})(C1 || (C1 = {}));
var C1_ESCAPED;
((C1_ESCAPED2) => {
  C1_ESCAPED2.ST = `${C0.ESC}\\`;
})(C1_ESCAPED || (C1_ESCAPED = {}));
//# sourceMappingURL=EscapeSequences.js.map
