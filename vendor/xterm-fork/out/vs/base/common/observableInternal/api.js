"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.observableValueOpts = observableValueOpts;
const equals_1 = require("vs/base/common/equals");
const base_1 = require("vs/base/common/observableInternal/base");
const debugName_1 = require("vs/base/common/observableInternal/debugName");
const lazyObservableValue_1 = require("vs/base/common/observableInternal/lazyObservableValue");
function observableValueOpts(options, initialValue) {
    if (options.lazy) {
        return new lazyObservableValue_1.LazyObservableValue(new debugName_1.DebugNameData(options.owner, options.debugName, undefined), initialValue, options.equalsFn ?? equals_1.strictEquals);
    }
    return new base_1.ObservableValue(new debugName_1.DebugNameData(options.owner, options.debugName, undefined), initialValue, options.equalsFn ?? equals_1.strictEquals);
}
