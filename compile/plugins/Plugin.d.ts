import type { InteractionEvent } from '@pixi/interaction';
import type { Viewport } from '../Viewport';
export declare class Plugin {
    readonly parent: Viewport;
    paused: boolean;
    constructor(parent: Viewport);
    destroy(): void;
    down(_e: InteractionEvent): boolean;
    move(_e: InteractionEvent): boolean;
    up(_e: InteractionEvent): boolean;
    wheel(_e: WheelEvent): boolean | undefined;
    update(_delta: number): void;
    resize(): void;
    reset(): void;
    pause(): void;
    resume(): void;
}
