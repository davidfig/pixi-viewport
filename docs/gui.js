let _viewport, _drawWorld, _gui, _options, _world

module.exports = function gui(viewport, drawWorld)
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
            time: 150,
            ease: 'easeInOutSine'
        },
        decelerate: {
            decelerate: true,
            friction: 0.95,
            others: 0.8,
            minSpeed: 0.01
        },
    }
    guiWorld()
    _gui.add(_viewport, 'threshold')
    guiDrag()
    guiPinch()
    guiClamp()
    guiBounce()
    guiDecelerate()

    // const snap = gui.addFolder('snap')
    // snap.add(fake, 'snap').onChange(
    //     function (value)
    //     {
    //         _viewport.snap = value
    //         if (value)
    //         {
    //             if (!snapSpeed)
    //             {
    //                 snapSpeed = snap.add(_viewport.snap, 'speed')
    //                 snapX = snap.add(_viewport.snap, 'x')
    //                 snapY = snap.add(_viewport.snap, 'y')
    //             }
    //         }
    //         else
    //         {
    //             if (snapSpeed)
    //             {
    //                 snap.remove(snapSpeed)
    //                 snap.remove(snapX)
    //                 snap.remove(snapY)
    //             }
    //         }
    //     }
    // )
    // let snapSpeed, snapX, snapY
    // if (fake.snap)
    // {
    //     snapSpeed = snap.add(_viewport.snap, 'speed')
    //     snapX = snap.add(_viewport.snap, 'x')
    //     snapY = snap.add(_viewport.snap, 'y')
    // }
    // snap.open()
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
    function add()
    {
        bounceTime = bounce.add(_options.bounce, 'time', 0, 2000).step(50).onChange(
            function ()
            {
                _viewport.bounce({ time: _options.bounce.time, ease: _options.bounce.ease })
            }
        )
        bounceEase = bounce.add(_options.bounce, 'ease').onChange(
            function ()
            {
                _viewport.bounce({ time: _options.bounce.time, ease: _options.bounce.ease })
            }
        )
    }

    let bounceTime, bounceEase
    const bounce = _gui.addFolder('bounce')
    bounce.add(_options.bounce, 'bounce').onChange(
        function (value)
        {
            if (value)
            {
                _viewport.bounce()
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
        _viewport.decelerate({ friction: _options.decelerate.friction, others: _options.decelerate.others, minSpeed: _options.decelerate.minSpeed })
    }

    function add()
    {
        friction = decelerate.add(_options.decelerate, 'friction', 0, 1)
        others = decelerate.add(_options.decelerate, 'others', 0, 1)
        minSpeed = decelerate.add(_options.decelerate, 'minSpeed')
    }

    let friction, others, minSpeed

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
                    decelerate.remove(others)
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

/* global dat */