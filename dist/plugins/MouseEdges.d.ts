import { Plugin } from './Plugin';
import type { Viewport } from '../Viewport';
import type { FederatedPointerEvent } from '@pixi/events';
export interface IMouseEdgesInsets {
    radius?: number | null;
    distance?: number | null;
    top?: number | null;
    bottom?: number | null;
    left?: number | null;
    right?: number | null;
}
export interface IMouseEdgesOptions extends IMouseEdgesInsets {
    speed?: number;
    reverse?: boolean;
    noDecelerate?: boolean;
    linear?: boolean;
    allowButtons?: boolean;
}
export declare class MouseEdges extends Plugin {
    readonly options: Readonly<Required<IMouseEdgesOptions>>;
    protected readonly reverse: -1 | 1;
    protected readonly radiusSquared: number | null;
    protected left: number | null;
    protected top: number | null;
    protected right: number | null;
    protected bottom: number | null;
    protected horizontal?: number | null;
    protected vertical?: number | null;
    constructor(parent: Viewport, options?: IMouseEdgesOptions);
    resize(): void;
    down(): boolean;
    move(event: FederatedPointerEvent): boolean;
    private decelerateHorizontal;
    private decelerateVertical;
    up(): boolean;
    update(): void;
}
