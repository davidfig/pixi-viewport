import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
export interface IClampZoomOptions {
    minWidth?: number | null;
    minHeight?: number | null;
    maxWidth?: number | null;
    maxHeight?: number | null;
    minScale?: number | null | IScale;
    maxScale?: number | null | IScale;
}
export declare class ClampZoom extends Plugin {
    readonly options: Required<IClampZoomOptions>;
    constructor(parent: Viewport, options?: {});
    resize(): void;
    clamp(): void;
    reset(): void;
}
export interface IScale {
    x: null | number;
    y: null | number;
}
