import * as PIXI from 'pixi.js';
import { Rectangle, Point, Container, VERSION } from 'pixi.js';

/**
 * @typedef ViewportTouch
 * @property {number} id
 * @property {PIXI.Point} last
*/

/**
 * handles all input for Viewport
 * @private
 */
class InputManager {
    constructor(viewport) {
        this.viewport = viewport;

        /**
         * list of active touches on viewport
         * @type {ViewportTouch[]}
         */
        this.touches = [];
        this.addListeners();
    }

    /**
     * add input listeners
     * @private
     */
    addListeners() {
        this.viewport.interactive = true;
        if (!this.viewport.forceHitArea) {
            this.viewport.hitArea = new Rectangle(0, 0, this.viewport.worldWidth, this.viewport.worldHeight);
        }
        this.viewport.on('pointerdown', this.down, this);
        this.viewport.on('pointermove', this.move, this);
        this.viewport.on('pointerup', this.up, this);
        this.viewport.on('pointerupoutside', this.up, this);
        this.viewport.on('pointercancel', this.up, this);
        this.viewport.on('pointerout', this.up, this);
        this.wheelFunction = (e) => this.handleWheel(e);
        this.viewport.options.divWheel.addEventListener('wheel', this.wheelFunction, { passive: this.viewport.options.passiveWheel });
        this.isMouseDown = false;
    }

    /**
     * removes all event listeners from viewport
     * (useful for cleanup of wheel when removing viewport)
     */
    destroy() {
        this.viewport.options.divWheel.removeEventListener('wheel', this.wheelFunction);
    }

    /**
     * handle down events for viewport
     * @param {PIXI.InteractionEvent} event
     */
    down(event) {
        if (this.viewport.pause || !this.viewport.worldVisible) {
            return
        }
        if (event.data.pointerType === 'mouse') {
            this.isMouseDown = true;
        }
        else if (!this.get(event.data.pointerId)) {
            this.touches.push({ id: event.data.pointerId, last: null });
        }
        if (this.count() === 1) {
            this.last = event.data.global.clone();

            // clicked event does not fire if viewport is decelerating or bouncing
            const decelerate = this.viewport.plugins.get('decelerate', true);
            const bounce = this.viewport.plugins.get('bounce', true);
            if ((!decelerate || !decelerate.isActive()) && (!bounce || !bounce.isActive())) {
                this.clickedAvailable = true;
            }
            else {
                this.clickedAvailable = false;
            }
        }
        else {
            this.clickedAvailable = false;
        }

        const stop = this.viewport.plugins.down(event);
        if (stop && this.viewport.options.stopPropagation) {
            event.stopPropagation();
        }
    }

    /**
     * clears all pointer events
     */
    clear() {
        this.isMouseDown = false;
        this.touches = [];
        this.last = null;
    }

    /**
     * @param {number} change
     * @returns whether change exceeds threshold
     */
    checkThreshold(change) {
        if (Math.abs(change) >= this.viewport.threshold) {
            return true
        }
        return false
    }

    /**
     * handle move events for viewport
     * @param {PIXI.InteractionEvent} event
     */
    move(event) {
        if (this.viewport.pause || !this.viewport.worldVisible) {
            return
        }

        const stop = this.viewport.plugins.move(event);

        if (this.clickedAvailable) {
            const distX = event.data.global.x - this.last.x;
            const distY = event.data.global.y - this.last.y;
            if (this.checkThreshold(distX) || this.checkThreshold(distY)) {
                this.clickedAvailable = false;
            }
        }

        if (stop && this.viewport.options.stopPropagation) {
            event.stopPropagation();
        }
    }

    /**
     * handle up events for viewport
     * @param {PIXI.InteractionEvent} event
     */
    up(event) {
        if (this.viewport.pause || !this.viewport.worldVisible) {
            return
        }

        if (event.data.pointerType === 'mouse') {
            this.isMouseDown = false;
        }

        if (event.data.pointerType !== 'mouse') {
            this.remove(event.data.pointerId);
        }

        const stop = this.viewport.plugins.up(event);

        if (this.clickedAvailable && this.count() === 0) {
            this.viewport.emit('clicked', { event: event, screen: this.last, world: this.viewport.toWorld(this.last), viewport: this });
            this.clickedAvailable = false;
        }

        if (stop && this.viewport.options.stopPropagation) {
            event.stopPropagation();
        }
    }

    /**
     * gets pointer position if this.interaction is set
     * @param {WheelEvent} event
     * @return {PIXI.Point}
     */
    getPointerPosition(event) {
        let point = new Point();
        if (this.viewport.options.interaction) {
            this.viewport.options.interaction.mapPositionToPoint(point, event.clientX, event.clientY);
        }
        else {
            point.x = event.clientX;
            point.y = event.clientY;
        }
        return point
    }

    /**
     * handle wheel events
     * @param {WheelEvent} event
     */
    handleWheel(event) {
        if (this.viewport.pause || !this.viewport.worldVisible) {
            return
        }

        // do not handle events coming from other elements
        if (this.viewport.options.interaction && this.viewport.options.interaction.interactionDOMElement !== event.target) {
            return
        }

        // only handle wheel events where the mouse is over the viewport
        const point = this.viewport.toLocal(this.getPointerPosition(event));
        if (this.viewport.left <= point.x && point.x <= this.viewport.right && this.viewport.top <= point.y && point.y <= this.viewport.bottom) {
            const stop = this.viewport.plugins.wheel(event);
            if (stop && !this.viewport.options.passiveWheel) {
                event.preventDefault();
            }
        }
    }

    pause() {
        this.touches = [];
        this.isMouseDown = false;
    }

    /**
     * get touch by id
     * @param {number} id
     * @return {ViewportTouch}
     */
    get(id) {
        for (let touch of this.touches) {
            if (touch.id === id) {
                return touch
            }
        }
        return null
    }

    /**
     * remove touch by number
     * @param {number} id
     */
    remove(id) {
        for (let i = 0; i < this.touches.length; i++) {
            if (this.touches[i].id === id) {
                this.touches.splice(i, 1);
                return
            }
        }
    }

    /**
     * @returns {number} count of mouse/touch pointers that are down on the viewport
     */
    count() {
        return (this.isMouseDown ? 1 : 0) + this.touches.length
    }
}

const PLUGIN_ORDER = ['drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'aniamte', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'];

/**
 * Use this to access current plugins or add user-defined plugins
 */
class PluginManager {
    /**
     * instantiated by Viewport
     * @param {Viewport} viewport
     */
    constructor(viewport) {
        this.viewport = viewport;
        this.list = [];
        this.plugins = {};
    }

    /**
     * Inserts a named plugin or a user plugin into the viewport
     * default plugin order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce', 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
     * @param {string} name of plugin
     * @param {Plugin} plugin - instantiated Plugin class
     * @param {number} index to insert userPlugin (otherwise inserts it at the end)
     */
    add(name, plugin, index = PLUGIN_ORDER.length) {
        this.plugins[name] = plugin;
        const current = PLUGIN_ORDER.indexOf(name);
        if (current !== -1) {
            PLUGIN_ORDER.splice(current, 1);
        }
        PLUGIN_ORDER.splice(index, 0, name);
        this.sort();
    }

