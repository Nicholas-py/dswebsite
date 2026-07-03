"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tooMuchOutput = exports.promptLabel = void 0;
let promptLabelInternal = 'Terminal input';
const promptLabel = {
    get: () => promptLabelInternal,
    set: (value) => promptLabelInternal = value
};
exports.promptLabel = promptLabel;
let tooMuchOutputInternal = 'Too much output to announce, navigate to rows manually to read';
const tooMuchOutput = {
    get: () => tooMuchOutputInternal,
    set: (value) => tooMuchOutputInternal = value
};
exports.tooMuchOutput = tooMuchOutput;
//# sourceMappingURL=LocalizableStrings.js.map