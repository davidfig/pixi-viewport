describe('pixi-viewport', () =>
{
    it('contructor with default options', () =>
    {
        let viewport = new Viewport.Viewport()
        chai.assert.equal(viewport.screenWidth, window.innerWidth)
        chai.assert.equal(viewport.screenHeight, window.innerHeight)
        chai.assert.isNull(viewport._worldWidth)
        chai.assert.isNull(viewport._worldHeight)
        chai.assert.equal(viewport.threshold, 5)
        chai.assert.isTrue(viewport.options.passiveWheel)
        chai.assert.isFalse(viewport.options.stopPropagation)
        chai.assert.isNull(viewport.forceHitArea)
        chai.assert.isTrue(viewport.options.passiveWheel)
        chai.assert.isFunction(viewport.tickerFunction)
        chai.assert.isUndefined(viewport.interaction)
    })

    it('contructor with passed options', () =>
    {
        const ticker = new PIXI.Ticker()
        const divWheel = document.createElement('div')
        const forceHitArea = new PIXI.Rectangle(0, 0, 100, 100)
        const interaction = {}
        const viewport = new Viewport.Viewport(
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
            interaction,
            divWheel
        })
        chai.assert.equal(viewport.screenWidth, 100)
        chai.assert.equal(viewport.screenHeight, 101)
        chai.assert.equal(viewport.worldWidth, 1000)
        chai.assert.equal(viewport.worldHeight, 1001)
        chai.assert.equal(viewport.threshold, 10)
        chai.assert.isFalse(viewport.options.passiveWheel)
        chai.assert.isTrue(viewport.options.stopPropagation)
        chai.assert.equal(viewport.hitArea, forceHitArea)
        chai.assert.isNotFunction(viewport.tickerFunction)
        chai.assert.equal(viewport.options.ticker, ticker)
        chai.assert.equal(viewport.options.interaction, interaction)
        chai.assert.equal(viewport.options.divWheel, divWheel)
    })

    it('resize() should change screen and world sizes', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(101, 102, 10000, 10001)
        chai.assert.equal(viewport.screenWidth, 101)
        chai.assert.equal(viewport.screenHeight, 102)
        chai.assert.equal(viewport.worldWidth, 10000)
        chai.assert.equal(viewport.worldHeight, 10001)
    })

    it('getVisibleBounds() and moveCorner()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(101, 102)
        viewport.moveCorner(10, 11)
        const bounds = viewport.getVisibleBounds()
        chai.assert.equal(bounds.x, 10)
        chai.assert.equal(bounds.y, 11)
        chai.assert.equal(bounds.width, 101)
        chai.assert.equal(bounds.height, 102)
    })

    it('zoom() and center', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(100, 200)
        viewport.zoom(100, true)
        chai.assert.equal(viewport.center.x, 50)
        chai.assert.equal(viewport.center.y, 100)
    })

    it('worldScreenWidth and worldScreenHeight', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        chai.assert.equal(viewport.worldScreenWidth, 200)
        chai.assert.equal(viewport.worldScreenHeight, 300)
        viewport.fitWidth(1000)
        chai.assert.equal(viewport.worldScreenWidth, 1000)
        chai.assert.equal(viewport.worldScreenHeight, 1500)
    })

    it('toWorld()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fit()
        const world = viewport.toWorld(50, 60)
        chai.assert.equal(world.x, 250)
        chai.assert.equal(world.y, 300)
    })

    it('toScreen()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fit()
        const screen = viewport.toScreen(100, 200)
        chai.assert.equal(screen.x, 20)
        chai.assert.equal(screen.y, 40)
    })

    it('worldWidth and worldHeight', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 500, 1000)
        chai.assert.equal(viewport.worldWidth, 500)
        chai.assert.equal(viewport.worldHeight, 1000)
    })

    it('screenWorldWidth and screenWorldHeight', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fit()
        chai.assert.equal(viewport.screenWorldWidth, 200)
        chai.assert.equal(viewport.screenWorldHeight, 200)
    })

    it('moveCenter(), top, bottom, left, and right', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.moveCenter(500, 500)
        chai.assert.equal(viewport.top, 350)
        chai.assert.equal(viewport.bottom, 650)
        chai.assert.equal(viewport.left, 400)
        chai.assert.equal(viewport.right, 600)
    })

    it('moveCorner() and corner', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.moveCorner(11, 12)
        chai.assert.equal(viewport.corner.x, 11)
        chai.assert.equal(viewport.corner.y, 12)
    })

    it('fitWidth()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fitWidth(1000, true)
        chai.assert.equal(viewport.screenWorldWidth, 200)
        chai.assert.equal(viewport.screenWorldHeight, 200)
        chai.assert.equal(viewport.center.x, 100)
        chai.assert.equal(viewport.center.y, 150)
        viewport.fitWidth(500, false, false)
        chai.assert.equal(viewport.center.x, 50)
        chai.assert.equal(viewport.center.y, 150)
        chai.assert.equal(viewport.screenWorldWidth, 400)
        chai.assert.equal(viewport.screenWorldHeight, 200)
    })

    it('fitHeight()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fitHeight(400, true)
        chai.assert.equal(viewport.screenWorldWidth, 750)
        chai.assert.equal(viewport.screenWorldHeight, 750)
        chai.assert.equal(viewport.center.x, 100)
        chai.assert.equal(viewport.center.y, 150)
        viewport.moveCenter(202, 22)
        viewport.fitHeight(800, false, false)
        chai.assert.equal(viewport.center.x, 202)
        chai.assert.equal(viewport.center.y, 44)
        chai.assert.equal(viewport.worldScreenHeight, 800)
        chai.assert.equal(viewport.screenWorldHeight, 375)
    })

    it('fitWorld()', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.resize(200, 300, 1000, 1000)
        viewport.fitWorld()
        viewport.moveCorner(0, 0)
        chai.assert.equal(viewport.center.x, 500)
        chai.assert.equal(viewport.center.y, 750)
        chai.assert.equal(viewport.screenWorldWidth, 200)
        chai.assert.equal(viewport.screenWorldHeight, 200)
    })

    it('pause', () =>
    {
        const viewport = new Viewport.Viewport()
        viewport.pause = true
        chai.assert.equal(viewport.pause, true)
        viewport.pause = false
        chai.assert.equal(viewport.pause, false)
    })
})