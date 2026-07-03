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
var Clipboard_exports = {};
__export(Clipboard_exports, {
  bracketTextForPaste: () => bracketTextForPaste,
  copyHandler: () => copyHandler,
  handlePasteEvent: () => handlePasteEvent,
  moveTextAreaUnderMouseCursor: () => moveTextAreaUnderMouseCursor,
  paste: () => paste,
  prepareTextForTerminal: () => prepareTextForTerminal,
  rightClickHandler: () => rightClickHandler
});
module.exports = __toCommonJS(Clipboard_exports);
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function prepareTextForTerminal(text) {
  return text.replace(/\r?\n/g, "\r");
}
function bracketTextForPaste(text, bracketedPasteMode) {
  if (bracketedPasteMode) {
    return "\x1B[200~" + text + "\x1B[201~";
  }
  return text;
}
function copyHandler(ev, selectionService) {
  if (ev.clipboardData) {
    ev.clipboardData.setData("text/plain", selectionService.selectionText);
  }
  ev.preventDefault();
}
function handlePasteEvent(ev, textarea, coreService, optionsService) {
  ev.stopPropagation();
  if (ev.clipboardData) {
    const text = ev.clipboardData.getData("text/plain");
    paste(text, textarea, coreService, optionsService);
  }
}
function paste(text, textarea, coreService, optionsService) {
  text = prepareTextForTerminal(text);
  text = bracketTextForPaste(text, coreService.decPrivateModes.bracketedPasteMode && optionsService.rawOptions.ignoreBracketedPasteMode !== true);
  coreService.triggerDataEvent(text, true);
  textarea.value = "";
}
function moveTextAreaUnderMouseCursor(ev, textarea, screenElement) {
  const pos = screenElement.getBoundingClientRect();
  const left = ev.clientX - pos.left - 10;
  const top = ev.clientY - pos.top - 10;
  textarea.style.width = "20px";
  textarea.style.height = "20px";
  textarea.style.left = `${left}px`;
  textarea.style.top = `${top}px`;
  textarea.style.zIndex = "1000";
  textarea.focus();
}
function rightClickHandler(ev, textarea, screenElement, selectionService, shouldSelectWord) {
  moveTextAreaUnderMouseCursor(ev, textarea, screenElement);
  if (shouldSelectWord) {
    selectionService.rightClickSelect(ev);
  }
  textarea.value = selectionService.selectionText;
  textarea.select();
}
//# sourceMappingURL=Clipboard.js.map
