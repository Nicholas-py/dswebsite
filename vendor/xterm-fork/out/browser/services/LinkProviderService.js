"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkProviderService = void 0;
const lifecycle_1 = require("vs/base/common/lifecycle");
class LinkProviderService extends lifecycle_1.Disposable {
    constructor() {
        super();
        this.linkProviders = [];
        this._register((0, lifecycle_1.toDisposable)(() => this.linkProviders.length = 0));
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
exports.LinkProviderService = LinkProviderService;
//# sourceMappingURL=LinkProviderService.js.map