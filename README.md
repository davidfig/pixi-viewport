# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js

## Rationale
I wanted to improve my work on yy-viewport with a complete rewrite of a viewport/2D camera for use with pixi.js. I added options that I need in my games, including edges that bounce, deceleration, and highly configurable options to tweak the feel of the viewport. 

## Example

    const ForkMe = require('fork-me-github')
    ForkMe('https://github.com/davidfig/pixi-viewport/)

## Live Example
https://davidfig.github.io/pixi-viewport/

## Installation

    npm i pixi-viewport

## API Reference
```
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {PIXI.Rectangle} worldBoundaries - only needed for options.noOverDrag or options.bounce
     * @param {object} [options]
     * @param {boolean} [options.dragToMove]
     * @param {boolean} [options.pinchToZoom] automatically turns on dragToMove
     * @param {boolean} [options.noOverDrag] stops scroll beyond boundaries
     * @param {boolean} [options.bounce] bounce back if pulled beyond boundaries
     * @param {number} [options.bounceTime=150] number is milliseconds to bounce back
     * @param {string} [options.bounceEase] easing function to use when bouncing (see https://github.com/bcherny/penner)
     * @param {boolean} [options.decelerate] decelerate after scrolling
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounceFriction=0.5] percent to decelerate after movement while inside a bounce
     * @param {number} [options.minVelocity=0.01] minimum velocity before stopping deceleration
     * @param {boolean} [options.noUpdate] turn off internal calls to requestAnimationFrame() -- update() must be called manually on each loop
     */
    constructor(container, screenWidth, screenHeight, worldBoundaries, options)
```
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
