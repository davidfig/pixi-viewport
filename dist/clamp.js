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
            _this.left = options.direction === 'x' || options.direction === 'all';
            _this.right = options.direction === 'x' || options.direction === 'all';
            _this.top = options.direction === 'y' || options.direction === 'all';
            _this.bottom = options.direction === 'y' || options.direction === 'all';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsInVuZGVyZmxvd1giLCJ1bmRlcmZsb3dZIiwiaW5kZXhPZiIsInVwZGF0ZSIsInBhdXNlZCIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwibW92ZWQiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJ4Iiwic2NhbGUiLCJ3b3JsZFdpZHRoIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsInNjcmVlbldvcmxkSGVpZ2h0Iiwic2NyZWVuSGVpZ2h0IiwieSIsIndvcmxkSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxRQUFTRCxRQUFRLFNBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7O0FBREosa0hBRVVELE1BRlY7O0FBR0ksWUFBSSxPQUFPQyxRQUFRQyxTQUFmLEtBQTZCLFdBQWpDLEVBQ0E7QUFDSSxrQkFBS0MsSUFBTCxHQUFZTixNQUFNTyxRQUFOLENBQWVILFFBQVFFLElBQXZCLEVBQTZCLElBQTdCLENBQVo7QUFDQSxrQkFBS0UsS0FBTCxHQUFhUixNQUFNTyxRQUFOLENBQWVILFFBQVFJLEtBQXZCLEVBQThCLElBQTlCLENBQWI7QUFDQSxrQkFBS0MsR0FBTCxHQUFXVCxNQUFNTyxRQUFOLENBQWVILFFBQVFLLEdBQXZCLEVBQTRCLElB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MUI7QUFDSDtBQUNKO0FBQ0o7QUE1S0w7O0FBQUE7QUFBQSxFQUFxQ2pDLE1BQXJDIiwiZmlsZSI6ImNsYW1wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCB1dGlscyA9ICByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgY2xhbXAgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMubGVmdF0gY2xhbXAgbGVmdDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnJpZ2h0XSBjbGFtcCByaWdodDsgdHJ1ZT12aWV3cG9ydC53b3JsZFdpZHRoXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLnRvcF0gY2xhbXAgdG9wOyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMuYm90dG9tXSBjbGFtcCBib3R0b207IHRydWU9dmlld3BvcnQud29ybGRIZWlnaHRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kaXJlY3Rpb25dIChhbGwsIHgsIG9yIHkpIHVzaW5nIGNsYW1wcyBvZiBbMCwgdmlld3BvcnQud29ybGRXaWR0aC92aWV3cG9ydC53b3JsZEhlaWdodF07IHJlcGxhY2VzIGxlZnQvcmlnaHQvdG9wL2JvdHRvbSBpZiBzZXRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy51bmRlcmZsb3c9Y2VudGVyXSAodG9wL2JvdHRvbS9jZW50ZXIgYW5kIGxlZnQvcmlnaHQvY2VudGVyLCBvciBjZW50ZXIpIHdoZXJlIHRvIHBsYWNlIHdvcmxkIGlmIHRvbyBzbWFsbCBmb3Igc2NyZWVuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGlyZWN0aW9uID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMubGVmdCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMucmlnaHQsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50b3AsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5ib3R0b20sIG51bGwpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJ1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneScgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCdcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLm1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAwXHJcbiAgICAgICAgICAgIHRoaXMudW5kZXJmbG93WSA9IDBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCAhPT0gbnVsbCB8fCB0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnggIT09ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMilcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yaWdodCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQucmlnaHQgPiAodGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtKHRoaXMucmlnaHQgPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZFdpZHRoIDogdGhpcy5yaWdodCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnY2xhbXAteCcgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy50b3AgIT09IG51bGwgfHwgdGhpcy5ib3R0b20gIT09IG51bGwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgbW92ZWRcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0IDwgdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRoaXMudW5kZXJmbG93WSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSAodGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpIC8gMilcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApICogdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC15JyB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19