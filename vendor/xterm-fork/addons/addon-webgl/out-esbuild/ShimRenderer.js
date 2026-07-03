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
var ShimRenderer_exports = {};
__export(ShimRenderer_exports, {
  ShimRenderer: () => ShimRenderer
});
module.exports = __toCommonJS(ShimRenderer_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_WebglAddon = require("WebglAddon");
class ShimRenderer extends import_lifecycle.Disposable {
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
    import_WebglAddon.WebglAddon.onInit?.(gl);
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
    import_WebglAddon.WebglAddon.onResize?.(
      this._dimensions.device.cell.width,
      this._dimensions.device.cell.height
    );
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
      import_WebglAddon.WebglAddon.onRender?.(this._texture);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, savedTexture);
    }
  }
}
//# sourceMappingURL=ShimRenderer.js.map
