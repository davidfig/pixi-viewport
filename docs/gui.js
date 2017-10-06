let _viewport, _drawWorld, _gui, _options, _world

module.exports = function gui(viewport, drawWorld, target)
{
    _viewport = viewport
    _drawWorld = drawWorld
    _gui = new dat.GUI({ autoPlace: false })
    document.body.appendChild(_gui.domElement)
    _gui.domElement.style.bottom = '2em'
    _gui.domElement.style.right = 0
    _gui.domElement.style.position = 'fixed'
    _gui.domElement.style.opacity = 0.95
    _world = _gui.addFolder('world')
    _options = {
        drag: true,
        pinch: {
            pinch: true,
            clampScreen: false,
            minWidth: 0,
            minHeight: 0,
            maxWidth: 0,
            maxHeight: 0
        },
        clamp: {
            clamp: false,
            x: true,
            y: true
        },
        bounce: {
            bounce: true,
            friction: 0.5,
            time: 150,
            ease: 'easeInOutSine'
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
            time: 1000,
            ease: 'easeInOutsine'
        },
        follow: {
            follow: false,
            speed: 0,
            radius: 0
        }

    }
    guiWorld()
    _gui.add(_viewport, 'threshold')
    guiDrag()
    guiPinch()
    guiClamp()
    guiBounce()
    guiDecelerate()
    guiSnap()
    guiFollow(target)
}

function guiWorld()
{
    _world.add(_viewport, 'worldWidth').onChange(_drawWorld)
    _world.add(_viewport, 'worldHeight').onChange(_drawWorld)
    _world.open()
}

function guiDrag()
{
    _gui.add(_options, 'drag').onChange(
        function (value)
        {
            if (value)
            {
                _viewport.drag()
            }
            else
            {
                _viewport.removePlugin('drag')
            }
        })
}

function guiClamp()
{
    let clampX, clampY
    const clamp = _gui.addFolder('clamp')
    clamp.add(_options.clamp, 'clamp').onChange(
        function (value)
        {
            if (value)
            {
                _viewport.clamp(_options.clamp.x && _options.clamp.y ? 'all' : _options.clamp.x ? 'x' : 'y')
                clampX = clamp.add(_options.clamp, 'x').onChange(
                    function (value)
                    {
                        _options.clamp.x = value
                        _viewport.clamp(_options.clamp.x && _options.clamp.y ? 'all' : _options.clamp.x ? 'x' : 'y')
                    })
                clampY = clamp.add(_options.clamp, 'y').onChange(
                    function (value)
                    {
                        _options.clamp.y = value
                        _viewport.clamp(_options.clamp.x && _options.clamp.y ? 'all' : _options.clamp.x ? 'x' : 'y')
                    })
            }
            else
            {
                _viewport.removePlugin('clamp')
                clamp.remove(clampX)
                clamp.remove(clampY)
            }
        })
    clamp.open()
}

function guiPinch()
{
    function change()
    {
        _viewport.pinch({ clampScreen: _options.pinch.clampScreen, minWidth: _options.pinch.minWidth, maxWidth: _options.pinch.maxWidth, minHeight: _options.pinch.minHeight, maxHeight: _options.pinch.maxHeight })
    }

    function add()
    {
        clampZoom = pinch.add(_options.pinch, 'clampScreen')
        minWidth = pinch.add(_options.pinch, 'minWidth')
        maxWidth = pinch.add(_options.pinch, 'maxWidth')
        minHeight = pinch.add(_options.pinch, 'minHeight')
        maxHeight = pinch.add(_options.pinch, 'maxHeight')
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
                pinch.remove(clampZoom)
                pinch.remove(minWidth)
                pinch.remove(maxWidth)
                pinch.remove(minHeight)
                pinch.remove(maxHeight)
            }
        })
    let clampZoom, minWidth, maxWidth, minHeight, maxHeight
    if (_options.pinch)
    {
        add()
    }
    pinch.open()
}

function guiBounce()
{
    function change()
    {
        _viewport.bounce({ time: _options.bounce.time, ease: _options.bounce.ease, friction: _options.bounce.friction })
    }

    function add()
    {
        bounceTime = bounce.add(_options.bounce, 'time', 0, 2000).step(50).onChange(change)
        bounceEase = bounce.add(_options.bounce, 'ease').onChange(change)
    }

    let bounceTime, bounceEase
    const bounce = _gui.addFolder('bounce')
    bounce.add(_options.bounce, 'bounce').onChange(
        function (value)
        {
            if (value)
            {
                change()
                if (!bounceTime)
                {
                    add()
                }
            }
            else
            {
                _viewport.removePlugin('bounce')
                if (bounceTime)
                {
                    bounce.remove(bounceTime)
                    bounceTime = null
                    bounce.remove(bounceEase)
                }
            }
        }
    )
    if (_options.bounce)
    {
        add()
    }
    bounce.open()
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
    decelerate.open()
}

function guiSnap()
{
    function change()
    {
        _viewport.snap(_options.snap.x, _options.snap.y, { time: _options.snap.time, ease: _options.snap.ease, friction: _options.snap.friction })
    }

    function add()
    {
        x = snap.add(_options.snap, 'x').onChange(change)
        y = snap.add(_options.snap, 'y').onChange(change)
        friction = snap.add(_options.snap, 'friction').onChange(change)
        time = snap.add(_options.snap, 'time').onChange(change)
        ease = snap.add(_options.snap, 'ease').onChange(change)
    }

    let x, y, time, ease, friction

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
                _viewport.removePlugin('snap')
            }
        }
    )
    if (_options.snap.snap)
    {
        add()
    }
    snap.open()
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
    follow.open()
}

/* global dat */