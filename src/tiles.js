const PIXI = require('pixi.js')
const Counter = require('yy-counter')
const exists = require('exists')

const Plugin = require('./plugin')

module.exports = class Tiles extends Plugin
{
    /**
     * @param {Viewport} parent
     * @param {number} width of tile
     * @param {number} height of tile
     * @param {function} tiles(x, y) should return { texture, tint? } where (x, y) is the coordinates in the tile map (i.e., the world coordinates divided by the tiles' width/height)
     * @param {object} [options]
     * @param {PIXI.Container} [options.container=viewport.container]
     * @param {boolean} [options.useContainer] use PIXI.Container instead of the default (and faster) PIXI.particles.ParticleContainer
     * @param {number} [options.maxNumberTiles=1500] for ParticlesContainer: maximum number of tiles to display on the screen
     * @param {number} [options.autoResize] for ParticlesContainer: autoresize if maxNumberTiles exceeded
     * @param {boolean} [options.shrink] shrink the number of sprites when zooming in (otherwise keeps them for later use)
     * @param {boolean} [options.tint] allows tiles to be tinted
     * @param {boolean} [options.debug] add a debug panel to see sprite usage
     */
    constructor(parent, width, height, tiles, options)
    {
        options = options || {}
        super(parent)
        const attach = options.container ? options.container : this.parent.container
        if (options.useContainer)
        {
            this.container = attach.addChild(new PIXI.Container())
        }
        else
        {
            this.container = attach.addChild(new PIXI.particles.ParticleContainer(options.maxNumberTiles, {tint: options.tint, scale: true, uvs: true, autoResize: options.autoResize}))
        }
        this.w = width
        this.h = height
        this.shrink = options.shrink
        this.tint = options.tint
        this.debug = options.debug
        this.last = {}
        this.tiles = tiles
        if (this.debug) this.counter = new Counter({ side: 'bottom-left', background: 'rgba(0,0,0,0.5)' })
    }

    remove()
    {
        this.container.parent.removeChild(this.container)
        this.container.destroy()
    }

    resize()
    {
        this.last = {}
    }

    layout()
    {
        this.columns = Math.floor(this.parent.worldScreenWidth / this.w) + 2
        this.rows = Math.floor(this.parent.worldScreenHeight / this.h) + 2
        this.count = this.columns * this.rows
        const max = Math.ceil(this.parent.worldWidth / this.w) * Math.ceil(this.parent.worldHeight / this.h)
        this.count = this.count > max ? max : this.count
        if (this.container.children.length > this.count)
        {
            if (this.shrink)
            {
                this.container.removeChildren(this.count)
            }
        }
        else if (this.container.children.length < this.count)
        {
            while (this.container.children.length < this.count)
            {
                const sprite = this.container.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
                sprite.width = this.w
                sprite.height = this.h
            }
        }
    }

    update()
    {
        let display = 0
        const container = this.parent.container
        if (this.last.x !== container.x || this.last.y !== container.y || this.last.scaleX !== container.scale.x || this.last.scaleY !== container.scale.y)
        {
            if (this.last.scaleX !== container.scale.x || this.last.scaleY !== container.scale.y)
            {
                this.layout()
            }
            const left = this.parent.left
            const top = this.parent.top
            const xStart = left - left % this.w
            const yStart = top - top % this.h
            const xIndex = xStart / this.w
            const yIndex = yStart / this.h
            let i = 0
            for (let y = 0; y < this.rows; y++)
            {
                for (let x = 0; x < this.columns; x++)
                {
                    const tile = this.tiles(xIndex + x, yIndex + y)
                    if (tile)
                    {
                        const sprite = this.container.children[i++]
                        // sprite.texture = tile.texture
                        // sprite.tint = exists(tile.tint) ? tile.tint : 0xffffff
                        sprite.visible = true
                        // sprite.position.set(xStart + x * this.w, yStart + y * this.h)
                        display++
                    }
                }
            }
            for (let j = i; j < this.container.children.length; j++)
            {
                this.container.children[j].visible = false
            }
            this.last.x = container.x
            this.last.y = container.y
            this.last.scaleX = container.scale.x
            this.last.scaleY = container.scale.y
            if (this.debug)
            {
                let count = 0
                for (let i = 0; i < this.container.children.length; i++)
                {
                    count += this.container.children[i].visible ? 0 : 1
                }
                this.counter.log(display + ' tiles with ' + count + ' empty' + ' using ' + this.container.children.length + ' sprites (' + Math.random() + ')')
            }
        }
    }
}