const PIXI = require('pixi.js')
const Ease = require('pixi-ease')
const Random = require('yy-random')
const Renderer = require('yy-renderer')
const Counter = require('yy-counter')

const Viewport = require('..')

const gui = require('./gui')

const BORDER = 10
const WIDTH = 5000
const HEIGHT = 5000
const STAR_SIZE = 30
const OBJECT_SIZE = 50
const OBJECT_ROTATION_TIME = 1000
const OBJECT_SPEED = 0.25
const ANIMATE_TIME = 1500
const FADE_TIME = 2000

let _renderer, _viewport, _ease, _object, _targetAnimation, _stars = []

function viewport()
{
    _viewport = new Viewport(_renderer.stage, { div: _renderer.div, pauseOnBlur: true, preventDefault: true })
    _viewport
        .drag()
        .wheel()
        .pinch()
        .on('click', click)
        .decelerate()
        .bounce()
        .start()
    resize()
}

function resize()
{
    _renderer.resize()
    _viewport.resize(window.innerWidth, window.innerHeight, WIDTH, HEIGHT)
}

function addCounter(name)
{
    const counter = new Counter({ side: 'top-left' })
    counter.log(name)
    const ease = _ease.to(counter.div.style, { opacity: 0 }, FADE_TIME, { ease: 'easeInOutSine' })
    ease.on('done', () => counter.div.remove())
}

function events()
{
    _viewport.on('click', (data) => addCounter('click: ' + data.screen.x + ', ' + data.screen.y))
    _viewport.on('drag-start', () => addCounter('drag-start'))
    _viewport.on('drag-end', () => addCounter('drag-end'))
    _viewport.on('pinch-start', () => addCounter('pinch-start'))
    _viewport.on('pinch-end', () => addCounter('pinch-end'))
    _viewport.on('bounce-start-x', () => addCounter('bounce-start-x'))
    _viewport.on('bounce-end-x', () => addCounter('bounce-end-x'))
    _viewport.on('bounce-start-y', () => addCounter('bounce-start-y'))
    _viewport.on('bounce-end-y', () => addCounter('bounce-end-y'))
    _viewport.on('snap-start', () => addCounter('snap-start'))
    _viewport.on('snap-end', () => addCounter('snap-end'))
    _viewport.on('snap-zoom-start', () => addCounter('snap-zoom-start'))
    _viewport.on('snap-zoom-end', () => addCounter('snap-zoom-end'))
    _viewport.on('mouse-edges-start', () => addCounter('mouse-edges-start'))
    _viewport.on('mouse-edges-end', () => addCounter('mouse-edges-end'))
}

function line(x, y, width, height)
{
    const line = _renderer.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    line.tint = 0xff0000
    line.position.set(x, y)
    line.width = width
    line.height = height
}

function border()
{
    line(0, 0, _viewport.worldWidth, BORDER)
    line(0, _viewport.worldHeight - BORDER, _viewport.worldWidth, BORDER)
    line(0, 0, BORDER, _viewport.worldHeight)
    line(_viewport.worldWidth - BORDER, 0, BORDER, _viewport.worldHeight)
}

function stars()
{
    const stars = (_viewport.worldWidth * _viewport.worldHeight) / Math.pow(STAR_SIZE, 2) * 0.1
    for (let i = 0; i < stars; i++)
    {
        const star = _renderer.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.anchor.set(0.5)
        star.tint = Random.color()
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.range(STAR_SIZE / 2 + BORDER, _viewport.worldWidth - STAR_SIZE - BORDER), Random.range(BORDER, _viewport.worldHeight - BORDER - STAR_SIZE))
        _stars.push(star)
    }
}

function createTarget()
{
    _targetAnimation = _ease.target(_object,
        {
            x: Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldWidth - OBJECT_SIZE / 2 - BORDER),
            y: Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldHeight - OBJECT_SIZE / 2 - BORDER)
        }, OBJECT_SPEED
    )
    _targetAnimation.on('done', createTarget)
}

function object()
{
    _object = _renderer.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    _object.anchor.set(0.5)
    _object.tint = 0
    _object.width = _object.height = OBJECT_SIZE
    _object.position.set(100, 100)
    _ease.to(_object, { rotation: Math.PI * 2 }, OBJECT_ROTATION_TIME, { repeat: true })
    createTarget()
}

function click(data)
{
    for (let star of _stars)
    {
        if (star.containsPoint(data.screen))
        {
            _ease.to(star, { width: STAR_SIZE * 3, height: STAR_SIZE * 3 }, ANIMATE_TIME, { reverse: true, ease: 'easeInOutSine' })
            return
        }
    }
    const sprite = _renderer.stage.addChild(new PIXI.Text('click', {fill: 0xff0000}))
    sprite.anchor.set(0.5)
    sprite.rotation = Random.range(-0.1, 0.1)
    sprite.position = data.world
    const fade = _ease.to(sprite, { alpha: 0 }, ANIMATE_TIME)
    fade.on('done', () => _renderer.stage.removeChild(sprite))
}

function drawWorld()
{
    _ease.removeAll()
    _renderer.stage.removeChildren()
    stars()
    object()
    border()
    _viewport.moveCorner(0, 0)
}

window.onload = function ()
{
    _renderer = new Renderer({ debug: true, fpsOptions: { side: 'bottom-left' } })
    viewport()
    window.addEventListener('resize', resize)

    _ease = new Ease.list()
    _viewport.interval(
        function ()
        {
            _ease.update()
            if (!gui.options.testDirty)
            {
                _renderer.dirty = true
            }
            if (_viewport.dirty)
            {
                _renderer.dirty = true
                _viewport.dirty = false
            }
            _renderer.update()
        }
    )
    drawWorld()
    events()

    gui.gui(_viewport, drawWorld, _object)

    require('./highlight')('https://github.com/davidfig/pixi-viewport')
}