    /**
     * get plugin
     * @param {string} name of plugin
     * @param {boolean} [ignorePaused] return null if plugin is paused
     * @return {Plugin}
     */
    get(name, ignorePaused) {
        if (ignorePaused) {
            if (this.plugins[name] && this.plugins[name].paused) {
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
            plugin.update(elapsed);
        }
    }

    /**
     * resize all active plugins
     * @ignore
     */
    resize() {
        for (let plugin of this.list) {
            plugin.resize();
        }
    }

    /**
     * clamps and resets bounce and decelerate (as needed) after manually moving viewport
     */
    reset() {
        for (let plugin of this.list) {
            plugin.reset();
        }
    }

    /** removes all installed plugins */
    removeAll() {
        this.plugins = {};
        this.sort();
    }

    /**
     * removes installed plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    remove(name) {
        if (this.plugins[name]) {
            delete this.plugins[name];
            this.viewport.emit(name + '-remove');
            this.sort();
        }
    }

    /**
     * pause plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    pause(name) {
        if (this.plugins[name]) {
            this.plugins[name].pause();
        }
    }

    /**
     * resume plugin
     * @param {string} name of plugin (e.g., 'drag', 'pinch')
     */
    resume(name) {
        if (this.plugins[name]) {
            this.plugins[name].resume();
        }
    }

    /**
     * sort plugins according to PLUGIN_ORDER
     * @ignore
     */
    sort() {
        this.list = [];
        for (let plugin of PLUGIN_ORDER) {
            if (this.plugins[plugin]) {
                this.list.push(this.plugins[plugin]);
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
        let stop = false;
        for (let plugin of this.list) {
            if (plugin.down(event)) {
                stop = true;
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
        let stop = false;
        for (let plugin of this.viewport.plugins.list) {
            if (plugin.move(event)) {
                stop = true;
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
        let stop = false;
        for (let plugin of this.list) {
            if (plugin.up(event)) {
                stop = true;
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
        let result = false;
        for (let plugin of this.list) {
            if (plugin.wheel(e)) {
                result = true;
            }
        }
        return result
    }
}

/**
 * derive this class to create user-defined plugins
 */
class Plugin {
    /**
     * @param {Viewport} parent
     */
    constructor(parent) {
        this.parent = parent;
        this.paused = false;
    }

    /** called when plugin is removed */
    destroy() {}

    /**
     * handler for pointerdown PIXI event
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    down() {
        return false
    }

    /**
     * handler for pointermove PIXI event
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    move() {
        return false
    }

    /**
     * handler for pointerup PIXI event
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    up() {
        return false
    }

    /**
     * handler for wheel event on div
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel() {
        return false
    }

    /**
     * called on each tick
     * @param {number} elapsed time in millisecond since last update
     */
    update() { }

    /** called when the viewport is resized */
    resize() { }

    /** called when the viewport is manually moved */
    reset() { }

    /** pause the plugin */
    pause() {
        this.paused = true;
    }

    /** un-pause the plugin */
    resume() {
        this.paused = false;
    }
}

/**
 * @typedef {object} LastDrag
 * @property {number} x
 * @property {number} y
 * @property {PIXI.Point} parent
 */

/**
 * @typedef DragOptions
 * @property {string} [direction=all] direction to drag
 * @property {boolean} [pressDrag=true] whether click to drag is active
 * @property {boolean} [wheel=true] use wheel to scroll in direction (unless wheel plugin is active)
 * @property {number} [wheelScroll=1] number of pixels to scroll with each wheel spin
 * @property {boolean} [reverse] reverse the direction of the wheel scroll
 * @property {(boolean|string)} [clampWheel=false] clamp wheel(to avoid weird bounce with mouse wheel)
 * @property {string} [underflow=center] where to place world if too small for screen
 * @property {number} [factor=1] factor to multiply drag to increase the speed of movement
 * @property {string} [mouseButtons=all] changes which mouse buttons trigger drag, use: 'all', 'left', right' 'middle', or some combination, like, 'middle-right'; you may want to set viewport.options.disableOnContextMenu if you want to use right-click dragging
 * @property {string[]} [keyToPress=null] array containing {@link key|https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code} codes of keys that can be pressed for the drag to be triggered, e.g.: ['ShiftLeft', 'ShiftRight'}.
 * @property {boolean} [ignoreKeyToPressOnTouch=false] ignore keyToPress for touch events
 * @property {number} [lineHeight=20] scaling factor for non-DOM_DELTA_PIXEL scrolling events
 */

const dragOptions = {
    direction: 'all',
    pressDrag: true,
    wheel: true,
    wheelScroll: 1,
    reverse: false,
    clampWheel: false,
    underflow: 'center',
    factor: 1,
    mouseButtons: 'all',
    keyToPress: null,
    ignoreKeyToPressOnTouch: false,
    lineHeight: 20,
};

/**
 * @private
 */
class Drag extends Plugin {
    /**
     * @param {Viewport} parent
     * @param {DragOptions} options
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, dragOptions, options);
        this.moved = false;
        this.reverse = this.options.reverse ? 1 : -1;
        this.xDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'x';
        this.yDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'y';
        this.keyIsPressed = false;

        this.parseUnderflow();
        this.mouseButtons(this.options.mouseButtons);
        if (this.options.keyToPress) {
            this.handleKeyPresses(this.options.keyToPress);
        }
    }

    /**
     * Handles keypress events and set the keyIsPressed boolean accordingly
     * @param {array} codes - key codes that can be used to trigger drag event
     */
    handleKeyPresses(codes) {
        window.addEventListener('keydown', e => {
            if (codes.includes(e.code))
                this.keyIsPressed = true;
        });

        window.addEventListener('keyup', e => {
            if (codes.includes(e.code))
                this.keyIsPressed = false;
        });
    }

    /**
     * initialize mousebuttons array
     * @param {string} buttons
     */
    mouseButtons(buttons) {
        if (!buttons || buttons === 'all') {
            this.mouse = [true, true, true];
        } else {
            this.mouse = [
                buttons.indexOf('left') === -1 ? false : true,
                buttons.indexOf('middle') === -1 ? false : true,
                buttons.indexOf('right') === -1 ? false : true
            ];
        }
    }

    parseUnderflow() {
        const clamp = this.options.underflow.toLowerCase();
        if (clamp === 'center') {
            this.underflowX = 0;
            this.underflowY = 0;
        } else {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
        }
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    checkButtons(event) {
        const isMouse = event.data.pointerType === 'mouse';
        const count = this.parent.input.count();
        if ((count === 1) || (count > 1 && !this.parent.plugins.get('pinch', true))) {
            if (!isMouse || this.mouse[event.data.button]) {
                return true
            }
        }
        return false
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    checkKeyPress(event) {
        if (!this.options.keyToPress || this.keyIsPressed || (this.options.ignoreKeyToPressOnTouch && event.data.pointerType === 'touch'))
            return true

        return false
    }

    /**
     * @param {PIXI.InteractionEvent} event
     */
    down(event) {
        if (this.paused || !this.options.pressDrag) {
            return
        }
        if (this.checkButtons(event) && this.checkKeyPress(event)) {
            this.last = { x: event.data.global.x, y: event.data.global.y };
            this.current = event.data.pointerId;
            return true
        } else {
            this.last = null;
        }
    }

    get active() {
        return this.moved
    }

    /**
     * @param {PIXI.InteractionEvent} event
     */
    move(event) {
        if (this.paused || !this.options.pressDrag) {
            return
        }
        if (this.last && this.current === event.data.pointerId) {
            const x = event.data.global.x;
            const y = event.data.global.y;
            const count = this.parent.input.count();
            if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch', true))) {
                const distX = x - this.last.x;
                const distY = y - this.last.y;
                if (this.moved || ((this.xDirection && this.parent.input.checkThreshold(distX)) || (this.yDirection && this.parent.input.checkThreshold(distY)))) {
                    const newPoint = { x, y };
                    if (this.xDirection) {
                        this.parent.x += (newPoint.x - this.last.x) * this.options.factor;
                    }
                    if (this.yDirection) {
                        this.parent.y += (newPoint.y - this.last.y) * this.options.factor;
                    }
                    this.last = newPoint;
                    if (!this.moved) {
                        this.parent.emit('drag-start', { event: event, screen: new Point(this.last.x, this.last.y), world: this.parent.toWorld(new Point(this.last.x, this.last.y)), viewport: this.parent });
                    }
                    this.moved = true;
                    this.parent.emit('moved', { viewport: this.parent, type: 'drag' });
                    return true
                }
            } else {
                this.moved = false;
            }
        }
    }

    /**
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    up(event) {
        if (this.paused) {
            return
        }
        const touches = this.parent.input.touches;
        if (touches.length === 1) {
            const pointer = touches[0];
            if (pointer.last) {
                this.last = { x: pointer.last.x, y: pointer.last.y };
                this.current = pointer.id;
            }
            this.moved = false;
            return true
        } else if (this.last) {
            if (this.moved) {
                const screen = new Point(this.last.x, this.last.y);
                this.parent.emit('drag-end', { event: event, screen, world: this.parent.toWorld(screen), viewport: this.parent });
                this.last = null;
                this.moved = false;
                return true
            }
        }
    }

    /**
     * @param {WheelEvent} event
     * @returns {boolean}
     */
    wheel(event) {
        if (this.paused) {
            return
        }

        if (this.options.wheel) {
            const wheel = this.parent.plugins.get('wheel', true);
            if (!wheel) {
                const step = event.deltaMode ? this.options.lineHeight : 1;
                if (this.xDirection) {
                    this.parent.x += event.deltaX * step * this.options.wheelScroll * this.reverse;
                }
                if (this.yDirection) {
                    this.parent.y += event.deltaY * step * this.options.wheelScroll * this.reverse;
                }
                if (this.options.clampWheel) {
                    this.clamp();
                }
                this.parent.emit('wheel-scroll', this.parent);
                this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
                if (!this.parent.options.passiveWheel) {
                    event.preventDefault();
                }
                return true
            }
        }
    }

    resume() {
        this.last = null;
        this.paused = false;
    }

    clamp() {
        const decelerate = this.parent.plugins.get('decelerate', true) || {};
        if (this.options.clampWheel !== 'y') {
            if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                switch (this.underflowX) {
                case -1:
                    this.parent.x = 0;
                    break
                case 1:
                    this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth);
                    break
                default:
                    this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                }
            } else {
                if (this.parent.left < 0) {
                    this.parent.x = 0;
                    decelerate.x = 0;
                } else if (this.parent.right > this.parent.worldWidth) {
                    this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth;
                    decelerate.x = 0;
                }
            }
        }
        if (this.options.clampWheel !== 'x') {
            if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                switch (this.underflowY) {
                case -1:
                    this.parent.y = 0;
                    break
                case 1:
                    this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                    break
                default:
                    this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                }
            } else {
                if (this.parent.top < 0) {
                    this.parent.y = 0;
                    decelerate.y = 0;
                }
                if (this.parent.bottom > this.parent.worldHeight) {
                    this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight;
                    decelerate.y = 0;
                }
            }
        }
    }
}

/**
 * @typedef {object} PinchOptions
 * @property {boolean} [noDrag] disable two-finger dragging
 * @property {number} [percent=1] percent to modify pinch speed
 * @property {number} [factor=1] factor to multiply two-finger drag to increase the speed of movement
 * @property {PIXI.Point} [center] place this point at center during zoom instead of center of two fingers
 * @property {('all'|'x'|'y')} [axis=all] axis to zoom
 */

const pinchOptions = {
    noDrag: false,
    percent: 1,
    center: null,
    factor: 1,
    axis: 'all',
};

class Pinch extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {PinchOptions} [options]
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, pinchOptions, options);
    }

    down() {
        if (this.parent.input.count() >= 2) {
            this.active = true;
            return true
        }
    }

    isAxisX() {
        return ['all', 'x'].includes(this.options.axis)
    }

    isAxisY() {
        return ['all', 'y'].includes(this.options.axis)
    }

    move(e) {
        if (this.paused || !this.active) {
            return
        }

        const x = e.data.global.x;
        const y = e.data.global.y;

        const pointers = this.parent.input.touches;
        if (pointers.length >= 2) {
            const first = pointers[0];
            const second = pointers[1];
            const last = (first.last && second.last) ? Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2)) : null;
            if (first.id === e.data.pointerId) {
                first.last = { x, y, data: e.data };
            }
            else if (second.id === e.data.pointerId) {
                second.last = { x, y, data: e.data };
            }
            if (last) {
                let oldPoint;
                const point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 };
                if (!this.options.center) {
                    oldPoint = this.parent.toLocal(point);
                }
                let dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2));
                dist = dist === 0 ? dist = 0.0000000001 : dist;
                const change = (1 - last / dist) * this.options.percent * (this.isAxisX() ? this.parent.scale.x : this.parent.scale.y);
                if (this.isAxisX()) {
                    this.parent.scale.x += change;
                }
                if (this.isAxisY()) {
                    this.parent.scale.y += change;
                }
                this.parent.emit('zoomed', { viewport: this.parent, type: 'pinch', center: point });
                const clamp = this.parent.plugins.get('clamp-zoom', true);
                if (clamp) {
                    clamp.clamp();
                }
                if (this.options.center) {
                    this.parent.moveCenter(this.options.center);
                }
                else {
                    const newPoint = this.parent.toGlobal(oldPoint);
                    this.parent.x += (point.x - newPoint.x) * this.options.factor;
                    this.parent.y += (point.y - newPoint.y) * this.options.factor;
                    this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                }
                if (!this.options.noDrag && this.lastCenter) {
                    this.parent.x += (point.x - this.lastCenter.x) * this.options.factor;
                    this.parent.y += (point.y - this.lastCenter.y) * this.options.factor;
                    this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                }
                this.lastCenter = point;
                this.moved = true;
            }
            else {
                if (!this.pinching) {
                    this.parent.emit('pinch-start', this.parent);
                    this.pinching = true;
                }
            }
            return true
        }
    }

    up() {
        if (this.pinching) {
            if (this.parent.input.touches.length <= 1) {
                this.active = false;
                this.lastCenter = null;
                this.pinching = false;
                this.moved = false;
                this.parent.emit('pinch-end', this.parent);
                return true
            }
        }
    }
}

/**
 * There are three ways to clamp:
 * 1. direction: 'all' = the world is clamped to its world boundaries, ie, you cannot drag any part of the world offscreen
 *    direction: 'x' | 'y' = only the x or y direction is clamped to its world boundary
 * 2. left, right, top, bottom = true | number = the world is clamped to the world's pixel location for each side;
 *    if any of these are set to true, then the location is set to the boundary [0, viewport.worldWidth/viewport.worldHeight]
 *    eg: to allow the world to be completely dragged offscreen, set [-viewport.worldWidth, -viewport.worldHeight, viewport.worldWidth * 2, viewport.worldHeight * 2]
 *
 * Underflow determines what happens when the world is smaller than the viewport
 * 1. none = the world is clamped but there is no special behavior
 * 2. center = the world is centered on the viewport
 * 3. combination of top/bottom/center and left/right/center (case insensitive) = the world is stuck to the appropriate boundaries
 *
 * @typedef ClampOptions
 * @property {(number|boolean)} [left=false] clamp left; true = 0
 * @property {(number|boolean)} [right=false] clamp right; true = viewport.worldWidth
 * @property {(number|boolean)} [top=false] clamp top; true = 0
 * @property {(number|boolean)} [bottom=false] clamp bottom; true = viewport.worldHeight
 * @property {string} [direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
 * @property {string} [underflow=center] where to place world if too small for screen (e.g., top-right, center, none, bottomleft)
 */

const clampOptions =
{
    left: false,
    right: false,
    top: false,
    bottom: false,
    direction: null,
    underflow: 'center'
};

