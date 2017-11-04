const TEXTURES_COUNT = 50
const TEXTURE_SIZE = 64

let _map, _width, _height

const PIXI = require('pixi.js')
const Random = require('yy-random')

function init(width, height)
{
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
            _map.push(Random.color())
        }
    }
}

function get(x, y)
{
    if (x < 0 || y < 0 || x >= _width || y >= _height)
    {
        return null
    }
    return { texture: PIXI.Texture.WHITE, tint: _map[x + y * _width] }
}

module.exports = {
    init,
    get,
    resize,
    size: TEXTURE_SIZE
}