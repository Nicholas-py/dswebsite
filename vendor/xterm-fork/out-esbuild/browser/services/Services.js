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
var Services_exports = {};
__export(Services_exports, {
  ICharSizeService: () => ICharSizeService,
  ICharacterJoinerService: () => ICharacterJoinerService,
  ICoreBrowserService: () => ICoreBrowserService,
  ILinkProviderService: () => ILinkProviderService,
  IMouseService: () => IMouseService,
  IRenderService: () => IRenderService,
  ISelectionService: () => ISelectionService,
  IThemeService: () => IThemeService
});
module.exports = __toCommonJS(Services_exports);
var import_ServiceRegistry = require("common/services/ServiceRegistry");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const ICharSizeService = (0, import_ServiceRegistry.createDecorator)("CharSizeService");
const ICoreBrowserService = (0, import_ServiceRegistry.createDecorator)("CoreBrowserService");
const IMouseService = (0, import_ServiceRegistry.createDecorator)("MouseService");
const IRenderService = (0, import_ServiceRegistry.createDecorator)("RenderService");
const ISelectionService = (0, import_ServiceRegistry.createDecorator)("SelectionService");
const ICharacterJoinerService = (0, import_ServiceRegistry.createDecorator)("CharacterJoinerService");
const IThemeService = (0, import_ServiceRegistry.createDecorator)("ThemeService");
const ILinkProviderService = (0, import_ServiceRegistry.createDecorator)("LinkProviderService");
//# sourceMappingURL=Services.js.map
