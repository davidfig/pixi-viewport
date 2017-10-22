const Plugin = require('./plugin')
const Ease = require('pixi-ease')

module.exports = class Snap extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @param {number} [options.friction=0.8] friction/frame to apply if decelerate is active
     * @param {boolean} [options.center] move the center of the camera to {x, y} (if false, move the top left corner to {x, y})
     * @param {number} [options.time=1000]
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.stopOnResize] stops performing the snap when resizing
     * @param {boolean} [options.dragInterrupt] allows users to stop the snapping by dragging (via the 'drag' plugin)
     * @param {boolean} [options.zoomInterrupt] allows users to stop the snapping by zooming (via the 'wheel' or 'pinch'  plugins)
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     */
    constructor(parent, x, y, options)
    {
        super(parent)
        options = options || {}
        this.friction = options.friction || 0.8
        this.time = options.time || 1000
        this.ease = options.ease || 'easeInOutSine'
        this.x = x
        this.y = y
        this.center = options.center
        this.stopOnResize = options.stopOnResize
        this.dragInterrupt = options.dragInterrupt
        this.zoomInterrupt = options.zoomInterrupt
        this.removeOnComplete = options.removeOnComplete

        if (this.parent.plugins['decelerate'])
        {
            this.parent.plugins['decelerate'].reset();
        }
        if (!this.dragInterrupt && this.parent.plugins['drag'])
        {
            this.parent.plugins['drag'].pause()
        }
        if (!this.zoomInterrupt)
        {
            if (this.parent.plugins['wheel'])
            {
                this.parent.plugins['wheel'].pause()
            }
            if (this.parent.plugins['pinch'])
            {
                this.parent.plugins['pinch'].pause()
            }
        }

        if (this.center)
        {
            this.x = (this.parent.worldScreenWidth / 2 - this.x) * this.parent.container.scale.x
            this.y = (this.parent.worldScreenHeight / 2 - this.y) * this.parent.container.scale.y
        }
        this.move()
    }

    restart()
    {
        this.snapping = new Ease.to(this.parent.container, { x: this.x, y: this.y }, this.time, { ease: this.ease })
    }

    resize()
    {
        if (this.center)
        {
            this.x = (this.parent.worldScreenWidth / 2 - this.x) * this.parent.container.scale.x
            this.y = (this.parent.worldScreenHeight / 2 - this.y) * this.parent.container.scale.y
        }
        if (this.stopOnResize)
        {
            this.reset()
        }
        else
        {
            this.restart()
        }
    }

    up()
    {
        const decelerate = this.parent.plugins['decelerate']
        if (decelerate && (decelerate.x || decelerate.y))
        {
            decelerate.percentChangeX = decelerate.percentChangeY = this.friction
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }
        if (this.snapping && this.snapping.update(elapsed))
        {
            if (this.removeOnComplete)
            {
                this.reset()
            }
        }
    }

    reset()
    {
        this.snapping = null
        if (this.removeOnComplete)
        {
            this.parent.removePlugin('snap')
        }
    }
}