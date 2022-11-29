import * as random from './random'

function overlap(x, y, viewport, starSize) {
    const size = starSize
    for (const child of viewport.children) {
        if (x < child.x + size &&
            x + size > child.x &&
            y < child.y + size &&
            y + size > child.y) {
            return true
        }
    }
    return false
}

export function stars(viewport, starSize, border) {
    const stars = (viewport.worldWidth * viewport.worldHeight) / Math.pow(starSize, 2) * 0.1
    for (let i = 0; i < stars; i++) {
        const star = new PIXI.Sprite(PIXI.Texture.WHITE)
        star.anchor.set(0.5)
        star.tint = random.randomInt(0xffffff)
        star.width = star.height = starSize
        star.alpha = random.range(0.25, 1, true)
        let x, y
        do {
            x = random.range(starSize / 2 + border, viewport.worldWidth - starSize - border)
            y = random.range(border, viewport.worldHeight - border - starSize)
        } while (overlap(x, y, viewport, starSize))
        star.position.set(x, y)
        viewport.addChild(star)
    }
}