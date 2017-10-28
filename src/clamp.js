const Plugin = require('./plugin')

module.exports = class clamp extends Plugin
{
    /**
     * @param {object} options
     * @param {string} [options.direction=all] (all, x, or y)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        switch (options.direction)
        {
            case 'x':
                this.x = true
                break
            case 'y':
                this.y = true
                break
            default:
                this.x = this.y = true
                break
        }
        this.parseUnderflow(options.underflow || 'center')
        this.move()
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

        const oob = this.parent.OOB()
        const point = oob.cornerPoint
        const decelerate = this.parent.plugin['decelerate'] || {}
        if (this.x)
        {
            if (this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                switch (this.underflowX)
                {
                    case -1:
                        this.parent.container.x = 0
                        break
                    case 1:
                        this.parent.container.x = (this.parent.screenWidth - this.parent.screenWorldWidth)
                        break
                    default:
                        this.parent.container.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                }
            }
            else
            {
                if (oob.left)
                {
                    this.parent.container.x = 0
                    decelerate.x = 0
                }
                else if (oob.right)
                {
                    this.parent.container.x = -point.x
                    decelerate.x = 0
                }
            }
        }
        if (this.y)
        {
            if (this.parent.screenWorldHeight < this.parent.screenHeight)
            {
                switch (this.underflowY)
                {
                    case -1:
                        this.parent.container.y = 0
                        break
                    case 1:
                        this.parent.container.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
                        break
                    default:
                        this.parent.container.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
                }
            }
            else
            {
                if (oob.top)
                {
                    this.parent.container.y = 0
                    decelerate.y = 0
                }
                else if (oob.bottom)
                {
                    this.parent.container.y = -point.y
                    decelerate.y = 0
                }
            }
        }
    }
}