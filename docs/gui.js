let _viewport, _drawWorld, _gui, _options, _world

const TEST = false

function gui(viewport, drawWorld, target)
{
    _viewport = viewport
    _drawWorld = drawWorld
    _gui = new dat.GUI({ autoPlace: false })
    if (TEST) _gui.close()
    document.body.appendChild(_gui.domElement)
    _gui.domElement.style.bottom = '2em'
    _gui.domElement.style.right = 0
    _gui.domElement.style.position = 'fixed'
    _gui.domElement.style.opacity = 0.95
    _world = _gui.addFolder('world')
    _options = {
        testDirty: false,
        drag: true,
        clampZoom: {
            clampZoom: false,
            minWidth: 1000,
            minHeight: 1000,
            maxWidth: 2000,
            maxHeight: 2000
        },
        pinch: {
            pinch: true,
            percent: 1,
            noDrag: false,
            centerX: 0,
            centerY: 0
        },
        clamp: {
            clamp: false,
            x: true,
            y: true,
            underflow: 'center'
        },
        bounce: {
            bounce: true,
            sides: 'all',
            friction: 0.5,
            time: 150,
            ease: 'easeInOutSine',
            underflow: 'center'
        },
        decelerate: {
            decelerate: true,
            friction: 0.95,
            minSpeed: 0.01
        },
        snap: {
            snap: false,
            x: 0,
            y: 0,
            friction: 0.8,
            topLeft: false,
            interrupt: true,
            time: 1000,
            ease: 'easeInOutSine'
        },
        follow: {
            follow: false,
            speed: 0,
            radius: 0
        },
        wheel: {
            wheel: true,
            percent: 0.1,
            centerX: 0,
            centerY: 0
        },
        snapZoom: {
            snapZoom: false,
            width: 2000,
            height: 0,
            time: 1000,
            ease: 'easeInOutSine',
            removeOnComplete: false,
            centerX: 0,
            centerY: 0,
            interrupt: true
        },
        mouseEdges: {
            mouseEdges: false,
            radius: 300,
            distance: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            speed: 8,
            reverse: false,
            noDecelerate: false,
            linear: false
        }
    }
    guiWorld()
    guiDrag()
    guiPinch()
    guiWheel()
    guiClamp()
    guiClampZoom()
    guiBounce()
    guiDecelerate()
    guiSnap()
    guiFollow(target)
    guiSnapZoom()
    guiMouseEdges()
}

function guiWorld()
{
    _world.add(_viewport, 'worldWidth').onChange(_drawWorld)
    _world.add(_viewport, 'worldHeight').onChange(_drawWorld)
}

function guiDrag()
{
    _gui.add(_options, 'drag').onChange(
        function (value)
        {
            if (value)
            {
                _viewport.drag({ clampWheel: true })
            }
            else
            {
                _viewport.removePlugin('drag')
            }
        })
}

function guiClamp()
{
    function change()
    {
        _viewport.clamp({ direction: _options.clamp.x && _options.clamp.y ? 'all' : _options.clamp.x ? 'x' : 'y', underflow: _options.clamp.underflow })
    }

    function add()
    {
        clampX = clamp.add(_options.clamp, 'x').onChange(change)
        clampY = clamp.add(_options.clamp, 'y').onChange(change)
        underflow = clamp.add(_options.clamp, 'underflow').onChange(change)
    }

    let clampX, clampY, underflow
    const clamp = _gui.addFolder('clamp')
    clamp.add(_options.clamp, 'clamp').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('clamp')
                clamp.remove(clampX)
                clamp.remove(clampY)
                clamp.remove(underflow)
            }
        })
    if (_options.clamp.clamp)
    {
        clamp.open()
    }
}

