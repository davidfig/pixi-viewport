const Plugin = require('./plugin')
const utils =  require('./utils')

module.exports = class clamp extends Plugin
{
    /**
     * @private
     * @param {object} options
     * @param {(number|boolean)} [options.left] clamp left; true=0
     * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
     * @param {(number|boolean)} [options.top] clamp top; true=0
     * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
     * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
     * @param {string} [options.underflow=center] (none OR (top/bottom/center and left/right/center) OR center) where to place world if too small for screen (e.g., top-right, center, none, bottomleft)
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        if (typeof options.direction === 'undefined')
        {
            this.left = utils.defaults(options.left, null)
            this.right = utils.defaults(options.right, null)
            this.top = utils.defaults(options.top, null)
            this.bottom = utils.defaults(options.bottom, null)
        }
        else
        {
            this.left = options.direction === 'x' || options.direction === 'all' ? true : null
            this.right = options.direction === 'x' || options.direction === 'all' ? true : null
            this.top = options.direction === 'y' || options.direction === 'all' ? true : null
            this.bottom = options.direction === 'y' || options.direction === 'all' ? true : null
        }
        this.parseUnderflow(options.underflow || 'center')
        this.move()
    }

    parseUnderflow(clamp)
    {
        clamp = clamp.toLowerCase()
        if (clamp === 'none')
        {
            this.noUnderflow = true
        }
        else if (clamp === 'center')
        {
            this.underflowX = this.underflowY = 0
            this.noUnderflow = false
        }
        else
        {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0
            this.noUnderflow = false
        }
    }

    move()
    {
        this.update()
    }

    update()
    {
        if (this.paused)
        {
            return
        }
        const original = { x: this.parent.x, y: this.parent.y }
        const decelerate = this.parent.plugins['decelerate'] || {}
        if (this.left !== null || this.right !== null)
        {
            let moved
            if (this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                if (!this.noUnderflow)
                {
                    switch (this.underflowX)
                    {
                        case -1:
                            if (this.parent.x !== 0)
                            {
                                this.parent.x = 0
                                moved = true
                            }
                            break
                        case 1:
                            if (this.parent.x !== this.parent.screenWidth - this.parent.screenWorldWidth)
                            {
                                this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth
                                moved = true
                            }
                            break
                        default:
                            if (this.parent.x !== (this.parent.screenWidth - this.parent.screenWorldWidth) / 2)
                            {
                                this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                                moved = true
                            }
                    }
                }
            }
            else
            {
                if (this.left !== null)
                {
                    if (this.parent.left < (this.left === true ? 0 : this.left))
                    {
                        this.parent.x = -(this.left === true ? 0 : this.left) * this.parent.scale.x
                        decelerate.x = 0
                        moved = true
                    }
                }
                if (this.right !== null)
                {
                    if (this.parent.right > (this.right === true ? this.parent.worldWidth : this.right))
                    {
                        this.parent.x = -(this.right === true ? this.parent.worldWidth : this.right) * this.parent.scale.x + this.parent.screenWidth
                        decelerate.x = 0
                        moved = true
                    }
                }
            }
            if (moved)
            {
                this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-x' })
            }
        }
        if (this.top !== null || this.bottom !== null)
        {
            let moved
            if (this.parent.screenWorldHeight < this.parent.screenHeight)
            {
                if (!this.noUnderflow)
                {
                    switch (this.underflowY)
                    {
                        case -1:
                            if (this.parent.y !== 0)
                            {
                                this.parent.y = 0
                                moved = true
                            }
                            break
                        case 1:
                            if (this.parent.y !== this.parent.screenHeight - this.parent.screenWorldHeight)
                            {
                                this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                                moved = true
                            }
                            break
                        default:
                            if (this.parent.y !== (this.parent.screenHeight - this.parent.screenWorldHeight) / 2)
                            {
                                this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
                                moved = true
                            }
                    }
                }
            }
            else
            {
                if (this.top !== null)
                {
                    if (this.parent.top < (this.top === true ? 0 : this.top))
                    {
                        this.parent.y = -(this.top === true ? 0 : this.top) * this.parent.scale.y
                        decelerate.y = 0
                        moved = true
                    }
                }
                if (this.bottom !== null)
                {
                    if (this.parent.bottom > (this.bottom === true ? this.parent.worldHeight : this.bottom))
                    {
                        this.parent.y = -(this.bottom === true ? this.parent.worldHeight : this.bottom) * this.parent.scale.y + this.parent.screenHeight
                        decelerate.y = 0
                        moved = true
                    }
                }
            }
            if (moved)
            {
                this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-y' })
            }
        }
    }
}