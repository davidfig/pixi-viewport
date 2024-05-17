// https://github.com/pixijs/pixijs/issues/8957

declare namespace GlobalMixins
{
    type Viewport = import('./Viewport').Viewport;
    type PixiViewportClickedEvent = import('./types').ClickedEvent;
    type PixiViewportDragEvent = import('./types').DragEvent;
    type PixiViewportMovedEvent = import('./types').MovedEvent;
    type PixiViewportZoomedEvent = import('./types').ZoomedEvent;
    type PixiViewportWheelStartEvent = import('./types').WheelStartEvent;

    interface DisplayObjectEvents
    {
        clicked: [PixiViewportClickedEvent]
        'drag-start': [PixiViewportDragEvent],
        'drag-end': [PixiViewportDragEvent],
        moved: [PixiViewportMovedEvent],
        zoomed: [PixiViewportZoomedEvent],
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
        'wheel-start': [PixiViewportWheelStartEvent],
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
