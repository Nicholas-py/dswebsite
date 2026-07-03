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
var RectangleRenderer_exports = {};
__export(RectangleRenderer_exports, {
  RectangleRenderer: () => RectangleRenderer
});
module.exports = __toCommonJS(RectangleRenderer_exports);
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_Constants = require("common/buffer/Constants");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_RenderModel = require("./RenderModel");
var import_WebglUtils = require("./WebglUtils");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var VertexAttribLocations = /* @__PURE__ */ ((VertexAttribLocations2) => {
  VertexAttribLocations2[VertexAttribLocations2["POSITION"] = 0] = "POSITION";
  VertexAttribLocations2[VertexAttribLocations2["SIZE"] = 1] = "SIZE";
  VertexAttribLocations2[VertexAttribLocations2["COLOR"] = 2] = "COLOR";
  VertexAttribLocations2[VertexAttribLocations2["UNIT_QUAD"] = 3] = "UNIT_QUAD";
  return VertexAttribLocations2;
})(VertexAttribLocations || {});
const vertexShaderSource = `#version 300 es
layout (location = ${0 /* POSITION */}) in vec2 a_position;
layout (location = ${1 /* SIZE */}) in vec2 a_size;
layout (location = ${2 /* COLOR */}) in vec4 a_color;
layout (location = ${3 /* UNIT_QUAD */}) in vec2 a_unitquad;

uniform mat4 u_projection;

out vec4 v_color;

void main() {
  vec2 zeroToOne = a_position + (a_unitquad * a_size);
  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);
  v_color = a_color;
}`;
const fragmentShaderSource = `#version 300 es
precision lowp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}`;
const INDICES_PER_RECTANGLE = 8;
const BYTES_PER_RECTANGLE = INDICES_PER_RECTANGLE * Float32Array.BYTES_PER_ELEMENT;
const INITIAL_BUFFER_RECTANGLE_CAPACITY = 20 * INDICES_PER_RECTANGLE;
class Vertices {
  constructor() {
    this.attributes = new Float32Array(INITIAL_BUFFER_RECTANGLE_CAPACITY);
    this.count = 0;
  }
}
let $rgba = 0;
let $x1 = 0;
let $y1 = 0;
let $r = 0;
let $g = 0;
let $b = 0;
let $a = 0;
class RectangleRenderer extends import_lifecycle.Disposable {
  constructor(_terminal, _gl, _dimensions, _themeService) {
    super();
    this._terminal = _terminal;
    this._gl = _gl;
    this._dimensions = _dimensions;
    this._themeService = _themeService;
    this._vertices = new Vertices();
    this._verticesCursor = new Vertices();
    const gl = this._gl;
    this._program = (0, import_RendererUtils.throwIfFalsy)((0, import_WebglUtils.createProgram)(gl, vertexShaderSource, fragmentShaderSource));
    this._register((0, import_lifecycle.toDisposable)(() => gl.deleteProgram(this._program)));
    this._projectionLocation = (0, import_RendererUtils.throwIfFalsy)(gl.getUniformLocation(this._program, "u_projection"));
    this._vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(this._vertexArrayObject);
    const unitQuadVertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    const unitQuadVerticesBuffer = gl.createBuffer();
    this._register((0, import_lifecycle.toDisposable)(() => gl.deleteBuffer(unitQuadVerticesBuffer)));
    gl.bindBuffer(gl.ARRAY_BUFFER, unitQuadVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, unitQuadVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3 /* UNIT_QUAD */);
    gl.vertexAttribPointer(3 /* UNIT_QUAD */, 2, this._gl.FLOAT, false, 0, 0);
    const unitQuadElementIndices = new Uint8Array([0, 1, 2, 3]);
    const elementIndicesBuffer = gl.createBuffer();
    this._register((0, import_lifecycle.toDisposable)(() => gl.deleteBuffer(elementIndicesBuffer)));
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, unitQuadElementIndices, gl.STATIC_DRAW);
    this._attributesBuffer = (0, import_RendererUtils.throwIfFalsy)(gl.createBuffer());
    this._register((0, import_lifecycle.toDisposable)(() => gl.deleteBuffer(this._attributesBuffer)));
    gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
    gl.enableVertexAttribArray(0 /* POSITION */);
    gl.vertexAttribPointer(0 /* POSITION */, 2, gl.FLOAT, false, BYTES_PER_RECTANGLE, 0);
    gl.vertexAttribDivisor(0 /* POSITION */, 1);
    gl.enableVertexAttribArray(1 /* SIZE */);
    gl.vertexAttribPointer(1 /* SIZE */, 2, gl.FLOAT, false, BYTES_PER_RECTANGLE, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(1 /* SIZE */, 1);
    gl.enableVertexAttribArray(2 /* COLOR */);
    gl.vertexAttribPointer(2 /* COLOR */, 4, gl.FLOAT, false, BYTES_PER_RECTANGLE, 4 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribDivisor(2 /* COLOR */, 1);
    this._updateCachedColors(_themeService.colors);
    this._register(this._themeService.onChangeColors((e) => {
      this._updateCachedColors(e);
      this._updateViewportRectangle();
    }));
  }
  renderBackgrounds() {
    this._renderVertices(this._vertices);
  }
  renderCursor() {
    this._renderVertices(this._verticesCursor);
  }
  _renderVertices(vertices) {
    const gl = this._gl;
    gl.useProgram(this._program);
    gl.bindVertexArray(this._vertexArrayObject);
    gl.uniformMatrix4fv(this._projectionLocation, false, import_WebglUtils.PROJECTION_MATRIX);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.attributes, gl.DYNAMIC_DRAW);
    gl.drawElementsInstanced(this._gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_BYTE, 0, vertices.count);
  }
  handleResize() {
    this._updateViewportRectangle();
  }
  setDimensions(dimensions) {
    this._dimensions = dimensions;
  }
  _updateCachedColors(colors) {
    this._bgFloat = this._colorToFloat32Array(colors.background);
    this._cursorFloat = this._colorToFloat32Array(colors.cursor);
  }
  _updateViewportRectangle() {
    this._addRectangleFloat(
      this._vertices.attributes,
      0,
      0,
      0,
      this._terminal.cols * this._dimensions.device.cell.width,
      this._terminal.rows * this._dimensions.device.cell.height,
      this._bgFloat
    );
  }
  updateBackgrounds(model) {
    const terminal = this._terminal;
    const vertices = this._vertices;
    let rectangleCount = 1;
    let y;
    let x;
    let currentStartX;
    let currentBg;
    let currentFg;
    let currentInverse;
    let modelIndex;
    let bg;
    let fg;
    let inverse;
    let offset;
    for (y = 0; y < terminal.rows; y++) {
      currentStartX = -1;
      currentBg = 0;
      currentFg = 0;
      currentInverse = false;
      for (x = 0; x < terminal.cols; x++) {
        modelIndex = (y * terminal.cols + x) * import_RenderModel.RENDER_MODEL_INDICIES_PER_CELL;
        bg = model.cells[modelIndex + import_RenderModel.RENDER_MODEL_BG_OFFSET];
        fg = model.cells[modelIndex + import_RenderModel.RENDER_MODEL_FG_OFFSET];
        inverse = !!(fg & import_Constants.FgFlags.INVERSE);
        if (bg !== currentBg || fg !== currentFg && (currentInverse || inverse)) {
          if (currentBg !== 0 || currentInverse && currentFg !== 0) {
            offset = rectangleCount++ * INDICES_PER_RECTANGLE;
            this._updateRectangle(vertices, offset, currentFg, currentBg, currentStartX, x, y);
          }
          currentStartX = x;
          currentBg = bg;
          currentFg = fg;
          currentInverse = inverse;
        }
      }
      if (currentBg !== 0 || currentInverse && currentFg !== 0) {
        offset = rectangleCount++ * INDICES_PER_RECTANGLE;
        this._updateRectangle(vertices, offset, currentFg, currentBg, currentStartX, terminal.cols, y);
      }
    }
    vertices.count = rectangleCount;
  }
  updateCursor(model) {
    const vertices = this._verticesCursor;
    const cursor = model.cursor;
    if (!cursor || cursor.style === "block") {
      vertices.count = 0;
      return;
    }
    let offset;
    let rectangleCount = 0;
    if (cursor.style === "bar" || cursor.style === "outline") {
      offset = rectangleCount++ * INDICES_PER_RECTANGLE;
      this._addRectangleFloat(
        vertices.attributes,
        offset,
        cursor.x * this._dimensions.device.cell.width,
        cursor.y * this._dimensions.device.cell.height,
        cursor.style === "bar" ? cursor.dpr * cursor.cursorWidth : cursor.dpr,
        this._dimensions.device.cell.height,
        this._cursorFloat
      );
    }
    if (cursor.style === "underline" || cursor.style === "outline") {
      offset = rectangleCount++ * INDICES_PER_RECTANGLE;
      this._addRectangleFloat(
        vertices.attributes,
        offset,
        cursor.x * this._dimensions.device.cell.width,
        (cursor.y + 1) * this._dimensions.device.cell.height - cursor.dpr,
        cursor.width * this._dimensions.device.cell.width,
        cursor.dpr,
        this._cursorFloat
      );
    }
    if (cursor.style === "outline") {
      offset = rectangleCount++ * INDICES_PER_RECTANGLE;
      this._addRectangleFloat(
        vertices.attributes,
        offset,
        cursor.x * this._dimensions.device.cell.width,
        cursor.y * this._dimensions.device.cell.height,
        cursor.width * this._dimensions.device.cell.width,
        cursor.dpr,
        this._cursorFloat
      );
      offset = rectangleCount++ * INDICES_PER_RECTANGLE;
      this._addRectangleFloat(
        vertices.attributes,
        offset,
        (cursor.x + cursor.width) * this._dimensions.device.cell.width - cursor.dpr,
        cursor.y * this._dimensions.device.cell.height,
        cursor.dpr,
        this._dimensions.device.cell.height,
        this._cursorFloat
      );
    }
    vertices.count = rectangleCount;
  }
  _updateRectangle(vertices, offset, fg, bg, startX, endX, y) {
    if (fg & import_Constants.FgFlags.INVERSE) {
      switch (fg & import_Constants.Attributes.CM_MASK) {
        case import_Constants.Attributes.CM_P16:
        case import_Constants.Attributes.CM_P256:
          $rgba = this._themeService.colors.ansi[fg & import_Constants.Attributes.PCOLOR_MASK].rgba;
          break;
        case import_Constants.Attributes.CM_RGB:
          $rgba = (fg & import_Constants.Attributes.RGB_MASK) << 8;
          break;
        case import_Constants.Attributes.CM_DEFAULT:
        default:
          $rgba = this._themeService.colors.foreground.rgba;
      }
    } else {
      switch (bg & import_Constants.Attributes.CM_MASK) {
        case import_Constants.Attributes.CM_P16:
        case import_Constants.Attributes.CM_P256:
          $rgba = this._themeService.colors.ansi[bg & import_Constants.Attributes.PCOLOR_MASK].rgba;
          break;
        case import_Constants.Attributes.CM_RGB:
          $rgba = (bg & import_Constants.Attributes.RGB_MASK) << 8;
          break;
        case import_Constants.Attributes.CM_DEFAULT:
        default:
          $rgba = this._themeService.colors.background.rgba;
      }
    }
    if (vertices.attributes.length < offset + 4) {
      vertices.attributes = (0, import_WebglUtils.expandFloat32Array)(vertices.attributes, this._terminal.rows * this._terminal.cols * INDICES_PER_RECTANGLE);
    }
    $x1 = startX * this._dimensions.device.cell.width;
    $y1 = y * this._dimensions.device.cell.height;
    $r = ($rgba >> 24 & 255) / 255;
    $g = ($rgba >> 16 & 255) / 255;
    $b = ($rgba >> 8 & 255) / 255;
    $a = 1;
    this._addRectangle(vertices.attributes, offset, $x1, $y1, (endX - startX) * this._dimensions.device.cell.width, this._dimensions.device.cell.height, $r, $g, $b, $a);
  }
  _addRectangle(array, offset, x1, y1, width, height, r, g, b, a) {
    array[offset] = x1 / this._dimensions.device.canvas.width;
    array[offset + 1] = y1 / this._dimensions.device.canvas.height;
    array[offset + 2] = width / this._dimensions.device.canvas.width;
    array[offset + 3] = height / this._dimensions.device.canvas.height;
    array[offset + 4] = r;
    array[offset + 5] = g;
    array[offset + 6] = b;
    array[offset + 7] = a;
  }
  _addRectangleFloat(array, offset, x1, y1, width, height, color) {
    array[offset] = x1 / this._dimensions.device.canvas.width;
    array[offset + 1] = y1 / this._dimensions.device.canvas.height;
    array[offset + 2] = width / this._dimensions.device.canvas.width;
    array[offset + 3] = height / this._dimensions.device.canvas.height;
    array[offset + 4] = color[0];
    array[offset + 5] = color[1];
    array[offset + 6] = color[2];
    array[offset + 7] = color[3];
  }
  _colorToFloat32Array(color) {
    return new Float32Array([
      (color.rgba >> 24 & 255) / 255,
      (color.rgba >> 16 & 255) / 255,
      (color.rgba >> 8 & 255) / 255,
      (color.rgba & 255) / 255
    ]);
  }
}
//# sourceMappingURL=RectangleRenderer.js.map
