(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Javascript: create click event for both mouse and touch
 * @example
 *
 * const clicked = require('clicked')
 *
 * function handleClick()
 * {
 *    console.log('I was clicked.')
 * }
 *
 * const div = document.getElementById('clickme')
 * const c = clicked(div, handleClick, {thresshold: 15})
 *
 * // change callback
 * c.callback = () => console.log('different clicker')
 *
 */

/**
 * @param {HTMLElement} element
 * @param {function} callback called after click: callback(event, options.args)
 * @param {object} [options]
 * @param {number} [options.thresshold=10] if touch moves threshhold-pixels then the touch-click is cancelled
 * @param {*} [options.args] arguments for callback function
 * @returns {Clicked}
 */
function clicked(element, callback, options) {
    return new Clicked(element, callback, options);
}

var Clicked = function () {
    function Clicked(element, callback, options) {
        var _this = this;

        _classCallCheck(this, Clicked);

        this.options = options || {};
        this.threshhold = this.options.thresshold || 10;
        this.events = {
            mouseclick: function mouseclick(e) {
                return _this.mouseclick(e);
            },
            touchstart: function touchstart(e) {
                return _this.touchstart(e);
            },
            touchmove: function touchmove(e) {
                return _this.touchmove(e);
            },
            touchcancel: function touchcancel(e) {
                return _this.touchcancel(e);
            },
            touchend: function touchend(e) {
                return _this.touchend(e);
            }
        };
        element.addEventListener('click', this.events.mouseclick);
        element.addEventListener('touchstart', this.events.touchstart, { passive: true });
        element.addEventListener('touchmove', this.events.touchmove, { passive: true });
        element.addEventListener('touchcancel', this.events.touchcancel);
        element.addEventListener('touchend', this.events.touchend);
        this.element = element;
        this.callback = callback;
    }

    /**
     * removes event listeners added by Clicked
     */


    _createClass(Clicked, [{
        key: 'destroy',
        value: function destroy() {
            this.element.removeEventListener('click', this.events.mouseclick);
            this.element.removeEventListener('touchstart', this.events.touchstart, { passive: true });
            this.element.removeEventListener('touchmove', this.events.touchmove, { passive: true });
            this.element.removeEventListener('touchcancel', this.events.touchcancel);
            this.element.removeEventListener('touchend', this.events.touchend);
        }
    }, {
        key: 'touchstart',
        value: function touchstart(e) {
            if (e.touches.length === 1) {
                this.lastX = e.changedTouches[0].screenX;
                this.lastY = e.changedTouches[0].screenY;
                this.down = true;
            }
        }
    }, {
        key: 'pastThreshhold',
        value: function pastThreshhold(x, y) {
            return Math.abs(this.lastX - x) > this.threshhold || Math.abs(this.lastY - y) > this.threshhold;
        }
    }, {
        key: 'touchmove',
        value: function touchmove(e) {
            if (!this.down || e.touches.length !== 1) {
                this.touchcancel();
                return;
            }
            var x = e.changedTouches[0].screenX;
            var y = e.changedTouches[0].screenY;
            if (this.pastThreshhold(x, y)) {
                this.touchcancel();
            }
        }
    }, {
        key: 'touchcancel',
        value: function touchcancel() {
            this.down = false;
        }
    }, {
        key: 'touchend',
        value: function touchend(e) {
            if (this.down) {
                e.preventDefault();
                this.callback(e, this.options.args);
            }
        }
    }, {
        key: 'mouseclick',
        value: function mouseclick(e) {
            this.callback(e, this.options.args);
        }
    }]);

    return Clicked;
}();

module.exports = clicked;

},{}],2:[function(require,module,exports){
const clicked = require('clicked')

let _id = 1

/**
 * a settings panel for changing and watching parameters during runtime
 */
class SettingsPanel
{
    /**
     * @param {object} [options]
     * @param {object} [options.style] CSS style to apply to the parent div
     * @param {object} [options.parent=document.body] where to append div
     * @param {string} [options.color='white'] default foreground
     * @param {string} [options.background='black'] default background
     * @param {boolean} [options.open=true] show when starting
     * @param {string} [options.side='right'] change side: 'left' or 'right'
     */
    constructor(options)
    {
        options = options || {}
        this.div = document.createElement('div')
        if (options.parent)
        {
            options.parent.appendChild(this.div)
        }
        else
        {
            document.body.appendChild(this.div)
        }
        this.div.id = 'SettingsPanel #' + _id++
        this.color = options.color || 'white'
        this.background = options.background || 'black'
        const styles = {
            'position': 'fixed',
            'color': this.color,
            'bottom': 0,
            'zIndex': 100,
            'textAlign': 'center',
            'opacity': 0.85
        }
        this.open = typeof options.open !== 'undefined' ? options.open : true
        this._topSetup()
        this._setStyles(this.div, styles, options.style)
        this.side(options.side)
    }

    /**
     * adds a button with callback
     * @param {string} text to display
     * @param {function} callback on button click if returns a value, then replaces button text with [text + result]
     * @param {object} [options]
     * @param {object} [options.original] original settings for button - sets text as [text + original] change through callback (see above)
     * @param {string} [options.color] foreground color
     * @param {string} [options.background] background color
     * @param {object} [options.style] CSS for button
     */
    button(text, callback, options)
    {
        options = options || {}
        const div = document.createElement('div')
        this.div.appendChild(div)
        div.callback = callback
        clicked(div, this._buttonCallback.bind(div))
        div.innerHTML = text + (options.original ? options.original : '')
        div.text = text
        const styles = {
            'background': this.background,
            'padding': '1em',
            'borderBottom': '1px white solid',
            'cursor': 'pointer',
            'userSelect': 'none'
        }
        if (options.background)
        {
            styles['background'] = options.background
        }
        if (options.color)
        {
            styles['color'] = options.color
        }
        this._setStyles(div, styles, options.style)
        this._update()
        return div
    }

    _buttonCallback()
    {
        if (this.callback)
        {
            const result = this.callback()
            if (typeof result !== 'undefined')
            {
                this.innerHTML = this.text + result
            }
        }
    }

    /**
     * adds an input panel
     * @param {string} label text
     * @param {function} callback on change input
     * @param {object} [options]
     * @param {object} [options.original] original settings for input
     * @param {string} [options.color] foreground color
     * @param {string} [options.background] background color
     * @param {object} [options.style] CSS for button
     * @param {boolean} [options.sameLine] same line for label and text
     * @param {number} [options.size] size (number of characters) of input box
     */
    input(text, callback, options)
    {
        options = options || {}
        const div = document.createElement('div')
        this.div.appendChild(div)
        const styles = {
            'background': this.background,
            'padding': '1em',
            'borderBottom': '1px white solid',
            'cursor': 'pointer',
            'userSelect': 'none'
        }
        if (options.background)
        {
            styles['background'] = options.background
        }
        if (options.color)
        {
            styles['color'] = options.color
        }
        this._setStyles(div, styles, options.style)
        const label = document.createElement(options.sameLine ? 'span' : 'div')
        div.callback = callback
        div.appendChild(label)
        label.innerHTML = text
        div.input = document.createElement('input')
        div.appendChild(div.input)
        div.input.style.fontSize = '1em'
        div.input.style.textAlign = 'right'
        div.input.style.padding = 0
        div.input.style.background = this.background
        div.input.style.color = 'white'
        if (options.size)
        {
            div.input.style.width = options.size + 'em'
        }
        div.input.defaultValue = typeof options.original !== 'undefined' ? options.original : null
        div.input.onchange = this._inputCallback.bind(div)
        this._update()
        return div
    }

    /**
     * input callback function with value
     * @private
     */
    _inputCallback()
    {
        this.callback(this.input.value)
    }

    /**
     * sets styles
     * @private
     * @param {object} div
     */
    _setStyles(div, styles1, styles2)
    {
        for (let style in styles1)
        {
            div.style[style] = styles1[style]
        }
        if (styles2)
        {
            for (let style in styles2)
            {
                div.style[style] = styles2[style]
            }
        }
    }

    /**
     * sets up arrow
     * @private
     */
    _topSetup()
    {
        const div = this.top = document.createElement('div')
        this.div.appendChild(div)
        const styles = {
            'margin': 'auto 0',
            'color': this.background,
            'fontSize': '150%',
            'cursor': 'pointer'
        }
        this._setStyles(div, styles)
        clicked(div, this._toggleTop.bind(this))
        this._topShow()
        div.innerHTML = this.open ? '&#9650;' : '&#9660;'
    }

    /**
     * shows top arrow
     * @private
     */
    _topShow()
    {
        this.top.innerHTML = this.open ? '&#9660;' : '&#9650;'
    }

    /**
     * updates the show/hide status after adding an element
     * @private
     */
    _update()
    {
        if (this.open)
        {
            this.show()
        }
        else
        {
            this.hide()
        }
    }

    /**
     * hides the SettingsPanel
     */
    hide()
    {
        this.open = false
        this.div.style.bottom = -(this.div.offsetHeight - this.top.offsetHeight) + 'px'
        this._topShow()
    }

    /**
     * shows the SettingsPanel
     */
    show()
    {
        this.open = true
        this.div.style.bottom = 0
        this._topShow()
    }

    /**
     * toggle top when pressed
     * @private
     */
    _toggleTop()
    {
        this.open = !this.open
        if (this.open)
        {
            this.show()
        }
        else
        {
            this.hide()
        }
    }

    /**
     * change side of panel
     * @param {string} side - 'left' or 'right'
     */
    side(side)
    {
        if (side === 'left')
        {
            this.div.style.left = 0
            this.div.style.right = null
        }
        else
        {
            this.div.style.left = null
            this.div.style.right = 0
        }
    }
}

window.SettingsPanel = SettingsPanel
module.exports = SettingsPanel
},{"clicked":1}]},{},[2]);
