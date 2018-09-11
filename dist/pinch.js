'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Pinch, _Plugin);

    /**
     * @private
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

            var pointers = this.parent.getTouchPointers();
            if (pointers.length >= 2) {
                var first = pointers[0];
                var second = pointers[1];
                var last = first.last && second.last ? Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2)) : null;
                if (first.pointerId === e.data.pointerId) {
                    first.last = { x: x, y: y, data: e.data };
                } else if (second.pointerId === e.data.pointerId) {
                    second.last = { x: x, y: y, data: e.data };
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
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'pinch' });
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
                        this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                    }
                    if (!this.noDrag && this.lastCenter) {
                        this.parent.x += point.x - this.lastCenter.x;
                        this.parent.y += point.y - this.lastCenter.y;
                        this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                    }
                    this.lastCenter = point;
                    this.moved = true;
                } else {
                    if (!this.pinching) {
                        this.parent.emit('pinch-start', this.parent);
                        this.pinching = true;
                    }
                }
            }
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.pinching) {
                if (this.parent.touches.length <= 1) {
                    this.active = false;
                    this.lastCenter = null;
                    this.pinching = false;
                    this.moved = false;
                    this.parent.emit('pinch-end', this.parent);
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsImNsYW1wIiwicGx1Z2lucyIsIm1vdmVDZW50ZXIiLCJuZXdQb2ludCIsInRvR2xvYmFsIiwibGFzdENlbnRlciIsIm1vdmVkIiwicGluY2hpbmciLCJ0b3VjaGVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSxtQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLGtIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLE9BQUwsR0FBZUQsUUFBUUMsT0FBUixJQUFtQixHQUFsQztBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBdEI7QUFDQSxjQUFLQyxNQUFMLEdBQWNILFFBQVFHLE1BQXRCO0FBTEo7QUFNQzs7QUFqQkw7QUFBQTtBQUFBLCtCQW9CSTtBQUNJLGdCQUFJLEtBQUtKLE1BQUwsQ0FBWUssaUJBQVosTUFBbUMsQ0FBdkMsRUFDQTtBQUNJLHFCQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNIO0FBQ0o7QUF6Qkw7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Q0FBQyxLQUFLQyxRQUFWLEVBQ0E7QUFDSSw2QkFBS3hDLE1BQUwsQ0FBWThCLElBQVosQ0FBaUIsYUFBakIsRUFBZ0MsS0FBSzlCLE1BQXJDO0FBQ0EsNkJBQUt3QyxRQUFMLEdBQWdCLElBQWhCO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7QUFsR0w7QUFBQTtBQUFBLDZCQXFHSTtBQUNJLGdCQUFJLEtBQUtBLFFBQVQsRUFDQTtBQUNJLG9CQUFJLEtBQUt4QyxNQUFMLENBQVl5QyxPQUFaLENBQW9CMUIsTUFBcEIsSUFBOEIsQ0FBbEMsRUFDQTtBQUNJLHlCQUFLVCxNQUFMLEdBQWMsS0FBZDtBQUNBLHlCQUFLZ0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLHlCQUFLRSxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EseUJBQUtELEtBQUwsR0FBYSxLQUFiO0FBQ0EseUJBQUt2QyxNQUFMLENBQVk4QixJQUFaLENBQWlCLFdBQWpCLEVBQThCLEtBQUs5QixNQUFuQztBQUNIO0FBQ0o7QUFDSjtBQWpITDs7QUFBQTtBQUFBLEVBQXFDSixNQUFyQyIsImZpbGUiOiJwaW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGluY2ggZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAxLjBcclxuICAgICAgICB0aGlzLm5vRHJhZyA9IG9wdGlvbnMubm9EcmFnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID49IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCB8fCAhdGhpcy5hY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy5wYXJlbnQuZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICAgICAgaWYgKHBvaW50ZXJzLmxlbmd0aCA+PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3QgPSBwb2ludGVyc1swXVxyXG4gICAgICAgICAgICBjb25zdCBzZWNvbmQgPSBwb2ludGVyc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gKGZpcnN0Lmxhc3QgJiYgc2Vjb25kLmxhc3QpID8gTWF0aC5zcXJ0KE1hdGgucG93KHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngsIDIpICsgTWF0aC5wb3coc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSwgMikpIDogbnVsbFxyXG4gICAgICAgICAgICBpZiAoZmlyc3QucG9pbnRlcklkID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdC5sYXN0ID0geyB4LCB5LCBkYXRhOiBlLmRhdGEgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZC5sYXN0ID0geyB4LCB5LCBkYXRhOiBlLmRhdGEgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50ID0geyB4OiBmaXJzdC5sYXN0LnggKyAoc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCkgLyAyLCB5OiBmaXJzdC5sYXN0LnkgKyAoc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSkgLyAyIH1cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdCA9IE1hdGguc3FydChNYXRoLnBvdyhzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54LCAyKSArIE1hdGgucG93KHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnksIDIpKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gKChkaXN0IC0gbGFzdCkgLyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICogdGhpcy5wZXJjZW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSArPSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAncGluY2gnIH0pXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAncGluY2gnIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubm9EcmFnICYmIHRoaXMubGFzdENlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSB0aGlzLmxhc3RDZW50ZXIueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIHRoaXMubGFzdENlbnRlci55XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3BpbmNoJyB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gcG9pbnRcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGluY2hpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgncGluY2gtc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5waW5jaGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3VjaGVzLmxlbmd0aCA8PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDZW50ZXIgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgncGluY2gtZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=