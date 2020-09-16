const PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'aniamte', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp']

/**
 * Use this to access current plugins or add user-defined plugins
 */
export class PluginManager {
    /**
     * instantiated by Viewport
     * @param {Viewport} viewport
     */
    constructor(viewport) {
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
    add(name, plugin, index = PLUGIN_ORDER.length) {
        this.plugins[name] = plugin
        const current = PLUGIN_ORDER.indexOf(name)
        if (current !== -1) {
            PLUGIN_ORDER.splice(current, 1)
        }
        PLUGIN_ORDER.splice(index, 0, name)
        this.sort()
    }

    /**
     * get plugin
     * @param {string} name of plugin
     * @param {boolean} [ignorePaused] return null if plugin is paused
     * @return {Plugin}
     */
    get(name, ignorePaused) {
        if (ignorePaused) {
            if (typeof this.plugins[name] !== 'undefined' && this.plugins[name].paused) {
                return null
            }
        }
        return this.plugins[name]
    }

    /**
     * update all active plugins
     * @ignore
     * @param {number} elapsed type in milliseconds since last update
     */
    update(elapsed) {
        for (let plugin of this.list) {
            plugin.update(elapsed)
        }
    }

    /**
     * resize all active plugins
     * @ignore
     */
    resize() {
        for (let plugin of this.list) {
            plugin.resize()
        }
    }

    /**
     * clamps and resets bounce and decelerate (as needed) after manually moving viewport
     */
    reset() {
        for (let plugin of this.list) {
            plugin.reset()
        }
    }

    /**
     * removes installed plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    remove(name) {
        if (this.plugins[name]) {
            this.plugins[name] = null
            this.viewport.emit(name + '-remove')
            this.sort()
        }
    }

    /**
     * pause plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    pause(name) {
        if (this.plugins[name]) {
            this.plugins[name].pause()
        }
    }

    /**
     * resume plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    resume(name) {
        if (this.plugins[name]) {
            this.plugins[name].resume()
        }
    }

    /**
     * sort plugins according to PLUGIN_ORDER
     * @ignore
     */
    sort() {
        this.list = []
        for (let plugin of PLUGIN_ORDER) {
            if (this.plugins[plugin]) {
                this.list.push(this.plugins[plugin])
            }
        }
    }

    /**
     * handle down for all plugins
     * @ignore
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    down(event) {
        let stop = false
        for (let plugin of this.list) {
            if (plugin.down(event)) {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle move for all plugins
     * @ignore
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    move(event) {
        let stop = false
        for (let plugin of this.viewport.plugins.list) {
            if (plugin.move(event)) {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle up for all plugins
     * @ignore
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    up(event) {
        let stop = false
        for (let plugin of this.list) {
            if (plugin.up(event)) {
                stop = true
            }
        }
        return stop
    }

    /**
     * handle wheel event for all plugins
     * @ignore
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel(e) {
        let result = false
        for (let plugin of this.list) {
            if (plugin.wheel(e)) {
                result = true
            }
        }
        return result
    }
}
