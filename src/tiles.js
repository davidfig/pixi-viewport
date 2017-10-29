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
     * @param {PIXI.Container} [options.parent=viewport.container]
     * @param {boolean} [options.useContainer] default is to use PIXI.particles.ParticleContainer for better performance
     * @param {number} [options.maxNumberTiles=1500] maximum number of tiles to display on the screen
     * @param {boolean} [options.shrink] shrink the number of sprites when zooming in (otherwise keeps them for later use)
     * @param {boolean} [options.debug] add a debug panel to see sprite usage
     * @param {boolean} [options.tint] allow changing of tint for the tiles
     */
    constructor(parent, width, height, tiles, options)
    {
        options = options || {}
        super(parent)
        const attach = options.parent ? options.parent : this.parent.container
        if (options.container)
        {
            this.container = attach.addChild(new PIXI.Container())
        }
        else
        {
            this.container = attach.addChild(new PIXI.particles.ParticleContainer(options.maxNumberTiles || 1500, { tint: options.tint }))
            //, uvs: true, scale: true }))
        }
        this.w = width
        this.h = height
        this.shrink = options.shrink
        this.debug = options.debug
        this.tint = options.tint
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
        else
        {
            for (let i = 0; i < this.count; i++)
            {
                if (i >= this.container.children.length)
                {
                    const sprite = this.container.addChild(new PIXI.Sprite())
                    sprite.width = this.w
                    sprite.height = this.h
                    if (this.tint)
                    {
                        sprite.tint = 0xffffff
                    }
                }
                else
                {
                    this.container.children[i]
                }
            }
        }
    }

    update()
    {
        let display = 0, empty = 0
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
                        sprite.texture = tile.texture
                        sprite.tint = tile.tint
                        sprite.visible = true
                        sprite.position.set(xStart + x * this.w, yStart + y * this.h)
                        if (this.tint)
                        {
                            if (exists(tile.tint))
                            {
                                sprite.tint = tile.tint
                            }
                            else
                            {
                                sprite.tint = 0xffffff
                            }
                        }
                        display++
                    }
                    else
                    {
                        empty++
                    }
                }
            }
            for (let j = i; j < this.count; j++)
            {
                this.container.children[j].visible = false
                empty++
            }
            this.last.x = container.x
            this.last.y = container.y
            this.last.scaleX = container.scale.x
            this.last.scaleY = container.scale.y
            if (this.debug) this.counter.log(display + ' tiles with ' + empty + ' empty' + ' using ' + this.container.children.length + ' sprites')
        }
    }
}