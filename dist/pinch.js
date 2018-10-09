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
                return true;
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
                return true;
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
                    return true;
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsImNsYW1wIiwicGx1Z2lucyIsIm1vdmVDZW50ZXIiLCJuZXdQb2ludCIsInRvR2xvYmFsIiwibGFzdENlbnRlciIsIm1vdmVkIiwicGluY2hpbmciLCJ0b3VjaGVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSxtQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLGtIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLE9BQUwsR0FBZUQsUUFBUUMsT0FBUixJQUFtQixHQUFsQztBQUNBLGNBQUtDLE1BQUwsR0FBY0YsUUFBUUUsTUFBdEI7QUFDQSxjQUFLQyxNQUFMLEdBQWNILFFBQVFHLE1BQXRCO0FBTEo7QUFNQzs7QUFqQkw7QUFBQTtBQUFBLCtCQW9CSTtBQUNJLGdCQUFJLEtBQUtKLE1BQUwsQ0FBWUssaUJBQVosTUFBbUMsQ0FBdkMsRUFDQTtBQUNJLHFCQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNBLHVCQUFPLElBQVA7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QXVDQTtBQUNJLHdCQUFJLENBQUMsS0FBS0MsUUFBVixFQUNBO0FBQ0ksNkJBQUt4QyxNQUFMLENBQVk4QixJQUFaLENBQWlCLGFBQWpCLEVBQWdDLEtBQUs5QixNQUFyQztBQUNBLDZCQUFLd0MsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0o7QUFDRCx1QkFBTyxJQUFQO0FBQ0g7QUFDSjtBQXBHTDtBQUFBO0FBQUEsNkJBdUdJO0FBQ0ksZ0JBQUksS0FBS0EsUUFBVCxFQUNBO0FBQ0ksb0JBQUksS0FBS3hDLE1BQUwsQ0FBWXlDLE9BQVosQ0FBb0IxQixNQUFwQixJQUE4QixDQUFsQyxFQUNBO0FBQ0kseUJBQUtULE1BQUwsR0FBYyxLQUFkO0FBQ0EseUJBQUtnQyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EseUJBQUtFLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSx5QkFBS0QsS0FBTCxHQUFhLEtBQWI7QUFDQSx5QkFBS3ZDLE1BQUwsQ0FBWThCLElBQVosQ0FBaUIsV0FBakIsRUFBOEIsS0FBSzlCLE1BQW5DO0FBQ0EsMkJBQU8sSUFBUDtBQUNIO0FBQ0o7QUFDSjtBQXBITDs7QUFBQTtBQUFBLEVBQXFDSixNQUFyQyIsImZpbGUiOiJwaW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGluY2ggZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAxLjBcclxuICAgICAgICB0aGlzLm5vRHJhZyA9IG9wdGlvbnMubm9EcmFnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID49IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCB8fCAhdGhpcy5hY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy5wYXJlbnQuZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICAgICAgaWYgKHBvaW50ZXJzLmxlbmd0aCA+PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3QgPSBwb2ludGVyc1swXVxyXG4gICAgICAgICAgICBjb25zdCBzZWNvbmQgPSBwb2ludGVyc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gKGZpcnN0Lmxhc3QgJiYgc2Vjb25kLmxhc3QpID8gTWF0aC5zcXJ0KE1hdGgucG93KHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngsIDIpICsgTWF0aC5wb3coc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSwgMikpIDogbnVsbFxyXG4gICAgICAgICAgICBpZiAoZmlyc3QucG9pbnRlcklkID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdC5sYXN0ID0geyB4LCB5LCBkYXRhOiBlLmRhdGEgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZC5sYXN0ID0geyB4LCB5LCBkYXRhOiBlLmRhdGEgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50ID0geyB4OiBmaXJzdC5sYXN0LnggKyAoc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCkgLyAyLCB5OiBmaXJzdC5sYXN0LnkgKyAoc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSkgLyAyIH1cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdCA9IE1hdGguc3FydChNYXRoLnBvdyhzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54LCAyKSArIE1hdGgucG93KHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnksIDIpKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gKChkaXN0IC0gbGFzdCkgLyB0aGlzLnBhcmVudC5zY3JlZW5XaWR0aCkgKiB0aGlzLnBhcmVudC5zY2FsZS54ICogdGhpcy5wZXJjZW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSArPSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAncGluY2gnIH0pXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAncGluY2gnIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubm9EcmFnICYmIHRoaXMubGFzdENlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSB0aGlzLmxhc3RDZW50ZXIueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIHRoaXMubGFzdENlbnRlci55XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3BpbmNoJyB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gcG9pbnRcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGluY2hpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgncGluY2gtc3RhcnQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5waW5jaGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC50b3VjaGVzLmxlbmd0aCA8PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDZW50ZXIgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpbmNoaW5nID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZWQgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgncGluY2gtZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19