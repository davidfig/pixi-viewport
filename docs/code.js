const PIXI = require('pixi.js')
const Ease = require('pixi-ease')
const Random = require('yy-random')
const Update = require('yy-update')
const Renderer = require('yy-renderer')

const Viewport = require('..')

const BORDER = 10
const WIDTH = 10000
const HEIGHT = 10000
const STAR_SIZE = 30
const OBJECT_SIZE = 50
const OBJECT_ROTATION_TIME = 1000
const OBJECT_SPEED = 0.25
const ANIMATE_TIME = 1500

let _renderer, _viewport, _view, _title, _ease, _object, _stars = []

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
    line(0, 0, _viewport.worldBoundaries.width, BORDER)
    line(0, _viewport.worldBoundaries.height - BORDER, _viewport.worldBoundaries.width, BORDER)
    line(0, 0, BORDER, _viewport.worldBoundaries.height)
    line(_viewport.worldBoundaries.width - BORDER, 0, BORDER, _viewport.worldBoundaries.height)
}

function stars()
{
    const stars = (_viewport.worldBoundaries.width * _viewport.worldBoundaries.height) / Math.pow(STAR_SIZE, 2) * 0.1
    for (let i = 0; i < stars; i++)
    {
        const star = _renderer.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        star.anchor.set(0.5)
        star.tint = Random.color()
        star.width = star.height = STAR_SIZE
        star.alpha = Random.range(0.25, 1, true)
        star.position.set(Random.range(STAR_SIZE / 2 + BORDER, _viewport.worldBoundaries.width - STAR_SIZE - BORDER), Random.range(BORDER, _viewport.worldBoundaries.height - BORDER - STAR_SIZE))
        _stars.push(star)
    }
}

function createTarget()
{
    const target = new Ease.target(_object,
        {
            x: Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldBoundaries.width - OBJECT_SIZE / 2 - BORDER),
            y: Random.range(OBJECT_SIZE / 2 + BORDER, _viewport.worldBoundaries.height - OBJECT_SIZE / 2 - BORDER)
        }, OBJECT_SPEED
    )
    target.on('done', () => createTarget())
    _ease.add(target)
}

function object()
{
    _object = _renderer.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    _object.anchor.set(0.5)
    _object.tint = 0
    _object.width = _object.height = OBJECT_SIZE
    _object.position.set(100, 100)
    _ease.add(new Ease.to(_object, { rotation: Math.PI * 2 }, OBJECT_ROTATION_TIME, { repeat: true }))
    createTarget()
}

function resize()
{
    _view.width = window.innerWidth
    _view.height = window.innerHeight - _title.offsetHeight
    _renderer.renderer.resize(_view.width, _view.height)
    _viewport.resize(_view.width, _view.height)
}

function click(data)
{
    for (let star of _stars)
    {
        if (star.containsPoint(data.screen))
        {
            _ease.add(new Ease.to(star, { width: STAR_SIZE * 3, height: STAR_SIZE * 3 }, ANIMATE_TIME, { reverse: true, ease: 'easeInOutSine' }))
            return
        }
    }
    const sprite = _renderer.stage.addChild(new PIXI.Text('click', {fill: 0xff0000}))
    sprite.anchor.set(0.5)
    sprite.rotation = Random.range(-0.1, 0.1)
    sprite.position = data.world
    const fade = new Ease.to(sprite, { alpha: 0 }, ANIMATE_TIME)
    fade.on('done', () => _renderer.stage.removeChild(sprite))
    _ease.add(fade)
}

function drawWorld()
{
    _ease.removeAll()
    _renderer.stage.removeChildren()
    stars()
    object()
    border()
    _viewport.corner(0, 0)
}

window.onload = function ()
{
    _title = document.getElementsByClassName('titleCode')[0]
    _view = document.getElementById('canvas')
    _renderer = new Renderer({alwaysRender: true, update: Update})
    _viewport = new Viewport(_renderer.stage, {
        screenWidth: _view.width,
        screenHeight: _view.height,
        worldBoundaries: new PIXI.Rectangle(0, 0, WIDTH, HEIGHT),
        noOverZoom: false,
        decelerate: true,
        dragToMove: false,
        noOverDrag: false,
        noOverDragX: false,
        noOverDragY: false,
        pinchToZoom: true,
        bounce: true,
        lockOn: true,
        threshold: 5,
        snap: false
    })
    _viewport.on('click', click)
    resize()
    window.addEventListener('resize', resize)

    _ease = new Ease.list()

    drawWorld()

    Update.init()
    Update.add(
        function(elapsed)
        {
            _ease.update(elapsed)
        })
    Update.update()

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
    const world = gui.addFolder('world')
    world.add(_viewport.worldBoundaries, 'width').onChange(drawWorld)
    world.add(_viewport.worldBoundaries, 'height').onChange(drawWorld)
    gui.add(_viewport, 'pinchToZoom')
    gui.add(_viewport, 'dragToMove')
    gui.add(_viewport, 'noOverDrag')
    gui.add(_viewport, 'noOverDragX')
    gui.add(_viewport, 'noOverDragY')
    gui.add(_viewport, 'noOverZoom')
    gui.add(_viewport, 'threshold')
    const fake = {
        bounce: _viewport.bounce ? true : false,
        decelerate: _viewport.decelerate ? true : false,
        snap: _viewport.snap ? true : false
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
    let bounceTime, bounceEase
    if (_viewport.bounce)
    {
        bounceTime = bounce.add(_viewport.bounce, 'time', 0, 2000).step(50)
        bounceEase = bounce.add(_viewport.bounce, 'ease')
    }
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
    let decelerateFriction, decelerateBounce
    if (fake.decelerate)
    {
        decelerateFriction = decelerate.add(_viewport.decelerate, 'friction', 0, 1)
        decelerateBounce = decelerate.add(_viewport.decelerate, 'frictionBounce', 0, 1)
    }
    decelerate.open()
    const snap = gui.addFolder('snap')
    snap.add(fake, 'snap').onChange(
        function (value)
        {
            _viewport.snap = value
            if (value)
            {
                if (!snapSpeed)
                {
                    snapSpeed = snap.add(_viewport.snap, 'speed')
                    snapX = snap.add(_viewport.snap, 'x')
                    snapY = snap.add(_viewport.snap, 'y')
                }
            }
            else
            {
                if (snapSpeed)
                {
                    snap.remove(snapSpeed)
                    snap.remove(snapX)
                    snap.remove(snapY)
                }
            }
        }
    )
    let snapSpeed, snapX, snapY
    if (fake.snap)
    {
        snapSpeed = snap.add(_viewport.snap, 'speed')
        snapX = snap.add(_viewport.snap, 'x')
        snapY = snap.add(_viewport.snap, 'y')
    }
    snap.open()
}

/* global dat */