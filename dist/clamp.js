'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var utils = require('./utils');

module.exports = function (_Plugin) {
    _inherits(clamp, _Plugin);

    /**
     * @private
     * @param {object} options
     * @param {(number|boolean)} [options.left] clamp left; true=0
     * @param {(number|boolean)} [options.right] clamp right; true=viewport.worldWidth
     * @param {(number|boolean)} [options.top] clamp top; true=0
     * @param {(number|boolean)} [options.bottom] clamp bottom; true=viewport.worldHeight
     * @param {string} [options.direction] (all, x, or y) using clamps of [0, viewport.worldWidth/viewport.worldHeight]; replaces left/right/top/bottom if set
     * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
     */
    function clamp(parent, options) {
        _classCallCheck(this, clamp);

        options = options || {};

        var _this = _possibleConstructorReturn(this, (clamp.__proto__ || Object.getPrototypeOf(clamp)).call(this, parent));

        if (typeof options.direction === 'undefined') {
            _this.left = utils.defaults(options.left, null);
            _this.right = utils.defaults(options.right, null);
            _this.top = utils.defaults(options.top, null);
            _this.bottom = utils.defaults(options.bottom, null);
        } else {
            _this.left = options.direction === 'x' || options.direction === 'all' ? true : null;
            _this.right = options.direction === 'x' || options.direction === 'all' ? true : null;
            _this.top = options.direction === 'y' || options.direction === 'all' ? true : null;
            _this.bottom = options.direction === 'y' || options.direction === 'all' ? true : null;
        }
        _this.parseUnderflow(options.underflow || 'center');
        _this.move();
        return _this;
    }

    _createClass(clamp, [{
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
        key: 'move',
        value: function move() {
            this.update();
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.paused) {
                return;
            }

            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.left !== null || this.right !== null) {
                var moved = void 0;
                if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                    switch (this.underflowX) {
                        case -1:
                            if (this.parent.x !== 0) {
                                this.parent.x = 0;
                                moved = true;
                            }
                            break;
                        case 1:
                            if (this.parent.x !== this.parent.screenWidth - this.parent.screenWorldWidth) {
                                this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                                moved = true;
                            }
                            break;
                        default:
                            if (this.parent.x !== (this.parent.screenWidth - this.parent.screenWorldWidth) / 2) {
                                this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                                moved = true;
                            }
                    }
                } else {
                    if (this.left !== null) {
                        if (this.parent.left < (this.left === true ? 0 : this.left)) {
                            this.parent.x = -(this.left === true ? 0 : this.left) * this.parent.scale.x;
                            decelerate.x = 0;
                            moved = true;
                        }
                    }
                    if (this.right !== null) {
                        if (this.parent.right > (this.right === true ? this.parent.worldWidth : this.right)) {
                            this.parent.x = -(this.right === true ? this.parent.worldWidth : this.right) * this.parent.scale.x + this.parent.screenWidth;
                            decelerate.x = 0;
                            moved = true;
                        }
                    }
                }
                if (moved) {
                    this.parent.emit('moved', { viewport: this.parent, type: 'clamp-x' });
                }
            }
            if (this.top !== null || this.bottom !== null) {
                var _moved = void 0;
                if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                    switch (this.underflowY) {
                        case -1:
                            if (this.parent.y !== 0) {
                                this.parent.y = 0;
                                _moved = true;
                            }
                            break;
                        case 1:
                            if (this.parent.y !== this.parent.screenHeight - this.parent.screenWorldHeight) {
                                this.parent.y = this.parent.screenHeight - this.parent.screenWorldHeight;
                                _moved = true;
                            }
                            break;
                        default:
                            if (this.parent.y !== (this.parent.screenHeight - this.parent.screenWorldHeight) / 2) {
                                this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                                _moved = true;
                            }
                    }
                } else {
                    if (this.top !== null) {
                        if (this.parent.top < (this.top === true ? 0 : this.top)) {
                            this.parent.y = -(this.top === true ? 0 : this.top) * this.parent.scale.y;
                            decelerate.y = 0;
                            _moved = true;
                        }
                    }
                    if (this.bottom !== null) {
                        if (this.parent.bottom > (this.bottom === true ? this.parent.worldHeight : this.bottom)) {
                            this.parent.y = -(this.bottom === true ? this.parent.worldHeight : this.bottom) * this.parent.scale.y + this.parent.screenHeight;
                            decelerate.y = 0;
                            _moved = true;
                        }
                    }
                }
                if (_moved) {
                    this.parent.emit('moved', { viewport: this.parent, type: 'clamp-y' });
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsInVwZGF0ZSIsInBhdXNlZCIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwibW92ZWQiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJ4Iiwic2NhbGUiLCJ3b3JsZFdpZHRoIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwieSIsIndvcmxkSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxRQUFTRCxRQUFRLFNBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosa0hBRVVELE1BRlY7O0FBR0ksWUFBSSxPQUFPQyxRQUFRQyxTQUFmLEtBQTZCLFdBQWpDLEVBQ0E7QUFDSSxrQkFBS0MsSUFBTCxHQUFZTixNQUFNTyxRQUFOLENBQWVILFFBQVFFLElBQXZCLEVBQTZCLElBQTdCLENBQVo7QUFDQSxrQkFBS0UsS0FBTCxHQUFhUixNQUFNTyxRQUFOLENBQWVILFFBQVFJLEtBQXZCLEVBQThCLElBQTlCLENBQWI7QUFDQSxrQkFBS0MsR0FBTCxHQUFXVCxNQUFNTyxRQUFOLENBQWVILFFBQVFLLEdBQXZCLEVBQTRCLElB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QTtBQUNJLHlCQUFLcEIsTUFBTCxDQUFZMEIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUszQixNQUFqQixFQUF5QjRCLE1BQU0sU0FBL0IsRUFBMUI7QUFDSDtBQUNKO0FBQ0o7QUE1S0w7O0FBQUE7QUFBQSxFQUFxQ2pDLE1BQXJDIiwiZmlsZSI6ImNsYW1wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgY2xhbXAgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMubGVmdF0gY2xhbXAgbGVmdDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnJpZ2h0XSBjbGFtcCByaWdodDsgdHJ1ZT12aWV3cG9ydC53b3JsZFdpZHRoXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnRvcF0gY2xhbXAgdG9wOyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMuYm90dG9tXSBjbGFtcCBib3R0b207IHRydWU9dmlld3BvcnQud29ybGRIZWlnaHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb25dIChhbGwsIHgsIG9yIHkpIHVzaW5nIGNsYW1wcyBvZiBbMCwgdmlld3BvcnQud29ybGRXaWR0aC92aWV3cG9ydC53b3JsZEhlaWdodF07IHJlcGxhY2VzIGxlZnQvcmlnaHQvdG9wL2JvdHRvbSBpZiBzZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGlyZWN0aW9uID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMubGVmdCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMucmlnaHQsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50b3AsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5ib3R0b20sIG51bGwpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy50b3AgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgPyB0cnVlIDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnY2VudGVyJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WCA9IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ10gfHwge31cclxuICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsIHx8IHRoaXMucmlnaHQgIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgbW92ZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGggPCB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnggIT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnggIT09IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueCAhPT0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGVmdCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQubGVmdCA8ICh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtKHRoaXMubGVmdCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLmxlZnQpICogdGhpcy5wYXJlbnQuc2NhbGUueFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5yaWdodCA+ICh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC0odGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSAqIHRoaXMucGFyZW50LnNjYWxlLnggKyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC14JyB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRvcCAhPT0gbnVsbCB8fCB0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtb3ZlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQgPCB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSB0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnkgIT09ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50b3AgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnRvcCA8ICh0aGlzLnRvcCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLnRvcCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLnRvcCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLnRvcCkgKiB0aGlzLnBhcmVudC5zY2FsZS55XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5ib3R0b20gPiAodGhpcy5ib3R0b20gPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZEhlaWdodCA6IHRoaXMuYm90dG9tKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAtKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkgKiB0aGlzLnBhcmVudC5zY2FsZS55ICsgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXknIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=