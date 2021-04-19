import * as viewport from './viewport'

let app

function createApplication() {
    app = new PIXI.Application({
        backgroundAlpha: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio,
        antialias: true,
    })
    document.body.appendChild(app.view)
    app.view.style.position = 'fixed'
    app.view.style.width = '100vw'
    app.view.style.height = '100vh'
    app.view.style.top = 0
    app.view.style.left = 0
    app.view.style.background = 'rgba(0,0,0,.1)'
}

function start() {
    createApplication()
    app.stage.addChild(viewport.create())
    window.onresize = () => app.renderer.resize(window.innerWidth, window.innerHeight)
}

window.onload = start