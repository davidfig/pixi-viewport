import { Plugin } from './Plugin';
import { IPointData, Point } from '@pixi/math';
import type { Viewport } from '../Viewport';
export interface IWheelOptions {
    percent?: number;
    smooth?: false | number;
    interrupt?: boolean;
    reverse?: boolean;
    center?: Point | null;
    lineHeight?: number;
    axis?: 'all' | 'x' | 'y';
}
export declare class Wheel extends Plugin {
    readonly options: Required<IWheelOptions>;
    protected smoothing?: IPointData | null;
    protected smoothingCenter?: Point | null;
    protected smoothingCount?: number;
    constructor(parent: Viewport, options?: IWheelOptions);
    down(): boolean;
    protected isAxisX(): boolean;
    protected isAxisY(): boolean;
    update(): void;
    wheel(e: WheelEvent): boolean | undefined;
}
