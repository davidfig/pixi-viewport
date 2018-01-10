'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Pinch, _Plugin);

    /**
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {boolean} [options.noDrag] disable two-finger dragging
     * @param {number} [options.percent=1.0] percent to modify pinch speed
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of two fingers
     */
    function Pinch(parent, options) {
        _classCallCheck(this, Pinch);

        var _this = _possibleConstructorReturn(this, (Pinch.__proto__ || Object.getPrototypeOf(Pinch)).call(this, parent));

        options = options || {};
        _this.percent = options.percent || 1.0;
        _this.noDrag = options.noDrag;
        _this.center = options.center;
        return _this;
    }

    _createClass(Pinch, [{
        key: 'down',
        value: function down() {
            if (this.parent.countDownPointers() >= 2) {
                this.active = true;
            }
        }
    }, {
        key: 'move',
        value: function move(e) {
            if (this.paused || !this.active) {
                return;
            }

            var x = e.data.global.x;
            var y = e.data.global.y;

            var pointers = this.parent.trackedPointers;
            var first = pointers[0];
            var second = pointers[1];
            var last = void 0;
            if (first.last && second.last) {
                last = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2));
            }
            if (first.pointerId === e.data.pointerId) {
                first.last = { x: x, y: y };
            } else if (second.pointerId === e.data.pointerId) {
                second.last = { x: x, y: y };
            }
            if (last) {
                var oldPoint = void 0;
                var point = { x: first.last.x + (second.last.x - first.last.x) / 2, y: first.last.y + (second.last.y - first.last.y) / 2 };
                if (!this.center) {
                    oldPoint = this.parent.toLocal(point);
                }
                var dist = Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2));
                var change = (dist - last) / this.parent.screenWidth * this.parent.scale.x * this.percent;
                this.parent.scale.x += change;
                this.parent.scale.y += change;
                var clamp = this.parent.plugins['clamp-zoom'];
                if (clamp) {
                    clamp.clamp();
                }
                if (this.center) {
                    this.parent.moveCenter(this.center);
                } else {
                    var newPoint = this.parent.toGlobal(oldPoint);
                    this.parent.x += point.x - newPoint.x;
                    this.parent.y += point.y - newPoint.y;
                }

                if (!this.noDrag && this.lastCenter) {
                    this.parent.x += point.x - this.lastCenter.x;
                    this.parent.y += point.y - this.lastCenter.y;
                }
                this.lastCenter = point;
            } else {
                if (!this.pinching) {
                    this.parent.emit('pinch-start', this.parent);
                    this.pinching = true;
                }
            }
            this.parent.dirty = true;
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.pinching) {
                if (this.parent.countDownPointers() <= 2) {
                    this.active = false;
                    this.lastCenter = null;
                    this.pinching = false;
                    this.parent.emit('pinch-end', this.parent);
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJ0cmFja2VkUG9pbnRlcnMiLCJmaXJzdCIsInNlY29uZCIsImxhc3QiLCJNYXRoIiwic3FydCIsInBvdyIsInBvaW50ZXJJZCIsIm9sZFBvaW50IiwicG9pbnQiLCJ0b0xvY2FsIiwiZGlzdCIsImNoYW5nZSIsInNjcmVlbldpZHRoIiwic2NhbGUiLCJjbGFtcCIsInBsdWdpbnMiLCJtb3ZlQ2VudGVyIiwibmV3UG9pbnQiLCJ0b0dsb2JhbCIsImxhc3RDZW50ZXIiLCJwaW5jaGluZyIsImVtaXQiLCJkaXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7QUFPQSxtQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLGtIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLE9BQUwsR0FBZUQsUUFBUUMsT0FBUixJQUFtQixHQUFsQztBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBdEI7QUFDQSxjQUFLQyxNQUFMLEdBQWNILFFBQVFHLE1BQXRCO0FBTEo7QUFNQzs7QUFoQkw7QUFBQTtBQUFBLCtCQW1CSTtBQUNJLGdCQUFJLEtBQUtKLE1BQUwsQ0FBWUssaUJBQVosTUFBbUMsQ0FBdkMsRUFDQTtBQUNJLHFCQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNIO0FBQ0o7QUF4Qkw7QUFBQTtBQUFBLDZCQTBCU0MsQ0ExQlQsRUEyQkk7QUFDSSxnQkFB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R0w7O0FBQUE7QUFBQSxFQUFxQ0osTUFBckMiLCJmaWxlIjoicGluY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBpbmNoIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAxLjBcclxuICAgICAgICB0aGlzLm5vRHJhZyA9IG9wdGlvbnMubm9EcmFnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID49IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCB8fCAhdGhpcy5hY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy5wYXJlbnQudHJhY2tlZFBvaW50ZXJzXHJcbiAgICAgICAgY29uc3QgZmlyc3QgPSBwb2ludGVyc1swXVxyXG4gICAgICAgIGNvbnN0IHNlY29uZCA9IHBvaW50ZXJzWzFdXHJcbiAgICAgICAgbGV0IGxhc3RcclxuICAgICAgICBpZiAoZmlyc3QubGFzdCAmJiBzZWNvbmQubGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxhc3QgPSBNYXRoLnNxcnQoTWF0aC5wb3coc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCwgMikgKyBNYXRoLnBvdyhzZWNvbmQubGFzdC55IC0gZmlyc3QubGFzdC55LCAyKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZpcnN0LnBvaW50ZXJJZCA9PT0gZS5kYXRhLnBvaW50ZXJJZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZpcnN0Lmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChzZWNvbmQucG9pbnRlcklkID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc2Vjb25kLmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobGFzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IHsgeDogZmlyc3QubGFzdC54ICsgKHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngpIC8gMiwgeTogZmlyc3QubGFzdC55ICsgKHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnkpIC8gMiB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KE1hdGgucG93KHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngsIDIpICsgTWF0aC5wb3coc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSwgMikpXHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9ICgoZGlzdCAtIGxhc3QpIC8gdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpICogdGhpcy5wYXJlbnQuc2NhbGUueCAqIHRoaXMucGVyY2VudFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMucGFyZW50LnRvR2xvYmFsKG9sZFBvaW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMubm9EcmFnICYmIHRoaXMubGFzdENlbnRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gdGhpcy5sYXN0Q2VudGVyLnhcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIHRoaXMubGFzdENlbnRlci55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gcG9pbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdwaW5jaC1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICB1cCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGluY2hpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuY291bnREb3duUG9pbnRlcnMoKSA8PSAyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDZW50ZXIgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19