import { IPointData } from '@pixi/core';
import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
export interface IAnimateOptions {
    time?: number;
    position?: IPointData;
    width?: number;
    height?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    ease?: any;
    callbackOnComplete?: (viewport: Viewport) => void;
    removeOnInterrupt?: boolean;
}
export declare class Animate extends Plugin {
    readonly options: IAnimateOptions & {
        ease: any;
        time: number;
    };
    protected startX?: number;
    protected startY?: number;
    protected deltaX?: number;
    protected deltaY?: number;
    protected keepCenter: boolean;
    protected startWidth: number | null;
    protected startHeight: number | null;
    protected deltaWidth: number | null;
    protected deltaHeight: number | null;
    protected width: number | null;
    protected height: number | null;
    protected time: number;
    constructor(parent: Viewport, options?: IAnimateOptions);
    protected setupPosition(): void;
    protected setupZoom(): void;
    down(): boolean;
    complete(): void;
    update(elapsed: number): void;
}
