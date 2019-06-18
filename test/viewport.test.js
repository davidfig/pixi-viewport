// import { Viewport } from '..'
import * as draw from './draw.js'

const SIZE = 10000
const DOT = 100
const COUNT = 1000

describe('Viewport', () =>
{
    describe('new Viewport()', () =>
    {
        draw.init()
        let viewport = new Viewport()
        draw.draw(viewport, SIZE, DOT, COUNT)
        assert.equal(viewport.screenWidth, window.innerWidth)
        assert.equal(viewport.screenHeight, window.innerHeight)
        assert.isNull(viewport._worldWidth)
        assert.isNull(viewport._worldHeight)
        assert.equal(viewport.threshold, 5)
        assert.isTrue(viewport.options.passiveWheel)
        assert.isFalse(viewport.options.stopPropagation)
        assert.isNull(viewport.forceHitArea)
        assert.isTrue(viewport.options.passiveWheel)
        assert.isFunction(viewport.tickerFunction)
        assert.isUndefined(viewport.interaction)
    })

    describe('new Viewport(options)', () =>
    {
        const ticker = new PIXI.Ticker()
        const divWheel = document.createElement('div')
        const forceHitArea = new PIXI.Rectangle(0, 0, 100, 100)
        const viewport = new Viewport(
        {
            screenWidth: 100,
            screenHeight: 101,
            worldWidth: 1000,
            worldHeight: 1001,
            threshold: 10,
            passiveWheel: false,
            stopPropagation: true,
            forceHitArea,
            noTicker: true,
            ticker,
            interaction: draw.renderer.plugins.interaction,
            divWheel
        })
        assert.equal(viewport.screenWidth, 100)
        assert.equal(viewport.screenHeight, 101)
        assert.equal(viewport.worldWidth, 1000)
        assert.equal(viewport.worldHeight, 1001)
        assert.equal(viewport.threshold, 10)
        assert.isFalse(viewport.options.passiveWheel)
        assert.isTrue(viewport.options.stopPropagation)
        assert.equal(viewport.hitArea, forceHitArea)
        assert.isNotFunction(viewport.tickerFunction)
        assert.equal(viewport.options.ticker, ticker)
        assert.equal(viewport.options.interaction, draw.renderer.plugins.interaction)
        assert.equal(viewport.options.divWheel, divWheel)
    })
})
// function sizing()
// {
//     log('Testing resize()...')
//     const viewport = new Viewport()
//     draw.draw(viewport, SIZE, DOT, COUNT)
//     viewport.resize(101, 102)
//     draw.renderer.resize(101, 102)
//     if (assert.equal(viewport.screenWidth, 101) &&
//         assert.equal(viewport.screenHeight, 102) &&
//         assert.equal(viewport.worldWidth, 10000) &&
//         assert.equal(viewport.worldHeight, 10000))
//         pass()
//     else return fail()

//     log('Testing getVisibleBounds()...')
//     const bounds = viewport.getVisibleBounds()
//     if (assert.isZero(bounds.x) &&
//         assert.isZero(bounds.y) &&
//         assert.equal(bounds.width, 101) &&
//         assert.equal(bounds.height, 102))
//         pass()
//     else return fail()

//     log('Testing zoom() and center...')
//     viewport.zoom(100, true)
//     if (assert.equal(viewport.center.x, 50.5) &&
//         assert.equal(viewport.center.y, 51))
//         pass()
//     else return fail()

//     log('Testing worldScreenWidth and worldScreenHeight...')
//     if (assert.equalRounded(viewport.worldScreenWidth, 201) &&
//         assert.equalRounded(viewport.worldScreenHeight, 203))
//         pass()
//     else return fail()

//     log('Testing toWorld()...')
//     const world = viewport.toWorld(50, 50)
//     if (assert.equalRounded(world.x, 50) &&
//         assert.equalRounded(world.y, 49))
//         pass()
//     else return fail()

//     log('Testing toScreen()...')
//     const screen = viewport.toScreen(100, 100)
//     if (assert.equalRounded(screen.x, 75) &&
//         assert.equalRounded(screen.y, 76))
//         pass()
//     else return fail()

//     log('Testing screenWorldWidth and screenWorldHeight...')
//     if (assert.equalRounded(viewport.screenWorldWidth, 5025) &&
//         assert.equalRounded(viewport.screenWorldHeight, 5025))
//         pass()
//     else return fail()

//     log('Testing moveCenter(), top, bottom, left, and right...')
//     viewport.moveCenter(500, 500)
//     if (assert.equalRounded(viewport.top, 399) &&
//         assert.equalRounded(viewport.bottom, 601) &&
//         assert.equalRounded(viewport.left, 400) &&
//         assert.equalRounded(viewport.right, 601))
//         pass()
//     else return fail()

//     log('Testing moveCorner() and corner...')
//     viewport.moveCorner(11, 12)
//     if (assert.equalRounded(viewport.corner.x, 11) &&
//         assert.equalRounded(viewport.corner.y, 12))
//         pass()
//     else return fail()

//     log('Testing fitWidth(n, true)...')
//     viewport.fitWidth(1000, true)
//     if (assert.equalRounded(viewport.screenWorldWidth, 1010) &&
//         assert.equalRounded(viewport.screenWorldHeight, 1010) &&
//         assert.equalRounded(viewport.center.x, 112) &&
//         assert.equalRounded(viewport.center.y, 113))
//         pass()
//     else return fail()

//     log('Testing fitWidth(n, false, false)...')
//     viewport.fitWidth(500, false, false)
//     if (assert.equalRounded(viewport.center.x, 56) &&
//         assert.equalRounded(viewport.center.y, 113) &&
//         assert.equalRounded(viewport.screenWorldWidth, 2020) &&
//         assert.equalRounded(viewport.screenWorldHeight, 1010))
//         pass()
//     else return fail()

//     log('Testing fitHeight(n, true)...')
//     viewport.fitHeight(400, true)
//     if (assert.equalRounded(viewport.screenWorldWidth, 2550) &&
//         assert.equalRounded(viewport.screenWorldHeight, 2550) &&
//         assert.equalRounded(viewport.center.x, 56) &&
//         assert.equalRounded(viewport.center.y, 113))
//         pass()
//     else return fail()

//     log('Testing fitHeight(n, false, false)...')
//     viewport.moveCenter(202, 22)
//     viewport.fitHeight(800, false, false)
//     if (assert.equalRounded(viewport.center.x, 202) &&
//         assert.equalRounded(viewport.center.y, 44) &&
//         assert.equalRounded(viewport.worldScreenHeight, 800) &&
//         assert.equalRounded(viewport.screenWorldHeight, 1275))
//         pass()
//     else return fail()

//     log('Testing fitWorld()...')
//     viewport.fitWorld()
//     viewport.moveCorner(0, 0)
//     if (
//         assert.equalRounded(viewport.center.x, 5000) &&
//         assert.equalRounded(viewport.center.y, 5050) &&
//         assert.equalRounded(viewport.screenWorldWidth, 101) &&
//         assert.equalRounded(viewport.screenWorldHeight, 101))
//         pass()
//     else return fail()
// }