const TEXTURES_1_COUNT = 50
const TEXTURES_2_COUNT = 10
const TEXTURE_SIZE = 64

let _map, _width, _height

const PIXI = require('pixi.js')
const Random = require('yy-random')
const RenderSheet = require('yy-rendersheet')

let Sheet

function init(width, height)
{
    Sheet = new RenderSheet()
    for (let i = 0; i < TEXTURES_1_COUNT; i++)
    {
        Sheet.add('texture-' + i, draw, measure)
    }
    for (let i = 0; i < TEXTURES_2_COUNT; i++)
    {
        Sheet.add('texture2-' + i, draw2, measure)
    }
    Sheet.render()
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
            const entry = []
            const chance = Random.get(1, true)
            if (chance > 0.1)
            {
                entry.push(Sheet.getTexture('texture-' + Random.get(TEXTURES_1_COUNT)))
            }
            if (chance > 0.8)
            {
                entry.push(Sheet.getTexture('texture2-' + Random.get(TEXTURES_2_COUNT)))
            }
            if (chance > 0.9)
            {
                entry.push(Sheet.getTexture('texture2-' + Random.get(TEXTURES_2_COUNT)))
            }
            _map.push(entry)
        }
    }
}

function get(x, y)
{
    if (x < 0 || y < 0 || x >= _width || y >= _height)
    {
        return null
    }
    return _map[x + y * _width]
}

function measure()
{
    return { width: TEXTURE_SIZE, height: TEXTURE_SIZE }
}

function draw(c)
{
    c.beginPath()
    c.fillStyle = '#' + Random.color().toString(16)
    c.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE)
}

function draw2(c)
{
    c.beginPath()
    c.fillStyle = '#' + Random.color().toString(16)
    c.arc(TEXTURE_SIZE / 2, TEXTURE_SIZE / 2, Random.get(TEXTURE_SIZE / 2), 0, PIXI.PI_2)
    c.fill()
}

module.exports = {
    init,
    get,
    resize,
    size: TEXTURE_SIZE
}