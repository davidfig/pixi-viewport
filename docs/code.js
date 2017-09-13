const PIXI = require('pixi.js')
const Random = require('yy-random')
const Panel = require('settingspanel')

const Viewport = require('..')

const BORDER = 10
const WIDTH = 1000
const HEIGHT = 1000
const STARS = 1000
const STAR_SIZE = 20

let viewport

function line(x, y, width, height)
{
    const line = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    line.tint = 0xff0000
    line.alpha = 0.25
    line.position.set(x, y)
    line.width = width
    line.height = height
}

function border()
{
    line(0, 0, WIDTH, BORDER)
    line(0, HEIGHT - BORDER, WIDTH, BORDER)
    line(0, 0, BORDER, HEIGHT)
    line(WIDTH - BORDER, 0, BORDER, HEIGHT)
}

function stars()
{
    for (let i = 0; i < STARS; i++)
    {
        const star = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.tint = Random.color()
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.get(WIDTH), Random.get(HEIGHT))
    }
}

window.onload = function ()
{
    const app = new PIXI.Application({ view: document.getElementById('canvas'), transparent: true })

    viewport = app.stage.addChild(new Viewport(app.view.width, app.view.height, new PIXI.Rectangle(0, 0, WIDTH, HEIGHT), { pinchToZoom: true, bounce: true, bounceEase: 'easeInOutSine' }))

    border()
    stars()

    const panel = new Panel()
    panel.button('', () => { viewport.pinchToZoom = !viewport.pinchToZoom; return viewport.pinchToZoom ? 'pinchToZoom' : '[pinchToZoom]' }, { original: 'pinchToZoom' })
    panel.button('', () => { viewport.dragToMove = !viewport.dragToMove; return viewport.dragToMove ? 'dragToMove' : '[dragToMove]' }, { original: '[dragToMove]' })
    panel.button('', () => { viewport.noOverDrag = !viewport.noOverDrag; return viewport.noOverDrag ? 'noOverDrag' : '[noOverDrag]' }, { original: '[noOverDrag]' })
    panel.button('', () => { viewport.bounce = !viewport.bounce; return viewport.bounce ? 'bounce' : '[bounce]' }, { original: 'bounce' })

    require('./highlight')()
}