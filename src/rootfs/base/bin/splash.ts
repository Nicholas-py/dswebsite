import { DSKernel } from "../../../dsKernel";
import { DSProcess, DSProcessError } from "../../../dsProcess";
import { sleep } from "../../../lib/dsLib";
import { DSOptionParser } from "../../../lib/dsOptionParser";

export class PRSplash extends DSProcess {

    protected async main(): Promise<void> {
        const optparser = new DSOptionParser(
            this.procname,
            true,
            "   print the depsys splash screen",
            "<speed>"
        );

        let nextarg = optparser.parseWithUsageAndHelp(this.argv);

        var baud = 2000;
        if (nextarg != -1) {
            baud = parseFloat(this.argv[nextarg])
        }

        const inode = this.cwd.getfile("/etc/splashtext.txt")
        const text = await inode.contentAsText().read();

        await DSKernel.terminal.baudWrite("");
        DSKernel.terminal.reset();
        DSKernel.terminal.baud = baud;
        await DSKernel.terminal.baudWrite(text);
        DSKernel.terminal.baud = 0;

        await sleep(1500)
    }
}