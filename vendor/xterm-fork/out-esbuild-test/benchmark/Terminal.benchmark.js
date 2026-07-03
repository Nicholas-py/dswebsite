var import_xterm_benchmark = require("xterm-benchmark");
var import_node_pty = require("node-pty");
var import_TextDecoder = require("common/input/TextDecoder");
var import_CoreBrowserTerminal = require("browser/CoreBrowserTerminal");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
(0, import_xterm_benchmark.perfContext)("Terminal: ls -lR /usr/lib", () => {
  let content = "";
  let contentUtf8;
  (0, import_xterm_benchmark.before)(async () => {
    const p = (0, import_node_pty.spawn)("ls", ["--color=auto", "-lR", "/usr/lib"], {
      name: "xterm-256color",
      cols: 80,
      rows: 25,
      cwd: process.env.HOME,
      env: process.env,
      encoding: null
      // needs to be fixed in node-pty
    });
    const chunks = [];
    let length = 0;
    p.onData((data) => {
      chunks.push(data);
      length += data.length;
    });
    await new Promise((resolve) => p.onExit(() => resolve()));
    contentUtf8 = Buffer.concat(chunks, length);
    const buffer = new Uint32Array(contentUtf8.length);
    const decoder = new import_TextDecoder.Utf8ToUtf32();
    const codepoints = decoder.decode(contentUtf8, buffer);
    for (let i = 0; i < codepoints; ++i) {
      content += (0, import_TextDecoder.stringFromCodePoint)(buffer[i]);
      if (!(i % 1e7)) {
        content[i];
      }
    }
  });
  (0, import_xterm_benchmark.perfContext)("write/string/async", () => {
    let terminal;
    (0, import_xterm_benchmark.before)(() => {
      terminal = new import_CoreBrowserTerminal.CoreBrowserTerminal({ cols: 80, rows: 25, scrollback: 1e3 });
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      await new Promise((res) => terminal.write(content, res));
      return { payloadSize: contentUtf8.length };
    }, { fork: false }).showAverageThroughput();
  });
  (0, import_xterm_benchmark.perfContext)("write/Utf8/async", () => {
    let terminal;
    (0, import_xterm_benchmark.before)(() => {
      terminal = new import_CoreBrowserTerminal.CoreBrowserTerminal({ cols: 80, rows: 25, scrollback: 1e3 });
    });
    new import_xterm_benchmark.ThroughputRuntimeCase("", async () => {
      await new Promise((res) => terminal.write(content, res));
      return { payloadSize: contentUtf8.length };
    }, { fork: false }).showAverageThroughput();
  });
});
//# sourceMappingURL=Terminal.benchmark.js.map