class Clamp extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {ClampOptions} [options]
     */
    constructor(parent, options={})
    {
        super(parent);
        this.options = Object.assign({}, clampOptions, options);
        if (this.options.direction)
        {
            this.options.left = this.options.direction === 'x' || this.options.direction === 'all' ? true : null;
            this.options.right = this.options.direction === 'x' || this.options.direction === 'all' ? true : null;
            this.options.top = this.options.direction === 'y' || this.options.direction === 'all' ? true : null;
            this.options.bottom = this.options.direction === 'y' || this.options.direction === 'all' ? true : null;
        }
        this.parseUnderflow();
        this.last = { x: null, y: null, scaleX: null, scaleY: null };
        this.update();
    }

    parseUnderflow()
    {
        const clamp = this.options.underflow.toLowerCase();
        if (clamp === 'none')
        {
            this.noUnderflow = true;
        }
        else if (clamp === 'center')
        {
            this.underflowX = this.underflowY = 0;
            this.noUnderflow = false;
        }
        else
        {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
            this.noUnderflow = false;
        }
    }

    /**
     * handle move events
     * @param {PIXI.InteractionEvent} event
     * @returns {boolean}
     */
    move()
    {
        this.update();
        return false
    }

    update()
    {
        if (this.paused)
        {
            return
        }

        // only clamp on change
        if (this.parent.x === this.last.x && this.parent.y === this.last.y && this.parent.scale.x === this.last.scaleX && this.parent.scale.y === this.last.scaleY)
        {
            return
        }
        const original = { x: this.parent.x, y: this.parent.y };
        const decelerate = this.parent.plugins['decelerate'] || {};
        if (this.options.left !== null || this.options.right !== null)
        {
            let moved = false;
            if (!this.noUnderflow && this.parent.screenWorldWidth < this.parent.screenWidth)
            {
                switch (this.underflowX)
                {
                    case -1:
                        if (this.parent.x !== 0)
                        {
                            this.parent.x = 0;
                            moved = true;
                        }
                        break
                    case 1:
                        if (this.parent.x !== this.parent.screenWidth - this.parent.screenWorldWidth)
                        {
                            this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                            moved = true;
                        }
                        break
                    default:
                        if (this.parent.x !== (this.parent.screenWidth - this.parent.screenWorldWidth) / 2)
                        {
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                            moved = true;
                        }
                }
            }
            else
            {
                if (this.options.left !== null)
                {
                    if (this.parent.left < (this.options.left === true ? 0 : this.options.left))
                    {
                        this.parent.x = -(this.options.left === true ? 0 : this.options.left) * this.parent.scale.x;
                        decelerate.x = 0;
                        moved = true;
                    }
                }
                if (this.options.right !== null)
                {
                    if (this.parent.right > (this.options.right === true ? this.parent.worldWidth : this.options.right))
                    {
                        this.parent.x = -(this.options.right === true ? this.parent.worldWidth : this.options.right) * this.parent.scale.x + this.parent.screenWidth;
                        decelerate.x = 0;
                        moved = true;
                    }
                }
            }
            if (moved)
            {
                this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-x' });
            }
        }
        if (this.options.top !== null || this.options.bottom !== null)
        {
            let moved = false;
            if (!this.noUnderflow && this.parent.screenWorldHeight < this.parent.screenHeight)
            {
                switch (this.underflowY)
                {
                    case -1:
                        if (this.parent.y !== 0)
                        {
                            this.parent.y = 0;
                            moved = true;
                        }
                        break
                    case 1:
                        if (this.parent.y !== this.parent.screenHeight - this.parent.screenWorldHeight)
                        {
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                            moved = true;
                        }
                        break
                    default:
                        if (this.parent.y !== (this.parent.screenHeight - this.parent.screenWorldHeight) / 2)
                        {
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                            moved = true;
                        }
                }
            }
            else
            {
                if (this.options.top !== null)
                {
                    if (this.parent.top < (this.options.top === true ? 0 : this.options.top))
                    {
                        this.parent.y = -(this.options.top === true ? 0 : this.options.top) * this.parent.scale.y;
                        decelerate.y = 0;
                        moved = true;
                    }
                }
                if (this.options.bottom !== null)
                {
                    if (this.parent.bottom > (this.options.bottom === true ? this.parent.worldHeight : this.options.bottom))
                    {
                        this.parent.y = -(this.options.bottom === true ? this.parent.worldHeight : this.options.bottom) * this.parent.scale.y + this.parent.screenHeight;
                        decelerate.y = 0;
                        moved = true;
                    }
                }
            }
            if (moved)
            {
                this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-y' });
            }
        }
        this.last.x = this.parent.x;
        this.last.y = this.parent.y;
        this.last.scaleX = this.parent.scale.x;
        this.last.scaleY = this.parent.scale.y;
    }

    reset()
    {
        this.update();
    }
}

/**
 * use either minimum width/height or minimum scale
 * @typedef {object} ClampZoomOptions
 * @property {number} [minWidth] minimum width
 * @property {number} [minHeight] minimum height
 * @property {number} [maxWidth] maximum width
 * @property {number} [maxHeight] maximum height
 * @property {number} [minScale] minimum scale
 * @property {number} [maxScale] minimum scale
 */

const clampZoomOptions = {
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    minScale: null,
    maxScale: null
};

