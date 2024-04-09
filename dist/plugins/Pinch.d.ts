import { Plugin } from './Plugin';
import { Point } from '@pixi/core';
import type { IPointData } from '@pixi/core';
import type { FederatedPointerEvent } from '@pixi/events';
import type { Viewport } from '../Viewport';
export interface IPinchOptions {
    noDrag?: boolean;
    percent?: number;
    factor?: number;
    center?: Point | null;
    axis?: 'all' | 'x' | 'y';
}
export declare class Pinch extends Plugin {
    readonly options: Required<IPinchOptions>;
    active: boolean;
    pinching: boolean;
    protected moved: boolean;
    protected lastCenter?: IPointData | null;
    constructor(parent: Viewport, options?: IPinchOptions);
    down(): boolean;
    isAxisX(): boolean;
    isAxisY(): boolean;
    move(e: FederatedPointerEvent): boolean;
    up(): boolean;
}
