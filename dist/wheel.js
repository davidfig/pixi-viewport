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
            var point = { x: e.clientX, y: e.clientY };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImUiLCJwYXVzZWQiLCJjaGFuZ2UiLCJkZWx0YVkiLCJwb2ludCIsIngiLCJjbGllbnRYIiwieSIsImNsaWVudFkiLCJvbGRQb2ludCIsInRvTG9jYWwiLCJzY2FsZSIsImNsYW1wIiwicGx1Z2lucyIsIm1vdmVDZW50ZXIiLCJuZXdQb2ludCIsInRvR2xvYmFsIiwicHJldmVudERlZmF1bHQiLCJlbWl0Iiwid2hlZWwiLCJkeCIsImRlbHRhWCIsImR5IiwiZHoiLCJkZWx0YVoiLCJldmVudCIsInZpZXdwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7OztBQVVBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE9BQUwsR0FBZUgsUUFBUUcsT0FBdkI7QUFMSjtBQU1DOztBQW5CTDtBQUFBO0FBQUEsOEJBcUJVQyxDQXJCVixFQXNCSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUlDLGVBQUo7QUFDQSxnQkFBSSxLQUFLSCxPQUFULEVBQ0E7QUFDSUcseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLTixPQUF4QixHQUFrQyxJQUFJLEtBQUtBLE9BQXBEO0FBQ0gsYUFIRCxNQUtBO0FBQ0lLLHlCQUFTRixFQUFFRyxNQUFGLEdBQVcsQ0FBWCxHQUFlLElBQUksS0FBS04sT0FBeEIsR0FBa0MsSUFBSSxLQUFLQSxPQUFwRDtBQUNIO0FBQ0QsZ0JBQUlPLFFBQVEsRUFBRUMsR0FBR0wsRUFBRU0sT0FBUCxFQUFnQkMsR0FBR1AsRUFBRVEsT0FBckIsRUFBWjtBQUNBLGdCQUFJQyxpQkFBSjtBQUNBLGdCQUFJLENBQUMsS0FBS1gsTUFBVixFQUNBO0FBQ0lXLDJCQUFXLEtBQUtkLE1BQUwsQ0FBWWUsT0FBWixDQUFvQk4sS0FBcEIsQ0FBWDtBQUNIO0FBQ0QsaUJBQUtULE1BQUwsQ0FBWWdCLEtBQVosQ0FBa0JOLENBQWxCLElBQXVCSCxNQUF2QjtBQUNBLGlCQUFLUCxNQUFMLENBQVlnQixLQUFaLENBQWtCSixDQUFsQixJQUF1QkwsTUFBdkI7QUFDQSxnQkFBTVUsUUFBUSxLQUFLakIsTUFBTCxDQUFZa0IsT0FBWixDQUFvQixZQUFwQixDQUFkO0FBQ0EsZ0JBQUlELEtBQUosRUFDQTtBQUNJQSxzQkFBTUEsS0FBTjtBQUNIOztBQUVELGdCQUFJLEtBQUtkLE1BQVQsRUFDQTtBQUNJLHFCQUFLSCxNQUFMLENBQVltQixVQUFaLENBQXVCLEtBQUtoQixNQUE1QjtBQUNILGFBSEQsTUFLQTtBQUNJLG9CQUFNaUIsV0FBVyxLQUFLcEIsTUFBTCxDQUFZcUIsUUFBWixDQUFxQlAsUUFBckIsQ0FBakI7QUFDQSxxQkFBS2QsTUFBTCxDQUFZVSxDQUFaLElBQWlCRCxNQUFNQyxDQUFOLEdBQVVVLFNBQVNWLENBQXBDO0FBQ0EscUJBQUtWLE1BQUwsQ0FBWVksQ0FBWixJQUFpQkgsTUFBTUcsQ0FBTixHQUFVUSxTQUFTUixDQUFwQztBQUNIO0FBQ0RQLGNBQUVpQixjQUFGO0FBQ0EsaUJBQUt0QixNQUFMLENBQVl1QixJQUFaLENBQWlCLE9BQWpCLEVBQTBCLEVBQUVDLE9BQU8sRUFBRUMsSUFBSXBCLEVBQUVxQixNQUFSLEVBQWdCQyxJQUFJdEIsRUFBRUcsTUFBdEIsRUFBOEJvQixJQUFJdkIsRUFBRXdCLE1BQXBDLEVBQVQsRUFBdURDLE9BQU96QixDQUE5RCxFQUFpRTBCLFVBQVUsS0FBSy9CLE1BQWhGLEVBQTFCO0FBQ0g7QUEvREw7O0FBQUE7QUFBQSxFQUFxQ0osTUFBckMiLCJmaWxlIjoid2hlZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdoZWVsIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnBlcmNlbnQ9MC4xXSBwZXJjZW50IHRvIHNjcm9sbCB3aXRoIGVhY2ggc3BpblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZXZlcnNlXSByZXZlcnNlIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNjcm9sbFxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY3VycmVudCBtb3VzZSBwb3NpdGlvblxyXG4gICAgICpcclxuICAgICAqIEBldmVudCB3aGVlbCh7d2hlZWw6IHtkeCwgZHksIGR6fSwgZXZlbnQsIHZpZXdwb3J0fSlcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IG9wdGlvbnMucGVyY2VudCB8fCAwLjFcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICAgICAgdGhpcy5yZXZlcnNlID0gb3B0aW9ucy5yZXZlcnNlXHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2VcclxuICAgICAgICBpZiAodGhpcy5yZXZlcnNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbmdlID0gZS5kZWx0YVkgPiAwID8gMSArIHRoaXMucGVyY2VudCA6IDEgLSB0aGlzLnBlcmNlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hhbmdlID0gZS5kZWx0YVkgPiAwID8gMSAtIHRoaXMucGVyY2VudCA6IDEgKyB0aGlzLnBlcmNlbnRcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHBvaW50ID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9XHJcbiAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCAqPSBjaGFuZ2VcclxuICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICo9IGNoYW5nZVxyXG4gICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLnBhcmVudC50b0dsb2JhbChvbGRQb2ludClcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsJywgeyB3aGVlbDogeyBkeDogZS5kZWx0YVgsIGR5OiBlLmRlbHRhWSwgZHo6IGUuZGVsdGFaIH0sIGV2ZW50OiBlLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgfVxyXG59Il19