class ClampZoom extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {ClampZoomOptions} [options]
     */
    constructor(parent, options={})
    {
        super(parent);
        this.options = Object.assign({}, clampZoomOptions, options);
        this.clamp();
    }

    resize()
    {
        this.clamp();
    }

    clamp()
    {
        if (this.paused)
        {
            return
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
            if (scale !== this.parent.scale.x) {
                this.parent.scale.set(scale);
                this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
    }

    reset()
    {
        this.clamp();
    }
}

/**
 * @typedef {object} DecelerateOptions
 * @property {number} [friction=0.95] percent to decelerate after movement
 * @property {number} [bounce=0.8] percent to decelerate when past boundaries (only applicable when viewport.bounce() is active)
 * @property {number} [minSpeed=0.01] minimum velocity before stopping/reversing acceleration
 */

const decelerateOptions = {
    friction: 0.98,
    bounce: 0.8,
    minSpeed: 0.01
};

/**
 * Time period of decay (1 frame)
 */
const TP = 16;

class Decelerate extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {DecelerateOptions} [options]
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, decelerateOptions, options);
        this.saved = [];
        this.timeSinceRelease = 0;
        this.reset();
        this.parent.on('moved', data => this.moved(data));
    }

    destroy() {
        this.parent;
    }

    down() {
        this.saved = [];
        this.x = this.y = false;
    }

    isActive() {
        return this.x || this.y
    }

    move() {
        if (this.paused) {
            return
        }

        const count = this.parent.input.count();
        if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch', true))) {
            this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() });
            if (this.saved.length > 60) {
                this.saved.splice(0, 30);
            }
        }
    }

    moved(data) {
        if (this.saved.length) {
            const last = this.saved[this.saved.length - 1];
            if (data.type === 'clamp-x') {
                if (last.x === data.original.x) {
                    last.x = this.parent.x;
                }
            }
            else if (data.type === 'clamp-y') {
                if (last.y === data.original.y) {
                    last.y = this.parent.y;
                }
            }
        }
    }

    up() {
        if (this.parent.input.count() === 0 && this.saved.length) {
            const now = performance.now();
            for (let save of this.saved) {
                if (save.time >= now - 100) {
                    const time = now - save.time;
                    this.x = (this.parent.x - save.x) / time;
                    this.y = (this.parent.y - save.y) / time;
                    this.percentChangeX = this.percentChangeY = this.options.friction;
                    this.timeSinceRelease = 0;
                    break
                }
            }
        }
    }

    /**
     * manually activate plugin
     * @param {object} options
     * @param {number} [options.x]
     * @param {number} [options.y]
     */
    activate(options) {
        options = options || {};
        if (typeof options.x !== 'undefined') {
            this.x = options.x;
            this.percentChangeX = this.options.friction;
        }
        if (typeof options.y !== 'undefined') {
            this.y = options.y;
            this.percentChangeY = this.options.friction;
        }
    }

    update(elapsed) {
        if (this.paused) {
            return
        }

        /*
         * See https://github.com/davidfig/pixi-viewport/issues/271 for math.
         *
         * The viewport velocity (this.x, this.y) decays expoenential by the the decay factor
         * (this.percentChangeX, this.percentChangeY) each frame. This velocity function is integrated
         * to calculate the displacement.
         */

        const moved = this.x || this.y;

        const ti = this.timeSinceRelease;
        const tf = this.timeSinceRelease + elapsed;

        if (this.x) {
            const k = this.percentChangeX;
            const lnk = Math.log(k);

            this.parent.x += ((this.x * TP) / lnk) * (Math.pow(k, tf / TP) - Math.pow(k, ti / TP));
        }
        if (this.y) {
            const k = this.percentChangeY;
            const lnk = Math.log(k);

            this.parent.y += ((this.y * TP) / lnk) * (Math.pow(k, tf / TP) - Math.pow(k, ti / TP));
        }

        this.timeSinceRelease += elapsed;
        this.x *= Math.pow(this.percentChangeX, elapsed / TP);
        this.y *= Math.pow(this.percentChangeY, elapsed / TP);

        if (Math.abs(this.x) < this.options.minSpeed) {
            this.x = 0;
        }
        if (Math.abs(this.y) < this.options.minSpeed) {
            this.y = 0;
        }

        if (moved) {
            this.parent.emit('moved', { viewport: this.parent, type: 'decelerate' });
        }
    }

    reset() {
        this.x = this.y = null;
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var penner = createCommonjsModule(function (module, exports) {
/*
	Copyright © 2001 Robert Penner
	All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, 
	are permitted provided that the following conditions are met:

	Redistributions of source code must retain the above copyright notice, this list of 
	conditions and the following disclaimer.
	Redistributions in binary form must reproduce the above copyright notice, this list 
	of conditions and the following disclaimer in the documentation and/or other materials 
	provided with the distribution.

	Neither the name of the author nor the names of contributors may be used to endorse 
	or promote products derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
	MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
	COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
	GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
	AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
	NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
	OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function() {
  var penner, umd;

  umd = function(factory) {
    {
      return module.exports = factory;
    }
  };

  penner = {
    linear: function(t, b, c, d) {
      return c * t / d + b;
    },
    easeInQuad: function(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOutQuad: function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      } else {
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
      }
    },
    easeInCubic: function(t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t + b;
      } else {
        return c / 2 * ((t -= 2) * t * t + 2) + b;
      }
    },
    easeInQuart: function(t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t + b;
      } else {
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
      }
    },
    easeInQuint: function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
      } else {
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
      }
    },
    easeInSine: function(t, b, c, d) {
      return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
      return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(t, b, c, d) {
      if (t === 0) {
        return b;
      } else {
        return c * Math.pow(2, 10 * (t / d - 1)) + b;
      }
    },
    easeOutExpo: function(t, b, c, d) {
      if (t === d) {
        return b + c;
      } else {
        return c * (-Math.pow(2, -10 * t / d) + 1) + b;
      }
    },
    easeInOutExpo: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
      } else {
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
      }
    },
    easeInCirc: function(t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
      } else {
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
      }
    },
    easeInElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) ; else if ((t /= d) === 1) ;
      if (!p) {
        p = d * .3;
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) ; else if ((t /= d) === 1) ;
      if (!p) {
        p = d * .3;
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function(t, b, c, d) {
      var a, p, s;
      s = 1.70158;
      p = 0;
      a = c;
      if (t === 0) ; else if ((t /= d / 2) === 2) ;
      if (!p) {
        p = d * (.3 * 1.5);
      }
      if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      if (t < 1) {
        return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      } else {
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
      }
    },
    easeInBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
      if (s === void 0) {
        s = 1.70158;
      }
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      } else {
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
      }
    },
    easeInBounce: function(t, b, c, d) {
      var v;
      v = penner.easeOutBounce(d - t, 0, c, d);
      return c - v + b;
    },
    easeOutBounce: function(t, b, c, d) {
      if ((t /= d) < 1 / 2.75) {
        return c * (7.5625 * t * t) + b;
      } else if (t < 2 / 2.75) {
        return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
      } else if (t < 2.5 / 2.75) {
        return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
      } else {
        return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
      }
    },
    easeInOutBounce: function(t, b, c, d) {
      var v;
      if (t < d / 2) {
        v = penner.easeInBounce(t * 2, 0, c, d);
        return v * .5 + b;
      } else {
        v = penner.easeOutBounce(t * 2 - d, 0, c, d);
        return v * .5 + c * .5 + b;
      }
    }
  };

  umd(penner);

}).call(commonjsGlobal);
});

/**
 * returns correct Penner equation using string or Function
 * @param {(function|string)} [ease]
 * @param {defaults} default penner equation to use if none is provided
 */
function ease(ease, defaults)
{
    if (!ease)
    {
        return penner[defaults]
    }
    else if (typeof ease === 'function')
    {
        return ease
    }
    else if (typeof ease === 'string')
    {
        return penner[ease]
    }
}

/**
 * @typedef {options} BounceOptions
 * @property {string} [sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
 * @property {number} [friction=0.5] friction to apply to decelerate if active
 * @property {number} [time=150] time in ms to finish bounce
 * @property {object} [bounceBox] use this bounceBox instead of (0, 0, viewport.worldWidth, viewport.worldHeight)
 * @property {number} [bounceBox.x=0]
 * @property {number} [bounceBox.y=0]
 * @property {number} [bounceBox.width=viewport.worldWidth]
 * @property {number} [bounceBox.height=viewport.worldHeight]
 * @property {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {string} [underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
 */

const bounceOptions = {
    sides: 'all',
    friction: 0.5,
    time: 150,
    ease: 'easeInOutSine',
    underflow: 'center',
    bounceBox: null
};

class Bounce extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {BounceOptions} [options]
     * @fires bounce-start-x
     * @fires bounce.end-x
     * @fires bounce-start-y
     * @fires bounce-end-y
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, bounceOptions, options);
        this.ease = ease(this.options.ease, 'easeInOutSine');
        if (this.options.sides) {
            if (this.options.sides === 'all') {
                this.top = this.bottom = this.left = this.right = true;
            }
            else if (this.options.sides === 'horizontal') {
                this.right = this.left = true;
            }
            else if (this.options.sides === 'vertical') {
                this.top = this.bottom = true;
            }
            else {
                this.top = this.options.sides.indexOf('top') !== -1;
                this.bottom = this.options.sides.indexOf('bottom') !== -1;
                this.left = this.options.sides.indexOf('left') !== -1;
                this.right = this.options.sides.indexOf('right') !== -1;
            }
        }
        this.parseUnderflow();
        this.last = {};
        this.reset();
    }

    parseUnderflow() {
        const clamp = this.options.underflow.toLowerCase();
        if (clamp === 'center') {
            this.underflowX = 0;
            this.underflowY = 0;
        }
        else {
            this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
            this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
        }
    }

    isActive() {
        return this.toX !== null || this.toY !== null
    }

    down() {
        this.toX = this.toY = null;
    }

    up() {
        this.bounce();
    }

    update(elapsed) {
        if (this.paused) {
            return
        }

        this.bounce();
        if (this.toX) {
            const toX = this.toX;
            toX.time += elapsed;
            this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' });
            if (toX.time >= this.options.time) {
                this.parent.x = toX.end;
                this.toX = null;
                this.parent.emit('bounce-x-end', this.parent);
            }
            else {
                this.parent.x = this.ease(toX.time, toX.start, toX.delta, this.options.time);
            }
        }
        if (this.toY) {
            const toY = this.toY;
            toY.time += elapsed;
            this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' });
            if (toY.time >= this.options.time) {
                this.parent.y = toY.end;
                this.toY = null;
                this.parent.emit('bounce-y-end', this.parent);
            }
            else {
                this.parent.y = this.ease(toY.time, toY.start, toY.delta, this.options.time);
            }
        }
    }

    calcUnderflowX() {
        let x;
        switch (this.underflowX) {
            case -1:
                x = 0;
                break
            case 1:
                x = (this.parent.screenWidth - this.parent.screenWorldWidth);
                break
            default:
                x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
        }
        return x
    }

    calcUnderflowY() {
        let y;
        switch (this.underflowY) {
            case -1:
                y = 0;
                break
            case 1:
                y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                break
            default:
                y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
        }
        return y
    }

    oob() {
        const box = this.options.bounceBox;
        if (box) {
            const x1 = typeof box.x === 'undefined' ? 0 : box.x;
            const y1 = typeof box.y === 'undefined' ? 0 : box.y;
            const width = typeof box.width === 'undefined' ? this.parent.worldWidth : box.width;
            const height = typeof box.height === 'undefined' ? this.parent.worldHeight : box.height;
            return {
                left: this.parent.left < x1,
                right: this.parent.right > width,
                top: this.parent.top < y1,
                bottom: this.parent.bottom > height,
                topLeft: new Point(
                    x1 * this.parent.scale.x,
                    y1 * this.parent.scale.y
                ),
                bottomRight: new Point(
                    width * this.parent.scale.x - this.parent.screenWidth,
                    height * this.parent.scale.y - this.parent.screenHeight
                )
            }
        }
        return {
            left: this.parent.left < 0,
            right: this.parent.right > this.parent.worldWidth,
            top: this.parent.top < 0,
            bottom: this.parent.bottom > this.parent.worldHeight,
            topLeft: new Point(0, 0),
            bottomRight: new Point(
                this.parent.worldWidth * this.parent.scale.x - this.parent.screenWidth,
                this.parent.worldHeight * this.parent.scale.y - this.parent.screenHeight
            )
        }
    }

    bounce() {
        if (this.paused) {
            return
        }

        let oob;
        let decelerate = this.parent.plugins.get('decelerate', true);
        if (decelerate && (decelerate.x || decelerate.y)) {
            if ((decelerate.x && decelerate.percentChangeX === decelerate.options.friction) || (decelerate.y && decelerate.percentChangeY === decelerate.options.friction)) {
                oob = this.oob();
                if ((oob.left && this.left) || (oob.right && this.right)) {
                    decelerate.percentChangeX = this.options.friction;
                }
                if ((oob.top && this.top) || (oob.bottom && this.bottom)) {
                    decelerate.percentChangeY = this.options.friction;
                }
            }
        }
        const drag = this.parent.plugins.get('drag', true) || {};
        const pinch = this.parent.plugins.get('pinch', true) || {};
        decelerate = decelerate || {};
        if (!drag.active && !pinch.active && ((!this.toX || !this.toY) && (!decelerate.x || !decelerate.y))) {
            oob = oob || this.oob();
            const topLeft = oob.topLeft;
            const bottomRight = oob.bottomRight;
            if (!this.toX && !decelerate.x) {
                let x = null;
                if (oob.left && this.left) {
                    x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -topLeft.x;
                }
                else if (oob.right && this.right) {
                    x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -bottomRight.x;
                }
                if (x !== null && this.parent.x !== x) {
                    this.toX = { time: 0, start: this.parent.x, delta: x - this.parent.x, end: x };
                    this.parent.emit('bounce-x-start', this.parent);
                }
            }
            if (!this.toY && !decelerate.y) {
                let y = null;
                if (oob.top && this.top) {
                    y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -topLeft.y;
                }
                else if (oob.bottom && this.bottom) {
                    y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -bottomRight.y;
                }
                if (y !== null && this.parent.y !== y) {
                    this.toY = { time: 0, start: this.parent.y, delta: y - this.parent.y, end: y };
                    this.parent.emit('bounce-y-start', this.parent);
                }
            }
        }
    }

    reset() {
        this.toX = this.toY = null;
        this.bounce();
    }
}

/**
 * @typedef SnapOptions
 * @property {boolean} [topLeft] snap to the top-left of viewport instead of center
 * @property {number} [friction=0.8] friction/frame to apply if decelerate is active
 * @property {number} [time=1000]
 * @property {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {boolean} [interrupt=true] pause snapping with any user input on the viewport
 * @property {boolean} [removeOnComplete] removes this plugin after snapping is complete
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 * @property {boolean} [forceStart] starts the snap immediately regardless of whether the viewport is at the desired location
 */

const snapOptions = {
    topLeft: false,
    friction: 0.8,
    time: 1000,
    ease: 'easeInOutSine',
    interrupt: true,
    removeOnComplete: false,
    removeOnInterrupt: false,
    forceStart: false
};

class Snap extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {number} x
     * @param {number} y
     * @param {SnapOptions} [options]
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     * @event snap-remove(Viewport) emitted if snap plugin is removed
     */
    constructor(parent, x, y, options = {}) {
        super(parent);
        this.options = Object.assign({}, snapOptions, options);
        this.ease = ease(options.ease, 'easeInOutSine');
        this.x = x;
        this.y = y;
        if (this.options.forceStart) {
            this.snapStart();
        }
    }

    snapStart() {
        this.percent = 0;
        this.snapping = { time: 0 };
        const current = this.options.topLeft ? this.parent.corner : this.parent.center;
        this.deltaX = this.x - current.x;
        this.deltaY = this.y - current.y;
        this.startX = current.x;
        this.startY = current.y;
        this.parent.emit('snap-start', this.parent);
    }

    wheel() {
        if (this.options.removeOnInterrupt) {
            this.parent.plugins.remove('snap');
        }
    }

    down() {
        if (this.options.removeOnInterrupt) {
            this.parent.plugins.remove('snap');
        }
        else if (this.options.interrupt) {
            this.snapping = null;
        }
    }

    up() {
        if (this.parent.input.count() === 0) {
            const decelerate = this.parent.plugins.get('decelerate', true);
            if (decelerate && (decelerate.x || decelerate.y)) {
                decelerate.percentChangeX = decelerate.percentChangeY = this.options.friction;
            }
        }
    }

    update(elapsed) {
        if (this.paused) {
            return
        }
        if (this.options.interrupt && this.parent.input.count() !== 0) {
            return
        }
        if (!this.snapping) {
            const current = this.options.topLeft ? this.parent.corner : this.parent.center;
            if (current.x !== this.x || current.y !== this.y) {
                this.snapStart();
            }
        }
        else {
            const snapping = this.snapping;
            snapping.time += elapsed;
            let finished, x, y;
            if (snapping.time > this.options.time) {
                finished = true;
                x = this.startX + this.deltaX;
                y = this.startY + this.deltaY;
            }
            else {
                const percent = this.ease(snapping.time, 0, 1, this.options.time);
                x = this.startX + this.deltaX * percent;
                y = this.startY + this.deltaY * percent;
            }
            if (this.options.topLeft) {
                this.parent.moveCorner(x, y);
            }
            else {
                this.parent.moveCenter(x, y);
            }
            this.parent.emit('moved', { viewport: this.parent, type: 'snap' });
            if (finished) {
                if (this.options.removeOnComplete) {
                    this.parent.plugins.remove('snap');
                }
                this.parent.emit('snap-end', this.parent);
                this.snapping = null;
            }
        }
    }
}

/**
 * @typedef {Object} SnapZoomOptions
 * @property {number} [width=0] the desired width to snap (to maintain aspect ratio, choose only width or height)
 * @property {number} [height=0] the desired height to snap (to maintain aspect ratio, choose only width or height)
 * @property {number} [time=1000] time for snapping in ms
 * @property {(string|function)} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
 * @property {PIXI.Point} [center] place this point at center during zoom instead of center of the viewport
 * @property {boolean} [interrupt=true] pause snapping with any user input on the viewport
 * @property {boolean} [removeOnComplete] removes this plugin after snapping is complete
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 * @property {boolean} [forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
 * @property {boolean} [noMove] zoom but do not move
 */

const snapZoomOptions = {
    width: 0,
    height: 0,
    time: 1000,
    ease: 'easeInOutSine',
    center: null,
    interrupt: true,
    removeOnComplete: false,
    removeOnInterrupts: false,
    forceStart: false,
    noMove: false
};

