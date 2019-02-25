import { demo, viewport } from './demo'

var options = {
    distance: 50,
    radius: 0,
    noDecelerate: false,
    'decelerate-plugin': true,
    reverse: false,
    linear: false,
    speed: 8,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    allowButtons: false
}

function mouseEdges() {
    viewport.mouseEdges(options)
    if (options['decelerate-plugin']) {
        viewport.decelerate()
    }
    else if (viewport.plugins.decelerate) {
        viewport.removePlugin('decelerate')
    }
}

window.addEventListener('load', () => {
    demo('mouseEdges', options, mouseEdges)
})