import * as PIXI from 'pixi.js'

import * as utils from './utils'
import { Plugin } from './plugin'

export class Drag extends Plugin
{
    /**
     * enable one-finger touch to drag
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.direction=all] direction to drag (all, x, or y)
     * @param {boolean} [options.wheel=true] use wheel to scroll in y direction (unless wheel plugin is active)
     * @param {number} [options.wheelScroll=1] number of pixels to scroll with each wheel spin
     * @param {boolean} [options.reverse] reverse the direction of the wheel scroll
     * @param {boolean|string} [options.clampWheel] (true, x, or y) clamp wheel (to avoid weird bounce with mouse wheel)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @param {number} [options.factor=1] factor to multiply drag to increase the speed of movement
     * @param {string} [options.mouseButtons=all] changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        this.moved = false
        this.wheelActive = utils.defaults(options.wheel, true)
        this.wheelScroll = options.wheelScroll || 1
        this.reverse = options.reverse ? 1 : -1
        this.clampWheel = options.clampWheel
        this.factor = options.factor || 1
        this.xDirection = !options.direction || options.direction === 'all' || options.direction === 'x'
        this.yDirection = !options.direction || options.direction === 'all' || options.direction === 'y'
        this.parseUnderflow(options.underflow || 'center')
        this.mouseButtons(options.mouseButtons)
    }

    mouseButtons(buttons)
    {
        if (!buttons || buttons === 'all')
        {
            this.mouse = [1, 1, 1]
        }
        else
        {
            this.mouse = [
                buttons.indexOf('left') === -1 ? false : true,
                buttons.indexOf('middle') === -1 ? false : true,
                buttons.indexOf('right') === -1 ? false : true
            ]
        }
    }

    parseUnderflow(clamp)
    {
        clamp = clamp.toLowerCase()
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

    checkButtons(e)
    {
        const isMouse = e.data.pointerType === 'mouse'
        const count = this.parent.countDownPointers()
        if (this.parent.parent)
        {
            if ((count === 1) || (count > 1 && !this.parent.plugins['pinch']))
            {
                if (!isMouse || this.mouse[e.data.button])
                {
                    return true
                }
            }
        }
        return false
    }

    down(e)
    {
        if (this.paused)
        {
            return
        }
        if (this.checkButtons(e))
        {
            const parent = this.parent.parent.toLocal(e.data.global)
            this.last = { x: e.data.global.x, y: e.data.global.y, parent }
            this.current = e.data.pointerId
            return true
        }
        else
        {
            this.last = null
        }
    }

    get active()
    {
        return this.moved
    }

    move(e)
    {
        if (this.paused)
        {
            return
        }
        if (this.last && this.current === e.data.pointerId)
        {
            const x = e.data.global.x
            const y = e.data.global.y
            const count = this.parent.countDownPointers()
            if (count === 1 || (count > 1 && !this.parent.plugins['pinch']))
            {
                const distX = x - this.last.x
                const distY = y - this.last.y
                if (this.moved || ((this.xDirection && this.parent.checkThreshold(distX)) || (this.yDirection && this.parent.checkThreshold(distY))))
                {
                    const newParent = this.parent.parent.toLocal(e.data.global)
                    if (this.xDirection)
                    {
                        this.parent.x += (newParent.x - this.last.parent.x) * this.factor
                    }
                    if (this.yDirection)
                    {
                        this.parent.y += (newParent.y - this.last.parent.y) * this.factor
                    }
                    this.last = { x, y, parent: newParent }
                    if (!this.moved)
                    {
                        this.parent.emit('drag-start', { screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent})
                    }
                    this.moved = true
                    this.parent.emit('moved', { viewport: this.parent, type: 'drag' })
                    return true
                }
            }
            else
            {
                this.moved = false
            }
        }
    }

    up()
    {
        const touches = this.parent.getTouchPointers()
        if (touches.length === 1)
        {
            const pointer = touches[0]
            if (pointer.last)
            {
                const parent = this.parent.parent.toLocal(pointer.last)
                this.last = { x: pointer.last.x, y: pointer.last.y, parent }
                this.current = pointer.last.data.pointerId
            }
            this.moved = false
            return true
        }
        else if (this.last)
        {
            if (this.moved)
            {
                this.parent.emit('drag-end', {screen: new PIXI.Point(this.last.x, this.last.y), world: this.parent.toWorld(this.last), viewport: this.parent})
                this.last = this.moved = false
                return true
            }
        }
    }

    wheel(e)
    {
        if (this.paused)
        {
            return
        }

        if (this.wheelActive)
        {
            const wheel = this.parent.plugins['wheel']
            if (!wheel)
            {
                if (this.xDirection)
                {
                    this.parent.x += e.deltaX * this.wheelScroll * this.reverse
                }
                if (this.yDirection)
                {
                    this.parent.y += e.deltaY * this.wheelScroll * this.reverse
                }
                if (this.clampWheel)
                {
                    this.clamp()
                }
                this.parent.emit('wheel-scroll', this.parent)
                this.parent.emit('moved', this.parent)
                if (!this.parent.passiveWheel)
                {
                    e.preventDefault()
                }
                return true
            }
        }
    }

    resume()
    {
        this.last = null
        this.paused = false
    }

    clamp()
    {
        const decelerate = this.parent.plugins['decelerate'] || {}
        if (this.clampWheel !== 'y')
        {
            if (this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                switch (this.underflowX)
                {
                    case -1:
                        this.parent.x = 0
                        break
                    case 1:
                        this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth)
                        break
                    default:
                        this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                }
            }
            else
            {
                if (this.parent.left < 0)
                {
                    this.parent.x = 0
                    decelerate.x = 0
                }
                else if (this.parent.right > this.parent.worldWidth)
                {
                    this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth
                    decelerate.x = 0
                }
            }
        }
        if (this.clampWheel !== 'x')
        {
            if (this.parent.screenWorldHeight < this.parent.screenHeight)
            {
                switch (this.underflowY)
                {
                    case -1:
                        this.parent.y = 0
                        break
                    case 1:
                        this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                        break
                    default:
                        this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
                }
            }
            else
            {
                if (this.parent.top < 0)
                {
                    this.parent.y = 0
                    decelerate.y = 0
                }
                if (this.parent.bottom > this.parent.worldHeight)
                {
                    this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight
                    decelerate.y = 0
                }
            }
        }
    }
}