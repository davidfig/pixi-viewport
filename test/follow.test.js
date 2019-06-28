require('./node-shim')
const assert = require('chai').assert
const Viewport = require('../dist/viewport.js').Viewport

describe('follow', () =>
{
    it('default options', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 })
        const target = { x: 10, y: 11 }
        viewport.follow(target)
        const follow = viewport.plugins.get('follow')
        assert.equal(follow.options.speed, 0)
        assert.isNull(follow.options.acceleration)
        assert.equal(follow.options.speed, 0)
        assert.isNull(follow.options.radius)
        target.x = 20
        target.y = 21
        assert.equal(viewport.center.x, 50)
        assert.equal(viewport.center.y, 100)
        setTimeout(() =>
        {
            assert.equal(viewport.center.x, 20)
            assert.equal(viewport.center.y, 21)
            viewport.destroy()
        }, 1000 / 60)
    })

    it('paused', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 })
        const target = { x: 10, y: 11 }
        viewport.follow(target)
        viewport.plugins.pause('follow')
        setTimeout(() =>
        {
            assert.equal(viewport.center.x, 50)
            assert.equal(viewport.center.y, 100)
            viewport.destroy()
        }, 250)
    })

    it('speed', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 })
        const target = { x: 10, y: 11 }
        viewport.follow(target, { speed: 2 })
        setTimeout(() =>
        {
            assert.equal(Math.floor(viewport.center.x), 49)
            assert.equal(Math.floor(viewport.center.y), 98)
        }, 1000 / 60)
        setTimeout(() =>
        {
            assert.equal(viewport.center.x, 10)
            assert.equal(viewport.center.y, 11)
            viewport.destroy()
        }, 1000)
    })

    it('radius', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 })
        const target = { x: 10, y: 11 }
        viewport.follow(target, { radius: 10, speed: 5 })
        setTimeout(() =>
        {
            assert.equal(Math.floor(viewport.center.x), 29)
            assert.equal(Math.floor(viewport.center.y), 54)
            viewport.moveCenter(15, 15)
            setTimeout(() =>
            {
                assert.equal(viewport.center.x, 15)
                assert.equal(viewport.center.y, 15)
                viewport.destroy()
            }, 1000)
        }, 1000 / 60 * 10)
    })

    it('speed and acceleration', () =>
    {
        const viewport = new Viewport({ screenWidth: 100, screenHeight: 200 })
        const target = { x: 10, y: 11 }
        viewport.follow(target, { acceleration: 0.1, speed: 5 })
        setTimeout(() =>
        {
            assert.equal(Math.floor(viewport.center.x), 36)
            assert.equal(Math.floor(viewport.center.y), 69)
        }, 1000 / 60 * 10)
        setTimeout(() =>
        {
            assert.equal(Math.floor(viewport.center.x), 10)
            assert.equal(Math.floor(viewport.center.y), 11)
            viewport.destroy()
        }, 1000)
    })
})