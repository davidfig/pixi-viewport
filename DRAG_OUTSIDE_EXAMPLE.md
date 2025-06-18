# dragOutside Feature Example

The `dragOutside` option allows dragging to continue even when the mouse/pointer leaves the canvas or browser window.

## Basic Usage

```javascript
import { Viewport } from 'pixi-viewport';

const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 2000,
    worldHeight: 2000,
    events: app.renderer.events
});

// Enable dragOutside
viewport.drag({ 
    dragOutside: true 
});
```

## Options

```javascript
viewport.drag({
    dragOutside: true,     // Enable dragging outside canvas (default: false)
    clampWheel: false,     // Other options work as usual
    mouseButtons: 'all'    // Still respects button configuration
});
```

## How it Works

When `dragOutside: true` is enabled:

1. **Normal behavior inside canvas**: Works exactly like before
2. **Outside canvas**: Uses document-level event listeners to track mouse movement
3. **Cross-window dragging**: Continues panning even when mouse leaves browser window
4. **Proper cleanup**: Automatically removes document listeners when drag ends

## Benefits

- **Better UX**: No more frustrating drag interruptions
- **Small canvases**: Enables large mouse movements for fine control
- **Interactive overlays**: Doesn't stop when mouse moves over UI elements
- **Backward compatible**: Default `false` maintains existing behavior

## Demo

The development server demo at `http://localhost:5175` shows `dragOutside` in action.
Look for the green indicator in the top-right corner!

## Browser Support

Works in all modern browsers that support pointer events (IE11+, all evergreen browsers).