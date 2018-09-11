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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsidXRpbHMiLCJyZXF1aXJlIiwiUGx1Z2luIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ0aW1lIiwiZWFzZSIsImZyaWN0aW9uIiwic2lkZXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJpbmRleE9mIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJsYXN0IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwidG9YIiwidG9ZIiwiYm91bmNlIiwiZWxhcHNlZCIsInBhdXNlZCIsImVtaXQiLCJ2aWV3cG9ydCIsInR5cGUiLCJ4IiwiZW5kIiwic3RhcnQiLCJkZWx0YSIsInkiLCJzY3JlZW5XaWR0aCIsInNjcmVlbldvcmxkV2lkdGgiLCJzY3JlZW5IZWlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsIm9vYiIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsIk9PQiIsImRyYWciLCJwaW5jaCIsImFjdGl2ZSIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJjYWxjVW5kZXJmbG93WCIsImNhbGNVbmRlcmZsb3dZIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7OztBQWNBLG9CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsb0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsSUFBTCxHQUFZRCxRQUFRQyxJQUFSLElBQWdCLEdBQTVCO0FBQ0EsY0FBS0MsSUFBTCxHQUFZUixNQUFNUSxJQUFOLENBQVdGLFFBQVFFLElBQW5CLEVBQXlC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QUVqQixNQUFNLENBQVIsRUFBVzBCLE9BQU8sS0FBSzVCLE1BQUwsQ0FBWThCLENBQTlCLEVBQWlDRCxPQUFPQyxJQUFJLEtBQUs5QixNQUFMLENBQVk4QixDQUF4RCxFQUEyREgsS0FBS0csQ0FBaEUsRUFBWDtBQUNBLDZCQUFLOUIsTUFBTCxDQUFZdUIsSUFBWixDQUFpQixnQkFBakIsRUFBbUMsS0FBS3ZCLE1BQXhDO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUF6Tkw7QUFBQTtBQUFBLGdDQTROSTtBQUNJLGlCQUFLa0IsR0FBTCxHQUFXLEtBQUtDLEdBQUwsR0FBVyxJQUF0QjtBQUNIO0FBOU5MOztBQUFBO0FBQUEsRUFBc0N0QixNQUF0QyIsImZpbGUiOiJib3VuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCb3VuY2UgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtlYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXN0YXJ0LXhcclxuICAgICAqIEBmaXJlcyBib3VuY2UuZW5kLXhcclxuICAgICAqIEBmaXJlcyBib3VuY2Utc3RhcnQteVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1lbmQteVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy50aW1lID0gb3B0aW9ucy50aW1lIHx8IDE1MFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IHV0aWxzLmVhc2Uob3B0aW9ucy5lYXNlLCAnZWFzZUluT3V0U2luZScpXHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC41XHJcbiAgICAgICAgb3B0aW9ucy5zaWRlcyA9IG9wdGlvbnMuc2lkZXMgfHwgJ2FsbCdcclxuICAgICAgICBpZiAob3B0aW9ucy5zaWRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNpZGVzID09PSAnYWxsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSA9IHRoaXMubGVmdCA9IHRoaXMucmlnaHQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ2hvcml6b250YWwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdGhpcy5sZWZ0ID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICd2ZXJ0aWNhbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gdGhpcy5ib3R0b20gPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZigndG9wJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdHRvbSA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZignYm90dG9tJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLmxhc3QgPSB7fVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50b1ggPSB0aGlzLnRvWSA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgICAgIGlmICh0aGlzLnRvWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvWCA9IHRoaXMudG9YXHJcbiAgICAgICAgICAgIHRvWC50aW1lICs9IGVsYXBzZWRcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2JvdW5jZS14JyB9KVxyXG4gICAgICAgICAgICBpZiAodG9YLnRpbWUgPj0gdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gdG9YLmVuZFxyXG4gICAgICAgICAgICAgICAgdGhpcy50b1ggPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSB0aGlzLmVhc2UodG9YLnRpbWUsIHRvWC5zdGFydCwgdG9YLmRlbHRhLCB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9ZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgdG9ZID0gdGhpcy50b1lcclxuICAgICAgICAgICAgdG9ZLnRpbWUgKz0gZWxhcHNlZFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnYm91bmNlLXknIH0pXHJcbiAgICAgICAgICAgIGlmICh0b1kudGltZSA+PSB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSB0b1kuZW5kXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvWSA9IG51bGxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IHRoaXMuZWFzZSh0b1kudGltZSwgdG9ZLnN0YXJ0LCB0b1kuZGVsdGEsIHRoaXMudGltZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYWxjVW5kZXJmbG93WCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHhcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICB4ID0gMFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgeCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geFxyXG4gICAgfVxyXG5cclxuICAgIGNhbGNVbmRlcmZsb3dZKClcclxuICAgIHtcclxuICAgICAgICBsZXQgeVxyXG4gICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgIHkgPSAwXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMlxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geVxyXG4gICAgfVxyXG5cclxuICAgIGJvdW5jZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb29iXHJcbiAgICAgICAgbGV0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAoZGVjZWxlcmF0ZSAmJiAoZGVjZWxlcmF0ZS54IHx8IGRlY2VsZXJhdGUueSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGRlY2VsZXJhdGUueCAmJiBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VYID09PSBkZWNlbGVyYXRlLmZyaWN0aW9uKSB8fCAoZGVjZWxlcmF0ZS55ICYmIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPT09IGRlY2VsZXJhdGUuZnJpY3Rpb24pKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvb2IgPSB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgICAgICAgICAgaWYgKChvb2IubGVmdCAmJiB0aGlzLmxlZnQpIHx8IChvb2IucmlnaHQgJiYgdGhpcy5yaWdodCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9IHRoaXMuZnJpY3Rpb25cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgob29iLnRvcCAmJiB0aGlzLnRvcCkgfHwgKG9vYi5ib3R0b20gJiYgdGhpcy5ib3R0b20pKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVkgPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZHJhZyA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RyYWcnXSB8fCB7fVxyXG4gICAgICAgIGNvbnN0IHBpbmNoID0gdGhpcy5wYXJlbnQucGx1Z2luc1sncGluY2gnXSB8fCB7fVxyXG4gICAgICAgIGRlY2VsZXJhdGUgPSBkZWNlbGVyYXRlIHx8IHt9XHJcbiAgICAgICAgaWYgKCFkcmFnLmFjdGl2ZSAmJiAhcGluY2guYWN0aXZlICYmICgoIXRoaXMudG9YIHx8ICF0aGlzLnRvWSkgJiYgKCFkZWNlbGVyYXRlLnggfHwgIWRlY2VsZXJhdGUueSkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb29iID0gb29iIHx8IHRoaXMucGFyZW50Lk9PQigpXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gb29iLmNvcm5lclBvaW50XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b1ggJiYgIWRlY2VsZXJhdGUueClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBudWxsXHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQgJiYgdGhpcy5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodCAmJiB0aGlzLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeCAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC54ICE9PSB4KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9YID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueCwgZGVsdGE6IHggLSB0aGlzLnBhcmVudC54LCBlbmQ6IHggfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS14LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRvWSAmJiAhZGVjZWxlcmF0ZS55KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeSA9IG51bGxcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wICYmIHRoaXMudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpID8gdGhpcy5jYWxjVW5kZXJmbG93WSgpIDogMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSAmJiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoeSAhPT0gbnVsbCAmJiB0aGlzLnBhcmVudC55ICE9PSB5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9ZID0geyB0aW1lOiAwLCBzdGFydDogdGhpcy5wYXJlbnQueSwgZGVsdGE6IHkgLSB0aGlzLnBhcmVudC55LCBlbmQ6IHkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudG9YID0gdGhpcy50b1kgPSBudWxsXHJcbiAgICB9XHJcbn0iXX0=