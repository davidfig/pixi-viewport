import type { InteractionEvent } from '@pixi/interaction';
import type { Plugin } from './plugins/plugin';
import type { Viewport } from './Viewport';

const PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'aniamte', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'];

/**
 * Use this to access current plugins or add user-defined plugins
 *
 * @public
 */
export class PluginManager
{
    /** Maps mounted plugins by their type */
    public readonly plugins: Partial<Record<string, Plugin>>;

    /** List of plugins mounted */
    public readonly list: Array<Plugin>;

    /** The viewport using the plugins managed by `this`. */
    public readonly viewport: Viewport;

    /** This is called by {@link Viewport} to initialize the {@link Viewport.plugins plugins}. */
    constructor(viewport: Viewport)
    {
        this.viewport = viewport;
        this.list = [];
        this.plugins = {};
    }

    /**
     * Inserts a named plugin or a user plugin into the viewport
     * default plugin order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
     *
     * @param {string} name of plugin
     * @param {Plugin} plugin - instantiated Plugin class
     * @param {number} index to insert userPlugin (otherwise inserts it at the end)
     */
    public add(name: string, plugin: Plugin, index: number = PLUGIN_ORDER.length)
    {
        this.plugins[name] = plugin;

        const current = PLUGIN_ORDER.indexOf(name);

        if (current !== -1)
        {
            PLUGIN_ORDER.splice(current, 1);
        }

        PLUGIN_ORDER.splice(index, 0, name);
        this.sort();
    }

    /**
     * Get plugin
     *
     * @param {string} name of plugin
     * @param {boolean} [ignorePaused] return null if plugin is paused
     * @return {Plugin}
     */
    public get(name: string, ignorePaused?: boolean): Plugin | undefined
    {
        if (ignorePaused)
        {
            if (this.plugins[name] && this.plugins[name].paused)
            {
                return null;
            }
        }

        return this.plugins[name];
    }

    /**
     * Update all active plugins
     *
     * @internal
     * @ignore
     * @param {number} elapsed type in milliseconds since last update
     */
    public update(elapsed: number): void
    {
        for (const plugin of this.list)
        {
            plugin.update(elapsed);
        }
    }

    /**
     * Resize all active plugins
     *
     * @internal
     * @ignore
     */
    public resize(): void
    {
        for (const plugin of this.list)
        {
            plugin.resize();
        }
    }

    /** Clamps and resets bounce and decelerate (as needed) after manually moving viewport */
    public reset(): void
    {
        for (const plugin of this.list)
        {
            plugin.reset();
        }
    }

    /** removes all installed plugins */
    public removeAll(): void
    {
        this.plugins = {};
        this.sort();
    }

    /**
     * Removes installed plugin
     *
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    public remove(name: string): void
    {
        if (this.plugins[name])
        {
            delete this.plugins[name];
            this.viewport.emit(`${name}-remove`);
            this.sort();
        }
    }

    /**
     * Pause plugin
     *
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    public pause(name: string): void
    {
        if (this.plugins[name])
        {
            this.plugins[name].pause();
        }
    }

    /**
     * Resume plugin
     *
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    public resume(name: string): void
    {
        if (this.plugins[name])
        {
            this.plugins[name].resume();
        }
    }

    /**
     * Sort plugins according to PLUGIN_ORDER
     *
     * @internal
     * @ignore
     */
    public sort()
    {
        this.list = [];
        for (const plugin of PLUGIN_ORDER)
        {
            if (this.plugins[plugin])
            {
                this.list.push(this.plugins[plugin]);
            }
        }
    }

    /**
     * Handle down for all plugins
     *
     * @internal
     * @ignore
     */
    public down(event: InteractionEvent): boolean
    {
        let stop = false;

        for (const plugin of this.list)
        {
            if (plugin.down(event))
            {
                stop = true;
            }
        }

        return stop;
    }

    /**
     * Handle move for all plugins
     *
     * @internal
     * @ignore
     */
    public move(event: InteractionEvent): boolean
    {
        let stop = false;

        for (const plugin of this.viewport.plugins.list)
        {
            if (plugin.move(event))
            {
                stop = true;
            }
        }

        return stop;
    }

    /**
     * Handle up for all plugins
     *
     * @internal
     * @ignore
     */
    public up(event: InteractionEvent): boolean
    {
        let stop = false;

        for (const plugin of this.list)
        {
            if (plugin.up(event))
            {
                stop = true;
            }
        }

        return stop;
    }

    /**
     * Handle wheel event for all plugins
     *
     * @internal
     * @ignore
     */
    public wheel(e: InteractionEvent): boolean
    {
        let result = false;

        for (const plugin of this.list)
        {
            if (plugin.wheel(e))
            {
                result = true;
            }
        }

        return result;
    }
}
