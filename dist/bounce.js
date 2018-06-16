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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsidXRpbHMiLCJyZXF1aXJlIiwiUGx1Z2luIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJ0aW1lIiwiZWFzZSIsImZyaWN0aW9uIiwic2lkZXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJpbmRleE9mIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJsYXN0IiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwidG9YIiwidG9ZIiwiYm91bmNlIiwiZWxhcHNlZCIsInBhdXNlZCIsIngiLCJlbmQiLCJlbWl0Iiwic3RhcnQiLCJkZWx0YSIsImRpcnR5IiwieSIsInNjcmVlbldpZHRoIiwic2NyZWVuV29ybGRXaWR0aCIsInNjcmVlbkhlaWdodCIsInNjcmVlbldvcmxkSGVpZ2h0Iiwib29iIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJwZXJjZW50Q2hhbmdlWCIsInBlcmNlbnRDaGFuZ2VZIiwiT09CIiwiZHJhZyIsInBpbmNoIiwiYWN0aXZlIiwicG9pbnQiLCJjb3JuZXJQb2ludCIsImNhbGNVbmRlcmZsb3dYIiwiY2FsY1VuZGVyZmxvd1kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxJQUFMLEdBQVlELFFBQVFDLElBQVIsSUFBZ0IsR0FBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlSLE1BQU1RLElBQU4sQ0FBV0YsUUFBUUUsSUFBbkIsRUFBeUIsZUFBekIsQ0FB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QUFLN0IsTUFBTCxDQUFZeUIsSUFBWixDQUFpQixnQkFBakIsRUFBbUMsS0FBS3pCLE1BQXhDO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUF6Tkw7QUFBQTtBQUFBLGdDQTROSTtBQUNJLGlCQUFLa0IsR0FBTCxHQUFXLEtBQUtDLEdBQUwsR0FBVyxJQUF0QjtBQUNIO0FBOU5MOztBQUFBO0FBQUEsRUFBc0N0QixNQUF0QyIsImZpbGUiOiJib3VuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCb3VuY2UgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtlYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXN0YXJ0LXhcclxuICAgICAqIEBmaXJlcyBib3VuY2UuZW5kLXhcclxuICAgICAqIEBmaXJlcyBib3VuY2Utc3RhcnQteVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1lbmQteVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy50aW1lID0gb3B0aW9ucy50aW1lIHx8IDE1MFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IHV0aWxzLmVhc2Uob3B0aW9ucy5lYXNlLCAnZWFzZUluT3V0U2luZScpXHJcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IG9wdGlvbnMuZnJpY3Rpb24gfHwgMC41XHJcbiAgICAgICAgb3B0aW9ucy5zaWRlcyA9IG9wdGlvbnMuc2lkZXMgfHwgJ2FsbCdcclxuICAgICAgICBpZiAob3B0aW9ucy5zaWRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNpZGVzID09PSAnYWxsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSA9IHRoaXMubGVmdCA9IHRoaXMucmlnaHQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ2hvcml6b250YWwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdGhpcy5sZWZ0ID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICd2ZXJ0aWNhbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gdGhpcy5ib3R0b20gPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZigndG9wJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvdHRvbSA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZignYm90dG9tJykgIT09IC0xXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLnNpZGVzLmluZGV4T2YoJ3JpZ2h0JykgIT09IC0xXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLmxhc3QgPSB7fVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy50b1ggPSB0aGlzLnRvWSA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShlbGFwc2VkKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib3VuY2UoKVxyXG4gICAgICAgIGlmICh0aGlzLnRvWClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRvWCA9IHRoaXMudG9YXHJcbiAgICAgICAgICAgIHRvWC50aW1lICs9IGVsYXBzZWRcclxuICAgICAgICAgICAgaWYgKHRvWC50aW1lID49IHRoaXMudGltZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRvWC5lbmRcclxuICAgICAgICAgICAgICAgIHRoaXMudG9YID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnYm91bmNlLXgtZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gdGhpcy5lYXNlKHRvWC50aW1lLCB0b1guc3RhcnQsIHRvWC5kZWx0YSwgdGhpcy50aW1lKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRpcnR5ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50b1kpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0b1kgPSB0aGlzLnRvWVxyXG4gICAgICAgICAgICB0b1kudGltZSArPSBlbGFwc2VkXHJcbiAgICAgICAgICAgIGlmICh0b1kudGltZSA+PSB0aGlzLnRpbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSB0b1kuZW5kXHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvWSA9IG51bGxcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ2JvdW5jZS15LWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IHRoaXMuZWFzZSh0b1kudGltZSwgdG9ZLnN0YXJ0LCB0b1kuZGVsdGEsIHRoaXMudGltZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY1VuZGVyZmxvd1goKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB4XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgeCA9IDBcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHhcclxuICAgIH1cclxuXHJcbiAgICBjYWxjVW5kZXJmbG93WSgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHlcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICB5ID0gMFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHlcclxuICAgIH1cclxuXHJcbiAgICBib3VuY2UoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9vYlxyXG4gICAgICAgIGxldCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKGRlY2VsZXJhdGUgJiYgKGRlY2VsZXJhdGUueCB8fCBkZWNlbGVyYXRlLnkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKChkZWNlbGVyYXRlLnggJiYgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9PT0gZGVjZWxlcmF0ZS5mcmljdGlvbikgfHwgKGRlY2VsZXJhdGUueSAmJiBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID09PSBkZWNlbGVyYXRlLmZyaWN0aW9uKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICAgICAgICAgIGlmICgob29iLmxlZnQgJiYgdGhpcy5sZWZ0KSB8fCAob29iLnJpZ2h0ICYmIHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVggPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9vYi50b3AgJiYgdGhpcy50b3ApIHx8IChvb2IuYm90dG9tICYmIHRoaXMuYm90dG9tKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRyYWcgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkcmFnJ10gfHwge31cclxuICAgICAgICBjb25zdCBwaW5jaCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10gfHwge31cclxuICAgICAgICBkZWNlbGVyYXRlID0gZGVjZWxlcmF0ZSB8fCB7fVxyXG4gICAgICAgIGlmICghZHJhZy5hY3RpdmUgJiYgIXBpbmNoLmFjdGl2ZSAmJiAoKCF0aGlzLnRvWCB8fCAhdGhpcy50b1kpICYmICghZGVjZWxlcmF0ZS54IHx8ICFkZWNlbGVyYXRlLnkpKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9vYiA9IG9vYiB8fCB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9YICYmICFkZWNlbGVyYXRlLngpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgaWYgKG9vYi5sZWZ0ICYmIHRoaXMubGVmdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dYKCkgOiAwXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvb2IucmlnaHQgJiYgdGhpcy5yaWdodClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dYKCkgOiAtcG9pbnQueFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHggIT09IG51bGwgJiYgdGhpcy5wYXJlbnQueCAhPT0geClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvWCA9IHsgdGltZTogMCwgc3RhcnQ6IHRoaXMucGFyZW50LngsIGRlbHRhOiB4IC0gdGhpcy5wYXJlbnQueCwgZW5kOiB4IH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteC1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b1kgJiYgIWRlY2VsZXJhdGUueSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBpZiAob29iLnRvcCAmJiB0aGlzLnRvcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5ib3R0b20gJiYgdGhpcy5ib3R0b20pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgeSA9ICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCkgPyB0aGlzLmNhbGNVbmRlcmZsb3dZKCkgOiAtcG9pbnQueVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHkgIT09IG51bGwgJiYgdGhpcy5wYXJlbnQueSAhPT0geSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvWSA9IHsgdGltZTogMCwgc3RhcnQ6IHRoaXMucGFyZW50LnksIGRlbHRhOiB5IC0gdGhpcy5wYXJlbnQueSwgZW5kOiB5IH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteS1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnRvWCA9IHRoaXMudG9ZID0gbnVsbFxyXG4gICAgfVxyXG59Il19