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
     * @param {string} [options.underflow=center] (none OR (top/bottom/center and left/right/center) OR center) where to place world if too small for screen (e.g., top-right, center, none, bottomleft)
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
            if (clamp === 'none') {
                this.noUnderflow = true;
            } else if (clamp === 'center') {
                this.underflowX = this.underflowY = 0;
                this.noUnderflow = false;
            } else {
                this.underflowX = clamp.indexOf('left') !== -1 ? -1 : clamp.indexOf('right') !== -1 ? 1 : 0;
                this.underflowY = clamp.indexOf('top') !== -1 ? -1 : clamp.indexOf('bottom') !== -1 ? 1 : 0;
                this.noUnderflow = false;
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
            var original = { x: this.parent.x, y: this.parent.y };
            var decelerate = this.parent.plugins['decelerate'] || {};
            if (this.left !== null || this.right !== null) {
                var moved = void 0;
                if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                    if (!!this.noUnderflow) {
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
                    this.parent.emit('moved', { viewport: this.parent, original: original, type: 'clamp-x' });
                }
            }
            if (this.top !== null || this.bottom !== null) {
                var _moved = void 0;
                if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                    if (!this.noUnderflow) {
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
                    this.parent.emit('moved', { viewport: this.parent, original: original, type: 'clamp-y' });
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsIm5vVW5kZXJmbG93IiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJpbmRleE9mIiwidXBkYXRlIiwicGF1c2VkIiwib3JpZ2luYWwiLCJ4IiwieSIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwibW92ZWQiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJzY2FsZSIsIndvcmxkV2lkdGgiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7OztBQVVBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCOztBQURKLGtIQUVVRCxNQUZWOztBQUdJLFlBQUksT0FBT0MsUUFBUUMsU0FBZixLQUE2QixXQUFqQyxFQUNBO0FBQ0ksa0JBQUtDLElBQUwsR0FBWU4sTUFBTU8sUUFBTixDQUFlSCxRQUFRRSxJQUF2QixFQUE2QixJQUE3QixDQUFaO0FBQ0Esa0JBQUtFLEtBQUwsR0FBYVIsTUFBTU8sUUFBTixDQUFlSCxRQUFRSSxLQUF2QixFQUE4QixJQUE5QixDQUFiO0FBQ0Esa0JBQUtDLEdBQUwsR0FBV1QsTUFBTU8sUUFBTixD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QixHQUF1QixLQUFLUCxNQUFMLENBQVlrQyxXQUFuQyxHQUFpRCxLQUFLM0IsTUFBNUUsQ0FBSixFQUNBO0FBQ0ksaUNBQUtQLE1BQUwsQ0FBWXFCLENBQVosR0FBZ0IsRUFBRSxLQUFLZCxNQUFMLEtBQWdCLElBQWhCLEdBQXVCLEtBQUtQLE1BQUwsQ0FBWWtDLFdBQW5DLEdBQWlELEtBQUszQixNQUF4RCxJQUFrRSxLQUFLUCxNQUFMLENBQVkyQixLQUFaLENBQWtCTixDQUFwRixHQUF3RixLQUFLckIsTUFBTCxDQUFZaUMsWUFBcEg7QUFDQVgsdUNBQVdELENBQVgsR0FBZSxDQUFmO0FBQ0FHLHFDQUFRLElBQVI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxvQkFBSUEsTUFBSixFQUNBO0FBQ0kseUJBQUt4QixNQUFMLENBQVk2QixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLFVBQVUsS0FBSzlCLE1BQWpCLEVBQXlCbUIsa0JBQXpCLEVBQW1DWSxNQUFNLFNBQXpDLEVBQTFCO0FBQ0g7QUFDSjtBQUNKO0FBdkxMOztBQUFBO0FBQUEsRUFBcUNwQyxNQUFyQyIsImZpbGUiOiJjbGFtcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIGNsYW1wIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmxlZnRdIGNsYW1wIGxlZnQ7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5yaWdodF0gY2xhbXAgcmlnaHQ7IHRydWU9dmlld3BvcnQud29ybGRXaWR0aFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy50b3BdIGNsYW1wIHRvcDsgdHJ1ZT0wXHJcbiAgICAgKiBAcGFyYW0geyhudW1iZXJ8Ym9vbGVhbil9IFtvcHRpb25zLmJvdHRvbV0gY2xhbXAgYm90dG9tOyB0cnVlPXZpZXdwb3J0LndvcmxkSGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZGlyZWN0aW9uXSAoYWxsLCB4LCBvciB5KSB1c2luZyBjbGFtcHMgb2YgWzAsIHZpZXdwb3J0LndvcmxkV2lkdGgvdmlld3BvcnQud29ybGRIZWlnaHRdOyByZXBsYWNlcyBsZWZ0L3JpZ2h0L3RvcC9ib3R0b20gaWYgc2V0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudW5kZXJmbG93PWNlbnRlcl0gKG5vbmUgT1IgKHRvcC9ib3R0b20vY2VudGVyIGFuZCBsZWZ0L3JpZ2h0L2NlbnRlcikgT1IgY2VudGVyKSB3aGVyZSB0byBwbGFjZSB3b3JsZCBpZiB0b28gc21hbGwgZm9yIHNjcmVlbiAoZS5nLiwgdG9wLXJpZ2h0LCBjZW50ZXIsIG5vbmUsIGJvdHRvbWxlZnQpXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGlyZWN0aW9uID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMubGVmdCwgbnVsbClcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMucmlnaHQsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy50b3AsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gdXRpbHMuZGVmYXVsdHMob3B0aW9ucy5ib3R0b20sIG51bGwpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy50b3AgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3knIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgPyB0cnVlIDogbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcnNlVW5kZXJmbG93KG9wdGlvbnMudW5kZXJmbG93IHx8ICdjZW50ZXInKVxyXG4gICAgICAgIHRoaXMubW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VVbmRlcmZsb3coY2xhbXApXHJcbiAgICB7XHJcbiAgICAgICAgY2xhbXAgPSBjbGFtcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGNsYW1wID09PSAnbm9uZScpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm5vVW5kZXJmbG93ID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjbGFtcCA9PT0gJ2NlbnRlcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSB0aGlzLnVuZGVyZmxvd1kgPSAwXHJcbiAgICAgICAgICAgIHRoaXMubm9VbmRlcmZsb3cgPSBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1ggPSAoY2xhbXAuaW5kZXhPZignbGVmdCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdyaWdodCcpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLnVuZGVyZmxvd1kgPSAoY2xhbXAuaW5kZXhPZigndG9wJykgIT09IC0xKSA/IC0xIDogKGNsYW1wLmluZGV4T2YoJ2JvdHRvbScpICE9PSAtMSkgPyAxIDogMFxyXG4gICAgICAgICAgICB0aGlzLm5vVW5kZXJmbG93ID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0geyB4OiB0aGlzLnBhcmVudC54LCB5OiB0aGlzLnBhcmVudC55IH1cclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddIHx8IHt9XHJcbiAgICAgICAgaWYgKHRoaXMubGVmdCAhPT0gbnVsbCB8fCB0aGlzLnJpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoIDwgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMubm9VbmRlcmZsb3cpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnggIT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yaWdodCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQucmlnaHQgPiAodGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtKHRoaXMucmlnaHQgPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZFdpZHRoIDogdGhpcy5yaWdodCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCBvcmlnaW5hbCwgdHlwZTogJ2NsYW1wLXgnIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsIHx8IHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm5vVW5kZXJmbG93KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApICogdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIG9yaWdpbmFsLCB0eXBlOiAnY2xhbXAteScgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==