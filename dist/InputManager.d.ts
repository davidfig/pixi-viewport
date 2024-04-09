import { Point } from '@pixi/core';
import type { IPointData } from '@pixi/core';
import type { FederatedPointerEvent } from '@pixi/events';
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
    down(event: FederatedPointerEvent): void;
    clear(): void;
    checkThreshold(change: number): boolean;
    move(event: FederatedPointerEvent): void;
    up(event: FederatedPointerEvent): void;
    getPointerPosition(event: WheelEvent): Point;
    handleWheel(event: WheelEvent): void;
    pause(): void;
    get(id: number): IViewportTouch | null;
    remove(id: number): void;
    count(): number;
}
