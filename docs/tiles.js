const TEXTURES_COUNT = 50
const TEXTURE_CIRCLE = 50
const TEXTURE_SIZE = 64

let _sheet, _map, _width, _height

const Random = require('yy-random')
const RenderSheet = require('yy-rendersheet')

function init(width, height)
{
    _sheet = new RenderSheet()
    for (let i = 0; i < TEXTURES_COUNT; i++)
    {
        _sheet.add('texture-' + i, draw, measure)
    }
    _sheet.render()
    resize(width, height)
}

function resize(width, height)
{
    _map = []
    _width = Math.ceil(width / TEXTURE_SIZE)
    _height = Math.ceil(height / TEXTURE_SIZE)
    for (let y = 0; y < _height; y++)
    {
        for (let x = 0; x < _width; x++)
        {
            _map.push(Random.get(TEXTURES_COUNT))
        }
    }
}

function draw(c)
{
    function r() { return Random.get(256) }
    c.beginPath()
    c.fillStyle = 'rgba(' + r() + ',' + r() + ',' + r() + ',0.2)'
    c.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
    c.fillStyle = 'rgba(255,255,255,0.2)'
    for (let i = 0; i < TEXTURE_CIRCLE; i++)
    {
        const r = Random.get(TEXTURE_SIZE * 0.1)
        const x = Random.range(r, TEXTURE_SIZE - r)
        const y = Random.range(r, TEXTURE_SIZE - r)
        c.beginPath()
        c.arc(x, y, r, 0, Math.PI * 2)
        c.fill()
    }
}

function measure()
{
    return { width: TEXTURE_SIZE, height: TEXTURE_SIZE }
}

function get(x, y)
{
    if (x < 0 || y < 0 || x >= _width || y >= _height)
    {
        return null
    }
    return _sheet.getTexture('texture-' + _map[x + y * _width])
}

module.exports = {
    init,
    get,
    resize,
    size: TEXTURE_SIZE
}