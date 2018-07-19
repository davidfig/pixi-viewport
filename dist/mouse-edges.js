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
                this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' });
            }
        }
    }]);

    return MouseEdges;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb3VzZS1lZGdlcy5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsInJlcXVpcmUiLCJQbHVnaW4iLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsInJldmVyc2UiLCJub0RlY2VsZXJhdGUiLCJsaW5lYXIiLCJyYWRpdXNTcXVhcmVkIiwiTWF0aCIsInBvdyIsInJhZGl1cyIsInJlc2l6ZSIsInNwZWVkIiwiZGlzdGFuY2UiLCJleGlzdHMiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiYm90dG9tIiwiaW5uZXJIZWlnaHQiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJlIiwiZGF0YSIsImlkZW50aWZpZXIiLCJidXR0b25zIiwieCIsImdsb2JhbCIsInkiLCJjZW50ZXIiLCJ0b1NjcmVlbiIsImFuZ2xlIiwiYXRhbjIiLCJyb3VuZCIsImNvcyIsInNpbiIsImRlY2VsZXJhdGVIb3Jpem9udGFsIiwiZGVjZWxlcmF0ZVZlcnRpY2FsIiwiZGVjZWxlcmF0ZSIsInBsdWdpbnMiLCJhY3RpdmF0ZSIsInBhdXNlZCIsIm1vdmVDZW50ZXIiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsUUFBU0MsUUFBUSxTQUFSLENBQWY7QUFDQSxJQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjs7QUFFQUUsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLHdCQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsNEhBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0EsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLEdBQWtCLENBQWxCLEdBQXNCLENBQUMsQ0FBdEM7QUFDQSxjQUFLQyxZQUFMLEdBQW9CRixRQUFRRSxZQUE1QjtBQUNB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RUFBdEQsQ0FBTCxFQUFwQjtBQUNIO0FBQ0o7QUFsSkw7QUFBQTtBQUFBLDZCQXFKSTtBQUNJLGdCQUFJLEtBQUtrQixVQUFULEVBQ0E7QUFDSSxxQkFBS2dCLG9CQUFMO0FBQ0g7QUFDRCxnQkFBSSxLQUFLZixRQUFULEVBQ0E7QUFDSSxxQkFBS2dCLGtCQUFMO0FBQ0g7QUFDRCxpQkFBS2pCLFVBQUwsR0FBa0IsS0FBS0MsUUFBTCxHQUFnQixJQUFsQztBQUNIO0FBL0pMO0FBQUE7QUFBQSxpQ0FrS0k7QUFDSSxnQkFBSSxLQUFLb0IsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSSxLQUFLckIsVUFBTCxJQUFtQixLQUFLQyxRQUE1QixFQUNBO0FBQ0ksb0JBQU1RLFNBQVMsS0FBSzdCLE1BQUwsQ0FBWTZCLE1BQTNCO0FBQ0Esb0JBQUksS0FBS1QsVUFBVCxFQUNBO0FBQ0lTLDJCQUFPSCxDQUFQLElBQVksS0FBS04sVUFBTCxHQUFrQixLQUFLVixLQUFuQztBQUNIO0FBQ0Qsb0JBQUksS0FBS1csUUFBVCxFQUNBO0FBQ0lRLDJCQUFPRCxDQUFQLElBQVksS0FBS1AsUUFBTCxHQUFnQixLQUFLWCxLQUFqQztBQUNIO0FBQ0QscUJBQUtWLE1BQUwsQ0FBWTBDLFVBQVosQ0FBdUJiLE1BQXZCO0FBQ0EscUJBQUs3QixNQUFMLENBQVkyQyxJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLFVBQVUsS0FBSzVDLE1BQWpCLEVBQXlCNkMsTUFBTSxhQUEvQixFQUExQjtBQUNIO0FBQ0o7QUF0TEw7O0FBQUE7QUFBQSxFQUEwQ2hELE1BQTFDIiwiZmlsZSI6Im1vdXNlLWVkZ2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXRpbHMgPSAgcmVxdWlyZSgnLi91dGlscycpXHJcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTW91c2VFZGdlcyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIFNjcm9sbCB2aWV3cG9ydCB3aGVuIG1vdXNlIGhvdmVycyBuZWFyIG9uZSBvZiB0aGUgZWRnZXMuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucmFkaXVzXSBkaXN0YW5jZSBmcm9tIGNlbnRlciBvZiBzY3JlZW4gaW4gc2NyZWVuIHBpeGVsc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmRpc3RhbmNlXSBkaXN0YW5jZSBmcm9tIGFsbCBzaWRlcyBpbiBzY3JlZW4gcGl4ZWxzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG9wXSBhbHRlcm5hdGl2ZWx5LCBzZXQgdG9wIGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5ib3R0b21dIGFsdGVybmF0aXZlbHksIHNldCBib3R0b20gZGlzdGFuY2UgKGxlYXZlIHVuc2V0IGZvciBubyB0b3Agc2Nyb2xsKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLmxlZnRdIGFsdGVybmF0aXZlbHksIHNldCBsZWZ0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yaWdodF0gYWx0ZXJuYXRpdmVseSwgc2V0IHJpZ2h0IGRpc3RhbmNlIChsZWF2ZSB1bnNldCBmb3Igbm8gdG9wIHNjcm9sbClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD04XSBzcGVlZCBpbiBwaXhlbHMvZnJhbWUgdG8gc2Nyb2xsIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgZGlyZWN0aW9uIG9mIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5ub0RlY2VsZXJhdGVdIGRvbid0IHVzZSBkZWNlbGVyYXRlIHBsdWdpbiBldmVuIGlmIGl0J3MgaW5zdGFsbGVkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxpbmVhcl0gaWYgdXNpbmcgcmFkaXVzLCB1c2UgbGluZWFyIG1vdmVtZW50ICgrLy0gMSwgKy8tIDEpIGluc3RlYWQgb2YgYW5nbGVkIG1vdmVtZW50IChNYXRoLmNvcyhhbmdsZSBmcm9tIGNlbnRlciksIE1hdGguc2luKGFuZ2xlIGZyb20gY2VudGVyKSlcclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgbW91c2UtZWRnZS1zdGFydChWaWV3cG9ydCkgZW1pdHRlZCB3aGVuIG1vdXNlLWVkZ2Ugc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgbW91c2UtZWRnZS1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgd2hlbiBtb3VzZS1lZGdlIGVuZHNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2UgPyAxIDogLTFcclxuICAgICAgICB0aGlzLm5vRGVjZWxlcmF0ZSA9IG9wdGlvbnMubm9EZWNlbGVyYXRlXHJcbiAgICAgICAgdGhpcy5saW5lYXIgPSBvcHRpb25zLmxpbmVhclxyXG4gICAgICAgIHRoaXMucmFkaXVzU3F1YXJlZCA9IE1hdGgucG93KG9wdGlvbnMucmFkaXVzLCAyKVxyXG4gICAgICAgIHRoaXMucmVzaXplKClcclxuICAgICAgICB0aGlzLnNwZWVkID0gb3B0aW9ucy5zcGVlZCB8fCA4XHJcbiAgICB9XHJcblxyXG4gICAgcmVzaXplKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlXHJcbiAgICAgICAgaWYgKHV0aWxzLmV4aXN0cyhkaXN0YW5jZSkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmxlZnQgPSBkaXN0YW5jZVxyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IGRpc3RhbmNlXHJcbiAgICAgICAgICAgIHRoaXMucmlnaHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGRpc3RhbmNlXHJcbiAgICAgICAgICAgIHRoaXMuYm90dG9tID0gd2luZG93LmlubmVySGVpZ2h0IC0gZGlzdGFuY2VcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIXRoaXMucmFkaXVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sZWZ0ID0gdXRpbHMuZXhpc3RzKG9wdGlvbnMubGVmdCkgPyBvcHRpb25zLmxlZnQgOiBudWxsXHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gdXRpbHMuZXhpc3RzKG9wdGlvbnMudG9wKSA/IG9wdGlvbnMudG9wIDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLnJpZ2h0ID0gdXRpbHMuZXhpc3RzKG9wdGlvbnMucmlnaHQpID8gd2luZG93LmlubmVyV2lkdGggLSBvcHRpb25zLnJpZ2h0IDogbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmJvdHRvbSA9IHV0aWxzLmV4aXN0cyhvcHRpb25zLmJvdHRvbSkgPyB3aW5kb3cuaW5uZXJIZWlnaHQgLSBvcHRpb25zLmJvdHRvbSA6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGUuZGF0YS5pZGVudGlmaWVyICE9PSAnTU9VU0UnIHx8IGUuZGF0YS5idXR0b25zICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhZGl1c1NxdWFyZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnBhcmVudC50b1NjcmVlbih0aGlzLnBhcmVudC5jZW50ZXIpXHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5wb3coY2VudGVyLnggLSB4LCAyKSArIE1hdGgucG93KGNlbnRlci55IC0geSwgMilcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID49IHRoaXMucmFkaXVzU3F1YXJlZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGNlbnRlci55IC0geSwgY2VudGVyLnggLSB4KVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZWFyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaG9yaXpvbnRhbCA9IE1hdGgucm91bmQoTWF0aC5jb3MoYW5nbGUpKSAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVydGljYWwgPSBNYXRoLnJvdW5kKE1hdGguc2luKGFuZ2xlKSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcml6b250YWwgPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnNwZWVkICogdGhpcy5yZXZlcnNlICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3Jpem9udGFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmVydGljYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuZXhpc3RzKHRoaXMubGVmdCkgJiYgeCA8IHRoaXMubGVmdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMSAqIHRoaXMucmV2ZXJzZSAqIHRoaXMuc3BlZWQgKiAoNjAgLyAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHV0aWxzLmV4aXN0cyh0aGlzLnJpZ2h0KSAmJiB4ID4gdGhpcy5yaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gLTEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5leGlzdHModGhpcy50b3ApICYmIHkgPCB0aGlzLnRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IDEgKiB0aGlzLnJldmVyc2UgKiB0aGlzLnNwZWVkICogKDYwIC8gMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh1dGlscy5leGlzdHModGhpcy5ib3R0b20pICYmIHkgPiB0aGlzLmJvdHRvbSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZXJ0aWNhbCA9IC0xICogdGhpcy5yZXZlcnNlICogdGhpcy5zcGVlZCAqICg2MCAvIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlY2VsZXJhdGVWZXJ0aWNhbCgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnRpY2FsID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY2VsZXJhdGVIb3Jpem9udGFsKClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkZWNlbGVyYXRlID0gdGhpcy5wYXJlbnQucGx1Z2luc1snZGVjZWxlcmF0ZSddXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB4OiAodGhpcy5ob3Jpem9udGFsICogdGhpcy5zcGVlZCAqIHRoaXMucmV2ZXJzZSkgLyAoMTAwMCAvIDYwKSB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNlbGVyYXRlVmVydGljYWwoKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRlY2VsZXJhdGUgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydkZWNlbGVyYXRlJ11cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbCAmJiBkZWNlbGVyYXRlICYmICF0aGlzLm5vRGVjZWxlcmF0ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRlY2VsZXJhdGUuYWN0aXZhdGUoeyB5OiAodGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWQgKiB0aGlzLnJldmVyc2UpIC8gKDEwMDAgLyA2MCl9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZUhvcml6b250YWwoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVjZWxlcmF0ZVZlcnRpY2FsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ob3Jpem9udGFsID0gdGhpcy52ZXJ0aWNhbCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaG9yaXpvbnRhbCB8fCB0aGlzLnZlcnRpY2FsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhvcml6b250YWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNlbnRlci54ICs9IHRoaXMuaG9yaXpvbnRhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy52ZXJ0aWNhbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2VudGVyLnkgKz0gdGhpcy52ZXJ0aWNhbCAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKGNlbnRlcilcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ21vdXNlLWVkZ2VzJyB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==