class SnapZoom extends Plugin {
    /**
     * @param {Viewport} parent
     * @param {SnapZoomOptions} options
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, snapZoomOptions, options);
        this.ease = ease(this.options.ease);
        if (this.options.width > 0) {
            this.xScale = parent.screenWidth / this.options.width;
        }
        if (this.options.height > 0) {
            this.yScale = parent.screenHeight / this.options.height;
        }
        this.xIndependent = this.xScale ? true : false;
        this.yIndependent = this.yScale ? true : false;
        this.xScale = this.xIndependent ? this.xScale : this.yScale;
        this.yScale = this.yIndependent ? this.yScale : this.xScale;

        if (this.options.time === 0) {
            parent.container.scale.x = this.xScale;
            parent.container.scale.y = this.yScale;
            if (this.options.removeOnComplete) {
                this.parent.plugins.remove('snap-zoom');
            }
        }
        else if (options.forceStart) {
            this.createSnapping();
        }
    }

    createSnapping() {
        this.parent.scale;
        const startWorldScreenWidth = this.parent.worldScreenWidth;
        const startWorldScreenHeight = this.parent.worldScreenHeight;
        const endWorldScreenWidth = this.parent.screenWidth / this.xScale;
        const endWorldScreenHeight = this.parent.screenHeight / this.yScale;
        
        this.snapping = { 
            time: 0, 
            startX: startWorldScreenWidth, 
            startY: startWorldScreenHeight, 
            deltaX: endWorldScreenWidth - startWorldScreenWidth, 
            deltaY: endWorldScreenHeight - startWorldScreenHeight 
        };
        this.parent.emit('snap-zoom-start', this.parent);
    }

    resize() {
        this.snapping = null;

        if (this.options.width > 0) {
            this.xScale = this.parent.screenWidth / this.options.width;
        }
        if (this.options.height > 0) {
            this.yScale = this.parent.screenHeight / this.options.height;
        }
        this.xScale = this.xIndependent ? this.xScale : this.yScale;
        this.yScale = this.yIndependent ? this.yScale : this.xScale;
    }

    wheel() {
        if (this.options.removeOnInterrupt) {
            this.parent.plugins.remove('snap-zoom');
        }
    }

    down() {
        if (this.options.removeOnInterrupt) {
            this.parent.plugins.remove('snap-zoom');
        }
        else if (this.options.interrupt) {
            this.snapping = null;
        }
    }

    update(elapsed) {
        if (this.paused) {
            return
        }
        if (this.options.interrupt && this.parent.input.count() !== 0) {
            return
        }

        let oldCenter;
        if (!this.options.center && !this.options.noMove) {
            oldCenter = this.parent.center;
        }
        if (!this.snapping) {
            if (this.parent.scale.x !== this.xScale || this.parent.scale.y !== this.yScale) {
                this.createSnapping();
            }
        }
        else if (this.snapping) {
            const snapping = this.snapping;
            snapping.time += elapsed;
            if (snapping.time >= this.options.time) {
                this.parent.scale.set(this.xScale, this.yScale);
                if (this.options.removeOnComplete) {
                    this.parent.plugins.remove('snap-zoom');
                }
                this.parent.emit('snap-zoom-end', this.parent);
                this.snapping = null;
            }
            else {
                const snapping = this.snapping;
                const worldScreenWidth = this.ease(snapping.time, snapping.startX, snapping.deltaX, this.options.time);
                const worldScreenHeight = this.ease(snapping.time, snapping.startY, snapping.deltaY, this.options.time);

                this.parent.scale.x = this.parent.screenWidth / worldScreenWidth;
                this.parent.scale.y = this.parent.screenHeight / worldScreenHeight;
            }
            const clamp = this.parent.plugins.get('clamp-zoom', true);
            if (clamp) {
                clamp.clamp();
            }
            if (!this.options.noMove) {
                if (!this.options.center) {
                    this.parent.moveCenter(oldCenter);
                }
                else {
                    this.parent.moveCenter(this.options.center);
                }
            }
        }
    }

    resume() {
        this.snapping = null;
        super.resume();
    }
}

/**
 * @typedef {object} FollowOptions
 * @property {number} [speed=0] to follow in pixels/frame (0=teleport to location)
 * @property {number} [acceleration] set acceleration to accelerate and decelerate at this rate; speed cannot be 0 to use acceleration
 * @property {number} [radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
 */

const followOptions = {
    speed: 0,
    acceleration: null,
    radius: null
};

class Follow extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {PIXI.DisplayObject} target to follow
     * @param {FollowOptions} [options]
     */
    constructor(parent, target, options = {})
    {
        super(parent);
        this.target = target;
        this.options = Object.assign({}, followOptions, options);
        this.velocity = { x: 0, y: 0 };
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }

        const center = this.parent.center;
        let toX = this.target.x,
            toY = this.target.y;
        if (this.options.radius)
        {
            const distance = Math.sqrt(Math.pow(this.target.y - center.y, 2) + Math.pow(this.target.x - center.x, 2));
            if (distance > this.options.radius)
            {
                const angle = Math.atan2(this.target.y - center.y, this.target.x - center.x);
                toX = this.target.x - Math.cos(angle) * this.options.radius;
                toY = this.target.y - Math.sin(angle) * this.options.radius;
            }
            else
            {
                return
            }
        }

        const deltaX = toX - center.x;
        const deltaY = toY - center.y;
        if (deltaX || deltaY)
        {
            if (this.options.speed)
            {
                if (this.options.acceleration)
                {
                    const angle = Math.atan2(toY - center.y, toX - center.x);
                    const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                    if (distance)
                    {
                        const decelerationDistance = (Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) / (2 * this.options.acceleration);
                        if (distance > decelerationDistance)
                        {
                            this.velocity = {
                                x: Math.min(this.velocity.x + this.options.acceleration * elapsed, this.options.speed),
                                y: Math.min(this.velocity.y + this.options.acceleration * elapsed, this.options.speed)
                            };
                        }
                        else
                        {
                            this.velocity = {
                                x: Math.max(this.velocity.x - this.options.acceleration * this.options.speed, 0),
                                y: Math.max(this.velocity.y - this.options.acceleration * this.options.speed, 0)
                            };
                        }
                        const changeX = Math.cos(angle) * this.velocity.x;
                        const changeY = Math.sin(angle) * this.velocity.y;
                        const x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                        const y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                        this.parent.moveCenter(x, y);
                        this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                    }
                }
                else
                {
                    const angle = Math.atan2(toY - center.y, toX - center.x);
                    const changeX = Math.cos(angle) * this.options.speed;
                    const changeY = Math.sin(angle) * this.options.speed;
                    const x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                    const y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                    this.parent.moveCenter(x, y);
                    this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                }
            }
            else
            {
                this.parent.moveCenter(toX, toY);
                this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
            }
        }
    }
}

/**
 * the default event listener for 'wheel' event is document.body. Use `Viewport.options.divWheel` to change this default
 * @typedef WheelOptions
 * @property {number} [percent=0.1] percent to scroll with each spin
 * @property {number} [smooth] smooth the zooming by providing the number of frames to zoom between wheel spins
 * @property {boolean} [interrupt=true] stop smoothing with any user input on the viewport
 * @property {boolean} [reverse] reverse the direction of the scroll
 * @property {PIXI.Point} [center] place this point at center during zoom instead of current mouse position
 * @property {number} [lineHeight=20] scaling factor for non-DOM_DELTA_PIXEL scrolling events
 * @property {('all'|'x'|'y')} [axis=all] axis to zoom
 */

const wheelOptions = {
    percent: 0.1,
    smooth: false,
    interrupt: true,
    reverse: false,
    center: null,
    lineHeight: 20,
    axis: 'all',
};

class Wheel extends Plugin {
    /**
     * @private
     * @param {Viewport} parent
     * @param {WheelOptions} [options]
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, wheelOptions, options);
    }

    down() {
        if (this.options.interrupt) {
            this.smoothing = null;
        }
    }

    isAxisX() {
        return ['all', 'x'].includes(this.options.axis)
    }

    isAxisY() {
        return ['all', 'y'].includes(this.options.axis)
    }

    update() {
        if (this.smoothing) {
            const point = this.smoothingCenter;
            const change = this.smoothing;
            let oldPoint;
            if (!this.options.center) {
                oldPoint = this.parent.toLocal(point);
            }
            if (this.isAxisX()) {
                this.parent.scale.x += change.x;
            }
            if (this.isAxisY()) {
                this.parent.scale.y += change.y;
            }
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
            const clamp = this.parent.plugins.get('clamp-zoom', true);
            if (clamp) {
                clamp.clamp();
            }
            if (this.options.center) {
                this.parent.moveCenter(this.options.center);
            } else {
                const newPoint = this.parent.toGlobal(oldPoint);
                this.parent.x += point.x - newPoint.x;
                this.parent.y += point.y - newPoint.y;
            }
            this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
            this.smoothingCount++;
            if (this.smoothingCount >= this.options.smooth) {
                this.smoothing = null;
            }
        }
    }

    wheel(e) {
        if (this.paused) {
            return
        }
        let point = this.parent.input.getPointerPosition(e);
        const sign = this.options.reverse ? -1 : 1;
        const step = sign * -e.deltaY * (e.deltaMode ? this.options.lineHeight : 1) / 500;
        const change = Math.pow(2, (1 + this.options.percent) * step);
        if (this.options.smooth) {
            const original = {
                x: this.smoothing ? this.smoothing.x * (this.options.smooth - this.smoothingCount) : 0,
                y: this.smoothing ? this.smoothing.y * (this.options.smooth - this.smoothingCount) : 0
            };
            this.smoothing = {
                x: ((this.parent.scale.x + original.x) * change - this.parent.scale.x) / this.options.smooth,
                y: ((this.parent.scale.y + original.y) * change - this.parent.scale.y) / this.options.smooth
            };
            this.smoothingCount = 0;
            this.smoothingCenter = point;
        } else {
            let oldPoint;
            if (!this.options.center) {
                oldPoint = this.parent.toLocal(point);
            }
            if (this.isAxisX()) {
                this.parent.scale.x *= change;
            }
            if (this.isAxisY()) {
                this.parent.scale.y *= change;
            }
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
            const clamp = this.parent.plugins.get('clamp-zoom', true);
            if (clamp) {
                clamp.clamp();
            }
            if (this.options.center) {
                this.parent.moveCenter(this.options.center);
            } else {
                const newPoint = this.parent.toGlobal(oldPoint);
                this.parent.x += point.x - newPoint.x;
                this.parent.y += point.y - newPoint.y;
            }
        }
        this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
        this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
        if (!this.parent.options.passiveWheel) {
            return true
        }
    }
}

/**
 * @typedef MouseEdgesOptions
 * @property {number} [radius] distance from center of screen in screen pixels
 * @property {number} [distance] distance from all sides in screen pixels
 * @property {number} [top] alternatively, set top distance (leave unset for no top scroll)
 * @property {number} [bottom] alternatively, set bottom distance (leave unset for no top scroll)
 * @property {number} [left] alternatively, set left distance (leave unset for no top scroll)
 * @property {number} [right] alternatively, set right distance (leave unset for no top scroll)
 * @property {number} [speed=8] speed in pixels/frame to scroll viewport
 * @property {boolean} [reverse] reverse direction of scroll
 * @property {boolean} [noDecelerate] don't use decelerate plugin even if it's installed
 * @property {boolean} [linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
 * @property {boolean} [allowButtons] allows plugin to continue working even when there's a mousedown event
 */

const mouseEdgesOptions = {
    radius: null,
    distance: null,
    top: null,
    bottom: null,
    left: null,
    right: null,
    speed: 8,
    reverse: false,
    noDecelerate: false,
    linear: false,
    allowButtons: false
};

class MouseEdges extends Plugin {
    /**
     * Scroll viewport when mouse hovers near one of the edges.
     * @private
     * @param {Viewport} parent
     * @param {MouseEdgeOptions} [options]
     * @event mouse-edge-start(Viewport) emitted when mouse-edge starts
     * @event mouse-edge-end(Viewport) emitted when mouse-edge ends
     */
    constructor(parent, options = {}) {
        super(parent);
        this.options = Object.assign({}, mouseEdgesOptions, options);
        this.reverse = this.options.reverse ? 1 : -1;
        this.radiusSquared = Math.pow(this.options.radius, 2);
        this.resize();
    }

