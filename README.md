# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js.

Features include dragging, pinch-to-zoom, mouse wheel zooming, decelerated dragging, follow target, snap to point, snap to zoom, clamping, bouncing on edges, and move on mouse edges. See live example to try out all of these features.

## Rationale
I wanted to improve my work on yy-viewport with a complete rewrite of a viewport/2D camera for use with pixi.js. I added options that I need in my games, including edges that bounce, deceleration, and highly configurable options to tweak the feel of the viewport. 

## Simple Example
```js
    var Viewport = require('pixi-viewport');

    var viewport = new Viewport( 
    {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: 1000,
        worldHeight: 1000
    });

    // activate plugins with the following plugins
    viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()
        .bounce();
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
