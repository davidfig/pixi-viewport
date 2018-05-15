const exists = require('exists')

const Plugin = require('./plugin')
module.exports = class Drag extends Plugin
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
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        this.moved = false
        this.wheelActive = exists(options.wheel) ? options.wheel : true
        this.wheelScroll = options.wheelScroll || 1
        this.reverse = options.reverse ? 1 : -1
        this.clampWheel = options.clampWheel
        this.xDirection = !options.direction || options.direction === 'all' || options.direction === 'x'
        this.yDirection = !options.direction || options.direction === 'all' || options.direction === 'y'
        this.parseUnderflow(options.underflow || 'center')
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

    down(e)
    {
        if (this.paused)
        {
            return
        }
        if (this.parent.countDownPointers() === 1 && this.parent.parent)
        {
            const parent = this.parent.parent.toLocal(e.data.global)
            this.last = { x: e.data.global.x, y: e.data.global.y, parent }
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

        if (this.last)
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
                        this.parent.x += newParent.x - this.last.parent.x
                    }
                    if (this.yDirection)
                    {
                        this.parent.y += newParent.y - this.last.parent.y
                    }
                    this.last = { x, y, parent: newParent }
                    if (!this.moved)
                    {
                        this.parent.emit('drag-start', { screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
                    }
                    this.moved = true
                    this.parent.dirty = true
                    this.parent.emit('moved', this.parent)
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
            }
            this.moved = false
        }
        else if (this.last)
        {
            if (this.moved)
            {
                this.parent.emit('drag-end', {screen: this.last, world: this.parent.toWorld(this.last), viewport: this.parent})
                this.last = this.moved = false
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
                this.parent.x += e.deltaX * this.wheelScroll * this.reverse
                this.parent.y += e.deltaY * this.wheelScroll * this.reverse
                if (this.clampWheel)
                {
                    this.clamp()
                }
                this.parent.emit('wheel-scroll', this.parent)
                this.parent.dirty = true
                e.preventDefault()
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
        const oob = this.parent.OOB()
        const point = oob.cornerPoint
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
                if (oob.left)
                {
                    this.parent.x = 0
                    decelerate.x = 0
                }
                else if (oob.right)
                {
                    this.parent.x = -point.x
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
                if (oob.top)
                {
                    this.parent.y = 0
                    decelerate.y = 0
                }
                else if (oob.bottom)
                {
                    this.parent.y = -point.y
                    decelerate.y = 0
                }
            }
        }
    }
}