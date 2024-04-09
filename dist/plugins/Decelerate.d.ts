import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
import { MovedEvent } from '../types';
export interface IDecelerateOptions {
    friction?: number;
    bounce?: number;
    minSpeed?: number;
}
export interface IDecelerateSnapshot {
    x: number;
    y: number;
    time: number;
}
export declare class Decelerate extends Plugin {
    readonly options: Required<IDecelerateOptions>;
    x: number | null;
    y: number | null;
    percentChangeX: number;
    percentChangeY: number;
    protected saved: Array<IDecelerateSnapshot>;
    protected timeSinceRelease: number;
    constructor(parent: Viewport, options?: IDecelerateOptions);
    down(): boolean;
    isActive(): boolean;
    move(): boolean;
    protected handleMoved(e: MovedEvent): void;
    up(): boolean;
    activate(options: {
        x?: number;
        y?: number;
    }): void;
    update(elapsed: number): void;
    reset(): void;
}
