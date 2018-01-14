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
                    this.moved = true;
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
                    this.moved = false;
                    this.parent.emit('pinch-end', this.parent);
                }
            }
        }
    }]);

    return Pinch;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9waW5jaC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50Iiwibm9EcmFnIiwiY2VudGVyIiwiY291bnREb3duUG9pbnRlcnMiLCJhY3RpdmUiLCJlIiwicGF1c2VkIiwieCIsImRhdGEiLCJnbG9iYWwiLCJ5IiwicG9pbnRlcnMiLCJnZXRUb3VjaFBvaW50ZXJzIiwibGVuZ3RoIiwiZmlyc3QiLCJzZWNvbmQiLCJsYXN0IiwiTWF0aCIsInNxcnQiLCJwb3ciLCJwb2ludGVySWQiLCJvbGRQb2ludCIsInBvaW50IiwidG9Mb2NhbCIsImRpc3QiLCJjaGFuZ2UiLCJzY3JlZW5XaWR0aCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJsYXN0Q2VudGVyIiwibW92ZWQiLCJwaW5jaGluZyIsImVtaXQiLCJkaXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7O0FBUUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjSCxRQUFRRyxNQUF0QjtBQUxKO0FBTUM7O0FBakJMO0FBQUE7QUFBQSwrQkFvQkk7QUFDSSxnQkFBSSxLQUFLSixNQUFMLENBQVlLLGlCQUFaLE1BQW1DLENBQXZDLEVBQ0E7QUFDSSxxQkFBS0MsTUFBTCxHQUFjLElBQWQ7QUFDSDtBQUNKO0FBekJMO0FBQUE7QUFBQSw2QkEyQlNDLENB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LFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSx5QkFBS0QsS0FBTCxHQUFhLEtBQWI7QUFDQSx5QkFBS3BDLE1BQUwsQ0FBWXNDLElBQVosQ0FBaUIsV0FBakIsRUFBOEIsS0FBS3RDLE1BQW5DO0FBQ0g7QUFDSjtBQUNKO0FBL0dMOztBQUFBO0FBQUEsRUFBcUNKLE1BQXJDIiwiZmlsZSI6InBpbmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQaW5jaCBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubm9EcmFnXSBkaXNhYmxlIHR3by1maW5nZXIgZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5wZXJjZW50PTEuMF0gcGVyY2VudCB0byBtb2RpZnkgcGluY2ggc3BlZWRcclxuICAgICAqIEBwYXJhbSB7UElYSS5Qb2ludH0gW29wdGlvbnMuY2VudGVyXSBwbGFjZSB0aGlzIHBvaW50IGF0IGNlbnRlciBkdXJpbmcgem9vbSBpbnN0ZWFkIG9mIGNlbnRlciBvZiB0d28gZmluZ2Vyc1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDEuMFxyXG4gICAgICAgIHRoaXMubm9EcmFnID0gb3B0aW9ucy5ub0RyYWdcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgPj0gMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkIHx8ICF0aGlzLmFjdGl2ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgeCA9IGUuZGF0YS5nbG9iYWwueFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLmRhdGEuZ2xvYmFsLnlcclxuXHJcbiAgICAgICAgY29uc3QgcG9pbnRlcnMgPSB0aGlzLnBhcmVudC5nZXRUb3VjaFBvaW50ZXJzKClcclxuICAgICAgICBpZiAocG9pbnRlcnMubGVuZ3RoID49IDIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBmaXJzdCA9IHBvaW50ZXJzWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IHNlY29uZCA9IHBvaW50ZXJzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGxhc3QgPSAoZmlyc3QubGFzdCAmJiBzZWNvbmQubGFzdCkgPyBNYXRoLnNxcnQoTWF0aC5wb3coc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCwgMikgKyBNYXRoLnBvdyhzZWNvbmQubGFzdC55IC0gZmlyc3QubGFzdC55LCAyKSkgOiBudWxsXHJcbiAgICAgICAgICAgIGlmIChmaXJzdC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZpcnN0Lmxhc3QgPSB7IHgsIHkgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlY29uZC5wb2ludGVySWQgPT09IGUuZGF0YS5wb2ludGVySWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZC5sYXN0ID0geyB4LCB5IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGFzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludCA9IHsgeDogZmlyc3QubGFzdC54ICsgKHNlY29uZC5sYXN0LnggLSBmaXJzdC5sYXN0LngpIC8gMiwgeTogZmlyc3QubGFzdC55ICsgKHNlY29uZC5sYXN0LnkgLSBmaXJzdC5sYXN0LnkpIC8gMiB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3QgPSBNYXRoLnNxcnQoTWF0aC5wb3coc2Vjb25kLmxhc3QueCAtIGZpcnN0Lmxhc3QueCwgMikgKyBNYXRoLnBvdyhzZWNvbmQubGFzdC55IC0gZmlyc3QubGFzdC55LCAyKSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9ICgoZGlzdCAtIGxhc3QpIC8gdGhpcy5wYXJlbnQuc2NyZWVuV2lkdGgpICogdGhpcy5wYXJlbnQuc2NhbGUueCAqIHRoaXMucGVyY2VudFxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCArPSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKz0gY2hhbmdlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5ub0RyYWcgJiYgdGhpcy5sYXN0Q2VudGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIHRoaXMubGFzdENlbnRlci54XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gdGhpcy5sYXN0Q2VudGVyLnlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdENlbnRlciA9IHBvaW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kaXJ0eSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXAoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBpbmNoaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50LmdldFRvdWNoUG9pbnRlcnMoKS5sZW5ndGggPD0gMilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2VudGVyID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5waW5jaGluZyA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVkID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3BpbmNoLWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19