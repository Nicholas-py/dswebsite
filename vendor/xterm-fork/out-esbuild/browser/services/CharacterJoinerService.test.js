"use strict";
var import_chai = require("chai");
var import_CharacterJoinerService = require("browser/services/CharacterJoinerService");
var import_BufferLine = require("common/buffer/BufferLine");
var import_CellData = require("common/buffer/CellData");
var import_TestUtils = require("common/TestUtils.test");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("CharacterJoinerService", () => {
  let service;
  beforeEach(() => {
    const bufferService = new import_TestUtils.MockBufferService(16, 10);
    const lines = bufferService.buffer.lines;
    lines.set(0, lineData([["a -> b -> c -> d"]]));
    lines.set(1, lineData([["a -> b => c -> d"]]));
    lines.set(2, lineData([["a -> b -", 4294967295], ["> c -> d", 0]]));
    lines.set(3, lineData([["no joined ranges"]]));
    lines.set(4, new import_BufferLine.BufferLine(0));
    lines.set(5, lineData([["a", 286331153], [" -> b -> c -> "], ["d", 572662306]]));
    const line6 = lineData([["wi"]]);
    line6.resize(line6.length + 1, import_CellData.CellData.fromCharData([0, "\uFFE5", 2, "\uFFE5".charCodeAt(0)]));
    line6.resize(line6.length + 1, import_CellData.CellData.fromCharData([0, "", 0, 0]));
    let sub = lineData([["deemo"]]);
    let oldSize = line6.length;
    line6.resize(oldSize + sub.length, import_CellData.CellData.fromCharData([0, "", 0, 0]));
    for (let i = 0; i < sub.length; ++i) line6.setCell(i + oldSize, sub.loadCell(i, new import_CellData.CellData()));
    line6.resize(line6.length + 1, import_CellData.CellData.fromCharData([0, "\xF0\x9F\x98\x81", 1, 128513]));
    line6.resize(line6.length + 1, import_CellData.CellData.fromCharData([0, " ", 1, " ".charCodeAt(0)]));
    sub = lineData([["jiabc"]]);
    oldSize = line6.length;
    line6.resize(oldSize + sub.length, import_CellData.CellData.fromCharData([0, "", 0, 0]));
    for (let i = 0; i < sub.length; ++i) line6.setCell(i + oldSize, sub.loadCell(i, new import_CellData.CellData()));
    lines.set(6, line6);
    service = new import_CharacterJoinerService.CharacterJoinerService(bufferService);
  });
  it("has no joiners upon creation", () => {
    import_chai.assert.deepEqual(service.getJoinedCharacters(0), []);
  });
  it("returns ranges matched by the registered joiners", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(0),
      [[2, 4], [7, 9], [12, 14]]
    );
  });
  it("processes the input using all provided joiners", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(1),
      [[2, 4], [12, 14]]
    );
    service.register(substringJoiner("=>"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(1),
      [[2, 4], [7, 9], [12, 14]]
    );
  });
  it("removes deregistered joiners from future calls", () => {
    const joiner1 = service.register(substringJoiner("->"));
    const joiner2 = service.register(substringJoiner("=>"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(1),
      [[2, 4], [7, 9], [12, 14]]
    );
    service.deregister(joiner1);
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(1),
      [[7, 9]]
    );
    service.deregister(joiner2);
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(1),
      []
    );
  });
  it("doesn't process joins on differently-styled characters", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(2),
      [[2, 4], [12, 14]]
    );
  });
  it("returns an empty list of ranges if there is nothing to be joined", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(3),
      []
    );
  });
  it("returns an empty list of ranges if the line is empty", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(4),
      []
    );
  });
  it("returns false when trying to deregister a joiner that does not exist", () => {
    service.register(substringJoiner("->"));
    import_chai.assert.deepEqual(service.deregister(123), false);
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(0),
      [[2, 4], [7, 9], [12, 14]]
    );
  });
  it("doesn't process same-styled ranges that only have one character", () => {
    service.register(substringJoiner("a"));
    service.register(substringJoiner("b"));
    service.register(substringJoiner("d"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(5),
      [[5, 6]]
    );
  });
  it("handles ranges that extend all the way to the end of the line", () => {
    service.register(substringJoiner("-> d"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(2),
      [[12, 16]]
    );
  });
  it("handles adjacent ranges", () => {
    service.register(substringJoiner("->"));
    service.register(substringJoiner("> c "));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(2),
      [[2, 4], [8, 12], [12, 14]]
    );
  });
  it("handles fullwidth characters in the middle of ranges", () => {
    service.register(substringJoiner("wi\uFFE5de"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(6),
      [[0, 6]]
    );
  });
  it("handles fullwidth characters at the end of ranges", () => {
    service.register(substringJoiner("wi\uFFE5"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(6),
      [[0, 4]]
    );
  });
  it("handles emojis in the middle of ranges", () => {
    service.register(substringJoiner("emo\xF0\x9F\x98\x81 ji"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(6),
      [[6, 13]]
    );
  });
  it("handles emojis at the end of ranges", () => {
    service.register(substringJoiner("emo\xF0\x9F\x98\x81 "));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(6),
      [[6, 11]]
    );
  });
  it("handles ranges after wide and emoji characters", () => {
    service.register(substringJoiner("abc"));
    import_chai.assert.deepEqual(
      service.getJoinedCharacters(6),
      [[13, 16]]
    );
  });
  describe("range merging", () => {
    it("inserts a new range before the existing ones", () => {
      service.register(() => [[1, 2], [2, 3]]);
      service.register(() => [[0, 1]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 1], [1, 2], [2, 3]]
      );
    });
    it("inserts in between two ranges", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[2, 4]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 2], [2, 4], [4, 6]]
      );
    });
    it("inserts after the last range", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[6, 8]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 2], [4, 6], [6, 8]]
      );
    });
    it("extends the beginning of a range", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[3, 5]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 2], [3, 6]]
      );
    });
    it("extends the end of a range", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[1, 4]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 4], [4, 6]]
      );
    });
    it("extends the last range", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[5, 7]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 2], [4, 7]]
      );
    });
    it("connects two ranges", () => {
      service.register(() => [[0, 2], [4, 6]]);
      service.register(() => [[1, 5]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 6]]
      );
    });
    it("connects more than two ranges", () => {
      service.register(() => [[0, 2], [4, 6], [8, 10], [12, 14]]);
      service.register(() => [[1, 10]]);
      import_chai.assert.deepEqual(
        service.getJoinedCharacters(0),
        [[0, 10], [12, 14]]
      );
    });
  });
});
function lineData(data) {
  const tline = new import_BufferLine.BufferLine(0);
  for (let i = 0; i < data.length; ++i) {
    const line = data[i][0];
    const attr = data[i][1] || 0;
    const offset = tline.length;
    tline.resize(tline.length + line.split("").length, import_CellData.CellData.fromCharData([0, "", 0, 0]));
    line.split("").map((char, idx) => tline.setCell(idx + offset, import_CellData.CellData.fromCharData([attr, char, 1, char.charCodeAt(0)])));
  }
  return tline;
}
function substringJoiner(substring) {
  return (sequence) => {
    const ranges = [];
    let searchIndex = 0;
    let matchIndex = -1;
    while ((matchIndex = sequence.indexOf(substring, searchIndex)) !== -1) {
      const matchEndIndex = matchIndex + substring.length;
      searchIndex = matchEndIndex;
      ranges.push([matchIndex, matchEndIndex]);
    }
    return ranges;
  };
}
//# sourceMappingURL=CharacterJoinerService.test.js.map
