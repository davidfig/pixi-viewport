const PIXI = require('pixi.js')
const Viewport = require('../src/Viewport')

window.onload = function ()
{
    const width = 300
    const height = 300
    const worldWidth = 1000
    const worldHeight = 200
    const N = 30
    const worldMinX = worldWidth / 3
    const worldMinY = worldHeight / 3

    const app = new PIXI.Application({ width: width, height: height })
    const viewport = new Viewport({
        screenWidth: width,
        screenHeight: height,
        worldWidth: worldWidth,
        worldHeight: worldHeight,
        interaction: app.renderer.plugins.interaction,
    })
    viewport.left = worldMinX
    viewport.top = worldMinY
    viewport
        .fitWidth(worldWidth, false, false)
        .fitHeight(worldHeight, false, false)
        .drag()
        .wheel({ percent: 0.3 })
        .decelerate()
        .clampZoom({
            minWidth: worldWidth / 4,
            minHeight: worldHeight / 4,
            maxWidth: worldWidth, // ?
            maxHeight: worldHeight, // ?
        })
        .clamp({
            left: worldMinX, // ?
            right: worldMinX + worldWidth, // ?
            top: worldMinY, // ?
            bottom: worldMinY + worldHeight, // ?
        })

    const body = document.getElementsByTagName('body')[0]
    body.appendChild(app.view)
    app.stage.addChild(viewport)

    const dx = worldWidth / N
    const dy = worldHeight / N
    for (let i = 0; i < N; i += 1)
    {
        for (let j = 0; j < N; j += 1)
        {
            if ((i + j) % 2 === 0)
            {
                const g = new PIXI.Graphics()
                g.beginFill(0xABABAB)
                g.drawRect(worldMinX + dx * i, worldMinY + dy * j, dx, dy)
                g.endFill()
                viewport.addChild(g)
            }
        }
    }

    const outline = new PIXI.Graphics()
    outline.lineStyle(5, 0xFF0000)
    outline.drawRect(worldMinX, worldMinY, worldWidth, worldHeight)
    viewport.addChild(outline)

    app.start()
    console.log(viewport.scale)
}