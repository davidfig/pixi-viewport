const PIXI = require('pixi.js')

const Viewport = require('..')
const Random = require('yy-random')

const WIDTH = 10000
const HEIGHT = 10000
const STARS = 1000
const STAR_SIZE = 20

let viewport

function background()
{
    const background = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    background.tint = 0
    background.width = WIDTH
    background.height = HEIGHT
}

function stars()
{
    for (let i = 0; i < STARS; i++)
    {
        const star = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.get(WIDTH), Random.get(HEIGHT))
    }
}

window.onload = function ()
{
    const app = new PIXI.Application()
    document.getElementById('test').appendChild(app.view)
    app.view.width = window.innerWidth

    viewport = app.stage.addChild(new Viewport(app.view.width, app.view.height))

    background()
    stars()

    require('./highlight')()
}