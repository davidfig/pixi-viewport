import * as PIXI from 'pixi.js'
import Random from 'yy-random'

export let renderer
let viewport

export function init()
{
    renderer = new PIXI.Renderer()
    update()
}

function update()
{
    if (viewport && viewport.dirty)
    {
        renderer.render(viewport)
        viewport.dirty = false
    }
    requestAnimationFrame(update)
}

export function draw(viewportIn, size, dot, count)
{
    viewport = viewportIn
    const g = viewport.addChild(new PIXI.Graphics())
    g.beginFill(0xeeeeee).drawRect(0, 0, size, size).endFill()
    g.lineStyle(10, 0).drawRect(10, 10, size - 20, size - 20)
    for (let i = 0; i < count; i++)
    {
        const sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        sprite.width = sprite.height = Random.get(dot)
        sprite.anchor.set(0.5)
        sprite.position.set(Random.range(dot, size - dot), Random.range(dot, size - dot))
        sprite.rotation = Random.get(Math.PI * 2, true)
    }
}