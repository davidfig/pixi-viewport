'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Wheel, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.percent=0.1] percent to scroll with each spin
     * @param {boolean} [options.reverse] reverse the direction of the scroll
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of current mouse position
     *
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    function Wheel(parent, options) {
        _classCallCheck(this, Wheel);

        var _this = _possibleConstructorReturn(this, (Wheel.__proto__ || Object.getPrototypeOf(Wheel)).call(this, parent));

        options = options || {};
        _this.percent = options.percent || 0.1;
        _this.center = options.center;
        _this.reverse = options.reverse;
        return _this;
    }

    _createClass(Wheel, [{
        key: 'getOffset',
        value: function getOffset(evt) {
            var el = this.parent.divWheel,
                x = 0,
                y = 0;

            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }

            x = evt.clientX - x;
            y = evt.clientY - y;

            return { x: x, y: y };
        }
    }, {
        key: 'wheel',
        value: function wheel(e) {
            if (this.paused) {
                return;
            }

            var change = void 0;
            if (this.reverse) {
                change = e.deltaY > 0 ? 1 + this.percent : 1 - this.percent;
            } else {
                change = e.deltaY > 0 ? 1 - this.percent : 1 + this.percent;
            }
            // let point = { x: e.clientX, y: e.clientY }
            var point = this.getOffset(e);
            // console.log(e);
            // console.log(point);
            var oldPoint = void 0;
            if (!this.center) {
                oldPoint = this.parent.toLocal(point);
            }
            this.parent.scale.x *= change;
            this.parent.scale.y *= change;
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
            e.preventDefault();
            this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
        }
    }]);

    return Wheel;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImV2dCIsImVsIiwiZGl2V2hlZWwiLCJ4IiwieSIsImlzTmFOIiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInNjcm9sbExlZnQiLCJzY3JvbGxUb3AiLCJvZmZzZXRQYXJlbnQiLCJjbGllbnRYIiwiY2xpZW50WSIsImUiLCJwYXVzZWQiLCJjaGFuZ2UiLCJkZWx0YVkiLCJwb2ludCIsImdldE9mZnNldCIsIm9sZFBvaW50IiwidG9Mb2NhbCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJwcmV2ZW50RGVmYXVsdCIsImVtaXQiLCJ3aGVlbCIsImR4IiwiZGVsdGFYIiwiZHkiLCJkeiIsImRlbHRhWiIsImV2ZW50Iiwidmlld3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUxKO0FBTUM7O0FBbkJMO0FBQUE7QUFBQSxrQ0FxQmNDLEdBckJkLEVBcUJtQjtBQUNiLGdCQUFJQyxLQUFLLEtBQUtOLE1BQUwsQ0FBWU8sUUFBckI7QUFBQSxnQkFDSUMsSUFBSSxDQURSO0FBQUEsZ0JBRUlDLElBQUksQ0FGUjs7QUFJQSxtQkFBT0gsTUFBTSxDQUFDSSxNQUFNSixHQUFHSyxVQUFULENBQVAsSUFBK0IsQ0FBQ0QsTUFBTUosR0FBR00sU0FBVCxDQUF2QyxFQUE0RDtBQUMxREoscUJBQUtGLEdBQUdLLFVBQUgsR0FBZ0JMLEdBQUdPLFVBQXhCO0FBQ0FKLHFCQUFLSCxHQUFHTSxTQUFILEdBQWVOLEdBQUdRLFNBQXZCO0FBQ0FSLHFCQUFLQSxHQUFHUyxZQUFSO0FBQ0Q7O0FBRURQLGdCQUFJSCxJQUFJVyxPQUFKLEdBQWNSLENBQWxCO0FBQ0FDLGdCQUFJSixJQUFJWSxPQUFKLEdBQWNSLENBQWxCOztBQUVBLG1CQUFPLEVBQUVELEdBQUdBLENBQUwsRUFBUUMsR0FBR0EsQ0FBWCxFQUFQO0FBQ0Q7QUFwQ0w7QUFBQTtBQUFBLDhCQXNDVVMsQ0F0Q1YsRUF1Q0k7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJQyxlQUFKO0FBQ0EsZ0JBQUksS0FBS2hCLE9BQVQsRUFDQTtBQUNJZ0IseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLbkIsT0FBeEIsR0FBa0MsSUFBSSxLQUFLQSxPQUFwRDtBQUNILGFBSEQsTUFLQTtBQUNJa0IseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLbkIsT0FBeEIsR0FBa0MsSUFBSSxLQUFLQSxPQUFwRDtBQUNIO0FBQ0Q7QUFDQSxnQkFBSW9CLFFBQVEsS0FBS0MsU0FBTCxDQUFlTCxDQUFmLENBQVo7QUFDQTtBQUNBO0FBQ0EsZ0JBQUlNLGlCQUFKO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLckIsTUFBVixFQUNBO0FBQ0lxQiwyQkFBVyxLQUFLeEIsTUFBTCxDQUFZeUIsT0FBWixDQUFvQkgsS0FBcEIsQ0FBWDtBQUNIO0FBQ0QsaUJBQUt0QixNQUFMLENBQVkwQixLQUFaLENBQWtCbEIsQ0FBbEIsSUFBdUJZLE1BQXZCO0FBQ0EsaUJBQUtwQixNQUFMLENBQVkwQixLQUFaLENBQWtCakIsQ0FBbEIsSUFBdUJXLE1BQXZCO0FBQ0EsZ0JBQU1PLFFBQVEsS0FBSzNCLE1BQUwsQ0FBWTRCLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLGdCQUFJRCxLQUFKLEVBQ0E7QUFDSUEsc0JBQU1BLEtBQU47QUFDSDs7QUFFRCxnQkFBSSxLQUFLeEIsTUFBVCxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWTZCLFVBQVosQ0FBdUIsS0FBSzFCLE1BQTVCO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksb0JBQU0yQixXQUFXLEtBQUs5QixNQUFMLENBQVkrQixRQUFaLENBQXFCUCxRQUFyQixDQUFqQjtBQUNBLHFCQUFLeEIsTUFBTCxDQUFZUSxDQUFaLElBQWlCYyxNQUFNZCxDQUFOLEdBQVVzQixTQUFTdEIsQ0FBcEM7QUFDQSxxQkFBS1IsTUFBTCxDQUFZUyxDQUFaLElBQWlCYSxNQUFNYixDQUFOLEdBQVVxQixTQUFTckIsQ0FBcEM7QUFDSDtBQUNEUyxjQUFFYyxjQUFGO0FBQ0EsaUJBQUtoQyxNQUFMLENBQVlpQyxJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLE9BQU8sRUFBRUMsSUFBSWpCLEVBQUVrQixNQUFSLEVBQWdCQyxJQUFJbkIsRUFBRUcsTUFBdEIsRUFBOEJpQixJQUFJcEIsRUFBRXFCLE1BQXBDLEVBQVQsRUFBdURDLE9BQU90QixDQUE5RCxFQUFpRXVCLFVBQVUsS0FBS3pDLE1BQWhGLEVBQTFCO0FBQ0g7QUFuRkw7O0FBQUE7QUFBQSxFQUFxQ0osTUFBckMiLCJmaWxlIjoid2hlZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdoZWVsIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICpcclxuICAgICAqIEBldmVudCB3aGVlbCh7d2hlZWw6IHtkeCwgZHksIGR6fSwgZXZlbnQsIHZpZXdwb3J0fSlcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAwLjFcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldE9mZnNldChldnQpIHtcclxuICAgICAgdmFyIGVsID0gdGhpcy5wYXJlbnQuZGl2V2hlZWwsXHJcbiAgICAgICAgICB4ID0gMCxcclxuICAgICAgICAgIHkgPSAwO1xyXG5cclxuICAgICAgd2hpbGUgKGVsICYmICFpc05hTihlbC5vZmZzZXRMZWZ0KSAmJiAhaXNOYU4oZWwub2Zmc2V0VG9wKSkge1xyXG4gICAgICAgIHggKz0gZWwub2Zmc2V0TGVmdCAtIGVsLnNjcm9sbExlZnQ7XHJcbiAgICAgICAgeSArPSBlbC5vZmZzZXRUb3AgLSBlbC5zY3JvbGxUb3A7XHJcbiAgICAgICAgZWwgPSBlbC5vZmZzZXRQYXJlbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHggPSBldnQuY2xpZW50WCAtIHg7XHJcbiAgICAgIHkgPSBldnQuY2xpZW50WSAtIHk7XHJcblxyXG4gICAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2VcclxuICAgICAgICBpZiAodGhpcy5yZXZlcnNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbmdlID0gZS5kZWx0YVkgPiAwID8gMSArIHRoaXMucGVyY2VudCA6IDEgLSB0aGlzLnBlcmNlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbmdlID0gZS5kZWx0YVkgPiAwID8gMSAtIHRoaXMucGVyY2VudCA6IDEgKyB0aGlzLnBlcmNlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbGV0IHBvaW50ID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9XHJcbiAgICAgICAgbGV0IHBvaW50ID0gdGhpcy5nZXRPZmZzZXQoZSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cocG9pbnQpO1xyXG4gICAgICAgIGxldCBvbGRQb2ludFxyXG4gICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvbGRQb2ludCA9IHRoaXMucGFyZW50LnRvTG9jYWwocG9pbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnggKj0gY2hhbmdlXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueSAqPSBjaGFuZ2VcclxuICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCd3aGVlbCcsIHsgd2hlZWw6IHsgZHg6IGUuZGVsdGFYLCBkeTogZS5kZWx0YVksIGR6OiBlLmRlbHRhWiB9LCBldmVudDogZSwgdmlld3BvcnQ6IHRoaXMucGFyZW50fSlcclxuICAgIH1cclxufVxyXG4iXX0=