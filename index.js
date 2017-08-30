const PIXI = require('pixi.js')

class Viewport extends PIXI.Container
{
    constructor(width, height, options)
    {
        super()
        this.interactive = true
        this.on('pointerdown', this.down.bind(this))
        this.on('pointermove', this.move.bind(this))
        this.on('pointerup', this.up.bind(this))
        this.on('pointercancel', this.up.bind(this))
        this.pointers = []
        this.resize(width, height)
this.g=this.addChild(new PIXI.Graphics())
    }

    down(e)
    {
        this.pointers.push({ id: e.data.pointerId, last: e.data.global })
    }

    resize(width, height)
    {
        this.w = width
        this.h = height
    }

    move(e)
    {
        if (this.pointers.length)
        {
            if (this.pointers.length === 1)
            {
                const last = this.pointers[0].last
                const pos = e.data.global
                this.position.x += (pos.x - last.x)
                this.position.y += (pos.y - last.y)
                this.pointers[0].last = { x: pos.x, y: pos.y }
            }
            else
            {
                const first = this.pointers[0]
                const second = this.pointers[1]
                const last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                if (first.id === e.data.pointerId)
                {
                    first.last = { x: e.data.global.x, y: e.data.global.y }
                }
                else if (second.id === e.data.pointerId)
                {
                    second.last = { x: e.data.global.x, y: e.data.global.y }
                }
                const dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                // this.position.x -= this.pivot.x
                // this.position.y -= this.pivot.y
                const pivot = this.toLocal(new PIXI.Point(second.last.x + (second.last.x - first.last.x) / 2, second.last.y + (second.last.y - first.last.y) / 2))
                // this.pivot.set(pivot)
                // this.position.x += pivot.x
                // this.position.y += pivot.y
console.log(pivot)
                this.g.beginFill(0xff0000).drawCircle(pivot.x, pivot.y, 50).endFill()
                if (last)
                {
                    const change = (dist - last) / this.w
                    this.scale.x += change
                    this.scale.y += change
                }
            }
        }
    }

    up(e)
    {
        for (let i = 0; i < this.pointers.length; i++)
        {
            if (this.pointers[i].id === e.data.pointerId)
            {
                this.pointers.splice(i, 1)
            }
        }
    }

    // get x()
    // {
    //     return this.center.x;
    // }
    // set x(value)
    // {
    //     this.center.x = value;
    //     this.recalculate();
    // }

    // get y()
    // {
    //     return this.center.y;
    // }
    // set y(value)
    // {
    //     this.center.y = value;
    //     this.recalculate();
    // }

    // get rotation()
    // {
    //     return this.stage.rotation;
    // }
    // set rotation(value)
    // {
    //     this.stage.rotation = value;
    //     this.cos = Math.cos(value);
    //     this.sin = Math.sin(value);
    //     this.recalculate();
    // }

    // get width()
    // {
    //     return this._width;
    // }
    // set width(value)
    // {
    //     this._width = value;
    //     this.recalculate();
    // }

    // get height()
    // {
    //     return this._height;
    // }
    // set height(value)
    // {
    //     this._height = value;
    //     this.recalculate();
    // }

    // /**
    //  * Change view window for viewport
    //  * @param {number} width
    //  * @param {number} height
    //  * @param {PIXI.Point} [center]
    //  */
    // view(width, height, center)
    // {
    //     if (width !== 0)
    //     {
    //         this._width = width;
    //         this._height = (width * this.renderer.height) / this.renderer.width;
    //     }
    //     else
    //     {
    //         this._height = height;
    //         this._width = (height * this.renderer.width) / this.renderer.height;
    //     }
    //     if (center)
    //     {
    //         this.center.x = center.x;
    //         this.center.y = center.y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * resizes view based on renderer.width
    //  */
    // resize()
    // {
    //     this.view(this.renderer.width, 0);
    // }

    // /**
    //  * moves the viewport using a delta (not absolute)
    //  * @param {number} deltaX
    //  * @param {number} deltaY
    //  */
    // move(deltaX, deltaY)
    // {
    //     this.center.x += deltaX;
    //     this.center.y += deltaY;
    //     this.recalculate();
    // }


