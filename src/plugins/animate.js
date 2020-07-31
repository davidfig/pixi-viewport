import * as PIXI from 'pixi.js'
import { Plugin } from './plugin'
import ease from '../ease'

/**
 * To set the zoom level, use: (1) scale, (2) scaleX and scaleY, (3) width and/or height
 * @typedef {options} AnimateOptions
 * @property {number} [time=1000] to animate
 * @property {PIXI.Point} [position=viewport.center] position to move viewport
 * @property {number} [width] desired viewport width in world pixels (use instead of scale; aspect ratio is maintained if height is not provided)
 * @property {number} [height] desired viewport height in world pixels (use instead of scale; aspect ratio is maintained if width is not provided)
 * @property {number} [scale] scale to change zoom (scale.x = scale.y)
 * @property {number} [scaleX] independently change zoom in x-direction
 * @property {number} [scaleY] independently change zoom in y-direction
 * @property {(function|string)} [ease=linear] easing function to use
 * @property {function} [callbackOnComplete]
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 */

const animateOptions = {
    removeOnInterrupt: false,
    ease: 'linear',
    time: 1000
}

export class Animate extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {AnimateOptions} [options]
     * @fires animate-end
     */
    constructor(parent, options={})
    {
        super(parent)
        this.options = Object.assign({}, animateOptions, options)
        this.options.ease = ease(this.options.ease)
        this.setupPosition()
        this.setupZoom()
    }

    setupPosition()
    {
        if (typeof this.options.position !== 'undefined')
        {
            this.startX = this.parent.center.x
            this.startY = this.parent.center.y
            this.deltaX = this.options.position.x - this.parent.center.x
            this.deltaY = this.options.position.y - this.parent.center.y
            this.keepCenter = false
        }
        else
        {
            this.keepCenter = true
        }
    }

    setupZoom()
    {
        this.width = null
        this.height = null
        if (typeof this.options.scale !== 'undefined')
        {
            this.width = this.parent.screenWidth / this.options.scale
        }
        else if (typeof this.options.scaleX !== 'undefined' || typeof this.options.scaleY !== 'undefined')
        {
            if (typeof this.options.scaleX !== 'undefined')
            {
                // screenSizeInWorldPixels = screenWidth / scale
                this.width = this.parent.screenWidth / this.options.scaleX
            }
            if (typeof this.options.scaleY !== 'undefined')
            {
                this.height = this.parent.screenHeight / this.options.scaleY
            }
        }
        else
        {
            if (typeof this.options.width !== 'undefined')
            {
                this.width = this.options.width
            }
            if (typeof this.options.height !== 'undefined')
            {
                this.height = this.options.height
            }
        }
        if (typeof this.width !== null)
        {
            this.startWidth = this.parent.screenWidthInWorldPixels
            this.deltaWidth = this.width - this.startWidth
        }
        if (typeof this.height !== null)
        {
            this.startHeight = this.parent.screenHeightInWorldPixels
            this.deltaHeight = this.height - this.startHeight
        }
        this.time = 0
    }

    down()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('animate')
        }
    }

    complete()
    {
        this.parent.plugins.remove('animate')
        if (this.width !== null)
        {
            this.parent.fitWidth(this.width, this.keepCenter, this.height === null)
        }
        if (this.height !== null)
        {
            this.parent.fitHeight(this.height, this.keepCenter, this.width === null)
        }
        if (!this.keepCenter)
        {
            this.parent.moveCenter(this.options.position.x, this.options.position.y)
        }
        this.parent.emit('animate-end', this.parent)
        if (this.options.callbackOnComplete)
        {
            this.options.callbackOnComplete(this.parent)
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }
        this.time += elapsed
        if (this.time >= this.options.time)
        {
            this.complete()
        }
        else
        {
            const percent = this.options.ease(this.time, 0, 1, this.options.time)
            if (this.width !== null)
            {
                this.parent.fitWidth(this.startWidth + this.deltaWidth * percent, this.keepCenter, this.height === null)
            }
            if (this.height !== null)
            {
                this.parent.fitHeight(this.startHeight + this.deltaHeight * percent, this.keepCenter, this.width === null)
            }
            if (this.width === null)
            {
                this.parent.scale.x = this.parent.scale.y
            }
            else if (this.height === null)
            {
                this.parent.scale.y = this.parent.scale.x
            }
            if (!this.keepCenter)
            {
                this.parent.moveCenter(this.startX + this.deltaX * percent, this.startY + this.deltaY * percent)
            }
        }
    }
}