const PIXI = require('pixi.js')
const Ease = require('pixi-ease')
const Random = require('yy-random')

const Viewport = require('..')

const BORDER = 10
const WIDTH = 10000
const HEIGHT = 10000
const STARS = 5000
const STAR_SIZE = 30
const OBJECT_SIZE = 50
const OBJECT_ROTATION_TIME = 1000
const OBJECT_SPEED = 0.25

let _app, _viewport, _view, _title, _object

function line(x, y, width, height)
{
    const line = _app.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    line.tint = 0xff0000
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
        const star = _app.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.tint = Random.color()
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.range(STAR_SIZE / 2 + BORDER, WIDTH - STAR_SIZE - BORDER), Random.range(BORDER, HEIGHT - BORDER - STAR_SIZE))
    }
}

function createTarget()
{
    const target = new Ease.target(_object,
        {
            x: Random.range(OBJECT_SIZE / 2 + BORDER, WIDTH - OBJECT_SIZE / 2 - BORDER),
            y: Random.range(OBJECT_SIZE / 2 + BORDER, HEIGHT - OBJECT_SIZE / 2 - BORDER)
        }, OBJECT_SPEED
    )
    target.on('done', () => createTarget())
}

function object()
{
    _object = _app.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    _object.anchor.set(0.5)
    _object.tint = 0
    _object.width = _object.height = OBJECT_SIZE
    _object.position.set(100, 100)
    new Ease.to(_object, { rotation: Math.PI * 2 }, OBJECT_ROTATION_TIME, { repeat: true })
    createTarget()
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
    _title = document.getElementsByClassName('titleCode')[0]
    _view = document.getElementById('canvas')
    _app = new PIXI.Application({ view: _view, transparent: true, sharedTicker: true })
    Ease.init({ ticker: PIXI.ticker.shared })
    _viewport = new Viewport(_app.stage, _view.width, _view.height, new PIXI.Rectangle(0, 0, WIDTH, HEIGHT), { noOverZoom: false, decelerate: true, dragToMove: false, noOverDrag: false, pinchToZoom: true, bounce: true, lockOn: true })
    resize()
    window.addEventListener('resize', resize)

    stars()
    object()
    border()

    gui()

    require('./highlight')('https://github.com/davidfig/pixi-viewport')
}

function gui()
{
    const gui = new dat.GUI({ autoPlace: false })
    document.body.appendChild(gui.domElement)
    gui.domElement.style.bottom = '2em'
    gui.domElement.style.right = 0
    gui.domElement.style.position = 'fixed'
    gui.domElement.style.opacity = 0.95
    gui.add(_viewport, 'pinchToZoom')
    gui.add(_viewport, 'dragToMove')
    gui.add(_viewport, 'noOverDrag')
    gui.add(_viewport, 'noOverZoom')
    const fake = {
        bounce: _viewport.bounce ? true : false,
        decelerate: _viewport.decelerate ? true : false
    }
    const bounce = gui.addFolder('bounce')
    bounce.add(fake, 'bounce').onChange(
        function (value)
        {
            _viewport.bounce = value
            if (value)
            {
                if (!bounceTime)
                {
                    bounceTime = bounce.add(_viewport.bounce, 'time', 0, 2000).step(50)
                    bounceEase = bounce.add(_viewport.bounce, 'ease')
                }
            }
            else
            {
                if (bounceTime)
                {
                    bounce.remove(bounceTime)
                    bounceTime = null
                    bounce.remove(bounceEase)
                }
            }
        }
    )
    let bounceTime = bounce.add(_viewport.bounce, 'time', 0, 2000).step(50)
    let bounceEase = bounce.add(_viewport.bounce, 'ease')
    bounce.open()
    const decelerate = gui.addFolder('decelerate')
    decelerate.add(fake, 'decelerate').onChange(
        function (value)
        {
            _viewport.decelerate = value
            if (value)
            {
                if (!decelerateFriction)
                {
                    decelerateFriction = decelerate.add(_viewport.decelerate, 'friction', 0, 1)
                    decelerateBounce = decelerate.add(_viewport.decelerate, 'frictionBounce', 0, 1)
                }
            }
            else
            {
                if (decelerateFriction)
                {
                    decelerate.remove(decelerateFriction)
                    decelerate.remove(decelerateBounce)
                    decelerateFriction = null
                }
            }
        }
    )
    let decelerateFriction = decelerate.add(_viewport.decelerate, 'friction', 0, 1)
    let decelerateBounce = decelerate.add(_viewport.decelerate, 'frictionBounce', 0, 1)
    decelerate.open()
}