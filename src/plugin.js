module.exports = class Plugin
{
    constructor(parent)
    {
        this.parent = parent
    }

    down() { }
    move() { }
    up() { }
    wheel() { }
    update() { }
    resize() { }
}