    resize() {
        const distance = this.options.distance;
        if (distance !== null) {
            this.left = distance;
            this.top = distance;
            this.right = this.parent.worldScreenWidth - distance;
            this.bottom = this.parent.worldScreenHeight - distance;
        }
        else if (!this.radius) {
            this.left = this.options.left;
            this.top = this.options.top;
            this.right = this.options.right === null ? null : this.parent.worldScreenWidth - this.options.right;
            this.bottom = this.options.bottom === null ? null : this.parent.worldScreenHeight - this.options.bottom;
        }
    }

    down() {
        if (this.paused) {
            return
        }
        if (!this.options.allowButtons) {
            this.horizontal = this.vertical = null;
        }
    }

    move(event) {
        if (this.paused) {
            return
        }
        if ((event.data.pointerType !== 'mouse' && event.data.identifier !== 1) || (!this.options.allowButtons && event.data.buttons !== 0)) {
            return
        }
        const x = event.data.global.x;
        const y = event.data.global.y;

        if (this.radiusSquared) {
            const center = this.parent.toScreen(this.parent.center);
            const distance = Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2);
            if (distance >= this.radiusSquared) {
                const angle = Math.atan2(center.y - y, center.x - x);
                if (this.options.linear) {
                    this.horizontal = Math.round(Math.cos(angle)) * this.options.speed * this.reverse * (60 / 1000);
                    this.vertical = Math.round(Math.sin(angle)) * this.options.speed * this.reverse * (60 / 1000);
                }
                else {
                    this.horizontal = Math.cos(angle) * this.options.speed * this.reverse * (60 / 1000);
                    this.vertical = Math.sin(angle) * this.options.speed * this.reverse * (60 / 1000);
                }
            }
            else {
                if (this.horizontal) {
                    this.decelerateHorizontal();
                }
                if (this.vertical) {
                    this.decelerateVertical();
                }
                this.horizontal = this.vertical = 0;
            }
        }
        else {
            if (this.left !== null && x < this.left) {
                this.horizontal = 1 * this.reverse * this.options.speed * (60 / 1000);
            }
            else if (this.right !== null && x > this.right) {
                this.horizontal = -1 * this.reverse * this.options.speed * (60 / 1000);
            }
            else {
                this.decelerateHorizontal();
                this.horizontal = 0;
            }
            if (this.top !== null && y < this.top) {
                this.vertical = 1 * this.reverse * this.options.speed * (60 / 1000);
            }
            else if (this.bottom !== null && y > this.bottom) {
                this.vertical = -1 * this.reverse * this.options.speed * (60 / 1000);
            }
            else {
                this.decelerateVertical();
                this.vertical = 0;
            }
        }
    }

    decelerateHorizontal() {
        const decelerate = this.parent.plugins.get('decelerate', true);
        if (this.horizontal && decelerate && !this.options.noDecelerate) {
            decelerate.activate({ x: (this.horizontal * this.options.speed * this.reverse) / (1000 / 60) });
        }
    }

    decelerateVertical() {
        const decelerate = this.parent.plugins.get('decelerate', true);
        if (this.vertical && decelerate && !this.options.noDecelerate) {
            decelerate.activate({ y: (this.vertical * this.options.speed * this.reverse) / (1000 / 60) });
        }
    }

    up() {
        if (this.paused) {
            return
        }
        if (this.horizontal) {
            this.decelerateHorizontal();
        }
        if (this.vertical) {
            this.decelerateVertical();
        }
        this.horizontal = this.vertical = null;
    }

    update() {
        if (this.paused) {
            return
        }

        if (this.horizontal || this.vertical) {
            const center = this.parent.center;
            if (this.horizontal) {
                center.x += this.horizontal * this.options.speed;
            }
            if (this.vertical) {
                center.y += this.vertical * this.options.speed;
            }
            this.parent.moveCenter(center);
            this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' });
        }
    }
}

/**
 * To set the zoom level, use: (1) scale, (2) scaleX and scaleY, or (3) width and/or height
 * @typedef {options} AnimateOptions
 * @property {number} [time=1000] to animate
 * @property {PIXI.Point} [position=viewport.center] position to move viewport
 * @property {number} [width] desired viewport width in world pixels (use instead of scale; aspect ratio is maintained if height is not provided)
 * @property {number} [height] desired viewport height in world pixels (use instead of scale; aspect ratio is maintained if width is not provided)
 * @property {number} [scale] scale to change zoom (scale.x = scale.y)
 * @property {number} [scaleX] independently change zoom in x-direction
 * @property {number} [scaleY] independently change zoom in y-direction
 * @property {(function|string)} [ease=linear] easing function to use
 * @property {function} [callbackOnComplete]
 * @property {boolean} [removeOnInterrupt] removes this plugin if interrupted by any user input
 */

const animateOptions = {
    removeOnInterrupt: false,
    ease: 'linear',
    time: 1000
};

class Animate extends Plugin
{
    /**
     * @private
     * @param {Viewport} parent
     * @param {AnimateOptions} [options]
     * @fires animate-end
     */
    constructor(parent, options={})
    {
        super(parent);
        this.options = Object.assign({}, animateOptions, options);
        this.options.ease = ease(this.options.ease);
        this.setupPosition();
        this.setupZoom();
    }

    setupPosition()
    {
        if (typeof this.options.position !== 'undefined')
        {
            this.startX = this.parent.center.x;
            this.startY = this.parent.center.y;
            this.deltaX = this.options.position.x - this.parent.center.x;
            this.deltaY = this.options.position.y - this.parent.center.y;
            this.keepCenter = false;
        }
        else
        {
            this.keepCenter = true;
        }
    }

    setupZoom()
    {
        this.width = null;
        this.height = null;
        if (typeof this.options.scale !== 'undefined')
        {
            this.width = this.parent.screenWidth / this.options.scale;
        }
        else if (typeof this.options.scaleX !== 'undefined' || typeof this.options.scaleY !== 'undefined')
        {
            if (typeof this.options.scaleX !== 'undefined')
            {
                // screenSizeInWorldPixels = screenWidth / scale
                this.width = this.parent.screenWidth / this.options.scaleX;
            }
            if (typeof this.options.scaleY !== 'undefined')
            {
                this.height = this.parent.screenHeight / this.options.scaleY;
            }
        }
        else
        {
            if (typeof this.options.width !== 'undefined')
            {
                this.width = this.options.width;
            }
            if (typeof this.options.height !== 'undefined')
            {
                this.height = this.options.height;
            }
        }
        if (typeof this.width !== null)
        {
            this.startWidth = this.parent.screenWidthInWorldPixels;
            this.deltaWidth = this.width - this.startWidth;
        }
        if (typeof this.height !== null)
        {
            this.startHeight = this.parent.screenHeightInWorldPixels;
            this.deltaHeight = this.height - this.startHeight;
        }
        this.time = 0;
    }

    down()
    {
        if (this.options.removeOnInterrupt)
        {
            this.parent.plugins.remove('animate');
        }
    }

    complete()
    {
        this.parent.plugins.remove('animate');
        if (this.width !== null)
        {
            this.parent.fitWidth(this.width, this.keepCenter, this.height === null);
        }
        if (this.height !== null)
        {
            this.parent.fitHeight(this.height, this.keepCenter, this.width === null);
        }
        if (!this.keepCenter)
        {
            this.parent.moveCenter(this.options.position.x, this.options.position.y);
        }
        this.parent.emit('animate-end', this.parent);
        if (this.options.callbackOnComplete)
        {
            this.options.callbackOnComplete(this.parent);
        }
    }

    update(elapsed)
    {
        if (this.paused)
        {
            return
        }
        this.time += elapsed;
        if (this.time >= this.options.time)
        {
            this.complete();
        }
        else
        {
            const originalZoom = new Point(this.parent.scale.x, this.parent.scale.y);
            const percent = this.options.ease(this.time, 0, 1, this.options.time);
            if (this.width !== null)
            {
                this.parent.fitWidth(this.startWidth + this.deltaWidth * percent, this.keepCenter, this.height === null);
            }
            if (this.height !== null)
            {
                this.parent.fitHeight(this.startHeight + this.deltaHeight * percent, this.keepCenter, this.width === null);
            }
            if (this.width === null)
            {
                this.parent.scale.x = this.parent.scale.y;
            }
            else if (this.height === null)
            {
                this.parent.scale.y = this.parent.scale.x;
            }
            if (!this.keepCenter)
            {
                const original = new Point(this.parent.x, this.parent.y);
                this.parent.moveCenter(this.startX + this.deltaX * percent, this.startY + this.deltaY * percent);
                this.parent.emit('moved', { viewport: this.parent, original, type: 'animate'});
            }
            if (this.width || this.height)
            {
                this.parent.emit('zoomed', { viewport: this.parent, original: originalZoom, type: 'animate' });
            }
            if (!this.keepCenter)
            ;
        }
    }
}

/**
 * @typedef {object} ViewportOptions
 * @property {number} [screenWidth=window.innerWidth]
 * @property {number} [screenHeight=window.innerHeight]
 * @property {number} [worldWidth=this.width]
 * @property {number} [worldHeight=this.height]
 * @property {number} [threshold=5] number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
 * @property {boolean} [passiveWheel=true] whether the 'wheel' event is set to passive (note: if false, e.preventDefault() will be called when wheel is used over the viewport)
 * @property {boolean} [stopPropagation=false] whether to stopPropagation of events that impact the viewport (except wheel events, see options.passiveWheel)
 * @property {HitArea} [forceHitArea] change the default hitArea from world size to a new value
 * @property {boolean} [noTicker] set this if you want to manually call update() function on each frame
 * @property {PIXI.Ticker} [ticker=PIXI.Ticker.shared] use this PIXI.ticker for updates
 * @property {PIXI.InteractionManager} [interaction=null] InteractionManager, available from instantiated WebGLRenderer/CanvasRenderer.plugins.interaction - used to calculate pointer postion relative to canvas location on screen
 * @property {HTMLElement} [divWheel=document.body] div to attach the wheel event
 * @property {boolean} [disableOnContextMenu] remove oncontextmenu=() => {} from the divWheel element
 */

const viewportOptions = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: null,
    worldHeight: null,
    threshold: 5,
    passiveWheel: true,
    stopPropagation: false,
    forceHitArea: null,
    noTicker: false,
    interaction: null,
    disableOnContextMenu: false
};

/**
 * Main class to use when creating a Viewport
 */
