const Ease = require('pixi-ease')
const exists = require('exists')

const Plugin = require('./plugin')

module.exports = class Bounce extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     *
     * @emits bounce-start-x(Viewport) emitted when a bounce on the x-axis starts
     * @emits bounce.end-x(Viewport) emitted when a bounce on the x-axis ends
     * @emits bounce-start-y(Viewport) emitted when a bounce on the y-axis starts
     * @emits bounce-end-y(Viewport) emitted when a bounce on the y-axis ends
     */
    constructor(parent, options)
    {
        super(parent)
        options = options || {}
        this.time = options.time || 150
        this.ease = options.ease || 'easeInOutSine'
        this.friction = options.friction || 0.5
        options.sides = options.sides || 'all'
        if (options.sides)
        {
            if (options.sides === 'all')
            {
                this.top = this.bottom = this.left = this.right = true
            }
            else if (options.sides === 'horizontal')
            {
                this.right = this.left = true
            }
            else if (options.sides === 'vertical')
            {
                this.top = this.bottom = true
            }
            else
            {
                this.top = options.sides.indexOf('top') !== -1
                this.bottom = options.sides.indexOf('bottom') !== -1
                this.left = options.sides.indexOf('left') !== -1
                this.right = options.sides.indexOf('right') !== -1
            }
        }
        this.parseUnderflow(options.underflow || 'center')
        this.last = {}
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
            if (this.toX.update(elapsed))
            {
                this.toX = null
                this.parent.emit('bounce-end-x', this.parent)
            }
            this.parent.dirty = true
        }
        if (this.toY)
        {
            if (this.toY.update(elapsed))
            {
                this.toY = null
                this.parent.emit('bounce-end-y', this.parent)
            }
            this.parent.dirty = true
        }
    }

    bounce()
    {
        if (this.paused)
        {
            return
        }

        // cache the values so you don't need to keep checking for bounce when there's no movement
        if (this.last.x === this.parent.container.x && this.last.y === this.parent.container.y && this.last.scaleX === this.parent.container.scale.x && this.last.scaleY === this.parent.container.scale.y)
        {
            return
        }
        this.last.x = this.parent.container.x
        this.last.y = this.parent.container.y
        this.last.scaleX = this.parent.container.scale.x
        this.last.scaleY = this.parent.container.scale.y

        let oob
        let decelerate = this.parent.plugins['decelerate']
        if (decelerate && (decelerate.x || decelerate.y))
        {
            if ((decelerate.x && decelerate.percentChangeX === decelerate.friction) || (decelerate.y && decelerate.percentChangeY === decelerate.friction))
            {
                oob = this.parent.OOB()
                if ((oob.left && this.left) || (oob.right && this.right))
                {
                    decelerate.percentChangeX = this.friction
                }
                if ((oob.top && this.top) || (oob.bottom && this.bottom))
                {
                    decelerate.percentChangeY = this.friction
                }
            }
        }
        const pointers = this.parent.input.pointers
        decelerate = decelerate || {}
        if (pointers.length === 0 && ((!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)))
        {
            oob = oob || this.parent.OOB()
            const point = oob.cornerPoint
            if (!this.toX && !decelerate.x)
            {
                let x
                if (this.parent.screenWorldWidth < this.parent.screenWidth)
                {
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
                }
                else
                {
                    if (oob.left && this.left)
                    {
                        x = 0
                    }
                    else if (oob.right && this.right)
                    {
                        x = -point.x
                    }
                }
                if (exists(x) && this.parent.container.x !== x)
                {
                    this.toX = new Ease.to(this.parent.container, { x }, this.time, { ease: this.ease })
                    this.parent.emit('bounce-start-x', this.parent)
                }
            }
            if (!this.toY && !decelerate.y)
            {
                let y
                if (this.parent.screenWorldHeight < this.parent.screenHeight)
                {
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
                }
                else
                {
                    if (oob.top && this.top)
                    {
                        y = 0
                    }
                    else if (oob.bottom && this.bottom)
                    {
                        y = -point.y
                    }
                }
                if (exists(y) && this.parent.container.y !== y)
                {
                    this.toY = new Ease.to(this.parent.container, { y }, this.time, { ease: this.ease })
                    this.parent.emit('bounce-start-y', this.parent)
                }
            }
        }
    }

    reset()
    {
        this.toX = this.toY = null
    }
}