function guiPinch()
{
    function change()
    {
        const center = (_options.pinch.centerX || _options.pinch.centerY) ? { x: _options.pinch.centerX, y: _options.pinch.centerY } : null
        _viewport.pinch({ noDrag: _options.pinch.noDrag, center, percent: _options.pinch.percent })
    }

    function add()
    {
        noDrag = pinch.add(_options.pinch, 'noDrag').onChange(change)
        centerX = pinch.add(_options.pinch, 'centerX').onChange(change)
        centerY = pinch.add(_options.pinch, 'centerY').onChange(change)
        percent = pinch.add(_options.pinch, 'percent').onChange(change)
    }

    const pinch = _gui.addFolder('pinch')
    pinch.add(_options.pinch, 'pinch').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('pinch')
                pinch.remove(noDrag)
                pinch.remove(centerX)
                pinch.remove(centerY)
                pinch.remove(percent)
            }
        })
    let noDrag, centerX, centerY, percent
    if (_options.pinch)
    {
        add()
    }
    if (_options.pinch.pinch)
    {
        pinch.open()
    }
}

function guiBounce()
{
    function change()
    {
        _viewport.bounce({ sides: _options.bounce.sides, time: _options.bounce.time, ease: _options.bounce.ease, friction: _options.bounce.friction, underflow: _options.bounce.underflow })
    }

    function add()
    {
        sides = bounce.add(_options.bounce, 'sides').onChange(change)
        time = bounce.add(_options.bounce, 'time', 0, 2000).step(50).onChange(change)
        ease = bounce.add(_options.bounce, 'ease').onChange(change)
        underflow = bounce.add(_options.bounce, 'underflow').onChange(change)
    }

    let time, ease, underflow, sides
    const bounce = _gui.addFolder('bounce')
    bounce.add(_options.bounce, 'bounce').onChange(
        function (value)
        {
            if (value)
            {
                change()
                if (!time)
                {
                    add()
                }
            }
            else
            {
                _viewport.removePlugin('bounce')
                if (time)
                {
                    bounce.remove(sides)
                    bounce.remove(time)
                    time = null
                    bounce.remove(ease)
                    bounce.remove(underflow)
                }
            }
        }
    )
    if (_options.bounce)
    {
        add()
    }
    if (_options.bounce.bounce)
    {
        bounce.open()
    }
}

function guiDecelerate()
{
    function change()
    {
        _viewport.decelerate({ friction: _options.decelerate.friction, minSpeed: _options.decelerate.minSpeed })
    }

    function add()
    {
        friction = decelerate.add(_options.decelerate, 'friction', 0, 1)
        minSpeed = decelerate.add(_options.decelerate, 'minSpeed')
    }

    let friction, minSpeed

    const decelerate = _gui.addFolder('decelerate')
    decelerate.add(_options.decelerate, 'decelerate').onChange(
        function (value)
        {
            if (value)
            {
                change()
                if (!friction)
                {
                    add()
                }
            }
            else
            {
                if (friction)
                {
                    decelerate.remove(friction)
                    decelerate.remove(minSpeed)
                    friction = null
                }
            }
        }
    )
    if (_options.decelerate)
    {
        add()
    }
    if (_options.decelerate.decelerate)
    {
        decelerate.open()
    }
}

function guiSnap()
{
    function change()
    {
        _viewport.snap(_options.snap.x, _options.snap.y, { interrupt: _options.snap.interrupt, time: _options.snap.time, ease: _options.snap.ease, friction: _options.snap.friction, topLeft: _options.snap.topLeft })
    }

    function add()
    {
        x = snap.add(_options.snap, 'x').onChange(change)
        y = snap.add(_options.snap, 'y').onChange(change)
        friction = snap.add(_options.snap, 'friction').onChange(change)
        topLeft = snap.add(_options.snap, 'topLeft').onChange(change)
        interrupt = snap.add(_options.snap, 'interrupt').onChange(change)
        time = snap.add(_options.snap, 'time').onChange(change)
        ease = snap.add(_options.snap, 'ease').onChange(change)
    }

    let x, y, time, ease, friction, interrupt, topLeft

    const snap = _gui.addFolder('snap')
    snap.add(_options.snap, 'snap').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                snap.remove(x)
                snap.remove(y)
                snap.remove(time)
                snap.remove(ease)
                snap.remove(friction)
                snap.remove(interrupt)
                snap.remove(topLeft)
                _viewport.removePlugin('snap')
            }
        }
    )
    if (_options.snap.snap)
    {
        add()
    }
    if (_options.snap.snap)
    {
        snap.open()
    }
}

