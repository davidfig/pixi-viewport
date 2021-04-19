import { Renderer } from 'pixi.js'
import { border } from './border'
import { stars } from './stars'

const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000
const STAR_SIZE = 30
const BORDER = 10

let viewport

export function create() {
    // create the viewport
    viewport = new pixi_viewport.Viewport({
        // screenWidth: window.innerWidth,
        // screenHeight: window.innerHeight,
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
        // threshold: 5,
        // passiveWheel: true,
        // stopPropagation: false,
        // forceHitArea: null,
        // noTicker: false,
        // ticker: PIXI.Ticker.shared,
        // interaction: renderer.plugins.interaction,
        // divWheel: null,
        // disableOnContextMenu: false,
    })

    viewport
        .drag({
            // direction: 'all',
            // pressDrag: true,
            // wheel: true,
            // wheelScroll: 1,
            // reverse: false,
            // clampWheel: false,
            // underflow: 'center',
            // factor: 1,
            // mouseButtons: 'all',
            // keyToPress: null
            // ignoreKeyToPressOnTouch: false
        })
        .decelerate({
            // friction: 0.95,
            // bounce: 0.8,
            // minSpeed: 0.01,
        })
        .pinch()
        .wheel()

    // create elements
    stars(viewport, STAR_SIZE, BORDER)
    border(viewport, BORDER)

    // fit and center the world into the panel
    viewport.fit()
    viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

    return viewport
}
