export interface ISelectionRedrawRequestEvent {
    start: [number, number] | undefined;
    end: [number, number] | undefined;
    columnSelectMode: boolean;
}
export interface ISelectionRequestScrollLinesEvent {
    amount: number;
    suppressScrollEvent: boolean;
}
//# sourceMappingURL=Types.d.ts.map