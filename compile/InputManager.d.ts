import { Point } from '@pixi/math';
import type { IPointData } from '@pixi/math';
import type { InteractionEvent } from '@pixi/interaction';
import type { Viewport } from './Viewport';
export interface IViewportTouch {
    id: number;
    last: IPointData | null;
}
export declare class InputManager {
    readonly viewport: Viewport;
    clickedAvailable?: boolean;
    isMouseDown?: boolean;
    last?: Point | null;
    wheelFunction?: (e: WheelEvent) => void;
    touches: IViewportTouch[];
    constructor(viewport: Viewport);
    private addListeners;
    destroy(): void;
    down(event: InteractionEvent): void;
    clear(): void;
    checkThreshold(change: number): boolean;
    move(event: InteractionEvent): void;
    up(event: InteractionEvent): void;
    getPointerPosition(event: WheelEvent): Point;
    handleWheel(event: WheelEvent): void;
    pause(): void;
    get(id: number): IViewportTouch | null;
    remove(id: number): void;
    count(): number;
}
