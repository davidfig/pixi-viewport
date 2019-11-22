import * as PIXI from 'pixi.js'
import { Plugin } from './plugin'
import ease from '../ease'

/**
 * @typedef {options} BounceOptions
 * @property {string} [sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
 * @property {number} [friction=0.5] friction to apply to decelerate if active
 * @property {number} [time=150] time in ms to finish bounce
 * @property {object} [bounceBox] use this bounceBox instead of (0, 0, viewport.worldWidth, viewport.worldHeight)
 * @property {number} [bounceBox.x=0]
 * @property {number} [bounceBox.y=0]
 * @property {number} [bounceBox.width=viewport.worldWidth]
 * @property {number} [bounceBox.height=viewport.worldHeight]
 * @property {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {string} [underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
 */

const bounceOptions = {
    sides: 'all',
    friction: 0.5,
    time: 150,
    ease: 'easeInOutSine',
    underflow: 'center',
    bounceBox: null
}

export class Bounce extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {BounceOptions} [options]
     * @fires bounce-start-x
     * @fires bounce.end-x
     * @fires bounce-start-y
     * @fires bounce-end-y
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, bounceOptions, options)
        this.ease = ease(this.options.ease, 'easeInOutSine')
        if (this.options.sides)
        {
            if (this.options.sides === 'all')
            {
                this.top = this.bottom = this.left = this.right = true
            }
            else if (this.options.sides === 'horizontal')
            {
                this.right = this.left = true
            }
            else if (this.options.sides === 'vertical')
            {
                this.top = this.bottom = true
            }
            else
            {
                this.top = this.options.sides.indexOf('top') !== -1
                this.bottom = this.options.sides.indexOf('bottom') !== -1
                this.left = this.options.sides.indexOf('left') !== -1
                this.right = this.options.sides.indexOf('right') !== -1
            }
        }
        this.parseUnderflow()
        this.last = {}
        this.reset()
    }

    parseUnderflow()
    {
        const clamp = this.options.underflow.toLowerCase()
        if (clamp === 'center')
        {
            this.underflowX = 0
            this.underflowY = 0
        }
        else
        {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0
        }
    }

    isActive()
    {
        return this.toX !== null || this.toY !== null
    }

    down()
    {
        this.toX = this.toY = null
    }

    up()
    {
        this.bounce()
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }

        this.bounce()
        if (this.toX)
        {
            const toX = this.toX
            toX.time += elapsed
            this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' })
            if (toX.time >= this.options.time)
            {
                this.parent.x = toX.end
                this.toX = null
                this.parent.emit('bounce-x-end', this.parent)
            }
            else
            {
                this.parent.x = this.ease(toX.time, toX.start, toX.delta, this.options.time)
            }
        }
        if (this.toY)
        {
            const toY = this.toY
            toY.time += elapsed
            this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' })
            if (toY.time >= this.options.time)
            {
                this.parent.y = toY.end
                this.toY = null
                this.parent.emit('bounce-y-end', this.parent)
            }
            else
            {
                this.parent.y = this.ease(toY.time, toY.start, toY.delta, this.options.time)
            }
        }
    }

    calcUnderflowX()
    {
        let x
        switch (this.underflowX)
        {
            case -1:
                x = 0
                break
            case 1:
                x = (this.parent.screenWidth - this.parent.screenWorldWidth)
                break
            default:
                x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
        }
        return x
    }

    calcUnderflowY()
    {
        let y
        switch (this.underflowY)
        {
            case -1:
                y = 0
                break
            case 1:
                y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                break
            default:
                y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
        }
        return y
    }

    oob()
    {
        const box = this.options.bounceBox
        if (box) {
            const x1 = typeof box.x === 'undefined' ? 0 : box.x
            const y1 = typeof box.y === 'undefined' ? 0 : box.y
            const width = typeof box.width === 'undefined' ? this.parent.worldWidth : box.width
            const height = typeof box.height === 'undefined' ? this.parent.worldHeight : box.height
            return {
                left: this.parent.left < x1,
                right: this.parent.right > width,
                top: this.parent.top < y1,
                bottom: this.parent.bottom > height,
                topLeft: new PIXI.Point(
                    x1 * this.parent.scale.x,
                    y1 * this.parent.scale.y
                ),
                bottomRight: new PIXI.Point(
                    width * this.parent.scale.x - this.parent.screenWidth,
                    height * this.parent.scale.y - this.parent.screenHeight
                )
            }
        }
        return {
            left: this.parent.left < 0,
            right: this.parent.right > this.parent.worldWidth,
            top: this.parent.top < 0,
            bottom: this.parent.bottom > this.parent.worldHeight,
            topLeft: new PIXI.Point(0, 0),
            bottomRight: new PIXI.Point(
                this.parent.worldWidth * this.parent.scale.x - this.parent.screenWidth,
                this.parent.worldHeight * this.parent.scale.y - this.parent.screenHeight
            )
        }
    }

    bounce()
    {
        if (this.paused)
        {
            return
        }

        let oob
        let decelerate = this.parent.plugins.get('decelerate')
        if (decelerate && (decelerate.x || decelerate.y))
        {
            if ((decelerate.x && decelerate.percentChangeX === decelerate.options.friction) || (decelerate.y && decelerate.percentChangeY === decelerate.options.friction))
            {
                oob = this.oob()
                if ((oob.left && this.left) || (oob.right && this.right))
                {
                    decelerate.percentChangeX = this.options.friction
                }
                if ((oob.top && this.top) || (oob.bottom && this.bottom))
                {
                    decelerate.percentChangeY = this.options.friction
                }
            }
        }
        const drag = this.parent.plugins.get('drag') || {}
        const pinch = this.parent.plugins.get('pinch') || {}
        decelerate = decelerate || {}
        if (!drag.active && !pinch.active && ((!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)))
        {
            oob = oob || this.oob()
            const topLeft = oob.topLeft
            const bottomRight = oob.bottomRight
            if (!this.toX && !decelerate.x)
            {
                let x = null
                if (oob.left && this.left)
                {
                    x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -topLeft.x
                }
                else if (oob.right && this.right)
                {
                    x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -bottomRight.x
                }
                if (x !== null && this.parent.x !== x)
                {
                    this.toX = { time: 0, start: this.parent.x, delta: x - this.parent.x, end: x }
                    this.parent.emit('bounce-x-start', this.parent)
                }
            }
            if (!this.toY && !decelerate.y)
            {
                let y = null
                if (oob.top && this.top)
                {
                    y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -topLeft.y
                }
                else if (oob.bottom && this.bottom)
                {
                    y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -bottomRight.y
                }
                if (y !== null && this.parent.y !== y)
                {
                    this.toY = { time: 0, start: this.parent.y, delta: y - this.parent.y, end: y }
                    this.parent.emit('bounce-y-start', this.parent)
                }
            }
        }
    }

    reset()
    {
        this.toX = this.toY = null
        this.bounce()
    }
}