import { Plugin } from './Plugin';

import type { Viewport } from '../Viewport';

/**
 * Options for {@link ClampZoom}.
 *
 * Use either minimum width/height or minimum scale
 */
export interface IClampZoomOptions
{
    /** Minimum width */
    minWidth?: number | null;

    /** Minimum height */
    minHeight?: number | null;

    /** Maximum width */
    maxWidth?: number | null;

    /** Maximum height */
    maxHeight?: number | null;

    /** Minimum scale */
    minScale?: number | null;

    /** Maximum scale */
    maxScale?: number | null;
}

const DEFAULT_CLAMP_ZOOM_OPTIONS: Required<IClampZoomOptions> = {
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    minScale: null,
    maxScale: null
};

/**
 * Plugin to clamp the viewport's zoom to a specific range.
 *
 * @public
 */
export class ClampZoom extends Plugin
{
    public readonly options: Required<IClampZoomOptions>;

    /**
     * This is called by {@link Viewport.clampZoom}.
     */
    constructor(parent: Viewport, options = {})
    {
        super(parent);
        this.options = Object.assign({}, DEFAULT_CLAMP_ZOOM_OPTIONS, options);

        this.clamp();
    }

    public resize(): void
    {
        this.clamp();
    }

    /** Clamp the viewport's zoom immediately. */
    public clamp(): void
    {
        if (this.paused)
        {
            return;
        }

        if (this.options.minWidth || this.options.minHeight || this.options.maxWidth || this.options.maxHeight)
        {
            let width = this.parent.worldScreenWidth;
            let height = this.parent.worldScreenHeight;

            if (this.options.minWidth !== null && width < this.options.minWidth)
            {
                const original = this.parent.scale.x;

                this.parent.fitWidth(this.options.minWidth, false, false, true);
                this.parent.scale.y *= this.parent.scale.x / original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.options.maxWidth !== null && width > this.options.maxWidth)
            {
                const original = this.parent.scale.x;

                this.parent.fitWidth(this.options.maxWidth, false, false, true);
                this.parent.scale.y *= this.parent.scale.x / original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.options.minHeight !== null && height < this.options.minHeight)
            {
                const original = this.parent.scale.y;

                this.parent.fitHeight(this.options.minHeight, false, false, true);
                this.parent.scale.x *= this.parent.scale.y / original;
                width = this.parent.worldScreenWidth;
                height = this.parent.worldScreenHeight;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (this.options.maxHeight !== null && height > this.options.maxHeight)
            {
                const original = this.parent.scale.y;

                this.parent.fitHeight(this.options.maxHeight, false, false, true);
                this.parent.scale.x *= this.parent.scale.y / original;
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
        else
        {
            let scale = this.parent.scale.x;

            if (this.options.minScale !== null && scale < this.options.minScale)
            {
                scale = this.options.minScale;
            }
            if (this.options.maxScale !== null && scale > this.options.maxScale)
            {
                scale = this.options.maxScale;
            }
            if (scale !== this.parent.scale.x)
            {
                this.parent.scale.set(scale);
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
    }

    public reset(): void
    {
        this.clamp();
    }
}
