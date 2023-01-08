import { range } from './random'

const SIZE = 40
const SPEED = 3
const SPIN_SPEED = 0.05

const target = new PIXI.Sprite(PIXI.Texture.WHITE)

let _viewport, _active, _velocity, _time, _last

export function start() {
    _active = true
    _last = Date.now()
}

export function setup(viewport) {
    viewport.addChild(target)
    target.tint = 0
    target.width = target.height = SIZE
    target.anchor.set(0.5)
    target.position.set(viewport.worldWidth / 2, viewport.worldHeight / 2)
    _viewport = viewport
    changeTarget()
}

export function get() {
    return target
}

export function update() {
    if (_active) {
        target.rotation += SPIN_SPEED
        target.x += _velocity[0]
        target.y += _velocity[1]
        const now = Date.now()
        _time -= now - _last
        _last = now
        if (_time <= 0) {
            changeTarget()
        }
    }
}

function changeTarget() {
    const x = range(SIZE / 2, _viewport.worldWidth - SIZE / 2)
    const y = range(SIZE / 2, _viewport.worldHeight - SIZE / 2)
    const angle = Math.atan2(y - target.y, x - target.x)
    _velocity = [Math.cos(angle) * SPEED, Math.sin(angle) * SPEED]
    _time = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)) / (SPEED * 60 / 1000)
}

export function isDirty() {
    return _active
}