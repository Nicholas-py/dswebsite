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
var LinkProviderService_exports = {};
__export(LinkProviderService_exports, {
  LinkProviderService: () => LinkProviderService
});
module.exports = __toCommonJS(LinkProviderService_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
class LinkProviderService extends import_lifecycle.Disposable {
  constructor() {
    super();
    this.linkProviders = [];
    this._register((0, import_lifecycle.toDisposable)(() => this.linkProviders.length = 0));
  }
  registerLinkProvider(linkProvider) {
    this.linkProviders.push(linkProvider);
    return {
      dispose: () => {
        const providerIndex = this.linkProviders.indexOf(linkProvider);
        if (providerIndex !== -1) {
          this.linkProviders.splice(providerIndex, 1);
        }
      }
    };
  }
}
//# sourceMappingURL=LinkProviderService.js.map
