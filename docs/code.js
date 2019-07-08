import * as PIXI from 'pixi.js'
import { ease } from 'pixi-ease'
// import { ease } from '../../pixi-ease'
import Random from 'yy-random'
import Counter from 'yy-counter'
import FPS from 'yy-fps'
import clicked from 'clicked'
// import highlight from 'highlight.js'
import DomEase from 'dom-ease'

import { Viewport } from '../src/viewport'
import { UserPlugin } from './user-plugin'

import { gui } from './gui'

const BORDER = 10
const WIDTH = 3000
const HEIGHT = 3000
const STAR_SIZE = 30
const OBJECT_SIZE = 50
const OBJECT_ROTATION_TIME = 1000
const OBJECT_SPEED = 0.25
const FADE_TIME = 2000

let _fps, _application, _viewport, _object, _stars = [], domEase

function viewport()
{
    _viewport = _application.stage.addChild(new Viewport(
    {
        interaction: _application.renderer.plugins.interaction,
        passiveWheel: false
    }))
    _viewport
        .drag({ clampWheel: true })
        .wheel({ smooth: 3 })
        .pinch()
        .decelerate()
        .on('clicked', click)
    resize()

    domEase = new DomEase({ duration: FADE_TIME })
    ease.duration = FADE_TIME

    // test for x/y independent scaling
    // _viewport.scale.y = 1.5

    // test for removeListeners()
    // _viewport.removeListeners()

    _viewport.plugins.add('test', new UserPlugin(_viewport))
}

function resize()
{
    _application.renderer.resize(window.innerWidth, window.innerHeight)
    _viewport.resize(window.innerWidth, window.innerHeight, WIDTH, HEIGHT)
}

function addCounter(name)
{
    const counter = new Counter({ side: 'top-left' })
    counter.log(name)
    const e = domEase.add(counter.div, { opacity: 0 })
    e.once('complete', () => counter.div.remove())
}

function events()
{
    _viewport.on('clicked', () => addCounter('clicked'))
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
    _viewport.on('moved-end', () => addCounter('moved-end'))
    _viewport.on('zoomed-end', () => addCounter('zoomed-end'))
    // _viewport.on('moved', (data) => addCounter('moved: ' + data.type))
}

function border()
{
    const line = _viewport.addChild(new PIXI.Graphics())
    line.lineStyle(10, 0xff0000).drawRect(0, 0, _viewport.worldWidth, _viewport.worldHeight)
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
    const target = ease.target(_object, { x, y }, OBJECT_SPEED, { wait: Random.chance(0.75) ? Random.range(500, 3000) : null })
    target.once('complete', createTarget)
}

function object()
{
    _object = _viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
    _object.anchor.set(0.5)
    _object.tint = 0
    _object.width = _object.height = OBJECT_SIZE
    _object.position.set(100, 100)
    ease.add(_object, { rotation: Math.PI * 2 }, { duration: OBJECT_ROTATION_TIME, repeat: true, ease: 'linear' })
    createTarget()
}

function click(data)
{
    for (let star of _stars)
    {
        if (star.containsPoint(data.screen))
        {
            ease.add(star, { width: STAR_SIZE * 3, height: STAR_SIZE * 3 }, { reverse: true })
            return
        }
    }
    const sprite = _viewport.addChild(new PIXI.Text('click', { fill: 0xff0000 }))
    sprite.anchor.set(0.5)
    sprite.rotation = Random.range(-0.1, 0.1)
    sprite.position = data.world
    const fade = ease.add(sprite, { alpha: 0 })
    fade.on('done', () => _viewport.removeChild(sprite))
}

function drawWorld()
{
    ease.removeAll()
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
    button.style.backgroundColor = '#3498db'
    button.style.color = 'white'
    button.style.position = 'fixed'
    button.style.left = '1em'
    button.style.top = '1em'
    button.style.backgroundImage = 'linear-gradient(to bottom, #3498db, #2980b9)'
    button.style.padding = '10px 20px 10px 20px'
    clicked(button, () => window.location.href = 'https://davidfig.github.io/pixi-viewport/jsdoc/')
}

window.onload = function()
{
    _fps = new FPS({ side: 'bottom-left' })
    _application = new PIXI.Application({ transparent: true, width: window.innerWidth, height: window.innerHeight, resolution: window.devicePixelRatio })
    document.body.appendChild(_application.view)
    _application.view.style.position = 'fixed'
    _application.view.style.width = '100vw'
    _application.view.style.height = '100vh'

    viewport()

    window.addEventListener('resize', resize)

    drawWorld()
    events()

    PIXI.Ticker.shared.add(() =>
    {
        _fps.frame()
        // test dirty
        // if (_viewport.dirty)
        // {
        //     console.log('dirty')
        // }
        // _viewport.dirty = false
    })

    gui(_viewport, drawWorld, _object)

    API()

    // highlight()
}