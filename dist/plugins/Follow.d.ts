import { Plugin } from './Plugin';
import type { DisplayObject } from '@pixi/display';
import type { IPointData } from '@pixi/core';
import type { Viewport } from '../Viewport';
export interface IFollowOptions {
    speed?: number;
    acceleration?: number | null;
    radius?: number | null;
}
export declare class Follow extends Plugin {
    readonly options: Required<IFollowOptions>;
    target: DisplayObject;
    protected velocity: IPointData;
    constructor(parent: Viewport, target: DisplayObject, options?: IFollowOptions);
    update(elapsed: number): void;
}
