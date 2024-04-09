import { Plugin } from './Plugin';
import type { Point } from '@pixi/core';
import type { Viewport } from '../Viewport';
export interface ISnapZoomOptions {
    width?: number;
    height?: number;
    time?: number;
    ease?: any;
    center?: Point | null;
    interrupt?: boolean;
    removeOnComplete?: boolean;
    removeOnInterrupt?: boolean;
    forceStart?: boolean;
    noMove?: boolean;
}
export declare class SnapZoom extends Plugin {
    readonly options: Required<ISnapZoomOptions>;
    protected ease: any;
    protected xScale: number;
    protected yScale: number;
    protected xIndependent: boolean;
    protected yIndependent: boolean;
    protected snapping?: {
        time: number;
        startX: number;
        startY: number;
        deltaX: number;
        deltaY: number;
    } | null;
    constructor(parent: Viewport, options?: ISnapZoomOptions);
    private createSnapping;
    resize(): void;
    wheel(): boolean;
    down(): boolean;
    update(elapsed: number): void;
    resume(): void;
}
