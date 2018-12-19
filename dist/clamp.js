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
                    if (!this.noUnderflow) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsIm5vVW5kZXJmbG93IiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJpbmRleE9mIiwidXBkYXRlIiwicGF1c2VkIiwib3JpZ2luYWwiLCJ4IiwieSIsImRlY2VsZXJhdGUiLCJwbHVnaW5zIiwibW92ZWQiLCJzY3JlZW5Xb3JsZFdpZHRoIiwic2NyZWVuV2lkdGgiLCJzY2FsZSIsIndvcmxkV2lkdGgiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ3b3JsZEhlaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBTUMsUUFBU0QsUUFBUSxTQUFSLENBQWY7O0FBRUFFLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7OztBQVVBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCOztBQURKLGtIQUVVRCxNQUZWOztBQUdJLFlBQUksT0FBT0MsUUFBUUMsU0FBZixLQUE2QixXQUFqQyxFQUNBO0FBQ0ksa0JBQUtDLElBQUwsR0FBWU4sTUFBTU8sUUFBTixDQUFlSCxRQUFRRSxJQUF2QixFQUE2QixJQUE3QixDQUFaO0FBQ0Esa0JBQUtFLEtBQUwsR0FBYVIsTUFBTU8sUUFBTixDQUFlSCxRQUFRSSxLQUF2QixFQUE4QixJQUE5QixDQUFiO0FBQ0Esa0JBQUtDLEdBQUwsR0FBV1QsTUFBTU8sUUFBTixD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dUIsS0FBS1AsTUFBTCxDQUFZa0MsV0FBbkMsR0FBaUQsS0FBSzNCLE1BQTVFLENBQUosRUFDQTtBQUNJLGlDQUFLUCxNQUFMLENBQVlxQixDQUFaLEdBQWdCLEVBQUUsS0FBS2QsTUFBTCxLQUFnQixJQUFoQixHQUF1QixLQUFLUCxNQUFMLENBQVlrQyxXQUFuQyxHQUFpRCxLQUFLM0IsTUFBeEQsSUFBa0UsS0FBS1AsTUFBTCxDQUFZMkIsS0FBWixDQUFrQk4sQ0FBcEYsR0FBd0YsS0FBS3JCLE1BQUwsQ0FBWWlDLFlBQXBIO0FBQ0FYLHVDQUFXRCxDQUFYLEdBQWUsQ0FBZjtBQUNBRyxxQ0FBUSxJQUFSO0FBQ0g7QUFDSjtBQUNKO0FBQ0Qsb0JBQUlBLE1BQUosRUFDQTtBQUNJLHlCQUFLeEIsTUFBTCxDQUFZNkIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUs5QixNQUFqQixFQUF5Qm1CLGtCQUF6QixFQUFtQ1ksTUFBTSxTQUF6QyxFQUExQjtBQUNIO0FBQ0o7QUFDSjtBQXZMTDs7QUFBQTtBQUFBLEVBQXFDcEMsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBjbGFtcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdIChub25lIE9SICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIpIE9SIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW4gKGUuZy4sIHRvcC1yaWdodCwgY2VudGVyLCBub25lLCBib3R0b21sZWZ0KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLmxlZnQsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnJpZ2h0LCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMudG9wLCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuYm90dG9tLCBudWxsKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgPyB0cnVlIDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneScgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLm1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ25vbmUnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5ub1VuZGVyZmxvdyA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgICAgICB0aGlzLm5vVW5kZXJmbG93ID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy5ub1VuZGVyZmxvdyA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudXBkYXRlKClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHsgeDogdGhpcy5wYXJlbnQueCwgeTogdGhpcy5wYXJlbnQueSB9XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwgfHwgdGhpcy5yaWdodCAhPT0gbnVsbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtb3ZlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubm9VbmRlcmZsb3cpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnVuZGVyZmxvd1gpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIC0xOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnggIT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9ICh0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGgpIC8gMlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmxlZnQgPCAodGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLmxlZnQgPT09IHRydWUgPyAwIDogdGhpcy5sZWZ0KSAqIHRoaXMucGFyZW50LnNjYWxlLnhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yaWdodCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQucmlnaHQgPiAodGhpcy5yaWdodCA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkV2lkdGggOiB0aGlzLnJpZ2h0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAtKHRoaXMucmlnaHQgPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZFdpZHRoIDogdGhpcy5yaWdodCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICsgdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjZWxlcmF0ZS54ID0gMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1vdmVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCBvcmlnaW5hbCwgdHlwZTogJ2NsYW1wLXgnIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsIHx8IHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm5vVW5kZXJmbG93KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApICogdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIG9yaWdpbmFsLCB0eXBlOiAnY2xhbXAteScgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==