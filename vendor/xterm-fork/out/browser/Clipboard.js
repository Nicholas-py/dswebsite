"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareTextForTerminal = prepareTextForTerminal;
exports.bracketTextForPaste = bracketTextForPaste;
exports.copyHandler = copyHandler;
exports.handlePasteEvent = handlePasteEvent;
exports.paste = paste;
exports.moveTextAreaUnderMouseCursor = moveTextAreaUnderMouseCursor;
exports.rightClickHandler = rightClickHandler;
function prepareTextForTerminal(text) {
    return text.replace(/\r?\n/g, '\r');
}
function bracketTextForPaste(text, bracketedPasteMode) {
    if (bracketedPasteMode) {
        return '\x1b[200~' + text + '\x1b[201~';
    }
    return text;
}
function copyHandler(ev, selectionService) {
    if (ev.clipboardData) {
        ev.clipboardData.setData('text/plain', selectionService.selectionText);
    }
    ev.preventDefault();
}
function handlePasteEvent(ev, textarea, coreService, optionsService) {
    ev.stopPropagation();
    if (ev.clipboardData) {
        const text = ev.clipboardData.getData('text/plain');
        paste(text, textarea, coreService, optionsService);
    }
}
function paste(text, textarea, coreService, optionsService) {
    text = prepareTextForTerminal(text);
    text = bracketTextForPaste(text, coreService.decPrivateModes.bracketedPasteMode && optionsService.rawOptions.ignoreBracketedPasteMode !== true);
    coreService.triggerDataEvent(text, true);
    textarea.value = '';
}
function moveTextAreaUnderMouseCursor(ev, textarea, screenElement) {
    const pos = screenElement.getBoundingClientRect();
    const left = ev.clientX - pos.left - 10;
    const top = ev.clientY - pos.top - 10;
    textarea.style.width = '20px';
    textarea.style.height = '20px';
    textarea.style.left = `${left}px`;
    textarea.style.top = `${top}px`;
    textarea.style.zIndex = '1000';
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