function guiFollow(target)
{
    function change()
    {
        _viewport.follow(target, { speed: _options.follow.speed, radius: _options.follow.radius })
    }

    function add()
    {
        speed = follow.add(_options.follow, 'speed').onChange(change)
        radius = follow.add(_options.follow, 'radius').onChange(change)
    }

    let speed, radius
    const follow = _gui.addFolder('follow')
    follow.add(_options.follow, 'follow').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                follow.remove(speed)
                follow.remove(radius)
                _viewport.removePlugin('follow')
            }
        }
    )
    if (_options.follow.follow)
    {
        add()
    }
    if (_options.follow.follow)
    {
        follow.open()
    }
}

function guiWheel()
{
    function change()
    {
        const center = (_options.wheel.centerX || _options.wheel.centerY) ? { x: _options.wheel.centerX, y: _options.wheel.centerY } : null
        _viewport.wheel({ percent: _options.wheel.percent, minWidth: _options.wheel.minWidth, maxWidth: _options.wheel.maxWidth, minHeight: _options.wheel.minHeight, maxHeight: _options.wheel.maxHeight, center })
    }

    function add()
    {
        percent = wheel.add(_options.wheel, 'percent').onChange(change)
        centerX = wheel.add(_options.wheel, 'centerX').onChange(change)
        centerY = wheel.add(_options.wheel, 'centerY').onChange(change)
    }

    const wheel = _gui.addFolder('wheel')
    wheel.add(_options.wheel, 'wheel').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('wheel')
                wheel.remove(percent)
                wheel.remove(centerX)
                wheel.remove(centerY)
            }
        })
    let percent, centerX, centerY
    if (_options.wheel)
    {
        add()
    }
    if (_options.wheel.wheel)
    {
        wheel.open()
    }
}

function guiClampZoom()
{
    function change()
    {
        _viewport.clampZoom({ minWidth: _options.clampZoom.minWidth, maxWidth: _options.clampZoom.maxWidth, minHeight: _options.clampZoom.minHeight, maxHeight: _options.clampZoom.maxHeight })
    }

    function add()
    {
        minWidth = clampZoom.add(_options.clampZoom, 'minWidth').onChange(change)
        maxWidth = clampZoom.add(_options.clampZoom, 'maxWidth').onChange(change)
        minHeight = clampZoom.add(_options.clampZoom, 'minHeight').onChange(change)
        maxHeight = clampZoom.add(_options.clampZoom, 'maxHeight').onChange(change)
    }

    const clampZoom = _gui.addFolder('clamp-zoom')
    clampZoom.add(_options.clampZoom, 'clampZoom').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('clamp-zoom')
                clampZoom.remove(minWidth)
                clampZoom.remove(maxWidth)
                clampZoom.remove(minHeight)
                clampZoom.remove(maxHeight)
            }
        })
    let minWidth, maxWidth, minHeight, maxHeight
    if (_options.clampZoom.clampZoom)
    {
        add()
    }
    if (_options.clampZoom.clampZoom)
    {
        clampZoom.open()
    }
}

