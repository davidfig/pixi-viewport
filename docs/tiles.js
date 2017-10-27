const TEXTURES_COUNT = 50
const TEXTURE_SIZE = 64

let _sheet, _map, _width, _height

const Random = require('yy-random')
const RenderSheet = require('yy-rendersheet')

function init(width, height)
{
    _sheet = new RenderSheet()
    for (let i = 0; i < TEXTURES_COUNT; i++)
    {
        _sheet.add('texture-' + i, draw, measure, i)
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

function draw(c, i)
{
    function r() { return Random.get(256) }
    c.beginPath()
    c.fillStyle = 'rgba(' + r() + ',' + r() + ',' + r() + ',1)'//0.15)'
    c.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
    c.save()
    c.beginPath()
    c.fillStyle = 'white'
    c.globalCompositeOperation = 'destination-out'
    c.font = '25px sans-serif'
    c.textBaseline = 'middle'
    c.textAlign = 'center'
    c.fillText(i, TEXTURE_SIZE / 2, TEXTURE_SIZE / 2)
    c.fill()
    c.restore()
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
    return { texture: _sheet.getTexture('texture-' + _map[x + y * _width]) }
}

module.exports = {
    init,
    get,
    resize,
    size: TEXTURE_SIZE
}