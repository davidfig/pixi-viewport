# pixi-viewport
A highly configurable viewport/2D camera designed to work with pixi.js

## Rationale
I wanted to improve my work on yy-viewport with a complete rewrite of a viewport/2D camera for use with pixi.js. I added options that I need in my games, including edges that bounce, deceleration, and highly configurable options to tweak the feel of the viewport. 

## Simple Example

    const Viewport = require('pixi-viewport')

    const container = new PIXI.Container()
    const viewport = new Viewport(container)

## Live Example
https://davidfig.github.io/pixi-viewport/

## Installation

    npm i pixi-viewport

## API Reference
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
