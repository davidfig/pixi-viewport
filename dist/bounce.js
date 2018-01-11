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
                    this.parent.emit('bounce-x-end', this.parent);
                }
                this.parent.dirty = true;
            }
            if (this.toY) {
                if (this.toY.update(elapsed)) {
                    this.toY = null;
                    this.parent.emit('bounce-y-end', this.parent);
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
                        this.parent.emit('bounce-x-start', this.parent);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3VuY2UuanMiXSwibmFtZXMiOlsiRWFzZSIsInJlcXVpcmUiLCJleGlzdHMiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInRpbWUiLCJlYXNlIiwiZnJpY3Rpb24iLCJzaWRlcyIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsImluZGV4T2YiLCJwYXJzZVVuZGVyZmxvdyIsInVuZGVyZmxvdyIsImxhc3QiLCJjbGFtcCIsInRvTG93ZXJDYXNlIiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJ0b1giLCJ0b1kiLCJib3VuY2UiLCJlbGFwc2VkIiwicGF1c2VkIiwidXBkYXRlIiwiZW1pdCIsImRpcnR5IiwieCIsInNjcmVlbldpZHRoIiwic2NyZWVuV29ybGRXaWR0aCIsInkiLCJzY3JlZW5IZWlnaHQiLCJzY3JlZW5Xb3JsZEhlaWdodCIsIm9vYiIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwicGVyY2VudENoYW5nZVgiLCJwZXJjZW50Q2hhbmdlWSIsIk9PQiIsImRyYWciLCJwaW5jaCIsImFjdGl2ZSIsInBvaW50IiwiY29ybmVyUG9pbnQiLCJjYWxjVW5kZXJmbG93WCIsInRvIiwiY2FsY1VuZGVyZmxvd1kiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxPQUFPQyxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1DLFNBQVNELFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU1FLFNBQVNGLFFBQVEsVUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esb0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxJQUFMLEdBQVlELFFBQVFDLElBQVIsSUFBZ0IsR0FBNUI7QUFDQSxjQUFLQyxJQUFMLEdBQVlGLFFBQVFFLElBQVIs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QUE3RCxHQUFxRixDQUF6RjtBQUNILHFCQUhELE1BSUssSUFBSWIsSUFBSXpCLE1BQUosSUFBYyxLQUFLQSxNQUF2QixFQUNMO0FBQ0lzQiw0QkFBSyxLQUFLN0IsTUFBTCxDQUFZK0IsaUJBQVosR0FBZ0MsS0FBSy9CLE1BQUwsQ0FBWThCLFlBQTdDLEdBQTZELEtBQUtlLGNBQUwsRUFBN0QsR0FBcUYsQ0FBQ0osTUFBTVosQ0FBaEc7QUFDSDtBQUNELHdCQUFJakMsT0FBT2lDLENBQVAsS0FBYSxLQUFLN0IsTUFBTCxDQUFZNkIsQ0FBWixLQUFrQkEsQ0FBbkMsRUFDQTtBQUNJLDZCQUFLVixHQUFMLEdBQVcsSUFBSXpCLEtBQUtrRCxFQUFULENBQVksS0FBSzVDLE1BQWpCLEVBQXlCLEVBQUU2QixJQUFGLEVBQXpCLEVBQWdDLEtBQUszQixJQUFyQyxFQUEyQyxFQUFFQyxNQUFNLEtBQUtBLElBQWIsRUFBM0MsQ0FBWDtBQUNBLDZCQUFLSCxNQUFMLENBQVl3QixJQUFaLENBQWlCLGdCQUFqQixFQUFtQyxLQUFLeEIsTUFBeEM7QUFDSDtBQUNKO0FBQ0o7QUFDSjtBQTNNTDtBQUFBO0FBQUEsZ0NBOE1JO0FBQ0ksaUJBQUtrQixHQUFMLEdBQVcsS0FBS0MsR0FBTCxHQUFXLElBQXRCO0FBQ0g7QUFoTkw7O0FBQUE7QUFBQSxFQUFzQ3RCLE1BQXRDIiwiZmlsZSI6ImJvdW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEVhc2UgPSByZXF1aXJlKCdwaXhpLWVhc2UnKVxyXG5jb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5cclxuY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBCb3VuY2UgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc2lkZXM9YWxsXSBhbGwsIGhvcml6b250YWwsIHZlcnRpY2FsLCBvciBjb21iaW5hdGlvbiBvZiB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQgKGUuZy4sICd0b3AtYm90dG9tLXJpZ2h0JylcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5mcmljdGlvbj0wLjVdIGZyaWN0aW9uIHRvIGFwcGx5IHRvIGRlY2VsZXJhdGUgaWYgYWN0aXZlXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xNTBdIHRpbWUgaW4gbXMgdG8gZmluaXNoIGJvdW5jZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtlYXNlPWVhc2VJbk91dFNpbmVdIGVhc2UgZnVuY3Rpb24gb3IgbmFtZSAoc2VlIGh0dHA6Ly9lYXNpbmdzLm5ldC8gZm9yIHN1cHBvcnRlZCBuYW1lcylcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKiBAZmlyZXMgYm91bmNlLXN0YXJ0LXhcclxuICAgICAqIEBmaXJlcyBib3VuY2UuZW5kLXhcclxuICAgICAqIEBmaXJlcyBib3VuY2Utc3RhcnQteVxyXG4gICAgICogQGZpcmVzIGJvdW5jZS1lbmQteVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy50aW1lID0gb3B0aW9ucy50aW1lIHx8IDE1MFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IG9wdGlvbnMuZWFzZSB8fCAnZWFzZUluT3V0U2luZSdcclxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gb3B0aW9ucy5mcmljdGlvbiB8fCAwLjVcclxuICAgICAgICBvcHRpb25zLnNpZGVzID0gb3B0aW9ucy5zaWRlcyB8fCAnYWxsJ1xyXG4gICAgICAgIGlmIChvcHRpb25zLnNpZGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2lkZXMgPT09ICdhbGwnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvcCA9IHRoaXMuYm90dG9tID0gdGhpcy5sZWZ0ID0gdGhpcy5yaWdodCA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zLnNpZGVzID09PSAnaG9yaXpvbnRhbCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmlnaHQgPSB0aGlzLmxlZnQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaWRlcyA9PT0gJ3ZlcnRpY2FsJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCd0b3AnKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5zaWRlcy5pbmRleE9mKCdib3R0b20nKSAhPT0gLTFcclxuICAgICAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZignbGVmdCcpICE9PSAtMVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuc2lkZXMuaW5kZXhPZigncmlnaHQnKSAhPT0gLTFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubGFzdCA9IHt9XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnRvWCA9IHRoaXMudG9ZID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmJvdW5jZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKGVsYXBzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJvdW5jZSgpXHJcbiAgICAgICAgaWYgKHRoaXMudG9YKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudG9YLnVwZGF0ZShlbGFwc2VkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b1ggPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9ZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudG9ZLnVwZGF0ZShlbGFwc2VkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b1kgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteS1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY1VuZGVyZmxvd1goKVxyXG4gICAge1xyXG4gICAgICAgIGxldCB4XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgeCA9IDBcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHhcclxuICAgIH1cclxuXHJcbiAgICBjYWxjVW5kZXJmbG93WSgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IHlcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICB5ID0gMFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgeSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHlcclxuICAgIH1cclxuXHJcbiAgICBib3VuY2UoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9vYlxyXG4gICAgICAgIGxldCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKGRlY2VsZXJhdGUgJiYgKGRlY2VsZXJhdGUueCB8fCBkZWNlbGVyYXRlLnkpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKChkZWNlbGVyYXRlLnggJiYgZGVjZWxlcmF0ZS5wZXJjZW50Q2hhbmdlWCA9PT0gZGVjZWxlcmF0ZS5mcmljdGlvbikgfHwgKGRlY2VsZXJhdGUueSAmJiBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID09PSBkZWNlbGVyYXRlLmZyaWN0aW9uKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb29iID0gdGhpcy5wYXJlbnQuT09CKClcclxuICAgICAgICAgICAgICAgIGlmICgob29iLmxlZnQgJiYgdGhpcy5sZWZ0KSB8fCAob29iLnJpZ2h0ICYmIHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUucGVyY2VudENoYW5nZVggPSB0aGlzLmZyaWN0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9vYi50b3AgJiYgdGhpcy50b3ApIHx8IChvb2IuYm90dG9tICYmIHRoaXMuYm90dG9tKSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnBlcmNlbnRDaGFuZ2VZID0gdGhpcy5mcmljdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRyYWcgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkcmFnJ10gfHwge31cclxuICAgICAgICBjb25zdCBwaW5jaCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ3BpbmNoJ10gfHwge31cclxuICAgICAgICBkZWNlbGVyYXRlID0gZGVjZWxlcmF0ZSB8fCB7fVxyXG4gICAgICAgIGlmICghZHJhZy5hY3RpdmUgJiYgIXBpbmNoLmFjdGl2ZSAmJiAoKCF0aGlzLnRvWCB8fCAhdGhpcy50b1kpICYmICghZGVjZWxlcmF0ZS54IHx8ICFkZWNlbGVyYXRlLnkpKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9vYiA9IG9vYiB8fCB0aGlzLnBhcmVudC5PT0IoKVxyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IG9vYi5jb3JuZXJQb2ludFxyXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9YICYmICFkZWNlbGVyYXRlLngpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCB4XHJcbiAgICAgICAgICAgICAgICBpZiAob29iLmxlZnQgJiYgdGhpcy5sZWZ0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IDBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9vYi5yaWdodCAmJiB0aGlzLnJpZ2h0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSA/IHRoaXMuY2FsY1VuZGVyZmxvd1goKSA6IC1wb2ludC54XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RzKHgpICYmIHRoaXMucGFyZW50LnggIT09IHgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b1ggPSBuZXcgRWFzZS50byh0aGlzLnBhcmVudCwgeyB4IH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteC1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b1kgJiYgIWRlY2VsZXJhdGUueSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IHlcclxuICAgICAgICAgICAgICAgIGlmIChvb2IudG9wICYmIHRoaXMudG9wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHkgPSAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpID8gdGhpcy5jYWxjVW5kZXJmbG93WSgpIDogMFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAob29iLmJvdHRvbSAmJiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0gKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KSA/IHRoaXMuY2FsY1VuZGVyZmxvd1koKSA6IC1wb2ludC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RzKHkpICYmIHRoaXMucGFyZW50LnkgIT09IHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b1kgPSBuZXcgRWFzZS50byh0aGlzLnBhcmVudCwgeyB5IH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdib3VuY2UteS1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnRvWCA9IHRoaXMudG9ZID0gbnVsbFxyXG4gICAgfVxyXG59Il19