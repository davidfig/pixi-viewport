'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Ease = require('pixi-ease');
var exists = require('exists');

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Bounce, _Plugin);

    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     *
     * @emits bounce-start-x(Viewport) emitted when a bounce on the x-axis starts
     * @emits bounce.end-x(Viewport) emitted when a bounce on the x-axis ends
     * @emits bounce-start-y(Viewport) emitted when a bounce on the y-axis starts
     * @emits bounce-end-y(Viewport) emitted when a bounce on the y-axis ends
     */
    function Bounce(parent, options) {
        _classCallCheck(this, Bounce);

        var _this = _possibleConstructorReturn(this, (Bounce.__proto__ || Object.getPrototypeOf(Bounce)).call(this, parent));

        options = options || {};
        _this.time = options.time || 150;
        _this.ease = options.ease || 'easeInOutSine';
        _this.friction = options.friction || 0.5;
        options.sides = options.sides || 'all';
        if (options.sides) {
            if (options.sides === 'all') {
                _this.top = _this.bottom = _this.left = _this.right = true;
            } else if (options.sides === 'horizontal') {
                _this.right = _this.left = true;
            } else if (options.sides === 'vertical') {
                _this.top = _this.bottom = true;
            } else {
                _this.top = options.sides.indexOf('top') !== -1;
                _this.bottom = options.sides.indexOf('bottom') !== -1;
                _this.left = options.sides.indexOf('left') !== -1;
                _this.right = options.sides.indexOf('right') !== -1;
            }
        }
        _this.parseUnderflow(options.underflow || 'center');
        _this.last = {};
        return _this;
    }

    _createClass(Bounce, [{
        key: 'parseUnderflow',
        value: function parseUnderflow(clamp) {
            clamp = clamp.toLowerCase();
            if (clamp === 'center') {
                this.underflowX = 0;
                this.underflowY = 0;
            } else {
                this.underflowX = clamp.indexOf('left') !== -1 ? -1 : clamp.indexOf('right') !== -1 ? 1 : 0;
                this.underflowY = clamp.indexOf('top') !== -1 ? -1 : clamp.indexOf('bottom') !== -1 ? 1 : 0;
            }
        }
    }, {
        key: 'down',
        value: function down() {
            this.toX = this.toY = null;
        }
    }, {
        key: 'up',
        value: function up() {
            this.bounce();
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }

            this.bounce();
            if (this.toX) {
                if (this.toX.update(elapsed)) {
                    this.toX = null;
                    this.parent.emit('bounce-end-x', this.parent);
                }
                this.parent.dirty = true;
            }
            if (this.toY) {
                if (this.toY.update(elapsed)) {
                    this.toY = null;
                    this.parent.emit('bounce-end-y', this.parent);
                }
                this.parent.dirty = true;
            }
        }
    }, {
        key: 'calcUnderflowX',
        value: function calcUnderflowX() {
            var x = void 0;
            switch (this.underflowX) {
                case -1:
                    x = 0;
                    break;
                case 1:
                    x = this.parent.screenWidth - this.parent.screenWorldWidth;
                    break;
                default:
                    x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
            }
            return x;
        }
    }, {
        key: 'calcUnderflowY',
        value: function calcUnderflowY() {
            var y = void 0;
            switch (this.underflowY) {
                case -1:
                    y = 0;
                    break;
                case 1:
                    y = this.parent.screenHeight - this.parent.screenWorldHeight;
                    break;
                default:
                    y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
            }
            return y;
        }
    }, {
        key: 'bounce',
        value: function bounce() {
            if (this.paused) {
                return;
            }

            var oob = void 0;
            var decelerate = this.parent.plugins['decelerate'];
            if (decelerate && (decelerate.x || decelerate.y)) {
                if (decelerate.x && decelerate.percentChangeX === decelerate.friction || decelerate.y && decelerate.percentChangeY === decelerate.friction) {
                    oob = this.parent.OOB();
                    if (oob.left && this.left || oob.right && this.right) {
                        decelerate.percentChangeX = this.friction;
                    }
                    if (oob.top && this.top || oob.bottom && this.bottom) {
                        decelerate.percentChangeY = this.friction;
                    }
                }
            }
            var drag = this.parent.plugins['drag'] || {};
            var pinch = this.parent.plugins['pinch'] || {};
            decelerate = decelerate || {};
            if (!drag.active && !pinch.active && (!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)) {
                oob = oob || this.parent.OOB();
                var point = oob.cornerPoint;
                if (!this.toX && !decelerate.x) {
                    var x = void 0;
                    if (oob.left && this.left) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : 0;
                    } else if (oob.right && this.right) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : -point.x;
                    }
                    if (exists(x) && this.parent.x !== x) {
                        this.toX = new Ease.to(this.parent, { x: x }, this.time, { ease: this.ease });
                        this.parent.emit('bounce-start-x', this.parent);
                    }
                }
                if (!this.toY && !decelerate.y) {
                    var y = void 0;
                    if (oob.top && this.top) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : 0;
                    } else if (oob.bottom && this.bottom) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : -point.y;
                    }
                    if (exists(y) && this.parent.y !== y) {
                        this.toY = new Ease.to(this.parent, { y: y }, this.time, { ease: this.ease });
                        this.parent.emit('bounce-start-y', this.parent);
                    }
                }
            }
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.toX = this.toY = null;
        }
    }]);

    return Bounce;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsiRWFzZSIsInJlcXVpcmUiLCJleGlzdHMiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInRpbWUiLCJlYXNlIiwiZnJpY3Rpb24iLCJzaWRlcyIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsImluZGV4T2YiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImxhc3QiLCJjbGFtcCIsInRvTG93ZXJDYXNlIiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJ0b1giLCJ0b1kiLCJib3VuY2UiLCJlbGFwc2VkIiwicGF1c2VkIiwidXBkYXRlIiwiZW1pdCIsImRpcnR5IiwieCIsInNjcmVlbldpZHRoIiwic2NyZWVuV29ybGRXaWR0aCIsInkiLCJzY3JlZW5IZWlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsIm9vYiIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsIk9PQiIsImRyYWciLCJwaW5jaCIsImFjdGl2ZSIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJjYWxjVW5kZXJmbG93WCIsInRvIiwiY2FsY1VuZGVyZmxvd1kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxPQUFPQyxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1DLFNBQVNELFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1FLFNBQVNGLFFBQVEsVUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxJQUFMLEdBQVlELFFBQVFDLElBQVIsSUFBZ0IsR0FBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIs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QUE3RCxHQUFxRixDQUF6RjtBQUNILHFCQUhELE1BSUssSUFBSWIsSUFBSXpCLE1BQUosSUFBYyxLQUFLQSxNQUF2QixFQUNMO0FBQ0lzQiw0QkFBSyxLQUFLN0IsTUFBTCxDQUFZK0IsaUJBQVosR0FBZ0MsS0FBSy9CLE1BQUwsQ0FBWThCLFlBQTdDLEdBQTZELEtBQUtlLGNBQUwsRUFBN0QsR0FBcUYsQ0FBQ0osTUFBTVosQ0FBaEc7QUFDSDtBQUNELHdCQUFJakMsT0FBT2lDLENBQVAsS0FBYSxLQUFLN0IsTUFBTCxDQUFZNkIsQ0FBWixLQUFrQkEsQ0FBbkMsRUFDQTtBQUNJLDZCQUFLVixHQUFMLEdBQVcsSUFBSXpCLEtBQUtrRCxFQUFULENBQVksS0FBSzVDLE1BQWpCLEVBQXlCLEVBQUU2QixJQUFGLEVBQXpCLEVBQWdDLEtBQUszQixJQUFyQyxFQUEyQyxFQUFFQyxNQUFNLEtBQUtBLElBQWIsRUFBM0MsQ0FBWDtBQUNBLDZCQUFLSCxNQUFMLENBQVl3QixJQUFaLENBQWlCLGdCQUFqQixFQUFtQyxLQUFLeEIsTUFBeEM7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQTNNTDtBQUFBO0FBQUEsZ0NBOE1JO0FBQ0ksaUJBQUtrQixHQUFMLEdBQVcsS0FBS0MsR0FBTCxHQUFXLElBQXRCO0FBQ0g7QUFoTkw7O0FBQUE7QUFBQSxFQUFzQ3RCLE1BQXRDIiwiZmlsZSI6ImJvdW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEVhc2UgPSByZXF1aXJlKCdwaXhpLWVhc2UnKVxyXG5jb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCb3VuY2UgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zaWRlcz1hbGxdIGFsbCwgaG9yaXpvbnRhbCwgdmVydGljYWwsIG9yIGNvbWJpbmF0aW9uIG9mIHRvcCwgYm90dG9tLCByaWdodCwgbGVmdCAoZS5nLiwgJ3RvcC1ib3R0b20tcmlnaHQnKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmZyaWN0aW9uPTAuNV0gZnJpY3Rpb24gdG8gYXBwbHkgdG8gZGVjZWxlcmF0ZSBpZiBhY3RpdmVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTE1MF0gdGltZSBpbiBtcyB0byBmaW5pc2ggYm91bmNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW2Vhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIsIG9yIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW5cclxuICAgICAqXHJcbiAgICAgKiBAZW1pdHMgYm91bmNlLXN0YXJ0LXgoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBhIGJvdW5jZSBvbiB0aGUgeC1heGlzIHN0YXJ0c1xyXG4gICAgICogQGVtaXRzIGJvdW5jZS5lbmQteChWaWV3cG9ydCkgZW1pdHRlZCB3aGVuIGEgYm91bmNlIG9uIHRoZSB4LWF4aXMgZW5kc1xyXG4gICAgICogQGVtaXRzIGJvdW5jZS1zdGFydC15KFZpZXdwb3J0KSBlbWl0dGVkIHdoZW4gYSBib3VuY2Ugb24gdGhlIHktYXhpcyBzdGFydHNcclxuICAgICAqIEBlbWl0cyBib3VuY2UtZW5kLXkoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBhIGJvdW5jZSBvbiB0aGUgeS1heGlzIGVuZHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMudGltZSA9IG9wdGlvbnMudGltZSB8fCAxNTBcclxuICAgICAgICB0aGlzLmVhc2UgPSBvcHRpb25zLmVhc2UgfHwgJ2Vhc2VJbk91dFNpbmUnXHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC41XHJcbiAgICAgICAgb3B0aW9ucy5zaWRlcyA9IG9wdGlvbnMuc2lkZXMgfHwgJ2FsbCdcclxuICAgICAgICBpZiAob3B0aW9ucy5zaWRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNpZGVzID09PSAnYWxsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSA9IHRoaXMubGVmdCA9IHRoaXMucmlnaHQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ2hvcml6b250YWwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdGhpcy5sZWZ0ID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICd2ZXJ0aWNhbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gdGhpcy5ib3R0b20gPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZigndG9wJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdHRvbSA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZignYm90dG9tJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLmxhc3QgPSB7fVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50b1ggPSB0aGlzLnRvWSA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgICAgIGlmICh0aGlzLnRvWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvWC51cGRhdGUoZWxhcHNlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9YID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLWVuZC14JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRvWSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRvWS51cGRhdGUoZWxhcHNlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9ZID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLWVuZC15JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGlydHkgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVbmRlcmZsb3dYKClcclxuICAgIHtcclxuICAgICAgICBsZXQgeFxyXG4gICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgIHggPSAwXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY1VuZGVyZmxvd1koKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB5XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgeSA9IDBcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgeSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB5XHJcbiAgICB9XHJcblxyXG4gICAgYm91bmNlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvb2JcclxuICAgICAgICBsZXQgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgIGlmIChkZWNlbGVyYXRlICYmIChkZWNlbGVyYXRlLnggfHwgZGVjZWxlcmF0ZS55KSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoZGVjZWxlcmF0ZS54ICYmIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVggPT09IGRlY2VsZXJhdGUuZnJpY3Rpb24pIHx8IChkZWNlbGVyYXRlLnkgJiYgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWSA9PT0gZGVjZWxlcmF0ZS5mcmljdGlvbikpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9vYiA9IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgICAgICAgICBpZiAoKG9vYi5sZWZ0ICYmIHRoaXMubGVmdCkgfHwgKG9vYi5yaWdodCAmJiB0aGlzLnJpZ2h0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKChvb2IudG9wICYmIHRoaXMudG9wKSB8fCAob29iLmJvdHRvbSAmJiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWSA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkcmFnID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZHJhZyddIHx8IHt9XHJcbiAgICAgICAgY29uc3QgcGluY2ggPSB0aGlzLnBhcmVudC5wbHVnaW5zWydwaW5jaCddIHx8IHt9XHJcbiAgICAgICAgZGVjZWxlcmF0ZSA9IGRlY2VsZXJhdGUgfHwge31cclxuICAgICAgICBpZiAoIWRyYWcuYWN0aXZlICYmICFwaW5jaC5hY3RpdmUgJiYgKCghdGhpcy50b1ggfHwgIXRoaXMudG9ZKSAmJiAoIWRlY2VsZXJhdGUueCB8fCAhZGVjZWxlcmF0ZS55KSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvb2IgPSBvb2IgfHwgdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBvb2IuY29ybmVyUG9pbnRcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRvWCAmJiAhZGVjZWxlcmF0ZS54KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeFxyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi5sZWZ0ICYmIHRoaXMubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dYKCkgOiAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IucmlnaHQgJiYgdGhpcy5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dYKCkgOiAtcG9pbnQueFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0cyh4KSAmJiB0aGlzLnBhcmVudC54ICE9PSB4KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9YID0gbmV3IEVhc2UudG8odGhpcy5wYXJlbnQsIHsgeCB9LCB0aGlzLnRpbWUsIHsgZWFzZTogdGhpcy5lYXNlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLXN0YXJ0LXgnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9ZICYmICFkZWNlbGVyYXRlLnkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB5XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLnRvcCAmJiB0aGlzLnRvcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5ib3R0b20gJiYgdGhpcy5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeSA9ICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dZKCkgOiAtcG9pbnQueVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGV4aXN0cyh5KSAmJiB0aGlzLnBhcmVudC55ICE9PSB5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9ZID0gbmV3IEVhc2UudG8odGhpcy5wYXJlbnQsIHsgeSB9LCB0aGlzLnRpbWUsIHsgZWFzZTogdGhpcy5lYXNlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLXN0YXJ0LXknLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50b1ggPSB0aGlzLnRvWSA9IG51bGxcclxuICAgIH1cclxufSJdfQ==