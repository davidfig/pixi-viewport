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
    reset() { }

    pause()
    {
        this.paused = true
    }

    resume()
    {
        this.paused = false
    }
}