var import_xterm_benchmark = require("xterm-benchmark");
var import_EscapeSequenceParser = require("common/parser/EscapeSequenceParser");
var import_EscapeSequences = require("common/data/EscapeSequences");
var import_OscParser = require("common/parser/OscParser");
var import_DcsParser = require("../../out/common/parser/DcsParser");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const SIZE = 5e6;
function toUtf32(s) {
  const result = new Uint32Array(s.length);
  for (let i = 0; i < s.length; ++i) {
    result[i] = s.charCodeAt(i);
  }
  return result;
}
class FastDcsHandler {
  hook(params) {
  }
  put(data, start, end) {
  }
  unhook(success) {
    return true;
  }
}
class FastOscHandler {
  start() {
  }
  put(data, start, end) {
  }
  end(success) {
    return true;
  }
}
(0, import_xterm_benchmark.perfContext)("Parser throughput - 50MB data", () => {
  let parsed;
  let parser;
  (0, import_xterm_benchmark.beforeEach)(() => {
    parser = new import_EscapeSequenceParser.EscapeSequenceParser();
    parser.setPrintHandler((data, start, end) => {
    });
    parser.registerCsiHandler({ final: "@" }, (params) => true);
    parser.registerCsiHandler({ final: "A" }, (params) => true);
    parser.registerCsiHandler({ final: "B" }, (params) => true);
    parser.registerCsiHandler({ final: "C" }, (params) => true);
    parser.registerCsiHandler({ final: "D" }, (params) => true);
    parser.registerCsiHandler({ final: "E" }, (params) => true);
    parser.registerCsiHandler({ final: "F" }, (params) => true);
    parser.registerCsiHandler({ final: "G" }, (params) => true);
    parser.registerCsiHandler({ final: "H" }, (params) => true);
    parser.registerCsiHandler({ final: "I" }, (params) => true);
    parser.registerCsiHandler({ final: "J" }, (params) => true);
    parser.registerCsiHandler({ final: "K" }, (params) => true);
    parser.registerCsiHandler({ final: "L" }, (params) => true);
    parser.registerCsiHandler({ final: "M" }, (params) => true);
    parser.registerCsiHandler({ final: "P" }, (params) => true);
    parser.registerCsiHandler({ final: "S" }, (params) => true);
    parser.registerCsiHandler({ final: "T" }, (params) => true);
    parser.registerCsiHandler({ final: "X" }, (params) => true);
    parser.registerCsiHandler({ final: "Z" }, (params) => true);
    parser.registerCsiHandler({ final: "`" }, (params) => true);
    parser.registerCsiHandler({ final: "a" }, (params) => true);
    parser.registerCsiHandler({ final: "b" }, (params) => true);
    parser.registerCsiHandler({ final: "c" }, (params) => true);
    parser.registerCsiHandler({ final: "d" }, (params) => true);
    parser.registerCsiHandler({ final: "e" }, (params) => true);
    parser.registerCsiHandler({ final: "f" }, (params) => true);
    parser.registerCsiHandler({ final: "g" }, (params) => true);
    parser.registerCsiHandler({ final: "h" }, (params) => true);
    parser.registerCsiHandler({ final: "l" }, (params) => true);
    parser.registerCsiHandler({ final: "m" }, (params) => true);
    parser.registerCsiHandler({ final: "n" }, (params) => true);
    parser.registerCsiHandler({ final: "p" }, (params) => true);
    parser.registerCsiHandler({ final: "q" }, (params) => true);
    parser.registerCsiHandler({ final: "r" }, (params) => true);
    parser.registerCsiHandler({ final: "s" }, (params) => true);
    parser.registerCsiHandler({ final: "u" }, (params) => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.BEL, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.LF, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.VT, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.FF, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.CR, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.BS, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.HT, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.SO, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C0.SI, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C1.IND, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C1.NEL, () => true);
    parser.setExecuteHandler(import_EscapeSequences.C1.HTS, () => true);
    parser.registerOscHandler(0, new import_OscParser.OscHandler((data) => true));
    parser.registerOscHandler(1, new FastOscHandler());
    parser.registerEscHandler({ final: "7" }, () => true);
    parser.registerEscHandler({ final: "8" }, () => true);
    parser.registerEscHandler({ final: "D" }, () => true);
    parser.registerEscHandler({ final: "E" }, () => true);
    parser.registerEscHandler({ final: "H" }, () => true);
    parser.registerEscHandler({ final: "M" }, () => true);
    parser.registerEscHandler({ final: "=" }, () => true);
    parser.registerEscHandler({ final: ">" }, () => true);
    parser.registerEscHandler({ final: "c" }, () => true);
    parser.registerEscHandler({ final: "n" }, () => true);
    parser.registerEscHandler({ final: "o" }, () => true);
    parser.registerEscHandler({ final: "|" }, () => true);
    parser.registerEscHandler({ final: "}" }, () => true);
    parser.registerEscHandler({ final: "~" }, () => true);
    parser.registerEscHandler({ intermediates: "%", final: "@" }, () => true);
    parser.registerEscHandler({ intermediates: "%", final: "G" }, () => true);
    parser.registerDcsHandler({ final: "p" }, new import_DcsParser.DcsHandler((data) => true));
    parser.registerDcsHandler({ final: "q" }, new FastDcsHandler());
  });
  (0, import_xterm_benchmark.perfContext)("PRINT - a", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("EXECUTE - \\n", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\n\n\n\n\n\n\n";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("ESCAPE - ESC E", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1BE\x1BE\x1BE\x1BE\x1BE\x1BE\x1BE\x1BE\x1BE\x1BE";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("ESCAPE with collect - ESC % G", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G\x1B%G";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("CSI - CSI A", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A\x1B[A";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("CSI with collect - CSI ? p", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p\x1B[?p";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("CSI with params (short) - CSI 1;2 m", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m\x1B[1;2m";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("CSI with params (long) - CSI 1;2;3;4;5;6;7;8;9;0 m", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B[1;2;3;4;5;6;7;8;9;0m\x1B[1;2;3;4;5;6;7;8;9;0m\x1B[1;2;3;4;5;6;7;8;9;0m";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("OSC string interface (short seq) - OSC 0;hi ST", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B]0;hi\x1B\\\x1B]0;hi\x1B\\\x1B]0;hi\x1B\\\x1B]0;hi\x1B\\x1b]0;hi\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("OSC string interface (long seq) - OSC 0;<text> ST", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B]0;Lorem ipsum dolor sit amet, consetetur sadipscing elitr.\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("OSC class interface (short seq) - OSC 0;hi ST", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B]1;hi\x1B\\\x1B]1;hi\x1B\\\x1B]1;hi\x1B\\\x1B]1;hi\x1B\\x1b]1;hi\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("OSC class interface (long seq) - OSC 0;<text> ST", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1B]1;Lorem ipsum dolor sit amet, consetetur sadipscing elitr.\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("DCS string interface (short seq)", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1BPphi\x1B\\\x1BPphi\x1B\\\x1BPphi\x1B\\\x1BPphi\x1B\\\x1BPphi\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("DCS string interface (long seq)", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1BPpLorem ipsum dolor sit amet, consetetur sadipscing elitr.\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("DCS class interface (short seq)", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1BPqhi\x1B\\\x1BPqhi\x1B\\\x1BPqhi\x1B\\\x1BPqhi\x1B\\\x1BPqhi\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("DCS class interface (long seq)", () => {
    (0, import_xterm_benchmark.before)(() => {
      const data = "\x1BPqLorem ipsum dolor sit amet, consetetur sadipscing elitr.\x1B\\";
      let content = "";
      while (content.length < SIZE) {
        content += data;
      }
      parsed = toUtf32(content);
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      parser.parse(parsed, parsed.length);
      return { payloadSize: parsed.length };
    }, { fork: true }).showAverageThroughput();
  });
});
//# sourceMappingURL=EscapeSequenceParser.benchmark.js.map
