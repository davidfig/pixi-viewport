import type { FederatedEvent } from '@pixi/events';
import type { Viewport } from '../Viewport';
export declare class Plugin {
    readonly parent: Viewport;
    paused: boolean;
    constructor(parent: Viewport);
    destroy(): void;
    down(_e: FederatedEvent): boolean;
    move(_e: FederatedEvent): boolean;
    up(_e: FederatedEvent): boolean;
    wheel(_e: WheelEvent): boolean | undefined;
    update(_delta: number): void;
    resize(): void;
    reset(): void;
    pause(): void;
    resume(): void;
}
