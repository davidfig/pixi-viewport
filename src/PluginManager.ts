import type {
    Animate,
    Bounce,
    Clamp,
    ClampZoom,
    Decelerate,
    Drag,
    Follow,
    MouseEdges,
    Pinch,
    Plugin,
    Snap,
    SnapZoom,
    Wheel,
} from './plugins';
import type { InteractionEvent } from '@pixi/interaction';
import type { Viewport } from './Viewport';

const PLUGIN_ORDER = [
    'drag',
    'pinch',
    'wheel',
    'follow',
    'mouse-edges',
    'decelerate',
    'animate',
    'bounce',
    'snap-zoom',
    'clamp-zoom',
    'snap',
    'clamp',
];

/**
 * Use this to access current plugins or add user-defined plugins
 *
 * @public
 */
export class PluginManager
{
    /** Maps mounted plugins by their type */
    public plugins: Partial<Record<string, Plugin>>;

    /**
     * List of plugins mounted
     *
     * This list is kept sorted by the internal priority of plugins (hard-coded).
     */
    public list: Array<Plugin>;

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
     * default plugin order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce',
     * 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
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

    public get(name: 'animate', ignorePaused?: boolean): Animate | undefined | null;
    public get(name: 'bounce', ignorePaused?: boolean): Bounce | undefined | null;
    public get(name: 'clamp', ignorePaused?: boolean): Clamp | undefined | null;
    public get(name: 'clamp-zoom', ignorePaused?: boolean): ClampZoom | undefined | null;
    public get(name: 'decelerate', ignorePaused?: boolean): Decelerate | undefined | null;
    public get(name: 'drag', ignorePaused?: boolean): Drag | undefined | null;
    public get(name: 'follow', ignorePaused?: boolean): Follow | undefined | null;
    public get(name: 'mouse-edges', ignorePaused?: boolean): MouseEdges | undefined | null;
    public get(name: 'pinch', ignorePaused?: boolean): Pinch | undefined | null;
    public get(name: 'snap', ignorePaused?: boolean): Snap | undefined | null;
    public get(name: 'snap-zoom', ignorePaused?: boolean): SnapZoom | undefined | null;
    public get(name: 'wheel', ignorePaused?: boolean): Wheel | undefined | null;
    public get<T extends Plugin = Plugin>(name: string, ignorePaused?: boolean): T | undefined | null;

    /**
     * Get plugin
     *
     * @param {string} name of plugin
     * @param {boolean} [ignorePaused] return null if plugin is paused
     */
    public get<T extends Plugin = Plugin>(name: string, ignorePaused?: boolean): T | undefined | null
    {
        if (ignorePaused)
        {
            if (this.plugins[name]?.paused)
            {
                return null;
            }
        }

        return this.plugins[name] as T;
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
        this.plugins[name]?.pause();
    }

    /**
     * Resume plugin
     *
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    public resume(name: string): void
    {
        this.plugins[name]?.resume();
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
                this.list.push(this.plugins[plugin] as Plugin);
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
    public wheel(e: WheelEvent): boolean
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
