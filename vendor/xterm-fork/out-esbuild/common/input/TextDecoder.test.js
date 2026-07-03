"use strict";
var import_chai = require("chai");
var import_TextDecoder = require("common/input/TextDecoder");
var import_utf8 = require("utf8");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function toString(data, length) {
  if (String.fromCodePoint) {
    return String.fromCodePoint.apply(null, data.subarray(0, length));
  }
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
  }
  return result;
}
function fromByteString(s) {
  const result = new Uint8Array(s.length);
  for (let i = 0; i < s.length; ++i) {
    result[i] = s.charCodeAt(i);
  }
  return result;
}
const BATCH_SIZE = 2048;
const TEST_STRINGS = [
  "\u041B\u043E\u0440\u0435\u043C \u0438\u043F\u0441\u0443\u043C \u0434\u043E\u043B\u043E\u0440 \u0441\u0438\u0442 \u0430\u043C\u0435\u0442, \u0435\u0445 \u0441\u0435\u0430 \u0430\u0446\u0446\u0443\u0441\u0430\u043C \u0434\u0438\u0441\u0441\u0435\u043D\u0442\u0438\u0435\u0442. \u0410\u043D \u0435\u043E\u0441 \u0441\u0442\u0435\u0442 \u0435\u0438\u0440\u043C\u043E\u0434 \u0432\u0438\u0442\u0443\u043F\u0435\u0440\u0430\u0442\u0430. \u0418\u0443\u0441 \u0434\u0438\u0446\u0435\u0440\u0435\u0442 \u0443\u0440\u0431\u0430\u043D\u0438\u0442\u0430\u0441 \u0435\u0442. \u0410\u043D \u043F\u0440\u0438 \u0430\u043B\u0442\u0435\u0440\u0430 \u0434\u043E\u043B\u043E\u0440\u0435\u0441 \u0441\u043F\u043B\u0435\u043D\u0434\u0438\u0434\u0435, \u0446\u0443 \u044F\u0443\u043E \u0438\u043D\u0442\u0435\u0433\u0440\u0435 \u0434\u0435\u043D\u0438\u044F\u0443\u0435, \u0438\u0433\u043D\u043E\u0442\u0430 \u0432\u043E\u043B\u0443\u043F\u0442\u0430\u0440\u0438\u0430 \u0438\u043D\u0441\u0442\u0440\u0443\u0446\u0442\u0438\u043E\u0440 \u0446\u0443 \u0432\u0438\u043C.",
  "\u10DA\u10DD\u10E0\u10D4\u10DB \u10D8\u10E4\u10E1\u10E3\u10DB \u10D3\u10DD\u10DA\u10DD\u10E0 \u10E1\u10D8\u10D7 \u10D0\u10DB\u10D4\u10D7, \u10E4\u10D0\u10EA\u10D4\u10E0 \u10DB\u10E3\u10EA\u10D8\u10E3\u10E1 \u10EA\u10DD\u10DC\u10E1\u10D4\u10D7\u10D4\u10D7\u10E3\u10E0 \u10E7\u10E3\u10DD \u10D8\u10D3, \u10E4\u10D4\u10E0 \u10D5\u10D8\u10D5\u10D4\u10DC\u10D3\u10E3\u10DB \u10E7\u10E3\u10D0\u10D4\u10E0\u10D4\u10DC\u10D3\u10E3\u10DB \u10D4\u10D0, \u10D4\u10E1\u10D7 \u10D0\u10DB\u10D4\u10D7 \u10DB\u10DD\u10D5\u10D4\u10D7 \u10E1\u10E3\u10D0\u10D5\u10D8\u10D7\u10D0\u10D7\u10D4 \u10EA\u10E3. \u10D5\u10D8\u10D7\u10D0\u10D4 \u10E1\u10D4\u10DC\u10E1\u10D8\u10D1\u10E3\u10E1 \u10D0\u10DC \u10D5\u10D8\u10EE. \u10D4\u10EE\u10D4\u10E0\u10EA\u10D8 \u10D3\u10D4\u10D7\u10D4\u10E0\u10E0\u10E3\u10D8\u10E1\u10E1\u10D4\u10D7 \u10E3\u10D7 \u10E7\u10E3\u10D8. \u10D5\u10DD\u10EA\u10D4\u10DC\u10D7 \u10D3\u10D4\u10D1\u10D8\u10D7\u10D8\u10E1 \u10D0\u10D3\u10D8\u10E4\u10D8\u10E1\u10EA\u10D8 \u10D4\u10D7 \u10E4\u10D4\u10E0. \u10DC\u10D4\u10EA \u10D0\u10DC \u10E4\u10D4\u10E3\u10D2\u10D0\u10D8\u10D7 \u10E4\u10DD\u10E0\u10D4\u10DC\u10E1\u10D8\u10D1\u10E3\u10E1 \u10D8\u10DC\u10D7\u10D4\u10E0\u10D4\u10E1\u10E1\u10D4\u10D7. \u10D8\u10D3 \u10D3\u10D8\u10EA\u10DD \u10E0\u10D8\u10D3\u10D4\u10DC\u10E1 \u10D8\u10E3\u10E1. \u10D3\u10D8\u10E1\u10E1\u10D4\u10DC\u10D7\u10D8\u10D4\u10D7 \u10EA\u10DD\u10DC\u10E1\u10D4\u10E7\u10E3\u10E3\u10DC\u10D7\u10E3\u10E0 \u10E1\u10D4\u10D3 \u10DC\u10D4, \u10DC\u10DD\u10D5\u10E3\u10DB \u10DB\u10E3\u10DC\u10D4\u10E0\u10D4 \u10D4\u10E3\u10DB \u10D0\u10D7, \u10DC\u10D4 \u10D4\u10E3\u10DB \u10DC\u10D8\u10F0\u10D8\u10DA \u10D8\u10E0\u10D0\u10EA\u10E3\u10DC\u10D3\u10D8\u10D0 \u10E3\u10E0\u10D1\u10D0\u10DC\u10D8\u10D7\u10D0\u10E1.",
  "\u0905\u0927\u093F\u0915\u093E\u0902\u0936 \u0905\u092E\u093F\u0924\u0915\u0941\u092E\u093E\u0930 \u092A\u094D\u0930\u094B\u0924\u094D\u0938\u093E\u0939\u093F\u0924 \u092E\u0941\u0916\u094D\u092F \u091C\u093E\u0928\u0947 \u092A\u094D\u0930\u0938\u093E\u0930\u0928 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u0935\u093F\u0936\u094D\u0935 \u0926\u093E\u0930\u0940 \u0905\u0928\u0941\u0935\u093E\u0926\u0915 \u0905\u0927\u093F\u0915\u093E\u0902\u0936 \u0928\u0935\u0902\u092C\u0930 \u0935\u093F\u0937\u092F \u0917\u091F\u0915\u0909\u0938\u093F \u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0935\u093F\u0915\u093E\u0938 \u091C\u0928\u093F\u0924 \u092A\u0930\u0938\u094D\u092A\u0930 \u0917\u091F\u0915\u0909\u0938\u093F \u0905\u0928\u094D\u0924\u0930\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u0940\u092F\u0915\u0930\u0928 \u0939\u094B\u0938\u0915\u0947 \u092E\u093E\u0928\u0935 \u092A\u0941\u0930\u094D\u0923\u0924\u093E \u0915\u092E\u094D\u092A\u094D\u092F\u0941\u091F\u0930 \u092F\u0928\u094D\u0924\u094D\u0930\u093E\u0932\u092F \u092A\u094D\u0930\u0924\u093F \u0938\u093E\u0927\u0928",
  "\u89A7\u516D\u5B50\u5F53\u805E\u793E\u8A08\u6587\u8B77\u884C\u60C5\u6295\u8EAB\u6597\u6765\u3002\u5897\u843D\u4E16\u7684\u6CC1\u4E0A\u5E2D\u5099\u754C\u5148\u95A2\u6A29\u80FD\u4E07\u3002\u672C\u7269\u6319\u6B6F\u4E73\u5168\u4E8B\u643A\u4F9B\u677F\u6803\u679C\u4EE5\u3002\u982D\u6708\u60A3\u7AEF\u64A4\u7AF6\u898B\u754C\u8A18\u5F15\u53BB\u6CD5\u6761\u516C\u6CCA\u5019\u3002\u6C7A\u6D77\u5099\u99C6\u53D6\u54C1\u76EE\u82B8\u65B9\u7528\u671D\u793A\u4E0A\u7528\u5831\u3002\u8B1B\u7533\u52D9\u7D19\u7D04\u9031\u5802\u51FA\u5FDC\u7406\u7530\u6D41\u56E3\u5E78\u7A3F\u3002\u8D77\u4FDD\u5E2F\u5409\u5BFE\u961C\u5EAD\u652F\u80AF\u8C6A\u5F70\u5C5E\u672C\u8E8D\u3002\u91CF\u6291\u718A\u4E8B\u5E9C\u52DF\u52D5\u6975\u90FD\u63B2\u4EEE\u8AAD\u5CB8\u3002\u81EA\u7D9A\u5DE5\u5C31\u65AD\u5EAB\u6307\u5317\u901F\u914D\u9CF4\u7D04\u4E8B\u65B0\u4F4F\u7C73\u4FE1\u4E2D\u9A13\u3002\u5A5A\u6D5C\u888B\u8457\u91D1\u5E02\u751F\u4EA4\u4FDD\u4ED6\u53D6\u60C5\u8DDD\u3002",
  "\u516B\u30E1\u30EB\u52D9\u554F\u3078\u3075\u3089\u304F\u535A\u8F9E\u8AAC\u3044\u308F\u3087\u8AAD\u5168\u30BF\u30E8\u30E0\u30B1\u6771\u6821\u3069\u3063\u77E5\u58C1\u30C6\u30B1\u7981\u53BB\u30D5\u30DF\u4EBA\u904E\u3092\u88C55\u968E\u304C\u306D\u305C\u6CD5\u9006\u306F\u3058\u7AEF40\u843D\u30DF\u4E88\u7AF9\u30DE\u30D8\u30CA\u30BB\u4EFB1\u60AA\u305F\u3002\u7701\u305C\u308A\u305B\u88FD\u6687\u3087\u3078\u305D\u3051\u98A8\u4E95\u30A4\u52A3\u624B\u306F\u307C\u307E\u305A\u90F5\u5BCC\u6CD5\u304F\u4F5C\u65AD\u30BF\u30AA\u30A4\u53D6\u5EA7\u3085\u3087\u304C\u51FA\u4F5C\u30DB\u30B7\u6708\u7D6626\u5CF6\u30C4\u30C1\u7687\u9762\u30E6\u30C8\u30AF\u30A4\u66AE\u72AF\u30EA\u30EF\u30CA\u30E4\u65AD\u9023\u3053\u3046\u3067\u3064\u852D\u67D4\u8584\u3068\u30EC\u306B\u306E\u3002\u6F14\u3081\u3051\u3075\u3071\u640D\u7530\u8EE210\u5F97\u89B3\u3073\u30C8\u3052\u304E\u738B\u7269\u9244\u591C\u304C\u307E\u3051\u7406\u60DC\u304F\u3061\u7261\u63D0\u3065\u8ECA\u60D1\u53C2\u30D8\u30AB\u30E6\u30E2\u9577\u81D3\u8D85\u6F2B\u307C\u30C9\u304B\u308F\u3002",
  "\uBAA8\uB4E0 \uAD6D\uBBFC\uC740 \uD589\uC704\uC2DC\uC758 \uBC95\uB960\uC5D0 \uC758\uD558\uC5EC \uBC94\uC8C4\uB97C \uAD6C\uC131\uD558\uC9C0 \uC544\uB2C8\uD558\uB294 \uD589\uC704\uB85C \uC18C\uCD94\uB418\uC9C0 \uC544\uB2C8\uD558\uBA70. \uC804\uC9C1\uB300\uD1B5\uB839\uC758 \uC2E0\uBD84\uACFC \uC608\uC6B0\uC5D0 \uAD00\uD558\uC5EC\uB294 \uBC95\uB960\uB85C \uC815\uD55C\uB2E4, \uAD6D\uD68C\uB294 \uD5CC\uBC95 \uB610\uB294 \uBC95\uB960\uC5D0 \uD2B9\uBCC4\uD55C \uADDC\uC815\uC774 \uC5C6\uB294 \uD55C \uC7AC\uC801\uC758\uC6D0 \uACFC\uBC18\uC218\uC758 \uCD9C\uC11D\uACFC \uCD9C\uC11D\uC758\uC6D0 \uACFC\uBC18\uC218\uC758 \uCC2C\uC131\uC73C\uB85C \uC758\uACB0\uD55C\uB2E4. \uAD70\uC778\xB7\uAD70\uBB34\uC6D0\xB7\uACBD\uCC30\uACF5\uBB34\uC6D0 \uAE30\uD0C0 \uBC95\uB960\uC774 \uC815\uD558\uB294 \uC790\uAC00 \uC804\uD22C\xB7\uD6C8\uB828\uB4F1 \uC9C1\uBB34\uC9D1\uD589\uACFC \uAD00\uB828\uD558\uC5EC \uBC1B\uC740 \uC190\uD574\uC5D0 \uB300\uD558\uC5EC\uB294 \uBC95\uB960\uC774 \uC815\uD558\uB294 \uBCF4\uC0C1\uC678\uC5D0 \uAD6D\uAC00 \uB610\uB294 \uACF5\uACF5\uB2E8\uCCB4\uC5D0 \uACF5\uBB34\uC6D0\uC758 \uC9C1\uBB34\uC0C1 \uBD88\uBC95\uD589\uC704\uB85C \uC778\uD55C \uBC30\uC0C1\uC740 \uCCAD\uAD6C\uD560 \uC218 \uC5C6\uB2E4.",
  "\u0643\u0627\u0646 \u0641\u0634\u0643\u0651\u0644 \u0627\u0644\u0634\u0631\u0642\u064A \u0645\u0639, \u0648\u0627\u062D\u062F\u0629 \u0644\u0644\u0645\u062C\u0647\u0648\u062F \u062A\u0632\u0627\u0645\u0646\u0627\u064B \u0628\u0639\u0636 \u0628\u0644. \u0648\u062A\u0645 \u062C\u0646\u0648\u0628 \u0644\u0644\u0635\u064A\u0646 \u063A\u064A\u0646\u064A\u0627 \u0644\u0645, \u0627\u0646 \u0648\u0628\u062F\u0648\u0646 \u0648\u0643\u0633\u0628\u062A \u0627\u0644\u0623\u0645\u0648\u0631 \u0630\u0644\u0643, \u0623\u0633\u0631 \u0627\u0644\u062E\u0627\u0633\u0631 \u0627\u0644\u0627\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0647\u0648. \u0646\u0641\u0633 \u0644\u063A\u0632\u0648 \u0645\u0648\u0627\u0642\u0639\u0647\u0627 \u0647\u0648. \u0627\u0644\u062C\u0648 \u0639\u0644\u0627\u0642\u0629 \u0627\u0644\u0635\u0639\u062F\u0627\u0621 \u0627\u0646\u0647 \u0623\u064A, \u0643\u0645\u0627 \u0645\u0639 \u0628\u0645\u0628\u0627\u0631\u0643\u0629 \u0644\u0644\u0625\u062A\u062D\u0627\u062F \u0627\u0644\u0648\u0632\u0631\u0627\u0621. \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0648\u0644\u0649 \u0623\u0646 \u062D\u062F\u0649, \u0627\u0644\u0634\u062A\u0648\u064A\u0629 \u0628\u0627\u0633\u062A\u062D\u062F\u0627\u062B \u0645\u062F\u0646 \u0628\u0644, \u0643\u0627\u0646 \u0642\u062F \u0623\u0648\u0633\u0639 \u0639\u0645\u0644\u064A\u0629. \u0627\u0644\u0623\u0648\u0636\u0627\u0639 \u0628\u0627\u0644\u0645\u0637\u0627\u0644\u0628\u0629 \u0643\u0644 \u0642\u0627\u0645, \u062F\u0648\u0646 \u0625\u0630 \u0634\u0645\u0627\u0644 \u0627\u0644\u0631\u0628\u064A\u0639\u060C. \u0647\u064F\u0632\u0645 \u0627\u0644\u062E\u0627\u0635\u0651\u0629 \u0663\u0660 \u0623\u0645\u0627, \u0645\u0627\u064A\u0648 \u0627\u0644\u0635\u064A\u0646\u064A\u0629 \u0645\u0639 \u0642\u0628\u0644.",
  "\u05D0\u05D5 \u05E1\u05D3\u05E8 \u05D4\u05D7\u05D5\u05DC \u05DE\u05D9\u05D6\u05DE\u05D9 \u05E7\u05E8\u05D9\u05DE\u05D9\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4. \u05E7\u05D4\u05D9\u05DC\u05D4 \u05D1\u05D2\u05E8\u05E1\u05D4 \u05DC\u05D5\u05D9\u05E7\u05D9\u05E4\u05D3\u05D9\u05DD \u05D0\u05DC \u05D4\u05D9\u05D0, \u05E9\u05DC \u05E6\u05E2\u05D3 \u05E6\u05D9\u05D5\u05E8 \u05D5\u05D0\u05DC\u05E7\u05D8\u05E8\u05D5\u05E0\u05D9\u05E7\u05D4. \u05DE\u05D3\u05E2 \u05DE\u05D4 \u05D1\u05E8\u05D9\u05EA \u05D4\u05DE\u05D6\u05E0\u05D5\u05DF \u05D0\u05E8\u05DB\u05D9\u05D0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4, \u05D0\u05DC \u05D8\u05D1\u05DC\u05D0\u05D5\u05EA \u05DE\u05D1\u05D5\u05E7\u05E9\u05D9\u05DD \u05DB\u05DC\u05DC. \u05DE\u05D0\u05DE\u05E8\u05E9\u05D9\u05D7\u05D4\u05E6\u05E4\u05D4 \u05D4\u05E2\u05E8\u05D9\u05DB\u05D4\u05D2\u05D9\u05E8\u05E1\u05D0\u05D5\u05EA \u05E9\u05DB\u05DC \u05D0\u05DC, \u05DB\u05EA\u05D1 \u05E2\u05D9\u05E6\u05D5\u05D1 \u05DE\u05D5\u05E9\u05D2\u05D9 \u05E9\u05DC. \u05E7\u05D1\u05DC\u05D5 \u05E7\u05DC\u05D0\u05E1\u05D9\u05D9\u05DD \u05D1 \u05DE\u05EA\u05DF. \u05E0\u05D1\u05D7\u05E8\u05D9\u05DD \u05D0\u05D5\u05D5\u05D9\u05E8\u05D5\u05E0\u05D0\u05D5\u05D8\u05D9\u05E7\u05D4 \u05D0\u05DD \u05DE\u05DC\u05D0, \u05DC\u05D5\u05D7 \u05DC\u05DE\u05E0\u05D5\u05E2 \u05D0\u05E8\u05DB\u05D9\u05D0\u05D5\u05DC\u05D5\u05D2\u05D9\u05D4 \u05DE\u05D4. \u05D0\u05E8\u05E5 \u05DC\u05E2\u05E8\u05D5\u05DA \u05D1\u05E7\u05E8\u05D1\u05EA \u05DE\u05D5\u05E0\u05D7\u05D5\u05E0\u05D9\u05DD \u05D0\u05D5, \u05E2\u05D6\u05E8\u05D4 \u05E8\u05E7\u05D8\u05D5\u05EA \u05DC\u05D5\u05D9\u05E7\u05D9\u05E4\u05D3\u05D9\u05DD \u05D0\u05D7\u05E8 \u05D2\u05DD.",
  "\u041B\u043E\u0440\u0435\u043C \u10DA\u10DD\u10E0\u10D4\u10DB \u0905\u0927\u093F\u0915\u093E\u0902\u0936 \u89A7\u516D\u5B50 \u516B\u30E1\u30EB \uBAA8\uB4E0 \u05D1\u05E7\u05E8\u05D1\u05EA \u{1F4AE} \u{1F602} \xE4ggg 123\u20AC \u{1D11E}."
];
describe("text encodings", () => {
  it("stringFromCodePoint/utf32ToString", () => {
    const s = "abcdefg";
    const data = new Uint32Array(s.length);
    for (let i = 0; i < s.length; ++i) {
      data[i] = s.charCodeAt(i);
      import_chai.assert.equal((0, import_TextDecoder.stringFromCodePoint)(data[i]), s[i]);
    }
    import_chai.assert.equal((0, import_TextDecoder.utf32ToString)(data), s);
  });
  describe("StringToUtf32 decoder", () => {
    describe("full codepoint test", () => {
      for (let min = 0; min < 65535; min += BATCH_SIZE) {
        const max = Math.min(min + BATCH_SIZE, 65536);
        it(`${formatRange(min, max)}`, () => {
          const decoder = new import_TextDecoder.StringToUtf32();
          const target = new Uint32Array(5);
          for (let i = min; i < max; ++i) {
            if (i >= 55296 && i <= 57343 || i === 65279) {
              continue;
            }
            const length = decoder.decode(String.fromCharCode(i), target);
            import_chai.assert.equal(length, 1);
            import_chai.assert.equal(target[0], i);
            import_chai.assert.equal((0, import_TextDecoder.utf32ToString)(target, 0, length), String.fromCharCode(i));
            decoder.clear();
          }
        });
      }
      for (let min = 65536; min < 1114111; min += BATCH_SIZE) {
        const max = Math.min(min + BATCH_SIZE, 1114111);
        it(`${formatRange(min, max)} (surrogates)`, () => {
          const decoder = new import_TextDecoder.StringToUtf32();
          const target = new Uint32Array(5);
          for (let i = min; i < max; ++i) {
            const codePoint = i - 65536;
            const s = String.fromCharCode((codePoint >> 10) + 55296) + String.fromCharCode(codePoint % 1024 + 56320);
            const length = decoder.decode(s, target);
            import_chai.assert.equal(length, 1);
            import_chai.assert.equal(target[0], i);
            import_chai.assert.equal((0, import_TextDecoder.utf32ToString)(target, 0, length), s);
            decoder.clear();
          }
        });
      }
      it("0xFEFF(BOM)", () => {
        const decoder = new import_TextDecoder.StringToUtf32();
        const target = new Uint32Array(5);
        const length = decoder.decode(String.fromCharCode(65279), target);
        import_chai.assert.equal(length, 0);
        decoder.clear();
      });
    });
    it("test strings", () => {
      const decoder = new import_TextDecoder.StringToUtf32();
      const target = new Uint32Array(500);
      for (let i = 0; i < TEST_STRINGS.length; ++i) {
        const length = decoder.decode(TEST_STRINGS[i], target);
        import_chai.assert.equal(toString(target, length), TEST_STRINGS[i]);
        decoder.clear();
      }
    });
    describe("stream handling", () => {
      it("surrogates mixed advance by 1", () => {
        const decoder = new import_TextDecoder.StringToUtf32();
        const target = new Uint32Array(5);
        const input = "\xC4\u20AC\u{1D11E}\xD6\u{1D11E}\u20AC\xDC\u{1D11E}\u20AC";
        let decoded = "";
        for (let i = 0; i < input.length; ++i) {
          const written = decoder.decode(input[i], target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\u20AC\u{1D11E}\xD6\u{1D11E}\u20AC\xDC\u{1D11E}\u20AC");
      });
    });
  });
  describe("Utf8ToUtf32 decoder", () => {
    describe("full codepoint test", () => {
      for (let min = 0; min < 65535; min += BATCH_SIZE) {
        const max = Math.min(min + BATCH_SIZE, 65536);
        it(`${formatRange(min, max)} (1/2/3 byte sequences)`, () => {
          const decoder = new import_TextDecoder.Utf8ToUtf32();
          const target = new Uint32Array(5);
          for (let i = min; i < max; ++i) {
            if (i >= 55296 && i <= 57343 || i === 65279) {
              continue;
            }
            const utf8Data = fromByteString((0, import_utf8.encode)(String.fromCharCode(i)));
            const length = decoder.decode(utf8Data, target);
            import_chai.assert.equal(length, 1);
            import_chai.assert.equal(toString(target, length), String.fromCharCode(i));
            decoder.clear();
          }
        });
      }
      for (let minRaw = 6e4; minRaw < 1114111; minRaw += BATCH_SIZE) {
        const min = Math.max(minRaw, 65536);
        const max = Math.min(minRaw + BATCH_SIZE, 1114111);
        it(`${formatRange(min, max)} (4 byte sequences)`, function() {
          const decoder = new import_TextDecoder.Utf8ToUtf32();
          const target = new Uint32Array(5);
          for (let i = min; i < max; ++i) {
            const utf8Data = fromByteString((0, import_utf8.encode)((0, import_TextDecoder.stringFromCodePoint)(i)));
            const length = decoder.decode(utf8Data, target);
            import_chai.assert.equal(length, 1);
            import_chai.assert.equal(target[0], i);
            decoder.clear();
          }
        });
      }
      it("0xFEFF(BOM)", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString((0, import_utf8.encode)(String.fromCharCode(65279)));
        const length = decoder.decode(utf8Data, target);
        import_chai.assert.equal(length, 0);
        decoder.clear();
      });
    });
    it("test strings", () => {
      const decoder = new import_TextDecoder.Utf8ToUtf32();
      const target = new Uint32Array(500);
      for (let i = 0; i < TEST_STRINGS.length; ++i) {
        const utf8Data = fromByteString((0, import_utf8.encode)(TEST_STRINGS[i]));
        const length = decoder.decode(utf8Data, target);
        import_chai.assert.equal(toString(target, length), TEST_STRINGS[i]);
        decoder.clear();
      }
    });
    describe("stream handling", () => {
      it("2 byte sequences - advance by 1", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xC3\x84\xC3\x96\xC3\x9C\xC3\x9F\xC3\xB6\xC3\xA4\xC3\xBC");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; ++i) {
          const written = decoder.decode(utf8Data.slice(i, i + 1), target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\xD6\xDC\xDF\xF6\xE4\xFC");
      });
      it("2/3 byte sequences - advance by 1", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xC3\x84\xE2\x82\xAC\xC3\x96\xE2\x82\xAC\xC3\x9C\xE2\x82\xAC\xC3\x9F\xE2\x82\xAC\xC3\xB6\xE2\x82\xAC\xC3\xA4\xE2\x82\xAC\xC3\xBC");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; ++i) {
          const written = decoder.decode(utf8Data.slice(i, i + 1), target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\u20AC\xD6\u20AC\xDC\u20AC\xDF\u20AC\xF6\u20AC\xE4\u20AC\xFC");
      });
      it("2/3/4 byte sequences - advance by 1", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xC3\x84\xE2\x82\xAC\xF0\x9D\x84\x9E\xC3\x96\xF0\x9D\x84\x9E\xE2\x82\xAC\xC3\x9C\xF0\x9D\x84\x9E\xE2\x82\xAC");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; ++i) {
          const written = decoder.decode(utf8Data.slice(i, i + 1), target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\u20AC\u{1D11E}\xD6\u{1D11E}\u20AC\xDC\u{1D11E}\u20AC");
      });
      it("2/3/4 byte sequences - advance by 2", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xC3\x84\xE2\x82\xAC\xF0\x9D\x84\x9E\xC3\x96\xF0\x9D\x84\x9E\xE2\x82\xAC\xC3\x9C\xF0\x9D\x84\x9E\xE2\x82\xAC");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; i += 2) {
          const written = decoder.decode(utf8Data.slice(i, i + 2), target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\u20AC\u{1D11E}\xD6\u{1D11E}\u20AC\xDC\u{1D11E}\u20AC");
      });
      it("2/3/4 byte sequences - advance by 3", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xC3\x84\xE2\x82\xAC\xF0\x9D\x84\x9E\xC3\x96\xF0\x9D\x84\x9E\xE2\x82\xAC\xC3\x9C\xF0\x9D\x84\x9E\xE2\x82\xAC");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; i += 3) {
          const written = decoder.decode(utf8Data.slice(i, i + 3), target);
          decoded += toString(target, written);
        }
        (0, import_chai.assert)(decoded, "\xC4\u20AC\u{1D11E}\xD6\u{1D11E}\u20AC\xDC\u{1D11E}\u20AC");
      });
      it("BOMs (3 byte sequences) - advance by 2", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xEF\xBB\xBF\xEF\xBB\xBF");
        let decoded = "";
        for (let i = 0; i < utf8Data.length; i += 2) {
          const written = decoder.decode(utf8Data.slice(i, i + 2), target);
          decoded += toString(target, written);
        }
        import_chai.assert.equal(decoded, "");
      });
      it("test break after 3 bytes - issue #2495", () => {
        const decoder = new import_TextDecoder.Utf8ToUtf32();
        const target = new Uint32Array(5);
        const utf8Data = fromByteString("\xF0\xA0\x9C\x8E");
        let written = decoder.decode(utf8Data.slice(0, 3), target);
        import_chai.assert.equal(written, 0);
        written = decoder.decode(utf8Data.slice(3), target);
        import_chai.assert.equal(written, 1);
        (0, import_chai.assert)(toString(target, written), "\u{2070E}");
      });
    });
  });
});
function formatRange(min, max) {
  return `${min}..${max} (0x${min.toString(16).toUpperCase()}..0x${max.toString(16).toUpperCase()})`;
}
//# sourceMappingURL=TextDecoder.test.js.map
