"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeDevicePixelDimensions = observeDevicePixelDimensions;
const lifecycle_1 = require("vs/base/common/lifecycle");
function observeDevicePixelDimensions(element, parentWindow, callback) {
    let observer = new parentWindow.ResizeObserver((entries) => {
        const entry = entries.find((entry) => entry.target === element);
        if (!entry) {
            return;
        }
        if (!('devicePixelContentBoxSize' in entry)) {
            observer?.disconnect();
            observer = undefined;
            return;
        }
        const width = entry.devicePixelContentBoxSize[0].inlineSize;
        const height = entry.devicePixelContentBoxSize[0].blockSize;
        if (width > 0 && height > 0) {
            callback(width, height);
        }
    });
    try {
        observer.observe(element, { box: ['device-pixel-content-box'] });
    }
    catch {
        observer.disconnect();
        observer = undefined;
    }
    return (0, lifecycle_1.toDisposable)(() => observer?.disconnect());
}
//# sourceMappingURL=DevicePixelObserver.js.map