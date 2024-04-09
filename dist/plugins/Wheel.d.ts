import { Plugin } from './Plugin';
import { IPointData, Point } from '@pixi/core';
import type { Viewport } from '../Viewport';
export interface IWheelOptions {
    percent?: number;
    smooth?: false | number;
    interrupt?: boolean;
    reverse?: boolean;
    center?: Point | null;
    lineHeight?: number;
    axis?: 'all' | 'x' | 'y';
    keyToPress?: string[] | null;
    trackpadPinch?: boolean;
    wheelZoom?: boolean;
}
export declare class Wheel extends Plugin {
    readonly options: Required<IWheelOptions>;
    protected smoothing?: IPointData | null;
    protected smoothingCenter?: Point | null;
    protected smoothingCount?: number;
    protected keyIsPressed: boolean;
    constructor(parent: Viewport, options?: IWheelOptions);
    protected handleKeyPresses(codes: string[]): void;
    protected checkKeyPress(): boolean;
    down(): boolean;
    protected isAxisX(): boolean;
    protected isAxisY(): boolean;
    update(): void;
    private pinch;
    wheel(e: WheelEvent): boolean;
}
