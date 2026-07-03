"use strict";
var import_chai = require("chai");
var import_Clone = require("common/Clone");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("clone", () => {
  it("should clone simple objects", () => {
    const test = {
      a: 1,
      b: 2
    };
    import_chai.assert.deepEqual((0, import_Clone.clone)(test), { a: 1, b: 2 });
  });
  it("should clone nested objects", () => {
    const test = {
      bar: {
        a: 1,
        b: 2,
        c: {
          foo: "bar"
        }
      }
    };
    import_chai.assert.deepEqual((0, import_Clone.clone)(test), {
      bar: {
        a: 1,
        b: 2,
        c: {
          foo: "bar"
        }
      }
    });
  });
  it("should clone array values", () => {
    const test = {
      a: [1, 2, 3],
      b: [1, null, "test", { foo: "bar" }]
    };
    import_chai.assert.deepEqual((0, import_Clone.clone)(test), {
      a: [1, 2, 3],
      b: [1, null, "test", { foo: "bar" }]
    });
  });
  it("should stop mutation from occuring on the original object", () => {
    const test = {
      a: 1,
      b: 2,
      c: {
        foo: "bar"
      }
    };
    const cloned = (0, import_Clone.clone)(test);
    test.a = 5;
    test.c.foo = "barbaz";
    import_chai.assert.deepEqual(cloned, {
      a: 1,
      b: 2,
      c: {
        foo: "bar"
      }
    });
  });
  it("should clone to a maximum depth of 5 by default", () => {
    const test = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: "foo"
              }
            }
          }
        }
      }
    };
    const cloned = (0, import_Clone.clone)(test);
    test.a.b.c.d.e.f = "bar";
    import_chai.assert.equal(cloned.a.b.c.d.e.f, "bar");
  });
  it("should allow an optional maximum depth to be set", () => {
    const test = {
      a: {
        b: {
          c: "foo"
        }
      }
    };
    const cloned = (0, import_Clone.clone)(test, 2);
    test.a.b.c = "bar";
    import_chai.assert.equal(cloned.a.b.c, "bar");
  });
  it("should not throw when cloning a recursive reference", () => {
    const test = {
      a: {
        b: {
          c: {}
        }
      }
    };
    test.a.b.c = test;
    import_chai.assert.doesNotThrow(() => (0, import_Clone.clone)(test));
  });
});
//# sourceMappingURL=Clone.test.js.map
