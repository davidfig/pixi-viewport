(function () {
    'use strict';

    function randomInt(n) {
        return Math.floor(Math.random() * n)
    }

    function randomFloat(n) {
        return Math.random() * n
    }

    function range(start, end, useFloat = false) {
        // case where there is no range
        if (end === start) {
            return end
        }

        if (useFloat) {
            return randomFloat(end - start) + start
        } else {
            let range;
            if (start < 0 && end > 0) {
                range = -start + end + 1;
            } else if (start === 0 && end > 0) {
                range = end + 1;
            } else if (start < 0 && end === 0) {
                range = start - 1;
                start = 1;
            } else if (start < 0 && end < 0) {
                range = end - start - 1;
            } else {
                range = end - start + 1;
            }
            return randomInt(range) + start
        }
    }

    function overlap(x, y, viewport, starSize) {
        const size = starSize;
        for (const child of viewport.children) {
            if (x < child.x + size &&
                x + size > child.x &&
                y < child.y + size &&
                y + size > child.y) {
                return true
            }
        }
        return false
    }

    function stars(viewport, starSize, border) {
        const stars = (viewport.worldWidth * viewport.worldHeight) / Math.pow(starSize, 2) * 0.1;
        for (let i = 0; i < stars; i++) {
            const star = new PIXI.Sprite(PIXI.Texture.WHITE);
            star.anchor.set(0.5);
            star.tint = randomInt(0xffffff);
            star.width = star.height = starSize;
            star.alpha = range(0.25, 1, true);
            let x, y;
            do {
                x = range(starSize / 2 + border, viewport.worldWidth - starSize - border);
                y = range(border, viewport.worldHeight - border - starSize);
            } while (overlap(x, y, viewport, starSize))
            star.position.set(x, y);
            viewport.addChild(star);
        }
    }

    const SIZE = 40;
    const SPEED = 3;

    const target = new PIXI.Sprite(PIXI.Texture.WHITE);

    let _viewport, _active;

    function setup(viewport) {
        viewport.addChild(target);
        target.tint = 0;
        target.width = target.height = SIZE;
        target.anchor.set(0.5);
        target.position.set(viewport.worldWidth / 2, viewport.worldHeight / 2);
        _viewport = viewport;
        changeTarget();
    }

    function changeTarget() {
        const x = range(SIZE / 2, _viewport.worldWidth - SIZE / 2);
        const y = range(SIZE / 2, _viewport.worldHeight - SIZE / 2);
        Math.atan2(y - target.y, x - target.x);
        Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)) / (SPEED * 60 / 1000);
    }

    function isDirty() {
        return _active
    }

    // import { Viewport } from 'pixi-viewport' // use with modern build toolchain

    const WORLD_WIDTH = 2000;
    const WORLD_HEIGHT = 2000;
    const STAR_SIZE = 30;
    const BORDER = 10;

    // INSTRUCTIONS
    // see https://davidfig.github.io/pixi-viewport/jsdoc/ for full API documentation
    // uncomment out the plugins or change options to experiment with how the viewport works
    let viewport;

    function create(renderer) {
        // create the viewport
        // viewport = new Viewport({    // use with modern build toolchain
        viewport = new pixi_viewport.Viewport({
            // screenWidth: window.innerWidth,              // screen width used by viewport (eg, size of canvas)
            // screenHeight: window.innerHeight,            // screen height used by viewport (eg, size of canvas)
            worldWidth: WORLD_WIDTH,                        // world width used by viewport (automatically calculated based on container width)
            worldHeight: WORLD_HEIGHT,                      // world height used by viewport (automatically calculated based on container height)
            // threshold: 5,                                // number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
            passiveWheel: false,                            // whether the 'wheel' event is set to passive (note: if false, e.preventDefault() will be called when wheel is used over the viewport)
            // stopPropagation: false,                      // whether to stopPropagation of events that impact the viewport (except wheel events, see options.passiveWheel)
            // forceHitArea: null,                          // change the default hitArea from world size to a new value
            // noTicker: false,                             // set this if you want to manually call update() function on each frame
            // ticker: PIXI.Ticker.shared,                  // use this PIXI.ticker for updates
            interaction: renderer.plugins.interaction,   // InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer position relative to canvas location on screen
            // divWheel: null,                              // div to attach the wheel event (uses document.body as default)
            // disableOnContextMenu: false,                 // remove oncontextmenu=() => {} from the divWheel element
        });

        viewport
            .drag({
                // direction: 'all',                // (x, y, or all) direction to drag
                // pressDrag: true,                 // whether click to drag is active
                // wheel: true,                     // use wheel to scroll in direction (unless wheel plugin is active)
                // wheelScroll: 1,                  // number of pixels to scroll with each wheel spin
                // reverse: false,                  // reverse the direction of the wheel scroll
                // clampWheel: false,               // clamp wheel (to avoid weird bounce with mouse wheel)
                // underflow: 'center',             // (top-left, top-center, etc.) where to place world if too small for screen
                // factor: 1,                       // factor to multiply drag to increase the speed of movement
                // mouseButtons: 'all',             // changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'; you may want to set viewport.options.disableOnContextMenu if you want to use right-click dragging
                // keyToPress: null,                // array containing https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code codes of keys that can be pressed for the drag to be triggered, e.g.: ['ShiftLeft', 'ShiftRight'}
                // ignoreKeyToPressOnTouch: false,  // ignore keyToPress for touch events
                // lineHeight: 20,                  // scaling factor for non-DOM_DELTA_PIXEL scrolling events (used for firefox mouse scrolling)
            })
            .decelerate({
                // friction: 0.95,              // percent to decelerate after movement
                // bounce: 0.8,                 // percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
                // minSpeed: 0.01,              // minimum velocity before stopping/reversing acceleration
            })
            .pinch({
                // noDrag: false,               // disable two-finger dragging
                // percent: 1,                  // percent to modify pinch speed
                // factor: 1,                   // factor to multiply two-finger drag to increase the speed of movement
                // center: null,                // place this point at center during zoom instead of center of two fingers
                // axis: 'all',                 // axis to zoom
            })
            .wheel({
                // percent: 0.1,                // smooth the zooming by providing the number of frames to zoom between wheel spins
                // interrupt: true,             // stop smoothing with any user input on the viewport
                // reverse: false,              // reverse the direction of the scroll
                // center: null,                // place this point at center during zoom instead of current mouse position
                // lineHeight: 20,	            // scaling factor for non-DOM_DELTA_PIXEL scrolling events
                // axis: 'all',                 // axis to zoom
            });

        // viewport.bounce({
        //     sides: 'all',                // all, horizontal, vertical, or combination of top, bottom, right, left(e.g., 'top-bottom-right')
        //     friction: 0.5,               // friction to apply to decelerate if active
        //     time: 150,                   // time in ms to finish bounce
        //     bounceBox: null,             // use this bounceBox instead of { x: 0, y: 0, width: viewport.worldWidth, height: viewport.worldHeight }
        //     ease: 'easeInOutSine',       // ease function or name (see http://easings.net/ for supported names)
        //     underflow: 'center',         // (top/bottom/center and left/right/center, or center) where to place world if too small for screen
        // })

        // viewport.animate({
        //     time: 1000,                     // time to animate
        //     position: null,                 // position to move viewport
        //     width: null,                    // desired viewport width in world pixels (use instead of scale; aspect ratio is maintained if height is not provided)
        //     height: null,                   // desired viewport height in world pixels(use instead of scale; aspect ratio is maintained if width is not provided)
        //     scale: null,                    // scale to change zoom(scale.x = scale.y)
        //     scaleX: null,                   // independently change zoom in x - direction
        //     scaleY: null,                   // independently change zoom in y - direction
        //     ease: 'linear',                 // easing function to use
        //     callbackOnComplete: null,       // callback when animate is complete
        //     removeOnInterrupt: false,	   // removes this plugin if interrupted by any user input
        // })

        // viewport.clamp({
        //     left: false,                // whether to clamp to the left and at what value
        //     right: false,               // whether to clamp to the right and at what value
        //     top: false,                 // whether to clamp to the top and at what value
        //     bottom: false,              // whether to clamp to the bottom and at what value
        //     direction: 'all',           // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
        //     underflow: 'center',	       // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
        // })

        // viewport.clampZoom({
        //     minWidth: null,                 // minimum width
        //     minHeight: null,                // minimum height
        //     maxWidth: null,                 // maximum width
        //     maxHeight: null,                // maximum height
        //     minScale: null,                 // minimum scale
        //     maxScale: null,                 // minimum scale
        // })

        // target.start()  // starts the target moving
        // viewport.follow(target.get(), {
        //     speed: 0,           // speed to follow in pixels/frame (0=teleport to location)
        //     acceleration: null, // set acceleration to accelerate and decelerate at this rate; speed cannot be 0 to use acceleration
        //     radius: null,       // radius (in world coordinates) of center circle where movement is allowed without moving the viewport
        // })

        // viewport.mouseEdges({
        //     radius: null,           // distance from center of screen in screen pixels
        //     distance: 20,           // distance from all sides in screen pixels
        //     top: null,              // alternatively, set top distance (leave unset for no top scroll)
        //     bottom: null,           // alternatively, set bottom distance (leave unset for no top scroll)
        //     left: null,             // alternatively, set left distance (leave unset for no top scroll)
        //     right: null,            // alternatively, set right distance (leave unset for no top scroll)
        //     speed: 8,               // speed in pixels/frame to scroll viewport
        //     reverse: false,         // reverse direction of scroll
        //     noDecelerate: false,    // don't use decelerate plugin even if it's installed
        //     linear: false,          // if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
        //     allowButtons: false,    // allows plugin to continue working even when there's a mousedown event
        // })

        // viewport.snap({
        //     topLeft: false,             // snap to the top-left of viewport instead of center
        //     friction: 0.8,              // friction/frame to apply if decelerate is active
        //     time: 1000,                 // time for snapping in ms
        //     ease: 'easeInOutSine',      // ease function or name (see http://easings.net/ for supported names)
        //     interrupt: true,            // pause snapping with any user input on the viewport
        //     removeOnComplete: false,    // removes this plugin after snapping is complete
        //     removeOnInterrupt: false,   // removes this plugin if interrupted by any user input
        //     forceStart: false,          // starts the snap immediately regardless of whether the viewport is at the desired location
        // })

        // viewport.snapZoom({
        //     width: 0,                   // the desired width to snap (to maintain aspect ratio, choose only width or height)
        //     height: 0,                  // the desired height to snap(to maintain aspect ratio, choose only width or height)
        //     time: 1000,                 // time for snapping in ms
        //     ease: 'easeInOutSine',      // ease function or name(see http://easings.net/ for supported names)
        //     center: null,               // place this point at center during zoom instead of center of the viewport
        //     interrupt: true,            // pause snapping with any user input on the viewport
        //     removeOnComplete: false,    // removes this plugin after snapping is complete
        //     removeOnInterrupt: false,   // removes this plugin if interrupted by any user input
        //     forceStart: false,          // starts the snap immediately regardless of whether the viewport is at the desired zoom
        //     noMove: false,              // zoom but do not move
        // })

        // create elements
        stars(viewport, STAR_SIZE, BORDER);
        setup(viewport);
        border(viewport);

        // fit and center the world into the panel
        viewport.fit();
        viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    }

    function border(viewport) {
        const line = viewport.addChild(new PIXI.Graphics());
        line.lineStyle(10, 0xff0000).drawRect(0, 0, viewport.worldWidth, viewport.worldHeight);
    }

    function get() {
        return viewport
    }

    // import * as PIXI from 'pixi.js'  // use with modern build toolchain

    let renderer;

    function createRenderer() {
        renderer = new PIXI.Renderer({
            backgroundAlpha: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: window.devicePixelRatio,
            antialias: true,
        });
        document.body.appendChild(renderer.view);
        renderer.view.style.position = 'fixed';
        renderer.view.style.width = '100vw';
        renderer.view.style.height = '100vh';
        renderer.view.style.top = 0;
        renderer.view.style.left = 0;
        renderer.view.style.background = 'rgba(0,0,0,.1)';
    }

    function start() {
        createRenderer();
        create(renderer);
        window.onresize = () => {
            renderer.resize(window.innerWidth, window.innerHeight);
            get().resize(window.innerWidth, window.innerHeight);
        };
        update();
    }

    function update() {
        const vp = get();
        if (vp.dirty || isDirty()) {
            renderer.render(vp);
            vp.dirty = false;
        }
        requestAnimationFrame(() => update());
    }

    window.onload = start;

})();
//# sourceMappingURL=index.js.map
