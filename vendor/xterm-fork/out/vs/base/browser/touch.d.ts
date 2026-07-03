import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
export declare namespace EventType {
    const Tap = "-xterm-gesturetap";
    const Change = "-xterm-gesturechange";
    const Start = "-xterm-gesturestart";
    const End = "-xterm-gesturesend";
    const Contextmenu = "-xterm-gesturecontextmenu";
}
export interface GestureEvent extends MouseEvent {
    initialTarget: EventTarget | undefined;
    translationX: number;
    translationY: number;
    pageX: number;
    pageY: number;
    tapCount: number;
}
export declare class Gesture extends Disposable {
    private static readonly SCROLL_FRICTION;
    private static INSTANCE;
    private static readonly HOLD_DELAY;
    private dispatched;
    private readonly targets;
    private readonly ignoreTargets;
    private handle;
    private readonly activeTouches;
    private _lastSetTapCountTime;
    private static readonly CLEAR_TAP_COUNT_TIME;
    private constructor();
    static addTarget(element: HTMLElement): IDisposable;
    static ignoreTarget(element: HTMLElement): IDisposable;
    static isTouchDevice(): boolean;
    dispose(): void;
    private onTouchStart;
    private onTouchEnd;
    private newGestureEvent;
    private dispatchEvent;
    private inertia;
    private onTouchMove;
}
//# sourceMappingURL=touch.d.ts.map