'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var exists = require('exists');
var Angle = require('yy-angle');

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
            if (exists(distance)) {
                this.left = distance;
                this.top = distance;
                this.right = window.innerWidth - distance;
                this.bottom = window.innerHeight - distance;
            } else if (!this.radius) {
                this.left = exists(options.left) ? options.left : null;
                this.top = exists(options.top) ? options.top : null;
                this.right = exists(options.right) ? window.innerWidth - options.right : null;
                this.bottom = exists(options.bottom) ? window.innerHeight - options.bottom : null;
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
                var distance = Angle.distanceTwoPointsSquared(center.x, center.y, x, y);
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
                if (exists(this.left) && x < this.left) {
                    this.horizontal = 1 * this.reverse * this.speed * (60 / 1000);
                } else if (exists(this.right) && x > this.right) {
                    this.horizontal = -1 * this.reverse * this.speed * (60 / 1000);
                } else {
                    this.decelerateHorizontal();
                    this.horizontal = 0;
                }
                if (exists(this.top) && y < this.top) {
                    this.vertical = 1 * this.reverse * this.speed * (60 / 1000);
                } else if (exists(this.bottom) && y > this.bottom) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb3VzZS1lZGdlcy5qcyJdLCJuYW1lcyI6WyJleGlzdHMiLCJyZXF1aXJlIiwiQW5nbGUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInJldmVyc2UiLCJub0RlY2VsZXJhdGUiLCJsaW5lYXIiLCJyYWRpdXNTcXVhcmVkIiwiTWF0aCIsInBvdyIsInJhZGl1cyIsInJlc2l6ZSIsInNwZWVkIiwiZGlzdGFuY2UiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiYm90dG9tIiwiaW5uZXJIZWlnaHQiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJlIiwiZGF0YSIsImlkZW50aWZpZXIiLCJidXR0b25zIiwieCIsImdsb2JhbCIsInkiLCJjZW50ZXIiLCJ0b1NjcmVlbiIsImRpc3RhbmNlVHdvUG9pbnRzU3F1YXJlZCIsImFuZ2xlIiwiYXRhbjIiLCJyb3VuZCIsImNvcyIsInNpbiIsImRlY2VsZXJhdGVIb3Jpem9udGFsIiwiZGVjZWxlcmF0ZVZlcnRpY2FsIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJhY3RpdmF0ZSIsInBhdXNlZCIsIm1vdmVDZW50ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFFBQVIsQ0FBZjtBQUNBLElBQU1DLFFBQVFELFFBQVEsVUFBUixDQUFkOztBQUVBLElBQU1FLFNBQVNGLFFBQVEsVUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsd0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSw0SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQSxPQUFMLEdBQWVBLE9BQWY7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsR0FBa0IsQ0FBbEIsR0FBc0IsQ0FBQyxDQUF0QztBQUNB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LEtBQUtoQixRQUFULEVBQ0E7QUFDSSxxQkFBS2lCLGtCQUFMO0FBQ0g7QUFDRCxpQkFBS2xCLFVBQUwsR0FBa0IsS0FBS0MsUUFBTCxHQUFnQixJQUFsQztBQUNIO0FBL0pMO0FBQUE7QUFBQSxpQ0FrS0k7QUFDSSxnQkFBSSxLQUFLcUIsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSSxLQUFLdEIsVUFBTCxJQUFtQixLQUFLQyxRQUE1QixFQUNBO0FBQ0ksb0JBQU1RLFNBQVMsS0FBSzVCLE1BQUwsQ0FBWTRCLE1BQTNCO0FBQ0Esb0JBQUksS0FBS1QsVUFBVCxFQUNBO0FBQ0lTLDJCQUFPSCxDQUFQLElBQVksS0FBS04sVUFBTCxHQUFrQixLQUFLVCxLQUFuQztBQUNIO0FBQ0Qsb0JBQUksS0FBS1UsUUFBVCxFQUNBO0FBQ0lRLDJCQUFPRCxDQUFQLElBQVksS0FBS1AsUUFBTCxHQUFnQixLQUFLVixLQUFqQztBQUNIO0FBQ0QscUJBQUtWLE1BQUwsQ0FBWTBDLFVBQVosQ0FBdUJkLE1BQXZCO0FBQ0g7QUFDSjtBQXJMTDs7QUFBQTtBQUFBLEVBQTBDL0IsTUFBMUMiLCJmaWxlIjoibW91c2UtZWRnZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBleGlzdHMgPSByZXF1aXJlKCdleGlzdHMnKVxyXG5jb25zdCBBbmdsZSA9IHJlcXVpcmUoJ3l5LWFuZ2xlJylcclxuXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW91c2VFZGdlcyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yaWdodF0gYWx0ZXJuYXRpdmVseSwgc2V0IHJpZ2h0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgbW91c2UtZWRnZS1zdGFydChWaWV3cG9ydCkgZW1pdHRlZCB3aGVuIG1vdXNlLWVkZ2Ugc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgbW91c2UtZWRnZS1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBtb3VzZS1lZGdlIGVuZHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLm5vRGVjZWxlcmF0ZSA9IG9wdGlvbnMubm9EZWNlbGVyYXRlXHJcbiAgICAgICAgdGhpcy5saW5lYXIgPSBvcHRpb25zLmxpbmVhclxyXG4gICAgICAgIHRoaXMucmFkaXVzU3F1YXJlZCA9IE1hdGgucG93KG9wdGlvbnMucmFkaXVzLCAyKVxyXG4gICAgICAgIHRoaXMucmVzaXplKClcclxuICAgICAgICB0aGlzLnNwZWVkID0gb3B0aW9ucy5zcGVlZCB8fCA4XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlXHJcbiAgICAgICAgaWYgKGV4aXN0cyhkaXN0YW5jZSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IGRpc3RhbmNlXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGRpc3RhbmNlXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gd2luZG93LmlubmVySGVpZ2h0IC0gZGlzdGFuY2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIXRoaXMucmFkaXVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gZXhpc3RzKG9wdGlvbnMubGVmdCkgPyBvcHRpb25zLmxlZnQgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gZXhpc3RzKG9wdGlvbnMudG9wKSA/IG9wdGlvbnMudG9wIDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gZXhpc3RzKG9wdGlvbnMucmlnaHQpID8gd2luZG93LmlubmVyV2lkdGggLSBvcHRpb25zLnJpZ2h0IDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IGV4aXN0cyhvcHRpb25zLmJvdHRvbSkgPyB3aW5kb3cuaW5uZXJIZWlnaHQgLSBvcHRpb25zLmJvdHRvbSA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5pZGVudGlmaWVyICE9PSAnTU9VU0UnIHx8IGUuZGF0YS5idXR0b25zICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhZGl1c1NxdWFyZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnBhcmVudC50b1NjcmVlbih0aGlzLnBhcmVudC5jZW50ZXIpXHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gQW5nbGUuZGlzdGFuY2VUd29Qb2ludHNTcXVhcmVkKGNlbnRlci54LCBjZW50ZXIueSwgeCwgeSlcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID49IHRoaXMucmFkaXVzU3F1YXJlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGNlbnRlci55IC0geSwgY2VudGVyLnggLSB4KVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZWFyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IE1hdGgucm91bmQoTWF0aC5jb3MoYW5nbGUpKSAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVydGljYWwgPSBNYXRoLnJvdW5kKE1hdGguc2luKGFuZ2xlKSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcml6b250YWwgPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3Jpem9udGFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZXhpc3RzKHRoaXMubGVmdCkgJiYgeCA8IHRoaXMubGVmdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMSAqIHRoaXMucmV2ZXJzZSAqIHRoaXMuc3BlZWQgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGV4aXN0cyh0aGlzLnJpZ2h0KSAmJiB4ID4gdGhpcy5yaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gLTEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChleGlzdHModGhpcy50b3ApICYmIHkgPCB0aGlzLnRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IDEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChleGlzdHModGhpcy5ib3R0b20pICYmIHkgPiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IC0xICogdGhpcy5yZXZlcnNlICogdGhpcy5zcGVlZCAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVWZXJ0aWNhbCgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB4OiAodGhpcy5ob3Jpem9udGFsICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSkgLyAoMTAwMCAvIDYwKSB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB5OiAodGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UpIC8gKDEwMDAgLyA2MCl9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZVZlcnRpY2FsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCB8fCB0aGlzLnZlcnRpY2FsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhvcml6b250YWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlci54ICs9IHRoaXMuaG9yaXpvbnRhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyLnkgKz0gdGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKGNlbnRlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=