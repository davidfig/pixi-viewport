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
                    this.parent.emit('moved', { viewport: this.parent, type: 'clamp-x' });
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
                    this.parent.emit('moved', { viewport: this.parent, type: 'clamp-y' });
                }
            }
        }
    }]);

    return clamp;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFtcC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwidXRpbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsImRpcmVjdGlvbiIsImxlZnQiLCJkZWZhdWx0cyIsInJpZ2h0IiwidG9wIiwiYm90dG9tIiwicGFyc2VVbmRlcmZsb3ciLCJ1bmRlcmZsb3ciLCJtb3ZlIiwiY2xhbXAiLCJ0b0xvd2VyQ2FzZSIsIm5vVW5kZXJmbG93IiwidW5kZXJmbG93WCIsInVuZGVyZmxvd1kiLCJpbmRleE9mIiwidXBkYXRlIiwicGF1c2VkIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJtb3ZlZCIsInNjcmVlbldvcmxkV2lkdGgiLCJzY3JlZW5XaWR0aCIsIngiLCJzY2FsZSIsIndvcmxkV2lkdGgiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwic2NyZWVuV29ybGRIZWlnaHQiLCJzY3JlZW5IZWlnaHQiLCJ5Iiwid29ybGRIZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU1DLFFBQVNELFFBQVEsU0FBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7QUFVQSxtQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUNJQSxrQkFBVUEsV0FBVyxFQUFyQjs7QUFESixrSEFFVUQsTUFGVjs7QUFHSSxZQUFJLE9BQU9DLFFBQVFDLFNBQWYsS0FBNkIsV0FBakMsRUFDQTtBQUNJLGtCQUFLQyxJQUFMLEdBQVlOLE1BQU1PLFFBQU4sQ0FBZUgsUUFBUUUsSUFBdkIsRUFBNkIsSUFBN0IsQ0FBWjtBQUNBLGtCQUFLRSxLQUFMLEdBQWFSLE1BQU1PLFFBQU4sQ0FBZUgsUUFBUUksS0FBdkIsRUFBOEIsSUFBOUIsQ0FBYjtBQUNBLGtCQUFLQyxHQUFMLEdBQVdULE1BQU1PLFFBQU4sQ0FBZUgsUUFBUUss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QWhCLEdBQXVCLEtBQUtQLE1BQUwsQ0FBWWlDLFdBQW5DLEdBQWlELEtBQUsxQixNQUF4RCxJQUFrRSxLQUFLUCxNQUFMLENBQVl5QixLQUFaLENBQWtCTyxDQUFwRixHQUF3RixLQUFLaEMsTUFBTCxDQUFZK0IsWUFBcEg7QUFDQVosdUNBQVdhLENBQVgsR0FBZSxDQUFmO0FBQ0FYLHFDQUFRLElBQVI7QUFDSDtBQUNKO0FBQ0o7QUFDRCxvQkFBSUEsTUFBSixFQUNBO0FBQ0kseUJBQUtyQixNQUFMLENBQVkyQixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLFVBQVUsS0FBSzVCLE1BQWpCLEVBQXlCNkIsTUFBTSxTQUEvQixFQUExQjtBQUNIO0FBQ0o7QUFDSjtBQXZMTDs7QUFBQTtBQUFBLEVBQXFDbEMsTUFBckMiLCJmaWxlIjoiY2xhbXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcbmNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBjbGFtcCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5sZWZ0XSBjbGFtcCBsZWZ0OyB0cnVlPTBcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMucmlnaHRdIGNsYW1wIHJpZ2h0OyB0cnVlPXZpZXdwb3J0LndvcmxkV2lkdGhcclxuICAgICAqIEBwYXJhbSB7KG51bWJlcnxib29sZWFuKX0gW29wdGlvbnMudG9wXSBjbGFtcCB0b3A7IHRydWU9MFxyXG4gICAgICogQHBhcmFtIHsobnVtYmVyfGJvb2xlYW4pfSBbb3B0aW9ucy5ib3R0b21dIGNsYW1wIGJvdHRvbTsgdHJ1ZT12aWV3cG9ydC53b3JsZEhlaWdodFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRpcmVjdGlvbl0gKGFsbCwgeCwgb3IgeSkgdXNpbmcgY2xhbXBzIG9mIFswLCB2aWV3cG9ydC53b3JsZFdpZHRoL3ZpZXdwb3J0LndvcmxkSGVpZ2h0XTsgcmVwbGFjZXMgbGVmdC9yaWdodC90b3AvYm90dG9tIGlmIHNldFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnVuZGVyZmxvdz1jZW50ZXJdIChub25lIE9SICh0b3AvYm90dG9tL2NlbnRlciBhbmQgbGVmdC9yaWdodC9jZW50ZXIpIE9SIGNlbnRlcikgd2hlcmUgdG8gcGxhY2Ugd29ybGQgaWYgdG9vIHNtYWxsIGZvciBzY3JlZW4gKGUuZy4sIHRvcC1yaWdodCwgY2VudGVyLCBub25lLCBib3R0b21sZWZ0KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLmxlZnQsIG51bGwpXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSB1dGlscy5kZWZhdWx0cyhvcHRpb25zLnJpZ2h0LCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMudG9wLCBudWxsKVxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IHV0aWxzLmRlZmF1bHRzKG9wdGlvbnMuYm90dG9tLCBudWxsKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ3gnIHx8IG9wdGlvbnMuZGlyZWN0aW9uID09PSAnYWxsJyA/IHRydWUgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gb3B0aW9ucy5kaXJlY3Rpb24gPT09ICd5JyB8fCBvcHRpb25zLmRpcmVjdGlvbiA9PT0gJ2FsbCcgPyB0cnVlIDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IG9wdGlvbnMuZGlyZWN0aW9uID09PSAneScgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdhbGwnID8gdHJ1ZSA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJzZVVuZGVyZmxvdyhvcHRpb25zLnVuZGVyZmxvdyB8fCAnY2VudGVyJylcclxuICAgICAgICB0aGlzLm1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVW5kZXJmbG93KGNsYW1wKVxyXG4gICAge1xyXG4gICAgICAgIGNsYW1wID0gY2xhbXAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChjbGFtcCA9PT0gJ25vbmUnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5ub1VuZGVyZmxvdyA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY2xhbXAgPT09ICdjZW50ZXInKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gdGhpcy51bmRlcmZsb3dZID0gMFxyXG4gICAgICAgICAgICB0aGlzLm5vVW5kZXJmbG93ID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dYID0gKGNsYW1wLmluZGV4T2YoJ2xlZnQnKSAhPT0gLTEpID8gLTEgOiAoY2xhbXAuaW5kZXhPZigncmlnaHQnKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy51bmRlcmZsb3dZID0gKGNsYW1wLmluZGV4T2YoJ3RvcCcpICE9PSAtMSkgPyAtMSA6IChjbGFtcC5pbmRleE9mKCdib3R0b20nKSAhPT0gLTEpID8gMSA6IDBcclxuICAgICAgICAgICAgdGhpcy5ub1VuZGVyZmxvdyA9IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMudXBkYXRlKClcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXSB8fCB7fVxyXG4gICAgICAgIGlmICh0aGlzLmxlZnQgIT09IG51bGwgfHwgdGhpcy5yaWdodCAhPT0gbnVsbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtb3ZlZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCA8IHRoaXMucGFyZW50LnNjcmVlbldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLm5vVW5kZXJmbG93KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dYKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC54ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueCAhPT0gdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkV2lkdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueCAhPT0gKHRoaXMucGFyZW50LnNjcmVlbldpZHRoIC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRXaWR0aCkgLyAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggPSAodGhpcy5wYXJlbnQuc2NyZWVuV2lkdGggLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZFdpZHRoKSAvIDJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sZWZ0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5sZWZ0IDwgKHRoaXMubGVmdCA9PT0gdHJ1ZSA/IDAgOiB0aGlzLmxlZnQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCA9IC0odGhpcy5sZWZ0ID09PSB0cnVlID8gMCA6IHRoaXMubGVmdCkgKiB0aGlzLnBhcmVudC5zY2FsZS54XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmlnaHQgIT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LnJpZ2h0ID4gKHRoaXMucmlnaHQgPT09IHRydWUgPyB0aGlzLnBhcmVudC53b3JsZFdpZHRoIDogdGhpcy5yaWdodCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ID0gLSh0aGlzLnJpZ2h0ID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRXaWR0aCA6IHRoaXMucmlnaHQpICogdGhpcy5wYXJlbnQuc2NhbGUueCArIHRoaXMucGFyZW50LnNjcmVlbldpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2VsZXJhdGUueCA9IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtb3ZlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ2NsYW1wLXgnIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsIHx8IHRoaXMuYm90dG9tICE9PSBudWxsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1vdmVkXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCA8IHRoaXMucGFyZW50LnNjcmVlbkhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm5vVW5kZXJmbG93KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGhpcy51bmRlcmZsb3dZKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC55ICE9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gdGhpcy5wYXJlbnQuc2NyZWVuSGVpZ2h0IC0gdGhpcy5wYXJlbnQuc2NyZWVuV29ybGRIZWlnaHQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQueSAhPT0gKHRoaXMucGFyZW50LnNjcmVlbkhlaWdodCAtIHRoaXMucGFyZW50LnNjcmVlbldvcmxkSGVpZ2h0KSAvIDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9ICh0aGlzLnBhcmVudC5zY3JlZW5IZWlnaHQgLSB0aGlzLnBhcmVudC5zY3JlZW5Xb3JsZEhlaWdodCkgLyAyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudG9wICE9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3AgPCAodGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSA9IC0odGhpcy50b3AgPT09IHRydWUgPyAwIDogdGhpcy50b3ApICogdGhpcy5wYXJlbnQuc2NhbGUueVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJvdHRvbSAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuYm90dG9tID4gKHRoaXMuYm90dG9tID09PSB0cnVlID8gdGhpcy5wYXJlbnQud29ybGRIZWlnaHQgOiB0aGlzLmJvdHRvbSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ID0gLSh0aGlzLmJvdHRvbSA9PT0gdHJ1ZSA/IHRoaXMucGFyZW50LndvcmxkSGVpZ2h0IDogdGhpcy5ib3R0b20pICogdGhpcy5wYXJlbnQuc2NhbGUueSArIHRoaXMucGFyZW50LnNjcmVlbkhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNlbGVyYXRlLnkgPSAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobW92ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdjbGFtcC15JyB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19