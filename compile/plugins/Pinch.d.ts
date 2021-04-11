import { Plugin } from './Plugin';
import { Point } from '@pixi/math';
import type { IPointData } from '@pixi/math';
import type { InteractionEvent } from '@pixi/interaction';
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
    move(e: InteractionEvent): boolean;
    up(): boolean;
}
