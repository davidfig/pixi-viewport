import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
export interface IClampOptions {
    left?: number | boolean | null;
    top?: number | boolean | null;
    right?: number | boolean | null;
    bottom?: number | boolean | null;
    direction?: 'all' | 'x' | 'y' | null;
    underflow?: 'center' | string;
}
export declare class Clamp extends Plugin {
    readonly options: Required<IClampOptions>;
    protected last: {
        x: number | null;
        y: number | null;
        scaleX: number | null;
        scaleY: number | null;
    };
    protected noUnderflow: boolean;
    protected underflowX: -1 | 0 | 1;
    protected underflowY: -1 | 0 | 1;
    constructor(parent: Viewport, options?: IClampOptions);
    private parseUnderflow;
    move(): boolean;
    update(): void;
    reset(): void;
}
