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
var playwright_config_exports = {};
__export(playwright_config_exports, {
  default: () => playwright_config_default
});
module.exports = __toCommonJS(playwright_config_exports);
const config = {
  testDir: ".",
  timeout: 1e4,
  projects: [
    {
      name: "ChromeStable",
      use: {
        browserName: "chromium",
        channel: "chrome"
      }
    },
    {
      name: "FirefoxStable",
      use: {
        browserName: "firefox"
      }
    },
    {
      name: "WebKit",
      use: {
        browserName: "webkit"
      }
    }
  ],
  reporter: "list",
  webServer: {
    command: "npm run start",
    port: 3e3,
    timeout: 12e4,
    reuseExistingServer: !process.env.CI
  }
};
var playwright_config_default = config;
//# sourceMappingURL=playwright.config.js.map
