var renderer,
    viewport,
    panel,
    originals = [],
    width = window.innerWidth * 3,
    height = window.innerHeight * 3,
    stars = (width + height) / 10

function createPage(name) {
    document.body.style.margin = 0
    document.body.style.padding = 0
    document.body.style.userSelect = false
    const div = document.createElement('div')
    div.style.fontSize = '1.75em'
    div.innerHTML = `viewport.${name}() example for <a href="https://github.com/davidfig/pixi-viewport.git/">github.com/davidfig/pixi-viewport/</a></div>`
    document.body.appendChild(div)
}

function createApplication() {
    renderer = new PIXI.Application({ transparent: true, width: window.innerWidth, height: window.innerHeight, resolution: window.devicePixelRatio })
    document.body.appendChild(renderer.view)
    renderer.view.style.position = 'fixed'
    renderer.view.style.width = '100vw'
    renderer.view.style.height = '100vh'
    renderer.view.style.top = 0
    renderer.view.style.left = 0
    renderer.view.style.background = 'rgba(0,0,0,.1)'
}

function createViewport() {
    viewport = renderer.stage.addChild(new PIXI.extras.Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: width,
        worldHeight: height
    }))
}

function createWorld() {
    const g = viewport.addChild(new PIXI.Graphics())
    g.lineStyle(5, 0xff0000).drawRect(0, 0, width, height).lineStyle(0)
    for (var i = 0; i < stars; i++) {
        var box = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        box.tint = Math.floor(Math.random() * 0xffffff)
        box.width = box.height = 20
        box.position.set(Math.floor(Math.random() * width), Math.floor(Math.random() * height))
    }
}

function createGUI(name, options, callback) {
    originals = []
    for (let key in options) {
        originals[key] = options[key]
    }
    panel = new SettingsPanel()
    panel.button(name + '.options', () => { })
    const style = { 'textAlign': 'right' }
    const size = 5
    for (let key in options) {
        const title = key + ': '
        if (typeof options[key] === 'boolean') {
            const input = panel.input(title, value => {
                if (value && value.toLowerCase() !== 'false') {
                    options[key] = true
                    input.value = 'true'
                }
                else {
                    options[key] = false
                    input.value = 'false'
                }
                callback()
            }, { original: options[key] ? 'true' : 'false', size, sameLine: true, style })
        }
        else if (isNaN(options[key])) {
            const input = panel.input(title, value => {
                if (value === '') {
                    options[key] = originals[key]
                }
                else {
                    options[key] = value
                }
                input.value = value
                callback()
            }, { original: options[key], size, sameLine: true, style })
        }
        else {
            panel.input(title,
                value => {
                    options[key] = value.indexOf('.') === -1 ? parseInt(value) : parseFloat(value)
                    callback()
                },
                { original: options[key], size, sameLine: true, style })
        }
    }
    callback()
}

function init(name, options, callback) {
    createPage(name)
    createApplication()
    createViewport()
    createWorld()
    createGUI(name, options, callback)

    window.onresize = function () {
        renderer.renderer.resize(window.innerWidth, window.innerHeight)
        viewport.resize(window.innerWidth, window.innerHeight)
    }
}

window.Demo = {
    init,
    get renderer() { return renderer },
    get viewport() { return viewport },
    get panel() { return panel }
}