import * as PIXI from 'pixi.js'
import { Viewport } from '../../../'

window.onload = () =>
{
    function rand(n)
    {
        return Math.round(Math.random() * n)
    }

    const app = new PIXI.Application({ autoresize: true })
    app.view.style.textAlign = 'center'
    document.body.appendChild(app.view)
    const div = document.createElement('div')
    div.innerHTML = '<div>Rollup <a href="https://https://github.com/davidfig/pixi-viewport">pixi-viewport</a>: viewport.drag().pinch().decelerate()</div>'
    document.body.appendChild(div)

    const viewport = app.stage.addChild(new Viewport({ screenWidth: app.view.offsetWidth, screenHeight: app.view.offsetHeight }))
    for (let i = 0; i < 10000; i++)
    {
        const sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        sprite.tint = rand(0xffffff)
        sprite.position.set(rand(10000), rand(10000))
    }
    viewport
        .moveCenter(5000, 5000)
        .drag()
        .pinch()
        .decelerate()
}