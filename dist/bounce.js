'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Bounce, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
     * @param {number} [options.friction=0.5] friction to apply to decelerate if active
     * @param {number} [options.time=150] time in ms to finish bounce
     * @param {string|function} [ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     * @fires bounce-start-x
     * @fires bounce.end-x
     * @fires bounce-start-y
     * @fires bounce-end-y
     */
    function Bounce(parent, options) {
        _classCallCheck(this, Bounce);

        var _this = _possibleConstructorReturn(this, (Bounce.__proto__ || Object.getPrototypeOf(Bounce)).call(this, parent));

        options = options || {};
        _this.time = options.time || 150;
        _this.ease = utils.ease(options.ease, 'easeInOutSine');
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
                var toX = this.toX;
                toX.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' });
                if (toX.time >= this.time) {
                    this.parent.x = toX.end;
                    this.toX = null;
                    this.parent.emit('bounce-x-end', this.parent);
                } else {
                    this.parent.x = this.ease(toX.time, toX.start, toX.delta, this.time);
                }
                this.parent.dirty = true;
            }
            if (this.toY) {
                var toY = this.toY;
                toY.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' });
                if (toY.time >= this.time) {
                    this.parent.y = toY.end;
                    this.toY = null;
                    this.parent.emit('bounce-y-end', this.parent);
                } else {
                    this.parent.y = this.ease(toY.time, toY.start, toY.delta, this.time);
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
                    var x = null;
                    if (oob.left && this.left) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : 0;
                    } else if (oob.right && this.right) {
                        x = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : -point.x;
                    }
                    if (x !== null && this.parent.x !== x) {
                        this.toX = { time: 0, start: this.parent.x, delta: x - this.parent.x, end: x };
                        this.parent.emit('bounce-x-start', this.parent);
                    }
                }
                if (!this.toY && !decelerate.y) {
                    var y = null;
                    if (oob.top && this.top) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : 0;
                    } else if (oob.bottom && this.bottom) {
                        y = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : -point.y;
                    }
                    if (y !== null && this.parent.y !== y) {
                        this.toY = { time: 0, start: this.parent.y, delta: y - this.parent.y, end: y };
                        this.parent.emit('bounce-y-start', this.parent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsidXRpbHMiLCJyZXF1aXJlIiwiUGx1Z2luIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ0aW1lIiwiZWFzZSIsImZyaWN0aW9uIiwic2lkZXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJpbmRleE9mIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJsYXN0IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwidG9YIiwidG9ZIiwiYm91bmNlIiwiZWxhcHNlZCIsInBhdXNlZCIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJ4IiwiZW5kIiwic3RhcnQiLCJkZWx0YSIsImRpcnR5IiwieSIsInNjcmVlbldpZHRoIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbkhlaWdodCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwib29iIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJwZXJjZW50Q2hhbmdlWCIsInBlcmNlbnRDaGFuZ2VZIiwiT09CIiwiZHJhZyIsInBpbmNoIiwiYWN0aXZlIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImNhbGNVbmRlcmZsb3dYIiwiY2FsY1VuZGVyZmxvd1kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxJQUFMLEdBQVlELFFBQVFDLElBQVIsSUFBZ0IsR0FBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlSLE1BQU1RLElBQU4sQ0FBV0YsUUFBUUUsSUFB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d0JBQUlBLE1BQU0sSUFBTixJQUFjLEtBQUsvQixNQUFMLENBQVkrQixDQUFaLEtBQWtCQSxDQUFwQyxFQUNBO0FBQ0ksNkJBQUtaLEdBQUwsR0FBVyxFQUFFakIsTUFBTSxDQUFSLEVBQVcwQixPQUFPLEtBQUs1QixNQUFMLENBQVkrQixDQUE5QixFQUFpQ0YsT0FBT0UsSUFBSSxLQUFLL0IsTUFBTCxDQUFZK0IsQ0FBeEQsRUFBMkRKLEtBQUtJLENBQWhFLEVBQVg7QUFDQSw2QkFBSy9CLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUIsZ0JBQWpCLEVBQW1DLEtBQUt2QixNQUF4QztBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBM05MO0FBQUE7QUFBQSxnQ0E4Tkk7QUFDSSxpQkFBS2tCLEdBQUwsR0FBVyxLQUFLQyxHQUFMLEdBQVcsSUFBdEI7QUFDSDtBQWhPTDs7QUFBQTtBQUFBLEVBQXNDdEIsTUFBdEMiLCJmaWxlIjoiYm91bmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQm91bmNlIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnNpZGVzPWFsbF0gYWxsLCBob3Jpem9udGFsLCB2ZXJ0aWNhbCwgb3IgY29tYmluYXRpb24gb2YgdG9wLCBib3R0b20sIHJpZ2h0LCBsZWZ0IChlLmcuLCAndG9wLWJvdHRvbS1yaWdodCcpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuZnJpY3Rpb249MC41XSBmcmljdGlvbiB0byBhcHBseSB0byBkZWNlbGVyYXRlIGlmIGFjdGl2ZVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRpbWU9MTUwXSB0aW1lIGluIG1zIHRvIGZpbmlzaCBib3VuY2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBbZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlciwgb3IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlblxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1zdGFydC14XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLmVuZC14XHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXN0YXJ0LXlcclxuICAgICAqIEBmaXJlcyBib3VuY2UtZW5kLXlcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMudGltZSA9IG9wdGlvbnMudGltZSB8fCAxNTBcclxuICAgICAgICB0aGlzLmVhc2UgPSB1dGlscy5lYXNlKG9wdGlvbnMuZWFzZSwgJ2Vhc2VJbk91dFNpbmUnKVxyXG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSBvcHRpb25zLmZyaWN0aW9uIHx8IDAuNVxyXG4gICAgICAgIG9wdGlvbnMuc2lkZXMgPSBvcHRpb25zLnNpZGVzIHx8ICdhbGwnXHJcbiAgICAgICAgaWYgKG9wdGlvbnMuc2lkZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ2FsbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gdGhpcy5ib3R0b20gPSB0aGlzLmxlZnQgPSB0aGlzLnJpZ2h0ID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICdob3Jpem9udGFsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IHRoaXMubGVmdCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLnNpZGVzID09PSAndmVydGljYWwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IHRoaXMuYm90dG9tID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ3RvcCcpICE9PSAtMVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3R0b20gPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0ID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCdsZWZ0JykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCdyaWdodCcpICE9PSAtMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFyc2VVbmRlcmZsb3cob3B0aW9ucy51bmRlcmZsb3cgfHwgJ2NlbnRlcicpXHJcbiAgICAgICAgdGhpcy5sYXN0ID0ge31cclxuICAgIH1cclxuXHJcbiAgICBwYXJzZVVuZGVyZmxvdyhjbGFtcClcclxuICAgIHtcclxuICAgICAgICBjbGFtcCA9IGNsYW1wLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IChjbGFtcC5pbmRleE9mKCdsZWZ0JykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IChjbGFtcC5pbmRleE9mKCd0b3AnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZignYm90dG9tJykgIT09IC0xKSA/IDEgOiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudG9YID0gdGhpcy50b1kgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYm91bmNlKClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm91bmNlKClcclxuICAgICAgICBpZiAodGhpcy50b1gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0b1ggPSB0aGlzLnRvWFxyXG4gICAgICAgICAgICB0b1gudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdib3VuY2UteCcgfSlcclxuICAgICAgICAgICAgaWYgKHRvWC50aW1lID49IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRvWC5lbmRcclxuICAgICAgICAgICAgICAgIHRoaXMudG9YID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLXgtZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gdGhpcy5lYXNlKHRvWC50aW1lLCB0b1guc3RhcnQsIHRvWC5kZWx0YSwgdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50b1kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0b1kgPSB0aGlzLnRvWVxyXG4gICAgICAgICAgICB0b1kudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdib3VuY2UteScgfSlcclxuICAgICAgICAgICAgaWYgKHRvWS50aW1lID49IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IHRvWS5lbmRcclxuICAgICAgICAgICAgICAgIHRoaXMudG9ZID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLXktZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gdGhpcy5lYXNlKHRvWS50aW1lLCB0b1kuc3RhcnQsIHRvWS5kZWx0YSwgdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYWxjVW5kZXJmbG93WCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHhcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICB4ID0gMFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geFxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVbmRlcmZsb3dZKClcclxuICAgIHtcclxuICAgICAgICBsZXQgeVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgIHkgPSAwXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geVxyXG4gICAgfVxyXG5cclxuICAgIGJvdW5jZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb29iXHJcbiAgICAgICAgbGV0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAoZGVjZWxlcmF0ZSAmJiAoZGVjZWxlcmF0ZS54IHx8IGRlY2VsZXJhdGUueSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGRlY2VsZXJhdGUueCAmJiBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID09PSBkZWNlbGVyYXRlLmZyaWN0aW9uKSB8fCAoZGVjZWxlcmF0ZS55ICYmIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPT09IGRlY2VsZXJhdGUuZnJpY3Rpb24pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvb2IgPSB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgICAgICAgICAgaWYgKChvb2IubGVmdCAmJiB0aGlzLmxlZnQpIHx8IChvb2IucmlnaHQgJiYgdGhpcy5yaWdodCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgob29iLnRvcCAmJiB0aGlzLnRvcCkgfHwgKG9vYi5ib3R0b20gJiYgdGhpcy5ib3R0b20pKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZHJhZyA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RyYWcnXSB8fCB7fVxyXG4gICAgICAgIGNvbnN0IHBpbmNoID0gdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSB8fCB7fVxyXG4gICAgICAgIGRlY2VsZXJhdGUgPSBkZWNlbGVyYXRlIHx8IHt9XHJcbiAgICAgICAgaWYgKCFkcmFnLmFjdGl2ZSAmJiAhcGluY2guYWN0aXZlICYmICgoIXRoaXMudG9YIHx8ICF0aGlzLnRvWSkgJiYgKCFkZWNlbGVyYXRlLnggfHwgIWRlY2VsZXJhdGUueSkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb29iID0gb29iIHx8IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gb29iLmNvcm5lclBvaW50XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b1ggJiYgIWRlY2VsZXJhdGUueClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBudWxsXHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQgJiYgdGhpcy5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodCAmJiB0aGlzLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeCAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC54ICE9PSB4KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9YID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueCwgZGVsdGE6IHggLSB0aGlzLnBhcmVudC54LCBlbmQ6IHggfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS14LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRvWSAmJiAhZGVjZWxlcmF0ZS55KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IG51bGxcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wICYmIHRoaXMudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpID8gdGhpcy5jYWxjVW5kZXJmbG93WSgpIDogMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSAmJiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeSAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC55ICE9PSB5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9ZID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueSwgZGVsdGE6IHkgLSB0aGlzLnBhcmVudC55LCBlbmQ6IHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudG9YID0gdGhpcy50b1kgPSBudWxsXHJcbiAgICB9XHJcbn0iXX0=