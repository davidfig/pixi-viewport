import type { FederatedEvent } from '@pixi/events';
import type { Point } from '@pixi/math';
import type { Viewport } from './Viewport';
export declare type DragEvent = {
    event: FederatedEvent;
    screen: Point;
    world: Point;
    viewport: Viewport;
};
export declare type ClickedEvent = DragEvent;
export declare type MovedEvent = {
    viewport: Viewport;
    type: 'wheel' | 'pinch' | 'animate' | 'ensureVisible' | 'snap' | 'mouse-edges' | 'follow' | 'drag' | 'decelerate' | 'clamp-x' | 'clamp-y' | 'bounce-x' | 'bounce-y';
    original?: Point;
};
export declare type ZoomedEvent = {
    viewport: Viewport;
    type: 'wheel' | 'pinch' | 'animate' | 'ensureVisible' | 'clamp-zoom';
    center?: Point;
    original?: Point;
};
export declare type WheelStartEvent = {
    event: WheelEvent;
    viewport: Viewport;
};
export declare type Events = {
    wheel: [
        {
            event: FederatedEvent;
            screen: Point;
            world: Point;
            viewport: Viewport;
        }
    ];
};
