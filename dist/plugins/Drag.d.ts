import { Plugin } from './Plugin';
import type { FederatedPointerEvent } from '@pixi/events';
import type { IPointData } from '@pixi/core';
import type { Viewport } from '../Viewport';
export interface IDragOptions {
    direction?: string;
    pressDrag?: boolean;
    wheel?: boolean;
    wheelScroll?: number;
    reverse?: boolean;
    clampWheel?: boolean | string;
    underflow?: string;
    factor?: number;
    mouseButtons?: 'all' | string;
    keyToPress?: string[] | null;
    ignoreKeyToPressOnTouch?: boolean;
    lineHeight?: number;
    wheelSwapAxes?: boolean;
}
export declare class Drag extends Plugin {
    readonly options: Readonly<Required<IDragOptions>>;
    protected moved: boolean;
    protected reverse: 1 | -1;
    protected xDirection: boolean;
    protected yDirection: boolean;
    protected keyIsPressed: boolean;
    protected mouse: [boolean, boolean, boolean];
    protected underflowX: -1 | 0 | 1;
    protected underflowY: -1 | 0 | 1;
    protected last?: IPointData | null;
    protected current?: number;
    private windowEventHandlers;
    constructor(parent: Viewport, options?: {});
    protected handleKeyPresses(codes: string[]): void;
    private addWindowEventHandler;
    destroy(): void;
    protected mouseButtons(buttons: string): void;
    protected parseUnderflow(): void;
    protected checkButtons(event: FederatedPointerEvent): boolean;
    protected checkKeyPress(event: FederatedPointerEvent): boolean;
    down(event: FederatedPointerEvent): boolean;
    get active(): boolean;
    move(event: FederatedPointerEvent): boolean;
    up(event: FederatedPointerEvent): boolean;
    wheel(event: WheelEvent): boolean;
    resume(): void;
    clamp(): void;
}
