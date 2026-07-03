"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DecorationService_1 = require("./DecorationService");
const lifecycle_1 = require("vs/base/common/lifecycle");
const event_1 = require("vs/base/common/event");
const fakeMarker = Object.freeze(new class extends lifecycle_1.Disposable {
    constructor() {
        super(...arguments);
        this.id = 1;
        this.line = 1;
        this.isDisposed = false;
        this.onDispose = new event_1.Emitter().event;
    }
}());
describe('DecorationService', () => {
    it('should set isDisposed to true after dispose', () => {
        const service = new DecorationService_1.DecorationService();
        const decoration = service.registerDecoration({
            marker: fakeMarker
        });
        chai_1.assert.ok(decoration);
        chai_1.assert.isFalse(decoration.isDisposed);
        decoration.dispose();
        chai_1.assert.isTrue(decoration.isDisposed);
    });
});
//# sourceMappingURL=DecorationService.test.js.map