class Viewport extends Container {
    /**
     * @param {ViewportOptions} [options]
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires drag-remove
     * @fires pinch-start
     * @fires pinch-end
     * @fires pinch-remove
     * @fires snap-start
     * @fires snap-end
     * @fires snap-remove
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires snap-zoom-remove
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires bounce-remove
     * @fires wheel
     * @fires wheel-remove
     * @fires wheel-scroll
     * @fires wheel-scroll-remove
     * @fires mouse-edge-start
     * @fires mouse-edge-end
     * @fires mouse-edge-remove
     * @fires moved
     * @fires moved-end
     * @fires zoomed
     * @fires zoomed-end
     * @fires frame-end
     */
    constructor(options = {}) {
        super();
        this.options = Object.assign({}, viewportOptions, options);

        // needed to pull this out of viewportOptions because of pixi.js v4 support (which changed from PIXI.ticker.shared to PIXI.Ticker.shared...sigh)
        if (options.ticker) {
            this.options.ticker = options.ticker;
        }
        else {
            // to avoid Rollup transforming our import, save pixi namespace in a variable
            // from here: https://github.com/pixijs/pixi.js/issues/5757
            let ticker;
            const pixiNS = PIXI;
            if (parseInt(/^(\d+)\./.exec(VERSION)[1]) < 5) {
                ticker = pixiNS.ticker.shared;
            }
            else {
                ticker = pixiNS.Ticker.shared;
            }
            this.options.ticker = options.ticker || ticker;
        }

        /** @type {number} */
        this.screenWidth = this.options.screenWidth;

        /** @type {number} */
        this.screenHeight = this.options.screenHeight;

        this._worldWidth = this.options.worldWidth;
        this._worldHeight = this.options.worldHeight;
        this.forceHitArea = this.options.forceHitArea;

        /**
         * number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event
         * @type {number}
         */
        this.threshold = this.options.threshold;

        this.options.divWheel = this.options.divWheel || document.body;

        if (this.options.disableOnContextMenu) {
            this.options.divWheel.oncontextmenu = e => e.preventDefault();
        }

        if (!this.options.noTicker) {
            this.tickerFunction = () => this.update(this.options.ticker.elapsedMS);
            this.options.ticker.add(this.tickerFunction);
        }

        this.input = new InputManager(this);

        /**
         * Use this to add user plugins or access existing plugins (e.g., to pause, resume, or remove them)
         * @type {PluginManager}
         */
        this.plugins = new PluginManager(this);
    }

    /**
     * overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners
     * @param {(object|boolean)} [options] - Options parameter. A boolean will act as if all options have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for child Sprites if options.children is set to true. Should it destroy the texture of the child sprite
     * @param {boolean} [options.baseTexture=false] - Only used for child Sprites if options.children is set to true. Should it destroy the base texture of the child sprite     */
    destroy(options) {
        if (!this.options.noTicker) {
            this.options.ticker.remove(this.tickerFunction);
        }
        this.input.destroy();
        super.destroy(options);
    }

    /**
     * update viewport on each frame
     * by default, you do not need to call this unless you set options.noTicker=true
     * @param {number} elapsed time in milliseconds since last update
     */
    update(elapsed) {
        if (!this.pause) {
            this.plugins.update(elapsed);

            if (this.lastViewport) {
                // check for moved-end event
                if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y) {
                    this.moving = true;
                }
                else {
                    if (this.moving) {
                        this.emit('moved-end', this);
                        this.moving = false;
                    }
                }
                // check for zoomed-end event
                if (this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y) {
                    this.zooming = true;
                }
                else {
                    if (this.zooming) {
                        this.emit('zoomed-end', this);
                        this.zooming = false;
                    }
                }
            }

            if (!this.forceHitArea) {
                this._hitAreaDefault = new Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
                this.hitArea = this._hitAreaDefault;
            }

            this._dirty = this._dirty || !this.lastViewport ||
                this.lastViewport.x !== this.x || this.lastViewport.y !== this.y ||
                this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y;

            this.lastViewport = {
                x: this.x,
                y: this.y,
                scaleX: this.scale.x,
                scaleY: this.scale.y
            };
            this.emit('frame-end', this);
        }
    }

    /**
     * use this to set screen and world sizes--needed for pinch/wheel/clamp/bounce
     * @param {number} [screenWidth=window.innerWidth]
     * @param {number} [screenHeight=window.innerHeight]
     * @param {number} [worldWidth]
     * @param {number} [worldHeight]
     */
    resize(screenWidth = window.innerWidth, screenHeight = window.innerHeight, worldWidth, worldHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        if (typeof worldWidth !== 'undefined') {
            this._worldWidth = worldWidth;
        }
        if (typeof worldHeight !== 'undefined') {
            this._worldHeight = worldHeight;
        }
        this.plugins.resize();
        this.dirty = true;
    }

    /**
     * world width in pixels
     * @type {number}
     */
    get worldWidth() {
        if (this._worldWidth) {
            return this._worldWidth
        }
        else {
            return this.width / this.scale.x
        }
    }
    set worldWidth(value) {
        this._worldWidth = value;
        this.plugins.resize();
    }

    /**
     * world height in pixels
     * @type {number}
     */
    get worldHeight() {
        if (this._worldHeight) {
            return this._worldHeight
        }
        else {
            return this.height / this.scale.y
        }
    }
    set worldHeight(value) {
        this._worldHeight = value;
        this.plugins.resize();
    }

    /**
     * get visible bounds of viewport
     * @returns {PIXI.Rectangle}
     */
    getVisibleBounds() {
        return new Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight)
    }

    /**
     * change coordinates from screen to world
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {PIXI.Point}
     */
    toWorld(x, y) {
        if (arguments.length === 2) {
            return this.toLocal(new Point(x, y))
        }
        else {
            return this.toLocal(x)
        }
    }

    /**
     * change coordinates from world to screen
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {PIXI.Point}
     */
    toScreen(x, y) {
        if (arguments.length === 2) {
            return this.toGlobal(new Point(x, y))
        }
        else {
            return this.toGlobal(x)
        }
    }

    /**
     * screen width in world coordinates
     * @type {number}
     */
    get worldScreenWidth() {
        return this.screenWidth / this.scale.x
    }

    /**
     * screen height in world coordinates
     * @type {number}
     */
    get worldScreenHeight() {
        return this.screenHeight / this.scale.y
    }

    /**
     * world width in screen coordinates
     * @type {number}
     */
    get screenWorldWidth() {
        return this.worldWidth * this.scale.x
    }

    /**
     * world height in screen coordinates
     * @type {number}
     */
    get screenWorldHeight() {
        return this.worldHeight * this.scale.y
    }

    /**
     * center of screen in world coordinates
     * @type {PIXI.Point}
     */
    get center() {
        return new Point(this.worldScreenWidth / 2 - this.x / this.scale.x, this.worldScreenHeight / 2 - this.y / this.scale.y)
    }
    set center(value) {
        this.moveCenter(value);
    }

    /**
     * move center of viewport to point
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {Viewport} this
     */
    moveCenter() {
        let x, y;
        if (!isNaN(arguments[0])) {
            x = arguments[0];
            y = arguments[1];
        }
        else {
            x = arguments[0].x;
            y = arguments[0].y;
        }
        const newX = (this.worldScreenWidth / 2 - x) * this.scale.x;
        const newY = (this.worldScreenHeight / 2 - y) * this.scale.y;
        if (this.x !== newX || this.y !== newY) {
            this.position.set(newX, newY);
            this.plugins.reset();
            this.dirty = true;
        }
        return this
    }

    /**
     * top-left corner of Viewport
     * @type {PIXI.Point}
     */
    get corner() {
        return new Point(-this.x / this.scale.x, -this.y / this.scale.y)
    }
    set corner(value) {
        this.moveCorner(value);
    }

    /**
     * move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed)
     * @param {(number|PIXI.Point)} x or point
     * @param {number} [y]
     * @return {Viewport} this
     */
    moveCorner() {
        let x, y;
        if (arguments.length === 1) {
            x = -arguments[0].x * this.scale.x;
            y = -arguments[0].y * this.scale.y;
        } else {
            x = -arguments[0] * this.scale.x;
            y = -arguments[1] * this.scale.y;
        }
        if (x !== this.x || y !== this.y) {
            this.position.set(x, y);
            this.plugins.reset();
            this.dirty = true;
        }
        return this
    }

    /**
     * get how many world pixels fit in screen's width
     * @type {number}
     */
    get screenWidthInWorldPixels() {
        return this.screenWidth / this.scale.x
    }

    /**
     * get how many world pixels fit on screen's height
     * @type {number}
     */
    get screenHeightInWorldPixels() {
        return this.screenHeight / this.scale.y
    }

    /**
     * find the scale value that fits a world width on the screen
     * does not change the viewport (use fit... to change)
     * @param {number} width in world pixels
     * @returns {number} scale
     */
    findFitWidth(width) {
        return this.screenWidth / width
    }

    /**
     * finds the scale value that fits a world height on the screens
     * does not change the viewport (use fit... to change)
     * @param {number} height in world pixels
     * @returns {number} scale
     */
    findFitHeight(height) {
        return this.screenHeight / height
    }

    /**
     * finds the scale value that fits the smaller of a world width and world height on the screen
     * does not change the viewport (use fit... to change)
     * @param {number} width in world pixels
     * @param {number} height in world pixels
     * @returns {number} scale
     */
    findFit(width, height) {
        const scaleX = this.screenWidth / width;
        const scaleY = this.screenHeight / height;
        return Math.min(scaleX, scaleY)
    }

    /**
     * finds the scale value that fits the larger of a world width and world height on the screen
     * does not change the viewport (use fit... to change)
     * @param {number} width in world pixels
     * @param {number} height in world pixels
     * @returns {number} scale
     */
    findCover(width, height) {
        const scaleX = this.screenWidth / width;
        const scaleY = this.screenHeight / height;
        return Math.max(scaleX, scaleY)
    }

    /**
     * change zoom so the width fits in the viewport
     * @param {number} [width=this.worldWidth] in world coordinates
     * @param {boolean} [center] maintain the same center
     * @param {boolean} [scaleY=true] whether to set scaleY=scaleX
     * @param {boolean} [noClamp] whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitWidth(width, center, scaleY = true, noClamp) {
        let save;
        if (center) {
            save = this.center;
        }
        this.scale.x = this.screenWidth / width;

        if (scaleY) {
            this.scale.y = this.scale.x;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);
        if (!noClamp && clampZoom) {
            clampZoom.clamp();
        }

        if (center) {
            this.moveCenter(save);
        }
        return this
    }

    /**
     * change zoom so the height fits in the viewport
     * @param {number} [height=this.worldHeight] in world coordinates
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
     * @param {boolean} [noClamp] whether to disable clamp-zoom
     * @returns {Viewport} this
     */
    fitHeight(height, center, scaleX = true, noClamp) {
        let save;
        if (center) {
            save = this.center;
        }
        this.scale.y = this.screenHeight / height;

        if (scaleX) {
            this.scale.x = this.scale.y;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);
        if (!noClamp && clampZoom) {
            clampZoom.clamp();
        }

        if (center) {
            this.moveCenter(save);
        }
        return this
    }

    /**
     * change zoom so it fits the entire world in the viewport
     * @param {boolean} center maintain the same center of the screen after zoom
     * @returns {Viewport} this
     */
    fitWorld(center) {
        let save;
        if (center) {
            save = this.center;
        }
        this.scale.x = this.screenWidth / this.worldWidth;
        this.scale.y = this.screenHeight / this.worldHeight;
        if (this.scale.x < this.scale.y) {
            this.scale.y = this.scale.x;
        }
        else {
            this.scale.x = this.scale.y;
        }

        const clampZoom = this.plugins.get('clamp-zoom', true);
        if (clampZoom) {
            clampZoom.clamp();
        }

        if (center) {
            this.moveCenter(save);
        }
        return this
    }

    /**
     * change zoom so it fits the size or the entire world in the viewport
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @param {number} [width=this.worldWidth] desired width
     * @param {number} [height=this.worldHeight] desired height
     * @returns {Viewport} this
     */
    fit(center, width = this.worldWidth, height = this.worldHeight) {
        let save;
        if (center) {
            save = this.center;
        }
        this.scale.x = this.screenWidth / width;
        this.scale.y = this.screenHeight / height;
        if (this.scale.x < this.scale.y) {
            this.scale.y = this.scale.x;
        }
        else {
            this.scale.x = this.scale.y;
        }
        const clampZoom = this.plugins.get('clamp-zoom', true);
        if (clampZoom) {
            clampZoom.clamp();
        }
        if (center) {
            this.moveCenter(save);
        }
        return this
    }

    set visible(value) {
        if (!value) {
            this.input.clear();
        }
        super.visible = value;
    }

    /**
     * zoom viewport to specific value
     * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    setZoom(scale, center) {
        let save;
        if (center) {
            save = this.center;
        }
        this.scale.set(scale);
        const clampZoom = this.plugins.get('clamp-zoom', true);
        if (clampZoom) {
            clampZoom.clamp();
        }
        if (center) {
            this.moveCenter(save);
        }
        return this
    }

    /**
     * zoom viewport by a certain percent (in both x and y direction)
     * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    zoomPercent(percent, center) {
        return this.setZoom(this.scale.x + this.scale.x * percent, center)
    }

    /**
     * zoom viewport by increasing/decreasing width by a certain number of pixels
     * @param {number} change in pixels
     * @param {boolean} [center] maintain the same center of the screen after zoom
     * @return {Viewport} this
     */
    zoom(change, center) {
        this.fitWidth(change + this.worldScreenWidth, center);
        return this
    }

    /**
     * changes scale of viewport and maintains center of viewport
     * @type {number}
     */
    set scaled(scale) {
        this.setZoom(scale, true);
    }
    get scaled() {
        return this.scale.x
    }

    /**
     * @param {SnapZoomOptions} options
     */
    snapZoom(options) {
        this.plugins.add('snap-zoom', new SnapZoom(this, options));
        return this
    }

    /**
     * is container out of world bounds
     * @returns {OutOfBounds}
     */
    OOB() {
        return {
            left: this.left < 0,
            right: this.right > this.worldWidth,
            top: this.top < 0,
            bottom: this.bottom > this._worldHeight,
            cornerPoint: new Point(
                this.worldWidth * this.scale.x - this.screenWidth,
                this.worldHeight * this.scale.y - this.screenHeight
            )
        }
    }

    /**
     * world coordinates of the right edge of the screen
     * @type {number}
     */
    get right() {
        return -this.x / this.scale.x + this.worldScreenWidth
    }
    set right(value) {
        this.x = -value * this.scale.x + this.screenWidth;
        this.plugins.reset();
    }

    /**
     * world coordinates of the left edge of the screen
     * @type { number }
     */
    get left() {
        return -this.x / this.scale.x
    }
    set left(value) {
        this.x = -value * this.scale.x;
        this.plugins.reset();
    }

    /**
     * world coordinates of the top edge of the screen
     * @type {number}
     */
    get top() {
        return -this.y / this.scale.y
    }
    set top(value) {
        this.y = -value * this.scale.y;
        this.plugins.reset();
    }

    /**
     * world coordinates of the bottom edge of the screen
     * @type {number}
     */
    get bottom() {
        return -this.y / this.scale.y + this.worldScreenHeight
    }
    set bottom(value) {
        this.y = -value * this.scale.y + this.screenHeight;
        this.plugins.reset();
    }

    /**
     * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
     * @type {boolean}
     */
    get dirty() {
        return this._dirty
    }
    set dirty(value) {
        this._dirty = value;
    }

    /**
     * permanently changes the Viewport's hitArea
     * NOTE: if not set then hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
     * @returns {HitArea}
     */
    get forceHitArea() {
        return this._forceHitArea
    }
    set forceHitArea(value) {
        if (value) {
            this._forceHitArea = value;
            this.hitArea = value;
        }
        else {
            this._forceHitArea = null;
            this.hitArea = new Rectangle(0, 0, this.worldWidth, this.worldHeight);
        }
    }

    /**
     * enable one-finger touch to drag
     * NOTE: if you expect users to use right-click dragging, you should enable viewport.options.disableOnContextMenu to avoid the context menu popping up on each right-click drag
     * @param {DragOptions} [options]
     * @returns {Viewport} this
     */
    drag(options) {
        this.plugins.add('drag', new Drag(this, options));
        return this
    }

    /**
     * clamp to world boundaries or other provided boundaries
     * NOTES:
     *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
     *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     * @param {ClampOptions} [options]
     * @returns {Viewport} this
     */
    clamp(options) {
        this.plugins.add('clamp', new Clamp(this, options));
        return this
    }

    /**
     * decelerate after a move
     * NOTE: this fires 'moved' event during deceleration
     * @param {DecelerateOptions} [options]
     * @return {Viewport} this
     */
    decelerate(options) {
        this.plugins.add('decelerate', new Decelerate(this, options));
        return this
    }

    /**
     * bounce on borders
     * NOTES:
     *    screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
     *    fires 'moved', 'bounce-x-start', 'bounce-y-start', 'bounce-x-end', and 'bounce-y-end' events
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {object} [options.bounceBox] use this bounceBox instead of (0, 0, viewport.worldWidth, viewport.worldHeight)
     * @param {number} [options.bounceBox.x=0]
     * @param {number} [options.bounceBox.y=0]
     * @param {number} [options.bounceBox.width=viewport.worldWidth]
     * @param {number} [options.bounceBox.height=viewport.worldHeight]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @return {Viewport} this
     */
    bounce(options) {
        this.plugins.add('bounce', new Bounce(this, options));
        return this
    }

    /**
     * enable pinch to zoom and two-finger touch to drag
     * @param {PinchOptions} [options]
     * @return {Viewport} this
     */
    pinch(options) {
        this.plugins.add('pinch', new Pinch(this, options));
        return this
    }

    /**
     * snap to a point
     * @param {number} x
     * @param {number} y
     * @param {SnapOptions} [options]
     * @return {Viewport} this
     */
    snap(x, y, options) {
        this.plugins.add('snap', new Snap(this, x, y, options));
        return this
    }

    /**
     * follow a target
     * NOTES:
     *    uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
     *    options.acceleration is not perfect as it doesn't know the velocity of the target
     *    it adds acceleration to the start of movement and deceleration to the end of movement when the target is stopped
     *    fires 'moved' event
     * @param {PIXI.DisplayObject} target to follow
     * @param {FollowOptions} [options]
     * @returns {Viewport} this
     */
    follow(target, options) {
        this.plugins.add('follow', new Follow(this, target, options));
        return this
    }

    /**
     * zoom using mouse wheel
     * @param {WheelOptions} [options]
     * @return {Viewport} this
     */
    wheel(options) {
        this.plugins.add('wheel', new Wheel(this, options));
        return this
    }

    /**
     * animate the position and/or scale of the viewport
     * @param {AnimateOptions} options
     * @returns {Viewport} this
     */
    animate(options) {
        this.plugins.add('animate', new Animate(this, options));
        return this
    }

    /**
     * enable clamping of zoom to constraints
     * @description
     * The minWidth/Height settings are how small the world can get (as it would appear on the screen)
     * before clamping. The maxWidth/maxHeight is how larger the world can scale (as it would appear on
     * the screen) before clamping.
     *
     * For example, if you have a world size of 1000 x 1000 and a screen size of 100 x 100, if you set
     * minWidth/Height = 100 then the world will not be able to zoom smaller than the screen size (ie,
     * zooming out so it appears smaller than the screen). Similarly, if you set maxWidth/Height = 100
     * the world will not be able to zoom larger than the screen size (ie, zooming in so it appears
     * larger than the screen).
     * @param {ClampZoomOptions} [options]
     * @return {Viewport} this
     */
    clampZoom(options) {
        this.plugins.add('clamp-zoom', new ClampZoom(this, options));
        return this
    }

    /**
     * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
     * NOTE: fires 'moved' event
     * @param {MouseEdgesOptions} [options]
     */
    mouseEdges(options) {
        this.plugins.add('mouse-edges', new MouseEdges(this, options));
        return this
    }

    /**
     * pause viewport (including animation updates such as decelerate)
     * @type {boolean}
     */
    get pause() {
        return this._pause
    }
    set pause(value) {
        this._pause = value;
        this.lastViewport = null;
        this.moving = false;
        this.zooming = false;
        if (value) {
            this.input.pause();
        }
    }

    /**
     * move the viewport so the bounding box is visible
     * @param {number} x - left
     * @param {number} y - top
     * @param {number} width
     * @param {number} height
     * @param {boolean} [resizeToFit] resize the viewport so the box fits within the viewport
     */
    ensureVisible(x, y, width, height, resizeToFit) {
        if (resizeToFit && (width > this.worldScreenWidth || height > this.worldScreenHeight)) {
            this.fit(true, width, height);
            this.emit('zoomed', { viewport: this, type: 'ensureVisible' });
        }
        let moved = false;
        if (x < this.left) {
            this.left = x;
            moved = true;
        }
        else if (x + width > this.right) {
            this.right = x + width;
            moved = true;
        }
        if (y < this.top) {
            this.top = y;
            moved = true;
        }
        else if (y + height > this.bottom) {
            this.bottom = y + height;
            moved = true;
        }
        if (moved) {
            this.emit('moved', { viewport: this, type: 'ensureVisible' });
        }
    }
}

