const PIXI = require('pixi.js')
const Random = require('yy-random')
const Panel = require('settingspanel')

const Viewport = require('..')

const BORDER = 10
const WIDTH = 10000
const HEIGHT = 10000
const STARS = 10000
const STAR_SIZE = 30

let _app, _viewport, _view, _title

function line(x, y, width, height)
{
    const line = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
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
        const star = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.tint = Random.color()
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.get(WIDTH), Random.get(HEIGHT))
    }
}

function resize()
{
    _view.width = window.innerWidth
    _view.height = window.innerHeight - _title.offsetHeight
    _app.renderer.resize(_view.width, _view.height)
    _viewport.resize(_view.width, _view.height)
}

window.onload = function ()
{
    _title = document.getElementsByClassName('title')[0]
    _view = document.getElementById('canvas')
    _app = new PIXI.Application({ view: _view, transparent: true, sharedTicker: true })
    _viewport = _app.stage.addChild(new Viewport(_view.width, _view.height, new PIXI.Rectangle(0, 0, WIDTH, HEIGHT), { friction: 0.1, pinchToZoom: true, bounce: true, bounceEase: 'easeInOutSine' }))
    resize()
    window.addEventListener('resize', resize)

    border()
    stars()

    const panel = new Panel()
    panel.button('', () => { _viewport.pinchToZoom = !_viewport.pinchToZoom; return _viewport.pinchToZoom ? 'pinchToZoom' : '[pinchToZoom]' }, { original: 'pinchToZoom' })
    panel.button('', () => { _viewport.bounce = !_viewport.bounce; return _viewport.bounce ? 'bounce' : '[bounce]' }, { original: 'bounce' })
    panel.input('friction: ', (value) => { _viewport.friction = value }, { original: 0.1, size: 5 })
    panel.button('', () => { _viewport.dragToMove = !_viewport.dragToMove; return _viewport.dragToMove ? 'dragToMove' : '[dragToMove]' }, { original: '[dragToMove]' })
    panel.button('', () => { _viewport.noOverDrag = !_viewport.noOverDrag; return _viewport.noOverDrag ? 'noOverDrag' : '[noOverDrag]' }, { original: '[noOverDrag]' })

    require('./highlight')()
}