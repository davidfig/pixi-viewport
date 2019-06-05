const PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp']

export class PluginManager
{
    /**
     * @private
     * @param {Viewport} viewport
     */
    constructor(viewport)
    {
        this.viewport = viewport
        this.list = []
        this.plugins = {}
    }

    /**
     * Inserts a named plugin or a user plugin into the viewport
     * default plugin order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
     * @param {string} name of plugin
     * @param {Plugin} plugin - instantiated Plugin class
     * @param {number} index to insert userPlugin (otherwise inserts it at the end)
     */
    add(name, plugin, index=PLUGIN_ORDER.length)
    {
        this.plugins[name] = plugin
        const current = PLUGIN_ORDER.indexOf(name)
        if (current !== -1)
        {
            PLUGIN_ORDER.splice(current, 1)
        }
        PLUGIN_ORDER.splice(index, 0, name)
        this.sort()
    }

    /**
     * get plugin
     * @param {string} name of plugin
     */
    get(name)
    {
        return this.plugins[name]
    }

    /**
     * update all active plugins
     * @param {number} elapsed type in milliseconds since last update
     */
    update(elapsed)
    {
        for (let plugin of this.list)
        {
            plugin.update(elapsed)
        }
    }

    /** resize all active plugins */
    resize()
    {
        for (let plugin of this.list)
        {
            plugin.resize()
        }
    }

    /** clamps and resets bounce and decelerate (as needed) after manually moving viewport */
    reset()
    {
        if (this.plugins['bounce'])
        {
            this.plugins['bounce'].reset()
            this.plugins['bounce'].bounce()
        }
        if (this.plugins['decelerate'])
        {
            this.plugins['decelerate'].reset()
        }
        if (this.plugins['snap'])
        {
            this.plugins['snap'].reset()
        }
        if (this.plugins['clamp'])
        {
            this.plugins['clamp'].update()
        }
        if (this.plugins['clamp-zoom'])
        {
            this.plugins['clamp-zoom'].clamp()
        }
    }

    /**
     * removes installed plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    remove(name)
    {
        if (this.plugins[name])
        {
            this.plugins[name] = null
            this.viewport.emit(name + '-remove')
            this.sort()
        }
    }

    /**
     * pause plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    pause(name)
    {
        if (this.plugins[name])
        {
            this.plugins[name].pause()
        }
    }

    /**
     * resume plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    resume(name)
    {
        if (this.plugins[name])
        {
            this.plugins[name].resume()
        }
    }

    sort()
    {
        this.list = []
        for (let plugin of PLUGIN_ORDER)
        {
            if (this.plugins[plugin])
            {
                this.list.push(this.plugins[plugin])
            }
        }
    }

    /**
     * handle down for all plugins
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    down(event)
    {
        let stop = false
        for (let plugin of this.list)
        {
            if (plugin.down(event))
            {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle move for all plugins
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    move(event)
    {
        let stop = false
        for (let plugin of this.viewport.plugins.list)
        {
            if (plugin.move(event))
            {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle up for all plugins
     * @param {PIXI.interaction.InteractionEvent} event
     * @returns {boolean}
     */
    up(event)
    {
        let stop = false
        for (let plugin of this.list)
        {
            if (plugin.up(event))
            {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle wheel event for all plugins
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel(e)
    {
        let result = false
        for (let plugin of this.list)
        {
            if (plugin.wheel(e))
            {
                result = true
            }
        }
        return result
    }
}