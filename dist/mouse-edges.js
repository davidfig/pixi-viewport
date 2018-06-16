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
            this.horizontal = this.vertical = null;
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (e.data.identifier !== 'MOUSE' || e.data.buttons !== 0) {
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
            }
        }
    }]);

    return MouseEdges;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb3VzZS1lZGdlcy5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInJldmVyc2UiLCJub0RlY2VsZXJhdGUiLCJsaW5lYXIiLCJyYWRpdXNTcXVhcmVkIiwiTWF0aCIsInBvdyIsInJhZGl1cyIsInJlc2l6ZSIsInNwZWVkIiwiZGlzdGFuY2UiLCJleGlzdHMiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiYm90dG9tIiwiaW5uZXJIZWlnaHQiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJlIiwiZGF0YSIsImlkZW50aWZpZXIiLCJidXR0b25zIiwieCIsImdsb2JhbCIsInkiLCJjZW50ZXIiLCJ0b1NjcmVlbiIsImFuZ2xlIiwiYXRhbjIiLCJyb3VuZCIsImNvcyIsInNpbiIsImRlY2VsZXJhdGVIb3Jpem9udGFsIiwiZGVjZWxlcmF0ZVZlcnRpY2FsIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJhY3RpdmF0ZSIsInBhdXNlZCIsIm1vdmVDZW50ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxRQUFTQyxRQUFRLFNBQVIsQ0FBZjtBQUNBLElBQU1DLFNBQVNELFFBQVEsVUFBUixDQUFmOztBQUVBRSxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsd0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSw0SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQSxPQUFMLEdBQWVBLE9BQWY7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsR0FBa0IsQ0FBbEIsR0FBc0IsQ0FBQyxDQUF0QztBQUNBLGNBQUtDLFlBQUwsR0FBb0JGLFFBQVFFLFlBQTVCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjSCxRQUFRRyxN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SjtBQWxKTDtBQUFBO0FBQUEsNkJBcUpJO0FBQ0ksZ0JBQUksS0FBS2tCLFVBQVQsRUFDQTtBQUNJLHFCQUFLZ0Isb0JBQUw7QUFDSDtBQUNELGdCQUFJLEtBQUtmLFFBQVQsRUFDQTtBQUNJLHFCQUFLZ0Isa0JBQUw7QUFDSDtBQUNELGlCQUFLakIsVUFBTCxHQUFrQixLQUFLQyxRQUFMLEdBQWdCLElBQWxDO0FBQ0g7QUEvSkw7QUFBQTtBQUFBLGlDQWtLSTtBQUNJLGdCQUFJLEtBQUtvQixNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJLEtBQUtyQixVQUFMLElBQW1CLEtBQUtDLFFBQTVCLEVBQ0E7QUFDSSxvQkFBTVEsU0FBUyxLQUFLN0IsTUFBTCxDQUFZNkIsTUFBM0I7QUFDQSxvQkFBSSxLQUFLVCxVQUFULEVBQ0E7QUFDSVMsMkJBQU9ILENBQVAsSUFBWSxLQUFLTixVQUFMLEdBQWtCLEtBQUtWLEtBQW5DO0FBQ0g7QUFDRCxvQkFBSSxLQUFLVyxRQUFULEVBQ0E7QUFDSVEsMkJBQU9ELENBQVAsSUFBWSxLQUFLUCxRQUFMLEdBQWdCLEtBQUtYLEtBQWpDO0FBQ0g7QUFDRCxxQkFBS1YsTUFBTCxDQUFZMEMsVUFBWixDQUF1QmIsTUFBdkI7QUFDSDtBQUNKO0FBckxMOztBQUFBO0FBQUEsRUFBMENoQyxNQUExQyIsImZpbGUiOiJtb3VzZS1lZGdlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHV0aWxzID0gIHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5jb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIE1vdXNlRWRnZXMgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBTY3JvbGwgdmlld3BvcnQgd2hlbiBtb3VzZSBob3ZlcnMgbmVhciBvbmUgb2YgdGhlIGVkZ2VzLlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gZGlzdGFuY2UgZnJvbSBjZW50ZXIgb2Ygc2NyZWVuIGluIHNjcmVlbiBwaXhlbHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5kaXN0YW5jZV0gZGlzdGFuY2UgZnJvbSBhbGwgc2lkZXMgaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvcF0gYWx0ZXJuYXRpdmVseSwgc2V0IHRvcCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuYm90dG9tXSBhbHRlcm5hdGl2ZWx5LCBzZXQgYm90dG9tIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5sZWZ0XSBhbHRlcm5hdGl2ZWx5LCBzZXQgbGVmdCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmlnaHRdIGFsdGVybmF0aXZlbHksIHNldCByaWdodCBkaXN0YW5jZSAobGVhdmUgdW5zZXQgZm9yIG5vIHRvcCBzY3JvbGwpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9OF0gc3BlZWQgaW4gcGl4ZWxzL2ZyYW1lIHRvIHNjcm9sbCB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIGRpcmVjdGlvbiBvZiBzY3JvbGxcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EZWNlbGVyYXRlXSBkb24ndCB1c2UgZGVjZWxlcmF0ZSBwbHVnaW4gZXZlbiBpZiBpdCdzIGluc3RhbGxlZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5saW5lYXJdIGlmIHVzaW5nIHJhZGl1cywgdXNlIGxpbmVhciBtb3ZlbWVudCAoKy8tIDEsICsvLSAxKSBpbnN0ZWFkIG9mIGFuZ2xlZCBtb3ZlbWVudCAoTWF0aC5jb3MoYW5nbGUgZnJvbSBjZW50ZXIpLCBNYXRoLnNpbihhbmdsZSBmcm9tIGNlbnRlcikpXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IG1vdXNlLWVkZ2Utc3RhcnQoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBtb3VzZS1lZGdlIHN0YXJ0c1xyXG4gICAgICogQGV2ZW50IG1vdXNlLWVkZ2UtZW5kKFZpZXdwb3J0KSBlbWl0dGVkIHdoZW4gbW91c2UtZWRnZSBlbmRzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlID8gMSA6IC0xXHJcbiAgICAgICAgdGhpcy5ub0RlY2VsZXJhdGUgPSBvcHRpb25zLm5vRGVjZWxlcmF0ZVxyXG4gICAgICAgIHRoaXMubGluZWFyID0gb3B0aW9ucy5saW5lYXJcclxuICAgICAgICB0aGlzLnJhZGl1c1NxdWFyZWQgPSBNYXRoLnBvdyhvcHRpb25zLnJhZGl1cywgMilcclxuICAgICAgICB0aGlzLnJlc2l6ZSgpXHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQgfHwgOFxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9uc1xyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZVxyXG4gICAgICAgIGlmICh1dGlscy5leGlzdHMoZGlzdGFuY2UpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gZGlzdGFuY2VcclxuICAgICAgICAgICAgdGhpcy50b3AgPSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gd2luZG93LmlubmVyV2lkdGggLSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IHdpbmRvdy5pbm5lckhlaWdodCAtIGRpc3RhbmNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCF0aGlzLnJhZGl1cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGVmdCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLmxlZnQpID8gb3B0aW9ucy5sZWZ0IDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLnRvcCkgPyBvcHRpb25zLnRvcCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5yaWdodCA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLnJpZ2h0KSA/IHdpbmRvdy5pbm5lcldpZHRoIC0gb3B0aW9ucy5yaWdodCA6IG51bGxcclxuICAgICAgICAgICAgdGhpcy5ib3R0b20gPSB1dGlscy5leGlzdHMob3B0aW9ucy5ib3R0b20pID8gd2luZG93LmlubmVySGVpZ2h0IC0gb3B0aW9ucy5ib3R0b20gOiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IHRoaXMudmVydGljYWwgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlLmRhdGEuaWRlbnRpZmllciAhPT0gJ01PVVNFJyB8fCBlLmRhdGEuYnV0dG9ucyAhPT0gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB4ID0gZS5kYXRhLmdsb2JhbC54XHJcbiAgICAgICAgY29uc3QgeSA9IGUuZGF0YS5nbG9iYWwueVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yYWRpdXNTcXVhcmVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQudG9TY3JlZW4odGhpcy5wYXJlbnQuY2VudGVyKVxyXG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGgucG93KGNlbnRlci54IC0geCwgMikgKyBNYXRoLnBvdyhjZW50ZXIueSAtIHksIDIpXHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+PSB0aGlzLnJhZGl1c1NxdWFyZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihjZW50ZXIueSAtIHksIGNlbnRlci54IC0geClcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmVhcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcml6b250YWwgPSBNYXRoLnJvdW5kKE1hdGguY29zKGFuZ2xlKSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gTWF0aC5yb3VuZChNYXRoLnNpbihhbmdsZSkpICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gTWF0aC5jb3MoYW5nbGUpICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IE1hdGguc2luKGFuZ2xlKSAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcnRpY2FsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZVZlcnRpY2FsKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IHRoaXMudmVydGljYWwgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmV4aXN0cyh0aGlzLmxlZnQpICYmIHggPCB0aGlzLmxlZnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IDEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1dGlscy5leGlzdHModGhpcy5yaWdodCkgJiYgeCA+IHRoaXMucmlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IC0xICogdGhpcy5yZXZlcnNlICogdGhpcy5zcGVlZCAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuZXhpc3RzKHRoaXMudG9wKSAmJiB5IDwgdGhpcy50b3ApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVydGljYWwgPSAxICogdGhpcy5yZXZlcnNlICogdGhpcy5zcGVlZCAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodXRpbHMuZXhpc3RzKHRoaXMuYm90dG9tKSAmJiB5ID4gdGhpcy5ib3R0b20pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVydGljYWwgPSAtMSAqIHRoaXMucmV2ZXJzZSAqIHRoaXMuc3BlZWQgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNlbGVyYXRlSG9yaXpvbnRhbCgpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZGVjZWxlcmF0ZSA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2RlY2VsZXJhdGUnXVxyXG4gICAgICAgIGlmICh0aGlzLmhvcml6b250YWwgJiYgZGVjZWxlcmF0ZSAmJiAhdGhpcy5ub0RlY2VsZXJhdGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkZWNlbGVyYXRlLmFjdGl2YXRlKHsgeDogKHRoaXMuaG9yaXpvbnRhbCAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UpIC8gKDEwMDAgLyA2MCkgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVjZWxlcmF0ZVZlcnRpY2FsKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwgJiYgZGVjZWxlcmF0ZSAmJiAhdGhpcy5ub0RlY2VsZXJhdGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkZWNlbGVyYXRlLmFjdGl2YXRlKHsgeTogKHRoaXMudmVydGljYWwgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlKSAvICgxMDAwIC8gNjApfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmhvcml6b250YWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVWZXJ0aWNhbCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IHRoaXMudmVydGljYWwgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhvcml6b250YWwgfHwgdGhpcy52ZXJ0aWNhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgICAgICBpZiAodGhpcy5ob3Jpem9udGFsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXIueCArPSB0aGlzLmhvcml6b250YWwgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlci55ICs9IHRoaXMudmVydGljYWwgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcihjZW50ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19