const Ease = require('pixi-ease')

module.exports = class Viewport
{
    /**
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {PIXI.Rectangle} worldBoundaries
     * @param {object} [options]
     * @param {boolean} [options.dragToMove]
     * @param {boolean} [options.pinchToZoom] automatically turns on dragToMove
     * @param {boolean} [options.noOverDrag] stops scroll beyond boundaries
     * @param {boolean} [options.bounce] bounce back if pulled beyond boundaries
     * @param {number} [options.bounceTime=150], number is milliseconds to bounce back
     * @param {string} [options.bounceEase=linear] easing function to use when bouncing (see https://github.com/bcherny/penner)
     * @param {boolean} [options.decelerate] decelerate after scrolling
     * @param {number} [options.friction=0.95] percent to decelerate after movement
     * @param {number} [options.bounceFriction=0.5] percent to decelerate after movement while inside a bounce
     * @param {number} [options.minVelocity=0.01] minimum velocity before stopping deceleration
     * @param {boolean} [options.noUpdate] use an external loop intead of internal calls to requestAnimationFrame()
     */
    constructor(container, screenWidth, screenHeight, worldBoundaries, options)
    {
        this.container = container
        this.options = options || {}
        this.options.bounceTime = this.options.bounceTime || 150
        this.options.friction = this.options.friction || 0.95
        this.options.bounceFriction = this.options.bounceFriction || 0.5
        this.options.minVelocity = this.options.minVelocity || 0.01
        this.pointers = []
        this.listeners()
        this.container.hitArea = worldBoundaries
        this._worldBoundaries = worldBoundaries
        this.resize(screenWidth, screenHeight)
        this.saved = []
    }

    set worldBoundaries(value)
    {
        this._worldBoundaries = value
        this.container.hitArea = value
    }
    get worldBoundaries() { return this._worldBoundaries }

    set noOverDrag(value)
    {
        this.options.noOverDrag = value
        if (value) this.clamp()
        this.listeners()
    }
    get noOverDrag() { return this.options.noOverDrag }

    set pinchToZoom(value)
    {
        this.options.pinchToZoom = value
        this.listeners()
    }
    get pinchToZoom() { return this.options.pinchToZoom }

    set dragToMove(value)
    {
        this.options.dragToMove = value
        this.listeners()
    }
    get dragToMove() { return this.options.dragToMove }

    set bounce(value)
    {
        this.options.bounce = value
        if (!value)
        {
            this.toX = this.toY = null
        }
    }
    get bounce() { return this.options.bounce }

    set bounceTime(value) { this.options.bounceTime = value }
    get bounceTime() { return this.options.bounceTime }

    set bounceEase(value) { this.options.bounceEase = value }
    get bounceEase() { return this.options.bounceEase }

    set noUpdate(value) { this.options.noUpdate = value }
    get noUpdate() { return this.options.noUpdate }

    set decelerate(value) { this.options.decelerate = value }
    get decelerate() { return this.options.decelerate }

    set friction(value) { this.options.friction = value }
    get friction() { return this.options.friction }

    set bounceFriction(value) { this.options.bounceFriction = value }
    get bounceFriction() { return this.options.bounceFriction }

    listeners()
    {
        if (this.options.dragToMove || this.options.pinchToZoom)
        {
            if (!this.interactive)
            {
                this.container.interactive = true
                this.container.on('pointerdown', this.down.bind(this))
                this.container.on('pointermove', this.move.bind(this))
                this.container.on('pointerup', this.up.bind(this))
                this.container.on('pointercancel', this.up.bind(this))
                this.container.on('pointerupoutside', this.up.bind(this))
            }
        }
        else
        {
            if (this.interactive)
            {
                this.container.interactive = false
                this.container.removeListener('pointerdown', this.down.bind(this))
                this.container.removeListener('pointermove', this.move.bind(this))
                this.container.removeListener('pointerup', this.up.bind(this))
                this.container.removeListener('pointercancel', this.up.bind(this))
                this.container.removeListener('pointerupoutside', this.up.bind(this))
            }
        }
    }

    down(e)
    {
        this.toX = this.toY = null
        this.pointers.push({ id: e.data.pointerId, last: e.data.global })
        this.saved = []
        this.decelerating = null
    }

    resize(screenWidth, screenHeight)
    {
        this.w = screenWidth
        this.h = screenHeight
    }

    move(e)
    {
        if (this.pointers.length)
        {
            if (this.pointers.length === 1 || !this.pinchToZoom)
            {
                const last = this.pointers[0].last
                const pos = e.data.global
                const distX = pos.x - last.x
                const distY = pos.y - last.y
                this.container.x += distX
                this.container.y += distY
                if (this.options.friction)
                {
                    this.saved.push({ x: this.container.x, y: this.container.y, time: performance.now() })
                    if (this.saved.length > 60)
                    {
                        this.saved.splice(0, 30)
                    }
                }
                this.pointers[0].last = { x: pos.x, y: pos.y }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
                this.inMove = true
            }
            else if (this.pinchToZoom)
            {
                this.inMove = false
                const first = this.pointers[0]
                const second = this.pointers[1]
                const last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                if (first.id === e.data.pointerId)
                {
                    first.last = { x: e.data.global.x, y: e.data.global.y }
                }
                else if (second.id === e.data.pointerId)
                {
                    second.last = { x: e.data.global.x, y: e.data.global.y }
                }
                if (last)
                {
                    const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 }
                    const oldPoint = this.container.toLocal(point)

                    const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                    const change = ((dist - last) / this.w) * this.container.scale.x
                    this.container.scale.x += change
                    this.container.scale.y += change

                    const newPoint = this.container.toGlobal(oldPoint)

                    this.container.x += point.x - newPoint.x
                    this.container.y += point.y - newPoint.y

                    if (this.lastCenter)
                    {
                        this.container.x += point.x - this.lastCenter.x
                        this.container.y += point.y - this.lastCenter.y
                    }
                    this.lastCenter = point
                }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
            }
        }
        else
        {
            this.inMove = false
        }
    }

    toWorld()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.container.toLocal({ x, y })
        }
        else
        {
            return this.container.toLocal(arguments[0])
        }
    }

    toScreen()
    {
        if (arguments.length === 2)
        {
            const x = arguments[0]
            const y = arguments[1]
            return this.container.toGlobal({ x, y })
        }
        else
        {
            const point = arguments[0]
            return this.container.toGlobal(point)
        }
    }

    clamp()
    {
        let point, changeX, changeY
        if (this.w / this.container.scale.x > this._worldBoundaries.width || this.container.x >= this._worldBoundaries.left)
        {
            this.container.x = this._worldBoundaries.left
            changeX = true
        }
        else
        {
            point = this.container.toLocal({ x: this.w, y: this.h })
            if (point.x > this._worldBoundaries.right)
            {
                this.container.x += (point.x - this._worldBoundaries.right)
                changeX = true
            }
        }
        if (this.h / this.container.scale.y > this._worldBoundaries.height || this.container.y >= this._worldBoundaries.top)
        {
            this.container.y = this._worldBoundaries.top
            changeY = true
        }
        else
        {
            if (!point)
            {
                point = this.container.toLocal({ x: this.w, y: this.h })
            }
            if (point.y > this._worldBoundaries.bottom)
            {
                this.container.y += (point.y - this._worldBoundaries.bottom)
                changeY = true
            }
        }
        return { x: changeX, y: changeY }
    }

    bounceStart(noStart, xOnly, yOnly)
    {
        let point
        let x = this.container.x
        let y = this.container.y
        if (this.w / this.container.scale.x > this._worldBoundaries.width || this.container.x >= this._worldBoundaries.left)
        {
            x = this._worldBoundaries.left
        }
        else
        {
            point = this.container.toLocal({ x: this.w, y: this.h })
            if (point.x > this._worldBoundaries.right)
            {
                x = this.container.x + (point.x - this._worldBoundaries.right)
            }
        }
        if (this.h / this.container.scale.y > this._worldBoundaries.height || this.container.y >= this._worldBoundaries.top)
        {
            y = this._worldBoundaries.top
        }
        else
        {
            if (!point)
            {
                point = this.container.toLocal({ x: 0, y: this.h })
            }
            if (point.y > this._worldBoundaries.bottom)
            {
                y = this.container.y + (point.y - this._worldBoundaries.bottom)
            }
        }
        if (noStart)
        {
            return { x: x !== this.container.x, y: y !== this.container.y }
        }
        if ((!yOnly && x !== this.container.x) || (!xOnly && y !== this.container.y))
        {
            if (!yOnly && x !== this.container.x)
            {
                this.toX = new Ease.to(this.container, { x }, this.options.bounceTime, { noAdd: true, ease: this.options.bounceEase })
                this.toX.lastTime = performance.now()
            }
            if (!xOnly && y !== this.container.y)
            {
                this.toY = new Ease.to(this.container, { y }, this.options.bounceTime, { noAdd: true, ease: this.options.bounceEase })
                this.toY.lastTime = performance.now()
            }
            return true
        }
    }

    update()
    {
        const now = performance.now()
        let continueUpdating
        if (this.toX)
        {
            const elapsed = now - this.toX.lastTime
            this.toX.lastTime = now
            if (this.toX.update(elapsed))
            {
                this.toX = null
            }
            else
            {
                continueUpdating = true
            }
        }
        if (this.toY)
        {
            const elapsed = now - this.toY.lastTime
            this.toY.lastTime = now
            if (this.toY.update(elapsed))
            {
                this.toY = null
            }
            else
            {
                continueUpdating = true
            }
        }
        if (this.decelerating)
        {
            const elapsed = now - this.decelerating.time
            this.decelerating.time = now
            const bounce = this.options.bounce ? this.bounceStart(true) : {}
            if (this.decelerating.x)
            {
                const deltaX = this.decelerating.x * elapsed
                this.container.x += deltaX
                this.decelerating.x = (bounce.x ? this.options.bounceFriction : this.options.friction) * this.decelerating.x
                if (Math.abs(this.decelerating.x) <= this.options.minVelocity)
                {
                    this.decelerating.x = 0
                    if (bounce.x)
                    {
                        if (this.bounceStart(false, true))
                        {
                            continueUpdating = true
                        }
                    }
                }
            }
            if (this.decelerating.y)
            {
                const deltaY = this.decelerating.y * elapsed
                this.container.y += deltaY
                this.decelerating.y = (bounce.y ? this.options.bounceFriction : this.options.friction) * this.decelerating.y
                if (Math.abs(this.decelerating.y) <= this.options.minVelocity)
                {
                    this.decelerating.y = 0
                    if (bounce.y)
                    {
                        if (this.bounceStart(false, false, true))
                        {
                            continueUpdating = true
                        }
                    }
                }
            }
            if (this.options.noOverDrag)
            {
                const result = this.clamp()
                if (result.x)
                {
                    this.decelerating.x = 0
                }
                if (result.y)
                {
                    this.decelerating.y = 0
                }
            }
            if (this.decelerating.x === 0 && this.decelerating.y === 0)
            {
                this.decelerating = null
            }
            else
            {
                continueUpdating = true
            }
        }
        if (continueUpdating)
        {
            requestAnimationFrame(this.update.bind(this))
        }
        this.last = now
    }

    up(e)
    {
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].id === e.data.pointerId)
            {
                this.pointers.splice(i, 1)
            }
        }
        if (this.pointers.length < 2)
        {
            this.lastCenter = null
        }
        let update
        if (this.options.bounce && this.pointers.length === 0)
        {
            update = this.bounceStart()
        }
        if (this.options.decelerate && this.saved.length)
        {
            if (!this.toX || !this.toY)
            {
                const now = performance.now()
                for (let save of this.saved)
                {
                    if (save.time >= now - 100)
                    {
                        const time = now - save.time
                        const x = (this.container.x - save.x) / time
                        const y = (this.container.y - save.y) / time
                        this.decelerating = { time: now }
                        if (!this.toX)
                        {
                            this.decelerating.x = x
                        }
                        if (!this.toY)
                        {
                            this.decelerating.y = y
                        }
                        update = true
                        break
                    }
                }
            }
        }
        if (update)
        {
            this.update()
        }
    }
}

/* global performance, requestAnimationFrame */