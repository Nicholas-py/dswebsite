"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShimRenderer = void 0;
const lifecycle_1 = require("vs/base/common/lifecycle");
const WebglAddon_1 = require("WebglAddon");
class ShimRenderer extends lifecycle_1.Disposable {
    constructor(_terminal, _gl, _dimensions) {
        super();
        this._terminal = _terminal;
        this._gl = _gl;
        this._dimensions = _dimensions;
        this._framebuffer = null;
        this._texture = null;
        const gl = this._gl;
        this._framebuffer = gl.createFramebuffer();
        this._texture = gl.createTexture();
        WebglAddon_1.WebglAddon.onInit?.(gl);
    }
    handleResize() {
        const gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        const width = gl.canvas.width;
        const height = gl.canvas.height;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        WebglAddon_1.WebglAddon.onResize?.(this._dimensions.device.cell.width, this._dimensions.device.cell.height);
    }
    setDimensions(dimensions) {
        this._dimensions = dimensions;
    }
    beginFrame() {
        const gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
    }
    render() {
        if (this._texture) {
            const gl = this._gl;
            gl.activeTexture(gl.TEXTURE0);
            const savedTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
            WebglAddon_1.WebglAddon.onRender?.(this._texture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, savedTexture);
        }
    }
}
exports.ShimRenderer = ShimRenderer;
//# sourceMappingURL=ShimRenderer.js.map