    // /**
    //  * moves the center of the viewport to a specific coordinate
    //  * @param {number|PIXI.Point} x
    //  * @param {number} y
    //  */
    // moveTo(x, y)
    // {
    //     if (arguments.length === 1)
    //     {
    //         this.center.x = arguments[0].x;
    //         this.center.y = arguments[0].y;
    //     }
    //     else
    //     {
    //         this.center.x = x;
    //         this.center.y = y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * moves the top-left of the viewport to a specific coordinate
    //  * @param {number} x
    //  * @param {number} y
    //  */
    // moveTopLeft(x, y)
    // {
    //     this.center.x = x + this._width / 2;
    //     this.center.y = y + this._height / 2;
    //     this.recalculate();
    // }

    // /**
    //  * changes zoom by zoomDelta; height is changed based on aspect ratio
    //  * @param {number} zoomDelta
    //  * @param {PIXI.Point} [center]
    //  */
    // zoom(zoomDelta, center)
    // {
    //     this._width += zoomDelta;
    //     this._height += zoomDelta * this.screenRatio;
    //     if (center)
    //     {
    //         this.center.x = center.x;
    //         this.center.y = center.y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * pinch to zoom
    //  * @param {number} x in screen coordinates
    //  * @param {number} y in screen coordinates
    //  * @param {number} amount
    //  * @param {number} min world coordinate
    //  * @param {number} max in world coordinates
    //  * @param {PIXI.Point} [center]
    //  */
    // zoomPinch(x, y, amount, min, max, center)
    // {
    //     var change = amount + this._width;
    //     change = (change < min) ? min : change;
    //     change = (change > max) ? max : change;
    //     var deltaX, deltaY;
    //     if (center)
    //     {
    //         this.center = this.toWorldFromScreen(center);
    //         deltaX = (this.renderer.width / 2 - x) / this.renderer.width;
    //         deltaY = (this.renderer.height / 2 - y) / this.renderer.height;
    //     }
    //     this._width = change;
    //     this._height = change * this.screenRatio;
    //     if (center)
    //     {
    //         this.center.x += this._width * deltaX;
    //         this.center.y += this._height * deltaY;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * zooms to a specific value
    //  * @param {number} zoomX - if === 0 then zoomY is used
    //  * @param {number} zoomY - only used if zoomX is set to 0
    //  * @param {PIXI.Point} [center]
    //  */
    // zoomTo(zoomX, zoomY, center)
    // {
    //     this._width = zoomX || zoomY / this.screenRatio;
    //     this._height = zoomY || zoomX * this.screenRatio;
    //     if (center)
    //     {
    //         this.center.x = center.x;
    //         this.center.y = center.y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  *
    //  * @param {number} width
    //  * @param {number} height
    //  * @param {PIXI.Point} [center]
    //  */
    // zoomToFit(width, height, center)
    // {
    //     if (width > height / this.screenRatio)
    //     {
    //         this._width = width;
    //         this._height = width * this.screenRatio;
    //     }
    //     else
    //     {
    //         this._height = height;
    //         this._width = height / this.screenRatio;
    //     }
    //     if (center)
    //     {
    //         this.center.x = center.x;
    //         this.center.y = center.y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * zoom by a percentage of the current zoom
    //  * @param {number} percent
    //  * @param {PIXI.Point} [center]
    //  */
    // zoomPercent(percent, center)
    // {
    //     this._width += this._width * percent;
    //     this._height += this._height * percent;
    //     if (center)
    //     {
    //         this.center.x = center.x;
    //         this.center.y = center.y;
    //     }
    //     this.recalculate();
    // }

    // /**
    //  * fit entire stage _width on screen
    //  */
    // fitX()
    // {
    //     this.view(this.stage.width, 0);
    // }

    // /**
    //  * fit entire stage _height on screen
    //  */
    // fitY()
    // {
    //     this.view(0, this.stage.height);
    // }

    // /**
    //  * fit entire stage on screen
    //  */
    // fit()
    // {
    //     if (this.stage.width / this.stage.height > this.renderer.width / this.renderer.height)
    //     {
    //         this.fitX();
    //     }
    //     else
    //     {
    //         this.fitY();
    //     }
    // }

    // /**
    //  * change _height of view area
    //  * @param {width} height
    //  */
    // heightTo(height)
    // {
    //     this.view(0, height, this.center);
    // }

