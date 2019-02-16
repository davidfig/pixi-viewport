'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var utils = require('./utils');
var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(MouseEdges, _Plugin);

    /**
     * Scroll viewport when mouse hovers near one of the edges.
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.radius] distance from center of screen in screen pixels
     * @param {number} [options.distance] distance from all sides in screen pixels
     * @param {number} [options.top] alternatively, set top distance (leave unset for no top scroll)
     * @param {number} [options.bottom] alternatively, set bottom distance (leave unset for no top scroll)
     * @param {number} [options.left] alternatively, set left distance (leave unset for no top scroll)
     * @param {number} [options.right] alternatively, set right distance (leave unset for no top scroll)
     * @param {number} [options.speed=8] speed in pixels/frame to scroll viewport
     * @param {boolean} [options.reverse] reverse direction of scroll
     * @param {boolean} [options.noDecelerate] don't use decelerate plugin even if it's installed
     * @param {boolean} [options.linear] if using radius, use linear movement (+/- 1, +/- 1) instead of angled movement (Math.cos(angle from center), Math.sin(angle from center))
     * @param {boolean} [options.allowButtons] allows plugin to continue working even when there's a mousedown event
     *
     * @event mouse-edge-start(Viewport) emitted when mouse-edge starts
     * @event mouse-edge-end(Viewport) emitted when mouse-edge ends
     */
    function MouseEdges(parent, options) {
        _classCallCheck(this, MouseEdges);

        var _this = _possibleConstructorReturn(this, (MouseEdges.__proto__ || Object.getPrototypeOf(MouseEdges)).call(this, parent));

        options = options || {};
        _this.options = options;
        _this.reverse = options.reverse ? 1 : -1;
        _this.noDecelerate = options.noDecelerate;
        _this.linear = options.linear;
        _this.radiusSquared = Math.pow(options.radius, 2);
        _this.resize();
        _this.speed = options.speed || 8;
        return _this;
    }

    _createClass(MouseEdges, [{
        key: 'resize',
        value: function resize() {
            var options = this.options;
            var distance = options.distance;
            if (utils.exists(distance)) {
                this.left = distance;
                this.top = distance;
                this.right = window.innerWidth - distance;
                this.bottom = window.innerHeight - distance;
            } else if (!this.radius) {
                this.left = utils.exists(options.left) ? options.left : null;
                this.top = utils.exists(options.top) ? options.top : null;
                this.right = utils.exists(options.right) ? window.innerWidth - options.right : null;
                this.bottom = utils.exists(options.bottom) ? window.innerHeight - options.bottom : null;
            }
        }
    }, {
        key: 'down',
        value: function down() {
            if (!this.options.allowButtons) {
                this.horizontal = this.vertical = null;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (e.data.identifier !== 'MOUSE' && e.data.identifier !== 1 || !this.options.allowButtons && e.data.buttons !== 0) {
                return;
            }
            var x = e.data.global.x;
            var y = e.data.global.y;

            if (this.radiusSquared) {
                var center = this.parent.toScreen(this.parent.center);
                var distance = Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2);
                if (distance >= this.radiusSquared) {
                    var angle = Math.atan2(center.y - y, center.x - x);
                    if (this.linear) {
                        this.horizontal = Math.round(Math.cos(angle)) * this.speed * this.reverse * (60 / 1000);
                        this.vertical = Math.round(Math.sin(angle)) * this.speed * this.reverse * (60 / 1000);
                    } else {
                        this.horizontal = Math.cos(angle) * this.speed * this.reverse * (60 / 1000);
                        this.vertical = Math.sin(angle) * this.speed * this.reverse * (60 / 1000);
                    }
                } else {
                    if (this.horizontal) {
                        this.decelerateHorizontal();
                    }
                    if (this.vertical) {
                        this.decelerateVertical();
                    }
                    this.horizontal = this.vertical = 0;
                }
            } else {
                if (utils.exists(this.left) && x < this.left) {
                    this.horizontal = 1 * this.reverse * this.speed * (60 / 1000);
                } else if (utils.exists(this.right) && x > this.right) {
                    this.horizontal = -1 * this.reverse * this.speed * (60 / 1000);
                } else {
                    this.decelerateHorizontal();
                    this.horizontal = 0;
                }
                if (utils.exists(this.top) && y < this.top) {
                    this.vertical = 1 * this.reverse * this.speed * (60 / 1000);
                } else if (utils.exists(this.bottom) && y > this.bottom) {
                    this.vertical = -1 * this.reverse * this.speed * (60 / 1000);
                } else {
                    this.decelerateVertical();
                    this.vertical = 0;
                }
            }
        }
    }, {
        key: 'decelerateHorizontal',
        value: function decelerateHorizontal() {
            var decelerate = this.parent.plugins['decelerate'];
            if (this.horizontal && decelerate && !this.noDecelerate) {
                decelerate.activate({ x: this.horizontal * this.speed * this.reverse / (1000 / 60) });
            }
        }
    }, {
        key: 'decelerateVertical',
        value: function decelerateVertical() {
            var decelerate = this.parent.plugins['decelerate'];
            if (this.vertical && decelerate && !this.noDecelerate) {
                decelerate.activate({ y: this.vertical * this.speed * this.reverse / (1000 / 60) });
            }
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.horizontal) {
                this.decelerateHorizontal();
            }
            if (this.vertical) {
                this.decelerateVertical();
            }
            this.horizontal = this.vertical = null;
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.paused) {
                return;
            }

            if (this.horizontal || this.vertical) {
                var center = this.parent.center;
                if (this.horizontal) {
                    center.x += this.horizontal * this.speed;
                }
                if (this.vertical) {
                    center.y += this.vertical * this.speed;
                }
                this.parent.moveCenter(center);
                this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' });
            }
        }
    }]);

    return MouseEdges;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb3VzZS1lZGdlcy5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInJldmVyc2UiLCJub0RlY2VsZXJhdGUiLCJsaW5lYXIiLCJyYWRpdXNTcXVhcmVkIiwiTWF0aCIsInBvdyIsInJhZGl1cyIsInJlc2l6ZSIsInNwZWVkIiwiZGlzdGFuY2UiLCJleGlzdHMiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiYm90dG9tIiwiaW5uZXJIZWlnaHQiLCJhbGxvd0J1dHRvbnMiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJlIiwiZGF0YSIsImlkZW50aWZpZXIiLCJidXR0b25zIiwieCIsImdsb2JhbCIsInkiLCJjZW50ZXIiLCJ0b1NjcmVlbiIsImFuZ2xlIiwiYXRhbjIiLCJyb3VuZCIsImNvcyIsInNpbiIsImRlY2VsZXJhdGVIb3Jpem9udGFsIiwiZGVjZWxlcmF0ZVZlcnRpY2FsIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJhY3RpdmF0ZSIsInBhdXNlZCIsIm1vdmVDZW50ZXIiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQSx3QkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLDRIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtBLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtDLE9BQUwsR0FBZUQsUUFBUUMsT0FBUixHQUFrQixDQUFsQixHQUFzQixDQUFDLENBQXRDO0FBQ0EsY0FBS0MsWUFBTCxHQUFvQkYs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aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vdXNlRWRnZXMgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmFsbG93QnV0dG9uc10gYWxsb3dzIHBsdWdpbiB0byBjb250aW51ZSB3b3JraW5nIGV2ZW4gd2hlbiB0aGVyZSdzIGEgbW91c2Vkb3duIGV2ZW50XHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IG1vdXNlLWVkZ2Utc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBtb3VzZS1lZGdlIHN0YXJ0c1xyXG4gICAgICogQGV2ZW50IG1vdXNlLWVkZ2UtZW5kKFZpZXdwb3J0KSBlbWl0dGVkIHdoZW4gbW91c2UtZWRnZSBlbmRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5ub0RlY2VsZXJhdGUgPSBvcHRpb25zLm5vRGVjZWxlcmF0ZVxyXG4gICAgICAgIHRoaXMubGluZWFyID0gb3B0aW9ucy5saW5lYXJcclxuICAgICAgICB0aGlzLnJhZGl1c1NxdWFyZWQgPSBNYXRoLnBvdyhvcHRpb25zLnJhZGl1cywgMilcclxuICAgICAgICB0aGlzLnJlc2l6ZSgpXHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQgfHwgOFxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZVxyXG4gICAgICAgIGlmICh1dGlscy5leGlzdHMoZGlzdGFuY2UpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gZGlzdGFuY2VcclxuICAgICAgICAgICAgdGhpcy50b3AgPSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IHdpbmRvdy5pbm5lckhlaWdodCAtIGRpc3RhbmNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnJhZGl1cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLmxlZnQpID8gb3B0aW9ucy5sZWZ0IDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLnRvcCkgPyBvcHRpb25zLnRvcCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLnJpZ2h0KSA/IHdpbmRvdy5pbm5lcldpZHRoIC0gb3B0aW9ucy5yaWdodCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSB1dGlscy5leGlzdHMob3B0aW9ucy5ib3R0b20pID8gd2luZG93LmlubmVySGVpZ2h0IC0gb3B0aW9ucy5ib3R0b20gOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmFsbG93QnV0dG9ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IHRoaXMudmVydGljYWwgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoKGUuZGF0YS5pZGVudGlmaWVyICE9PSAnTU9VU0UnICYmIGUuZGF0YS5pZGVudGlmaWVyICE9PSAxKSB8fCAoIXRoaXMub3B0aW9ucy5hbGxvd0J1dHRvbnMgJiYgZS5kYXRhLmJ1dHRvbnMgIT09IDApKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhZGl1c1NxdWFyZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnBhcmVudC50b1NjcmVlbih0aGlzLnBhcmVudC5jZW50ZXIpXHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5wb3coY2VudGVyLnggLSB4LCAyKSArIE1hdGgucG93KGNlbnRlci55IC0geSwgMilcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID49IHRoaXMucmFkaXVzU3F1YXJlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGNlbnRlci55IC0geSwgY2VudGVyLnggLSB4KVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZWFyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IE1hdGgucm91bmQoTWF0aC5jb3MoYW5nbGUpKSAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVydGljYWwgPSBNYXRoLnJvdW5kKE1hdGguc2luKGFuZ2xlKSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcml6b250YWwgPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3Jpem9udGFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuZXhpc3RzKHRoaXMubGVmdCkgJiYgeCA8IHRoaXMubGVmdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMSAqIHRoaXMucmV2ZXJzZSAqIHRoaXMuc3BlZWQgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHV0aWxzLmV4aXN0cyh0aGlzLnJpZ2h0KSAmJiB4ID4gdGhpcy5yaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gLTEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5leGlzdHModGhpcy50b3ApICYmIHkgPCB0aGlzLnRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IDEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1dGlscy5leGlzdHModGhpcy5ib3R0b20pICYmIHkgPiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IC0xICogdGhpcy5yZXZlcnNlICogdGhpcy5zcGVlZCAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVWZXJ0aWNhbCgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB4OiAodGhpcy5ob3Jpem9udGFsICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSkgLyAoMTAwMCAvIDYwKSB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB5OiAodGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UpIC8gKDEwMDAgLyA2MCl9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZVZlcnRpY2FsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCB8fCB0aGlzLnZlcnRpY2FsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhvcml6b250YWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlci54ICs9IHRoaXMuaG9yaXpvbnRhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyLnkgKz0gdGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKGNlbnRlcilcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ21vdXNlLWVkZ2VzJyB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==