/**
 * fires after a mouse or touch click
 * @event Viewport#clicked
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag starts
 * @event Viewport#drag-start
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * fires when a drag ends
 * @event Viewport#drag-end
 * @type {object}
 * @property {PIXI.Point} screen
 * @property {PIXI.Point} world
 * @property {Viewport} viewport
 */

/**
 * fires when a pinch starts
 * @event Viewport#pinch-start
 * @type {Viewport}
 */

/**
 * fires when a pinch end
 * @event Viewport#pinch-end
 * @type {Viewport}
 */

/**
 * fires when a snap starts
 * @event Viewport#snap-start
 * @type {Viewport}
 */

/**
 * fires when a snap ends
 * @event Viewport#snap-end
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom starts
 * @event Viewport#snap-zoom-start
 * @type {Viewport}
 */

/**
 * fires when a snap-zoom ends
 * @event Viewport#snap-zoom-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the x direction
 * @event Viewport#bounce-x-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the x direction
 * @event Viewport#bounce-x-end
 * @type {Viewport}
 */

/**
 * fires when a bounce starts in the y direction
 * @event Viewport#bounce-y-start
 * @type {Viewport}
 */

/**
 * fires when a bounce ends in the y direction
 * @event Viewport#bounce-y-end
 * @type {Viewport}
 */

/**
 * fires when for a mouse wheel event
 * @event Viewport#wheel
 * @type {object}
 * @property {object} wheel
 * @property {number} wheel.dx
 * @property {number} wheel.dy
 * @property {number} wheel.dz
 * @property {Viewport} viewport
 */

/**
 * fires when a wheel-scroll occurs
 * @event Viewport#wheel-scroll
 * @type {Viewport}
 */

/**
 * fires when a mouse-edge starts to scroll
 * @event Viewport#mouse-edge-start
 * @type {Viewport}
 */

/**
 * fires when the mouse-edge scrolling ends
 * @event Viewport#mouse-edge-end
 * @type {Viewport}
 */

/**
 * fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
 * @event Viewport#moved
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag, snap, pinch, follow, bounce-x, bounce-y, clamp-x, clamp-y, decelerate, mouse-edges, wheel, ensureVisible)
 */

/**
 * fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
 * @event Viewport#zoomed
 * @type {object}
 * @property {Viewport} viewport
 * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom, ensureVisible)
 */

/**
 * fires when viewport stops moving
 * @event Viewport#moved-end
 * @type {Viewport}
 */

/**
 * fires when viewport stops zooming
 * @event Viewport#zoomed-end
 * @type {Viewport}
 */

/**
* fires at the end of an update frame
* @event Viewport#frame-end
* @type {Viewport}
*/

/** @typedef HitArea {(PIXI.Rectangle | PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.RoundedRectangle)} */

/**
 * @typedef {Object} OutOfBounds
 * @private
 * @property {boolean} left
 * @property {boolean} right
 * @property {boolean} top
 * @property {boolean} bottom
 * @property {PIXI.Point} cornerPoint
 */

/**
 * @typedef {Object} LastViewport
 * @private
 * @property {number} x
 * @property {number} y
 * @property {number} scaleX
 * @property {number} scaleY
 */

export { Plugin, Viewport };
//# sourceMappingURL=viewport.es.js.map
