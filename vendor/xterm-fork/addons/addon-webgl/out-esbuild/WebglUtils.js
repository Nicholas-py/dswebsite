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
var WebglUtils_exports = {};
__export(WebglUtils_exports, {
  GLTexture: () => GLTexture,
  PROJECTION_MATRIX: () => PROJECTION_MATRIX,
  createProgram: () => createProgram,
  createShader: () => createShader,
  expandFloat32Array: () => expandFloat32Array
});
module.exports = __toCommonJS(WebglUtils_exports);
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const PROJECTION_MATRIX = new Float32Array([
  2,
  0,
  0,
  0,
  0,
  -2,
  0,
  0,
  0,
  0,
  1,
  0,
  -1,
  1,
  0,
  1
]);
function createProgram(gl, vertexSource, fragmentSource) {
  const program = (0, import_RendererUtils.throwIfFalsy)(gl.createProgram());
  gl.attachShader(program, (0, import_RendererUtils.throwIfFalsy)(createShader(gl, gl.VERTEX_SHADER, vertexSource)));
  gl.attachShader(program, (0, import_RendererUtils.throwIfFalsy)(createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)));
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
function createShader(gl, type, source) {
  const shader = (0, import_RendererUtils.throwIfFalsy)(gl.createShader(type));
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}
function expandFloat32Array(source, max) {
  const newLength = Math.min(source.length * 2, max);
  const newArray = new Float32Array(newLength);
  for (let i = 0; i < source.length; i++) {
    newArray[i] = source[i];
  }
  return newArray;
}
class GLTexture {
  constructor(texture) {
    this.texture = texture;
    this.version = -1;
  }
}
//# sourceMappingURL=WebglUtils.js.map
