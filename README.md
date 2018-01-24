# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, mouse wheel zooming, decelerated dragging, follow target, snap to point, snap to zoom, clamping, bouncing on edges, and move on mouse edges. See live example to try out all of these features.

All features are configurable and removable, so set up the viewport to be exactly what you need.

## Rationale
I kept rewriting 2d cameras for the games I developed with pixi.js, so I decided to package up a generic one. I included options that I need in my games, including edges that bounce, deceleration, and lots of options to tweak the feel of the viewport. 

## Simple Example
```js
var PIXI = require('pixi.js');
var Viewport = require('pixi-viewport');

// create viewport
var viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000
});

// add the viewport to the stage
var app = new PIXI.Application();
document.body.appendChild(app.view);
app.stage.addChild(viewport);

// activate plugins
viewport
    .drag()
    .pinch()
    .decelerate();

// add a red box
var sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
sprite.tint = 0xff0000;
sprite.width = sprite.height = 100
sprite.position.set(100, 100);
```

## Live Example
[https://davidfig.github.io/pixi-viewport/](https://davidfig.github.io/pixi-viewport/)

## API Documentation
[https://davidfig.github.io/pixi-viewport/jsdoc/](https://davidfig.github.io/pixi-viewport/jsdoc/)

## Installation

    npm i pixi-viewport

## license  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
