import { IBuffer } from 'common/buffer/Types';
import { CoreTerminal } from 'common/CoreTerminal';
import { IMarker, ITerminalOptions } from 'common/Types';
import { Event } from 'vs/base/common/event';
export declare class Terminal extends CoreTerminal {
    private readonly _onBell;
    readonly onBell: Event<void>;
    private readonly _onCursorMove;
    readonly onCursorMove: Event<void>;
    private readonly _onTitleChange;
    readonly onTitleChange: Event<string>;
    private readonly _onA11yCharEmitter;
    readonly onA11yChar: Event<string>;
    private readonly _onA11yTabEmitter;
    readonly onA11yTab: Event<number>;
    constructor(options?: ITerminalOptions);
    get buffer(): IBuffer;
    get markers(): IMarker[];
    addMarker(cursorYOffset: number): IMarker | undefined;
    bell(): void;
    input(data: string, wasUserInput?: boolean): void;
    resize(x: number, y: number): void;
    clear(): void;
    reset(): void;
}
//# sourceMappingURL=Terminal.d.ts.map