    // /**
    //  * transform a world coordinate to a screen coordinate
    //  * @param {number|PIXI.Point} x
    //  * @param {number} y
    //  * @return {object} x, y
    //  */
    // toWorldFromScreen()
    // {
    //     const screen = {};
    //     if (arguments.length === 1)
    //     {
    //         screen.x = arguments[0].x;
    //         screen.y = arguments[0].y;
    //     }
    //     else
    //     {
    //         screen.x = arguments[0];
    //         screen.y = arguments[1];
    //     }

    //     if (this.stage.rotation)
    //     {
    //         const x = (screen.x - this.renderer.width / 2) * this.screenToViewRatio;
    //         const y = (screen.y - this.renderer.height / 2) * this.screenToViewRatio;
    //         const rotatedX = x * this.cos + y * this.sin;
    //         const rotatedY = y * this.cos - x * this.sin;
    //         return { x: rotatedX + this.center.x, y: rotatedY + this.center.y };
    //     }
    //     else
    //     {
    //         const x = this.center.x + (screen.x - this.renderer.width / 2) * this.screenToViewRatio;
    //         const y = this.center.y + (screen.y - this.renderer.height / 2) * this.screenToViewRatio;
    //         return { x, y };
    //     }
    // }

    // /**
    //  * transform a world coordinate to a screen coordinate
    //  * @param {PIXI.Point} world
    //  * @return {object} x, y
    //  */
    // toScreenFromWorld(world)
    // {
    //     if (this.stage.rotation)
    //     {
    //         const x = world.x - this.center.x;
    //         const y = world.y - this.center.y;
    //         const rotatedX = x * this.cos - y * this.sin;
    //         const rotatedY = y * this.cos + x * this.sin;
    //         return { x: (rotatedX + this._width / 2) * this.viewToScreenRatio, y: (rotatedY + this._height / 2) * this.viewToScreenRatio };
    //     }
    //     return { x: (world.x - this.center.x + this._width / 2) * this.viewToScreenRatio, y: (world.y - this.center.y + this._height / 2) * this.viewToScreenRatio };
    // }

    // /**
    //  * Transform a number from view size to screen size
    //  * @param {number} original
    //  * @return number
    //  */
    // toScreenSize(original)
    // {
    //     return original * this.viewToScreenRatio;
    // }

    // /**
    //  * Transform a number from screen size to view size
    //  * @param {number} original
    //  * @return {number}
    //  */
    // toWorldSize(original)
    // {
    //     return original * this.screenToViewRatio;
    // }

    // /**
    //  * @return {number} screen _height in the world coordinate system
    //  */
    // screenHeightInWorld()
    // {
    //     return this.toWorldSize(this.renderer.height);
    // }

    // /**
    //  * @return {number} screen _width in the world coordinate system
    //  */
    // screenWidthInWorld()
    // {
    //     return this.toWorldSize(this.renderer.width);
    // }

    // /**
    //  * converts an x value to a y value in the screen coordinates
    //  * @param {number} x
    //  * @return {number}
    //  */
    // screenXtoY(x)
    // {
    //     return x * this.renderer.height / this.renderer.width;
    // }

    // /**
    //  * converts a y value to an x value in the screen coordinates
    //  * @param {number} y
    //  * @return {number}
    //  */
    // screenYtoX(y)
    // {
    //     return y * this.renderer.width / this.renderer.height;
    // }

    // /**
    //  * @return {number} scale
    //  */
    // scaleGet()
    // {
    //     return this.stage.scale.x;
    // }

    // /**
    //  * recalucates and repositions
    //  * @private
    //  */
    // recalculate()
    // {
    //     this.screenToViewRatio = this._width / this.renderer.width;
    //     this.viewToScreenRatio = this.renderer.width / this._width;
    //     this.screenRatio = this.renderer.height / this.renderer.width;
    //     this.stage.scale.set(this.viewToScreenRatio);
    //     this.stage.pivot.set(this.center.x, this.center.y);
    //     this.stage.position.set(this._width / 2 * this.stage.scale.x, this._height / 2 * this.stage.scale.y);
    //     this.topLeft = { x: this.center.x - this._width / 2, y: this.center.y - this._height / 2 };
    //     this.AABB = [this.topLeft.x, this.topLeft.y, this.topLeft.x + this._width, this.topLeft.y + this._height];
    //     this.bounds = { x: this.topLeft.x, y: this.topLeft.y, width: this._width, height: this._height };
    // }
}

module.exports = Viewport;