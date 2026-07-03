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
var platform_exports = {};
__export(platform_exports, {
  LANGUAGE_DEFAULT: () => LANGUAGE_DEFAULT,
  Language: () => Language,
  OS: () => OS,
  OperatingSystem: () => OperatingSystem,
  Platform: () => Platform,
  PlatformToString: () => PlatformToString,
  isAndroid: () => isAndroid,
  isBigSurOrNewer: () => isBigSurOrNewer,
  isCI: () => isCI,
  isChrome: () => isChrome,
  isEdge: () => isEdge,
  isElectron: () => isElectron,
  isFirefox: () => isFirefox,
  isIOS: () => isIOS,
  isLinux: () => isLinux,
  isLinuxSnap: () => isLinuxSnap,
  isLittleEndian: () => isLittleEndian,
  isMacintosh: () => isMacintosh,
  isMobile: () => isMobile,
  isNative: () => isNative,
  isSafari: () => isSafari,
  isWeb: () => isWeb,
  isWebWorker: () => isWebWorker,
  isWindows: () => isWindows,
  language: () => language,
  locale: () => locale,
  platform: () => platform,
  platformLocale: () => platformLocale,
  setTimeout0: () => setTimeout0,
  setTimeout0IsFaster: () => setTimeout0IsFaster,
  translationsConfigFile: () => translationsConfigFile,
  userAgent: () => userAgent,
  webWorkerOrigin: () => webWorkerOrigin
});
module.exports = __toCommonJS(platform_exports);
const LANGUAGE_DEFAULT = "en";
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isElectron = false;
let _isIOS = false;
let _isCI = false;
let _isMobile = false;
let _locale = void 0;
let _language = LANGUAGE_DEFAULT;
let _platformLocale = LANGUAGE_DEFAULT;
let _translationsConfigFile = void 0;
let _userAgent = void 0;
const $globalThis = globalThis;
let nodeProcess = void 0;
if (typeof $globalThis.vscode !== "undefined" && typeof $globalThis.vscode.process !== "undefined") {
  nodeProcess = $globalThis.vscode.process;
} else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
  nodeProcess = process;
}
const isElectronProcess = typeof nodeProcess?.versions?.electron === "string";
const isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";
if (typeof nodeProcess === "object") {
  _isWindows = nodeProcess.platform === "win32";
  _isMacintosh = nodeProcess.platform === "darwin";
  _isLinux = nodeProcess.platform === "linux";
  _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
  _isElectron = isElectronProcess;
  _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"];
  _locale = LANGUAGE_DEFAULT;
  _language = LANGUAGE_DEFAULT;
  const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
  if (rawNlsConfig) {
    try {
      const nlsConfig = JSON.parse(rawNlsConfig);
      _locale = nlsConfig.userLocale;
      _platformLocale = nlsConfig.osLocale;
      _language = nlsConfig.resolvedLanguage || LANGUAGE_DEFAULT;
      _translationsConfigFile = nlsConfig.languagePack?.translationsConfigFile;
    } catch (e) {
    }
  }
  _isNative = true;
} else if (typeof navigator === "object" && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf("Windows") >= 0;
  _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
  _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf("Linux") >= 0;
  _isMobile = _userAgent?.indexOf("Mobi") >= 0;
  _isWeb = true;
  _language = globalThis._VSCODE_NLS_LANGUAGE || LANGUAGE_DEFAULT;
  _locale = navigator.language.toLowerCase();
  _platformLocale = _locale;
} else {
  console.error("Unable to resolve platform.");
}
var Platform = /* @__PURE__ */ ((Platform2) => {
  Platform2[Platform2["Web"] = 0] = "Web";
  Platform2[Platform2["Mac"] = 1] = "Mac";
  Platform2[Platform2["Linux"] = 2] = "Linux";
  Platform2[Platform2["Windows"] = 3] = "Windows";
  return Platform2;
})(Platform || {});
function PlatformToString(platform2) {
  switch (platform2) {
    case 0 /* Web */:
      return "Web";
    case 1 /* Mac */:
      return "Mac";
    case 2 /* Linux */:
      return "Linux";
    case 3 /* Windows */:
      return "Windows";
  }
}
let _platform = 0 /* Web */;
if (_isMacintosh) {
  _platform = 1 /* Mac */;
} else if (_isWindows) {
  _platform = 3 /* Windows */;
} else if (_isLinux) {
  _platform = 2 /* Linux */;
}
const isWindows = _isWindows;
const isMacintosh = _isMacintosh;
const isLinux = _isLinux;
const isLinuxSnap = _isLinuxSnap;
const isNative = _isNative;
const isElectron = _isElectron;
const isWeb = _isWeb;
const isWebWorker = _isWeb && typeof $globalThis.importScripts === "function";
const webWorkerOrigin = isWebWorker ? $globalThis.origin : void 0;
const isIOS = _isIOS;
const isMobile = _isMobile;
const isCI = _isCI;
const platform = _platform;
const userAgent = _userAgent;
const language = _language;
var Language;
((Language2) => {
  function value() {
    return language;
  }
  Language2.value = value;
  function isDefaultVariant() {
    if (language.length === 2) {
      return language === "en";
    } else if (language.length >= 3) {
      return language[0] === "e" && language[1] === "n" && language[2] === "-";
    } else {
      return false;
    }
  }
  Language2.isDefaultVariant = isDefaultVariant;
  function isDefault() {
    return language === "en";
  }
  Language2.isDefault = isDefault;
})(Language || (Language = {}));
const locale = _locale;
const platformLocale = _platformLocale;
const translationsConfigFile = _translationsConfigFile;
const setTimeout0IsFaster = typeof $globalThis.postMessage === "function" && !$globalThis.importScripts;
const setTimeout0 = (() => {
  if (setTimeout0IsFaster) {
    const pending = [];
    $globalThis.addEventListener("message", (e) => {
      if (e.data && e.data.vscodeScheduleAsyncWork) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];
          if (candidate.id === e.data.vscodeScheduleAsyncWork) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return (callback) => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback
      });
      $globalThis.postMessage({ vscodeScheduleAsyncWork: myId }, "*");
    };
  }
  return (callback) => setTimeout(callback);
})();
var OperatingSystem = /* @__PURE__ */ ((OperatingSystem2) => {
  OperatingSystem2[OperatingSystem2["Windows"] = 1] = "Windows";
  OperatingSystem2[OperatingSystem2["Macintosh"] = 2] = "Macintosh";
  OperatingSystem2[OperatingSystem2["Linux"] = 3] = "Linux";
  return OperatingSystem2;
})(OperatingSystem || {});
const OS = _isMacintosh || _isIOS ? 2 /* Macintosh */ : _isWindows ? 1 /* Windows */ : 3 /* Linux */;
let _isLittleEndian = true;
let _isLittleEndianComputed = false;
function isLittleEndian() {
  if (!_isLittleEndianComputed) {
    _isLittleEndianComputed = true;
    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);
    _isLittleEndian = view[0] === (2 << 8) + 1;
  }
  return _isLittleEndian;
}
const isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);
const isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);
const isSafari = !!(!isChrome && (userAgent && userAgent.indexOf("Safari") >= 0));
const isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);
const isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);
function isBigSurOrNewer(osVersion) {
  return parseFloat(osVersion) >= 20;
}
//# sourceMappingURL=platform.js.map