function guiSnapZoom()
{
    function change()
    {
        _options.snapZoom.center = (_options.snapZoom.centerX || _options.snapZoom.centerY) ? { x: _options.snapZoom.centerX, y: _options.snapZoom.centerY } : null
        _viewport.snapZoom(_options.snapZoom)
    }

    function add()
    {
        width = snapZoom.add(_options.snapZoom, 'width').onChange(change)
        height = snapZoom.add(_options.snapZoom, 'height').onChange(change)
        time = snapZoom.add(_options.snapZoom, 'time').onChange(change)
        ease = snapZoom.add(_options.snapZoom, 'ease').onChange(change)
        removeOnComplete = snapZoom.add(_options.snapZoom, 'removeOnComplete').onChange(change)
        centerX = snapZoom.add(_options.snapZoom, 'centerX').onChange(change)
        centerY = snapZoom.add(_options.snapZoom, 'centerY').onChange(change)
        interrupt = snapZoom.add(_options.snapZoom, 'interrupt').onChange(change)
    }

    const snapZoom = _gui.addFolder('snap-zoom')
    snapZoom.add(_options.snapZoom, 'snapZoom').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('snap-zoom')
                snapZoom.remove(width)
                snapZoom.remove(height)
                snapZoom.remove(time)
                snapZoom.remove(ease)
                snapZoom.remove(removeOnComplete)
                snapZoom.remove(centerX)
                snapZoom.remove(centerY)
                snapZoom.remove(interrupt)
            }
        })
    let width, height, time, ease, removeOnComplete, centerX, centerY, interrupt
    if (_options.snapZoom.snapZoom)
    {
        add()
    }
    if (_options.snapZoom.snapZoom)
    {
        snapZoom.open()
    }
}

function guiMouseEdges()
{
    function change()
    {
        const me = _options.mouseEdges
        const options = { radius: me.radius !== 0 ? me.radius : null, distance: me.distance !== 0 ? me.distance : null, top: me.top !== 0 ? me.top : null, bottom: me.bottom !== 0 ? me.bottom : null, left: me.left !== 0 ? me.left : null, right: me.right !== 0 ? me.right : null, speed: me.speed, reverse: me.reverse, noDecelerate: me.noDecelerate, linear: me.linear }
        _viewport.mouseEdges(options)
    }

    function add()
    {
        radius = mouseEdges.add(_options.mouseEdges, 'radius').onChange(change)
        distance = mouseEdges.add(_options.mouseEdges, 'distance').onChange(change)
        top = mouseEdges.add(_options.mouseEdges, 'top').onChange(change)
        left = mouseEdges.add(_options.mouseEdges, 'left').onChange(change)
        right = mouseEdges.add(_options.mouseEdges, 'right').onChange(change)
        bottom = mouseEdges.add(_options.mouseEdges, 'bottom').onChange(change)
        speed = mouseEdges.add(_options.mouseEdges, 'speed').onChange(change)
        reverse = mouseEdges.add(_options.mouseEdges, 'reverse').onChange(change)
        noDecelerate = mouseEdges.add(_options.mouseEdges, 'noDecelerate').onChange(change)
        linear = mouseEdges.add(_options.mouseEdges, 'linear').onChange(change)
    }

    const mouseEdges = _gui.addFolder('mouseEdges')
    mouseEdges.add(_options.mouseEdges, 'mouseEdges').onChange(
        function (value)
        {
            if (value)
            {
                change()
                add()
            }
            else
            {
                _viewport.removePlugin('mouse-edges')
                mouseEdges.remove(radius)
                mouseEdges.remove(distance)
                mouseEdges.remove(top)
                mouseEdges.remove(left)
                mouseEdges.remove(right)
                mouseEdges.remove(bottom)
                mouseEdges.remove(speed)
                mouseEdges.remove(reverse)
                mouseEdges.remove(noDecelerate)
                mouseEdges.remove(linear)
            }
        })
    let radius, distance, top, left, right, bottom, speed, reverse, noDecelerate, linear
    if (_options.mouseEdges.mouseEdges)
    {
        add()
    }
    if (_options.mouseEdges.mouseEdges)
    {
        mouseEdges.open()
    }
}

module.exports = {
    gui,
    get options()
    {
        return _options
    }
}

/* global dat */