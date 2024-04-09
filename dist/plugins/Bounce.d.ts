import { Rectangle } from '@pixi/core';
import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
export interface IBounceOptions {
    sides?: 'all' | 'horizontal' | 'vertical' | string;
    friction?: number;
    time?: number;
    bounceBox?: Rectangle | null;
    ease?: any;
    underflow?: 'center' | string;
}
export interface IBounceState {
    time: number;
    start: number;
    delta: number;
    end: number;
}
export declare class Bounce extends Plugin {
    readonly options: Readonly<Required<IBounceOptions>>;
    readonly left: boolean;
    readonly top: boolean;
    readonly right: boolean;
    readonly bottom: boolean;
    readonly underflowX: -1 | 0 | 1;
    readonly underflowY: -1 | 0 | 1;
    protected ease: any;
    protected toX: IBounceState | null;
    protected toY: IBounceState | null;
    constructor(parent: Viewport, options?: IBounceOptions);
    isActive(): boolean;
    down(): boolean;
    up(): boolean;
    update(elapsed: number): void;
    protected calcUnderflowX(): number;
    protected calcUnderflowY(): number;
    private oob;
    bounce(): void;
    reset(): void;
}
