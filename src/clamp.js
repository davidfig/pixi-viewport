const Plugin = require('./plugin')
const exists = require('exists')

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
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    constructor(parent, options)
    {
        options = options || {}
        super(parent)
        if (typeof options.direction === 'undefined')
        {
            this.left = exists(options.left) ? options.left : null
            this.right = exists(options.right) ? options.right : null
            this.top = exists(options.top) ? options.top : null
            this.bottom = exists(options.bottom) ? options.bottom : null
        }
        else
        {
            this.left = options.direction === 'x' || options.direction === 'all'
            this.right = options.direction === 'x' || options.direction === 'all'
            this.top = options.direction === 'y' || options.direction === 'all'
            this.bottom = options.direction === 'y' || options.direction === 'all'
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

        const decelerate = this.parent.plugins['decelerate'] || {}
        if (this.left !== null || this.right !== null)
        {
            if (this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                switch (this.underflowX)
                {
                    case -1:
                        this.parent.x = 0
                        break
                    case 1:
                        this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth
                        break
                    default:
                        this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2
                }
            }
            else
            {
                if (this.left !== null)
                {
                    if (this.parent.left < (this.left === true ? 0 : this.left))
                    {
console.log(this.parent.left, this.left)
                        this.parent.left = this.left === true ? 0 : this.left
                        decelerate.x = 0
                    }
                }
                if (this.right !== null)
                {
                    if (this.parent.right > (this.right === true ? this.parent.worldWidth : this.right))
                    {
                        this.parent.right = this.right === true ? this.parent.worldWidth : this.right
                        decelerate.x = 0
                    }
                }
            }
        }
        // if (this.top !== null || this.bottom !== null)
        // {
        //     if (this.parent.screenWorldHeight < this.parent.screenHeight)
        //     {
        //         switch (this.underflowY)
        //         {
        //             case -1:
        //                 this.parent.y = 0
        //                 break
        //             case 1:
        //                 this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight)
        //                 break
        //             default:
        //                 this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2
        //         }
        //     }
        //     else
        //     {
        //         if (this.top !== null)
        //         {
        //             if (this.parent.top < this.top === true ? 0 : this.top * this.parent.scale.y)
        //             {
        //                 this.parent.y = this.top === true ? 0 : this.top * this.parent.scale.y
        //                 decelerate.y = 0
        //             }
        //         }
        //         if (this.bottom !== null)
        //         {
        //             if (this.parent.bottom > this.bottom === true ? this.parent._worldHeight : this.bottom)
        //             {
        //                 this.parent.y = this.bottom === true ?
        //                     -this.parent._worldHeight * this.parent.scale.y - this.parent._screenHeight :
        //                     -this.bottom * this.parent.scale.y - this.parent._screenHeight
        //             }
        //             decelerate.y = 0
        //         }
        //     }
        // }
    }
}