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
        }
    }, {
        key: 'up',
        value: function up() {
            if (this.pinching) {
                if (this.parent.getTouchPointers().length <= 2) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJsYXN0Q2VudGVyIiwicGluY2hpbmciLCJlbWl0IiwiZGlydHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7OztBQVFBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE1BQUwsR0FBY0gsUUFBUUcsTUFBdEI7QUFMSjtBQU1DOztBQWpCTDtBQUFBO0FBQUEsK0JBb0JJO0FBQ0ksZ0JBQUksS0FBS0osTUFBTCxDQUFZSyxpQkFBWixNQUFtQyxDQUF2QyxFQUNBO0FBQ0kscUJBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0g7QUFDSjtBQXpCTDtBQUFBO0FBQUEsNkJBMkJTQyxDQTNCVCxFQTRC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LENBQVlxQyxJQUFaLENBQWlCLFdBQWpCLEVBQThCLEtBQUtyQyxNQUFuQztBQUNIO0FBQ0o7QUFDSjtBQTdHTDs7QUFBQTtBQUFBLEVBQXFDSixNQUFyQyIsImZpbGUiOiJwaW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGluY2ggZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm5vRHJhZ10gZGlzYWJsZSB0d28tZmluZ2VyIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0xLjBdIHBlcmNlbnQgdG8gbW9kaWZ5IHBpbmNoIHNwZWVkXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdHdvIGZpbmdlcnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAxLjBcclxuICAgICAgICB0aGlzLm5vRHJhZyA9IG9wdGlvbnMubm9EcmFnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgfVxyXG5cclxuICAgIGRvd24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpID49IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCB8fCAhdGhpcy5hY3RpdmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHggPSBlLmRhdGEuZ2xvYmFsLnhcclxuICAgICAgICBjb25zdCB5ID0gZS5kYXRhLmdsb2JhbC55XHJcblxyXG4gICAgICAgIGNvbnN0IHBvaW50ZXJzID0gdGhpcy5wYXJlbnQuZ2V0VG91Y2hQb2ludGVycygpXHJcbiAgICAgICAgaWYgKHBvaW50ZXJzLmxlbmd0aCA+PSAyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3QgPSBwb2ludGVyc1swXVxyXG4gICAgICAgICAgICBjb25zdCBzZWNvbmQgPSBwb2ludGVyc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBsYXN0ID0gKGZpcnN0Lmxhc3QgJiYgc2Vjb25kLmxhc3QpID8gTWF0aC5zcXJ0KE1hdGgucG93KHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngsIDIpICsgTWF0aC5wb3coc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSwgMikpIDogbnVsbFxyXG4gICAgICAgICAgICBpZiAoZmlyc3QucG9pbnRlcklkID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdC5sYXN0ID0geyB4LCB5IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzZWNvbmQucG9pbnRlcklkID09PSBlLmRhdGEucG9pbnRlcklkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmQubGFzdCA9IHsgeCwgeSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxhc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnQgPSB7IHg6IGZpcnN0Lmxhc3QueCArIChzZWNvbmQubGFzdC54IC0gZmlyc3QubGFzdC54KSAvIDIsIHk6IGZpcnN0Lmxhc3QueSArIChzZWNvbmQubGFzdC55IC0gZmlyc3QubGFzdC55KSAvIDIgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KE1hdGgucG93KHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngsIDIpICsgTWF0aC5wb3coc2Vjb25kLmxhc3QueSAtIGZpcnN0Lmxhc3QueSwgMikpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSAoKGRpc3QgLSBsYXN0KSAvIHRoaXMucGFyZW50LnNjcmVlbldpZHRoKSAqIHRoaXMucGFyZW50LnNjYWxlLnggKiB0aGlzLnBlcmNlbnRcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKz0gY2hhbmdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICs9IGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICAgICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMucGFyZW50LnRvR2xvYmFsKG9sZFBvaW50KVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubm9EcmFnICYmIHRoaXMubGFzdENlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSB0aGlzLmxhc3RDZW50ZXIueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIHRoaXMubGFzdENlbnRlci55XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RDZW50ZXIgPSBwb2ludFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKS5sZW5ndGggPD0gMilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdwaW5jaC1lbmQnLCB0aGlzLnBhcmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==