"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainWindow = void 0;
exports.ensureCodeWindow = ensureCodeWindow;
function ensureCodeWindow(targetWindow, fallbackWindowId) {
}
// eslint-disable-next-line no-restricted-globals
exports.mainWindow = (typeof window === 'object' ? window : globalThis);
