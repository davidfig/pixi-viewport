import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
export interface ISnapOptions {
    topLeft?: boolean;
    friction?: number;
    time?: number;
    ease?: any;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    forceStart?: boolean;
}
export declare class Snap extends Plugin {
    readonly options: Required<ISnapOptions>;
    ease?: any;
    x: number;
    y: number;
    protected percent?: number;
    protected snapping?: {
        time: number;
    } | null;
    protected deltaX?: number;
    protected deltaY?: number;
    protected startX?: number;
    protected startY?: number;
    constructor(parent: Viewport, x: number, y: number, options?: ISnapOptions);
    snapStart(): void;
    wheel(): boolean;
    down(): boolean;
    up(): boolean;
    update(elapsed: number): void;
}
