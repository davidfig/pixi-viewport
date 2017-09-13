const PIXI = require('pixi.js')
const clamp = require('clamp')
const Penner = require('penner')

module.exports = class Viewport extends PIXI.Container
{
    /**
     *
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {PIXI.Rectangle} worldBoundaries
     * @param {object} [options]
     * @param {boolean} [options.dragToMove]
     * @param {boolean} [options.pinchToZoom] automatically turns on dragToMove
     * @param {boolean|number} [options.bounce=250] bounce back if pulled past boundaries
     * @param {string} [options.bounceEase='linear'] easing function to use when bouncing (see https://github.com/bcherny/penner)
     * @param {boolean} [options.noOverDrag]
     * @param {boolean} [options.noUpdate] set to true to manually call update function, otherwise internally calls requestAnimationFrame
     */
    constructor(screenWidth, screenHeight, worldBoundaries, options)
    {
        super()
        this.options = options || {}
        if (this.options.bounce)
        {
            this.bounce = this.options.bounce
        }
        this.pointers = []
        this.listeners()
        this.hitArea = worldBoundaries
        this._worldBoundaries = worldBoundaries
        this.resize(screenWidth, screenHeight)

        this.g = this.addChild(new PIXI.Graphics())
        this.g.lineStyle(10, 0x00ff00)
            .moveTo(worldBoundaries.left, worldBoundaries.top)
            .lineTo(worldBoundaries.right, worldBoundaries.top)
    }

    set worldBoundaries(value)
    {
        this._worldBoundaries = value
        this.hitArea = value
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
        this.options.bounce = (value === true) ? 250 : this.options.bounce
        this.bounceEasing = Penner[this.options.bounceEase] || Penner['linear']
    }
    get bounce() { return this.options.bounce }

    set bounceEase(value)
    {
        this.options.bounceEase = value
        this.bounceEasing = Penner[value] || Penner['linear']
    }
    get bounceEase()
    {
        return this.options.bounceEase
    }

    set noUpdate(value) { this.options.noUpdate = value }
    get noUpdate() { return this.options.noUpdate }

    listeners()
    {
        if (this.options.dragToMove || this.options.pinchToZoom)
        {
            if (!this.interactive)
            {
                this.interactive = true
                this.on('pointerdown', this.down.bind(this))
                this.on('pointermove', this.move.bind(this))
                this.on('pointerup', this.up.bind(this))
                this.on('pointercancel', this.up.bind(this))
                this.on('pointerupoutside', this.up.bind(this))
            }
        }
        else
        {
            if (this.interactive)
            {
                this.interactive = false
                this.removeListener('pointerdown', this.down.bind(this))
                this.removeListener('pointermove', this.move.bind(this))
                this.removeListener('pointerup', this.up.bind(this))
                this.removeListener('pointercancel', this.up.bind(this))
                this.removeListener('pointerupoutside', this.up.bind(this))
            }
        }
    }

    down(e)
    {
        this.to = null
        this.pointers.push({ id: e.data.pointerId, last: e.data.global })
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
                this.x += (pos.x - last.x)
                this.y += (pos.y - last.y)
                this.pointers[0].last = { x: pos.x, y: pos.y }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
            }
            else if (this.pinchToZoom)
            {
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
                    const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))

                    const change = (dist - last) / this.w
                    this.scale.x += change
                    this.scale.y += change

                    const pivot = this.toLocal(new PIXI.Point(first.last.x + (second.last.x - first.last.x) / 2 - this.w / 2, first.last.y + (second.last.y - first.last.y) / 2 - this.h / 2))
                    this.x = pivot.x - (this.w / 2) * this.scale.x
                    this.y = pivot.y - (this.h / 2) * this.scale.y

                    this.g.beginFill(0xff0000).drawCircle(pivot.x, pivot.y, 50).endFill()
                }
                if (this.options.noOverDrag)
                {
                    this.clamp()
                }
            }
        }
    }

    clamp()
    {
        const right = -this.worldBoundaries.right + this.w * this.scale.x
        const bottom = -this.worldBoundaries.bottom + this.h * this.scale.y
        this.x = this.x > this._worldBoundaries.left ? this._worldBoundaries.left : this.x < right ? right : this.x
        this.y = this.y > this._worldBoundaries.top ? this._worldBoundaries.top : this.y < bottom ? bottom : this.y
    }

    bounceStart()
    {
        const right = -this.worldBoundaries.right + this.w * this.scale.x
        const bottom = -this.worldBoundaries.bottom + this.h * this.scale.y
        const x = this.x > this._worldBoundaries.left ? this._worldBoundaries.left : this.x < right ? right : this.x
        const y = this.y > this._worldBoundaries.top ? this._worldBoundaries.top : this.y < bottom ? bottom : this.y
        if (x !== this.x || y !== this.y)
        {
            this.to = { x: this.x, y: this.y, deltaX: x - this.x, deltaY: y - this.y, time: 0, last: performance.now() }
            if (!this.bouncing)
            {
                this.bouncing = true
                if (!this.options.noUpdate)
                {
                    requestAnimationFrame(this.update.bind(this))
                }
            }
        }
    }

    update(elapsed)
    {
        if (this.to)
        {
            const now = performance.now()
            elapsed = now - this.to.last
            this.to.last = now
            this.to.time += elapsed
            this.x = this.bounceEasing(this.to.time, this.to.x, this.to.deltaX, this.options.bounce)
            this.y = this.bounceEasing(this.to.time, this.to.y, this.to.deltaY, this.options.bounce)
            if (this.to.time >= this.options.bounce)
            {
                this.to = null
                this.bouncing = false
            }
            else if (!this.options.noUpdate)
            {
                requestAnimationFrame(this.update.bind(this))
            }
        }
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
        if (this.options.bounce && this.pointers.length === 0)
        {
            this.bounceStart()
        }
    }
}

/* global performance, requestAnimationFrame */