// https://github.com/pixijs/pixijs/issues/8957

declare namespace GlobalMixins
{
    type Viewport = import('./Viewport').Viewport;
    type PixiVieportClickedEvent = import('./types').ClickedEvent;
    type PixiVieportDragEvent = import('./types').DragEvent;
    type PixiVieportMovedEvent = import('./types').MovedEvent;
    type PixiVieportZoomedEvent = import('./types').ZoomedEvent;
    type PixiVieportWheelStartEvent = import('./types').WheelStartEvent;

    interface DisplayObjectEvents
    {
        clicked: [PixiVieportClickedEvent]
        'drag-start': [PixiVieportDragEvent],
        'drag-end': [PixiVieportDragEvent],
        moved: [PixiVieportMovedEvent],
        zoomed: [PixiVieportZoomedEvent],
        'pinch-start': [Viewport],
        'pinch-end': [Viewport],
        'snap-start': [Viewport],
        'snap-end': [Viewport],
        'snap-zoom-start': [Viewport],
        'snap-zoom-end': [Viewport],
        'bounce-x-start': [Viewport],
        'bounce-x-end': [Viewport],
        'bounce-y-start': [Viewport],
        'bounce-y-end': [Viewport],
        'wheel-start': [PixiVieportWheelStartEvent],
        'wheel-scroll': [Viewport],
        'animate-end': [Viewport],
        'mouse-edge-start': [Viewport],
        'mouse-edge-end': [Viewport],
        'moved-end': [Viewport],
        'zoomed-end': [Viewport],
        'frame-end': [Viewport],
        'plugin-remove': [string],
    }
}
