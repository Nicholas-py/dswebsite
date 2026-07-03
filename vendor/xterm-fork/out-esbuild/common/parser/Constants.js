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
var Constants_exports = {};
__export(Constants_exports, {
  OscState: () => OscState,
  PAYLOAD_LIMIT: () => PAYLOAD_LIMIT,
  ParserAction: () => ParserAction,
  ParserState: () => ParserState
});
module.exports = __toCommonJS(Constants_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var ParserState = /* @__PURE__ */ ((ParserState2) => {
  ParserState2[ParserState2["GROUND"] = 0] = "GROUND";
  ParserState2[ParserState2["ESCAPE"] = 1] = "ESCAPE";
  ParserState2[ParserState2["ESCAPE_INTERMEDIATE"] = 2] = "ESCAPE_INTERMEDIATE";
  ParserState2[ParserState2["CSI_ENTRY"] = 3] = "CSI_ENTRY";
  ParserState2[ParserState2["CSI_PARAM"] = 4] = "CSI_PARAM";
  ParserState2[ParserState2["CSI_INTERMEDIATE"] = 5] = "CSI_INTERMEDIATE";
  ParserState2[ParserState2["CSI_IGNORE"] = 6] = "CSI_IGNORE";
  ParserState2[ParserState2["SOS_PM_APC_STRING"] = 7] = "SOS_PM_APC_STRING";
  ParserState2[ParserState2["OSC_STRING"] = 8] = "OSC_STRING";
  ParserState2[ParserState2["DCS_ENTRY"] = 9] = "DCS_ENTRY";
  ParserState2[ParserState2["DCS_PARAM"] = 10] = "DCS_PARAM";
  ParserState2[ParserState2["DCS_IGNORE"] = 11] = "DCS_IGNORE";
  ParserState2[ParserState2["DCS_INTERMEDIATE"] = 12] = "DCS_INTERMEDIATE";
  ParserState2[ParserState2["DCS_PASSTHROUGH"] = 13] = "DCS_PASSTHROUGH";
  return ParserState2;
})(ParserState || {});
var ParserAction = /* @__PURE__ */ ((ParserAction2) => {
  ParserAction2[ParserAction2["IGNORE"] = 0] = "IGNORE";
  ParserAction2[ParserAction2["ERROR"] = 1] = "ERROR";
  ParserAction2[ParserAction2["PRINT"] = 2] = "PRINT";
  ParserAction2[ParserAction2["EXECUTE"] = 3] = "EXECUTE";
  ParserAction2[ParserAction2["OSC_START"] = 4] = "OSC_START";
  ParserAction2[ParserAction2["OSC_PUT"] = 5] = "OSC_PUT";
  ParserAction2[ParserAction2["OSC_END"] = 6] = "OSC_END";
  ParserAction2[ParserAction2["CSI_DISPATCH"] = 7] = "CSI_DISPATCH";
  ParserAction2[ParserAction2["PARAM"] = 8] = "PARAM";
  ParserAction2[ParserAction2["COLLECT"] = 9] = "COLLECT";
  ParserAction2[ParserAction2["ESC_DISPATCH"] = 10] = "ESC_DISPATCH";
  ParserAction2[ParserAction2["CLEAR"] = 11] = "CLEAR";
  ParserAction2[ParserAction2["DCS_HOOK"] = 12] = "DCS_HOOK";
  ParserAction2[ParserAction2["DCS_PUT"] = 13] = "DCS_PUT";
  ParserAction2[ParserAction2["DCS_UNHOOK"] = 14] = "DCS_UNHOOK";
  return ParserAction2;
})(ParserAction || {});
var OscState = /* @__PURE__ */ ((OscState2) => {
  OscState2[OscState2["START"] = 0] = "START";
  OscState2[OscState2["ID"] = 1] = "ID";
  OscState2[OscState2["PAYLOAD"] = 2] = "PAYLOAD";
  OscState2[OscState2["ABORT"] = 3] = "ABORT";
  return OscState2;
})(OscState || {});
const PAYLOAD_LIMIT = 1e7;
//# sourceMappingURL=Constants.js.map
