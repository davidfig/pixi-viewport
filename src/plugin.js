module.exports = class Plugin
{
    constructor(parent)
    {
        this.parent = parent
        this.paused = false
    }

    down() { }
    move() { }
    up() { }
    wheel() { }
    update() { }
    resize() { }
    remove() { }

    pause()
    {
        this.paused = true
    }

    resume()
    {
        this.paused = false
    }
}