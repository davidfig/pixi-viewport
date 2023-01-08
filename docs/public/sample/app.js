// import * as PIXI from 'pixi.js'  // use with modern build toolchain
import * as viewport from './viewport'
import * as target from './target'

let renderer

function createRenderer() {
    renderer = new PIXI.Renderer({
        backgroundAlpha: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio,
        antialias: true,
    })
    document.body.appendChild(renderer.view)
    renderer.view.style.position = 'fixed'
    renderer.view.style.width = '100vw'
    renderer.view.style.height = '100vh'
    renderer.view.style.top = 0
    renderer.view.style.left = 0
    renderer.view.style.background = 'rgba(0,0,0,.1)'
}

function start() {
    createRenderer()
    viewport.create(renderer)
    window.onresize = () => {
        renderer.resize(window.innerWidth, window.innerHeight)
        viewport.get().resize(window.innerWidth, window.innerHeight)
    }
    update()
}

function update() {
    const vp = viewport.get()
    if (vp.dirty || target.isDirty()) {
        target.update()
        renderer.render(vp)
        vp.dirty = false
    }
    requestAnimationFrame(() => update())
}

window.onload = start