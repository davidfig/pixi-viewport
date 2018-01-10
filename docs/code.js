const PIXI = require('pixi.js')
const Ease = require('pixi-ease')
const Random = require('yy-random')
const Counter = require('yy-counter')
const FPS = require('yy-fps')

const Viewport = require('../dist/viewport')
// const Viewport = require('../src/viewport')

const gui = require('./gui')

const BORDER = 10
const WIDTH = 5000
const HEIGHT = 5000
const STAR_SIZE = 30
const OBJECT_SIZE = 50
const OBJECT_ROTATION_TIME = 1000
const OBJECT_SPEED = 0.25
const FADE_TIME = 2000

let _fps, _renderer, _viewport, _ease, _object, _stars = []

function viewport()
{
    _viewport = _renderer.stage.addChild(new Viewport())
    _viewport
        .drag({ clampWheel: true })
        .wheel()
        .pinch()
        .decelerate()
        .bounce()
    resize()
}

function resize()
{
    _renderer.renderer.resize(window.innerWidth, window.innerHeight)
    _viewport.resize(window.innerWidth, window.innerHeight, WIDTH, HEIGHT)
}

function addCounter(name)
{
    const counter = new Counter({ side: 'top-left' })
    counter.log(name)
    const ease = _ease.to(counter.div.style, { opacity: 0 }, FADE_TIME, { ease: 'easeInOutSine' })
    ease.once('done', () => counter.div.remove())
}

function events()
{
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
    const line = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
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
        const star = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
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

    const x = Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldWidth - OBJECT_SIZE / 2 - BORDER)
    const y = Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldHeight - OBJECT_SIZE / 2 - BORDER)
    const target = _ease.target(_object, { x, y }, OBJECT_SPEED)
    target.once('done', createTarget)
}

function object()
{
    _object = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    _object.anchor.set(0.5)
    _object.tint = 0
    _object.width = _object.height = OBJECT_SIZE
    _object.position.set(100, 100)
    _ease.to(_object, { rotation: Math.PI * 2 }, OBJECT_ROTATION_TIME, { repeat: true })
    createTarget()
}

function drawWorld()
{
    _ease.removeAll()
    _viewport.removeChildren()
    stars()
    object()
    border()
    _viewport.moveCorner(0, 0)
}

function API()
{
    const button = document.createElement('button')
    document.body.appendChild(button)
    button.innerText = 'API Documentation'
    button.style.backgroundColor = 'rgba(0,0,0,0.75)'
    button.style.color = 'white'
    button.style.position = 'fixed'
    button.style.left = 0
    button.style.top = 0
    button.onclick = () => window.location.href = '/jsdoc/'
}

window.onload = function ()
{
    _fps = new FPS({ side: 'bottom-left' })
    _renderer = new PIXI.Application({ transparent: true, width: window.innerWidth, height: window.innerHeight, resolution: window.devicePixelRatio })
    document.body.appendChild(_renderer.view)
    _renderer.view.style.position = 'fixed'
    _renderer.view.style.width = '100vw'
    _renderer.view.style.height = '100vh'

    viewport()

    window.addEventListener('resize', resize)

    _ease = new Ease.list()
    drawWorld()
    events()

    PIXI.ticker.shared.add(() => _fps.frame())

    gui.gui(_viewport, drawWorld, _object)

    API()

    require('./highlight')('https://github.com/davidfig/pixi-viewport')
}