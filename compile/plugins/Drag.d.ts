import { Plugin } from './Plugin';
import type { InteractionEvent } from '@pixi/interaction';
import type { IPointData } from '@pixi/math';
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
    constructor(parent: Viewport, options?: {});
    protected handleKeyPresses(codes: string[]): void;
    protected mouseButtons(buttons: string): void;
    protected parseUnderflow(): void;
    protected checkButtons(event: InteractionEvent): boolean;
    protected checkKeyPress(event: InteractionEvent): boolean;
    down(event: InteractionEvent): boolean;
    get active(): boolean;
    move(event: InteractionEvent): boolean;
    up(event: InteractionEvent): boolean;
    wheel(event: WheelEvent): boolean;
    resume(): void;
    clamp(): void;
}
