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
        key: 'getPointerPosition',
        value: function getPointerPosition(evt) {
            var point = new PIXI.Point();
            if (this.parent.interaction) {
                this.parent.interaction.mapPositionToPoint(point, evt.clientX, evt.clientY);
            } else {
                point.x = evt.clientX;
                point.y = evt.clientY;
            }
            return point;
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
            var point = this.getPointerPosition(e);

            var oldPoint = void 0;
            if (!this.center) {
                oldPoint = this.parent.toLocal(point);
            }
            this.parent.scale.x *= change;
            this.parent.scale.y *= change;
            this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
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
            this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
            this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });
            e.preventDefault();
        }
    }]);

    return Wheel;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImV2dCIsInBvaW50IiwiUElYSSIsIlBvaW50IiwiaW50ZXJhY3Rpb24iLCJtYXBQb3NpdGlvblRvUG9pbnQiLCJjbGllbnRYIiwiY2xpZW50WSIsIngiLCJ5IiwiZSIsInBhdXNlZCIsImNoYW5nZSIsImRlbHRhWSIsImdldFBvaW50ZXJQb3NpdGlvbiIsIm9sZFBvaW50IiwidG9Mb2NhbCIsInNjYWxlIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSIsImNsYW1wIiwicGx1Z2lucyIsIm1vdmVDZW50ZXIiLCJuZXdQb2ludCIsInRvR2xvYmFsIiwid2hlZWwiLCJkeCIsImRlbHRhWCIsImR5IiwiZHoiLCJkZWx0YVoiLCJldmVudCIsInByZXZlbnREZWZhdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7OztBQVVBLG1CQUFZQyxNQUFaLEVBQW9CQyxPQUFwQixFQUNBO0FBQUE7O0FBQUEsa0hBQ1VELE1BRFY7O0FBRUlDLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlRCxRQUFRQyxPQUFSLElBQW1CLEdBQWxDO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLGNBQUtDLE9BQUwsR0FBZUgsUUFBUUcsT0FBdkI7QUFMSjtBQU1DOztBQW5CTDtBQUFBO0FBQUEsMkNBcUJ1QkMsR0FyQnZCLEVBc0JJO0FBQ0ksZ0JBQUlDLFFBQVEsSUFBSUMsS0FBS0MsS0FBVCxFQUFaO0FBQ0EsZ0JBQUksS0FBS1IsTUFBTCxDQUFZUyxXQUFoQixFQUNBO0FBQ0kscUJBQUtULE1BQUwsQ0FBWVMsV0FBWixDQUF3QkMsa0JBQXhCLENBQTJDSixLQUEzQyxFQUFrREQsSUFBSU0sT0FBdEQsRUFBK0ROLElBQUlPLE9BQW5FO0FBQ0gsYUFIRCxNQUtBO0FBQ0lOLHNCQUFNTyxDQUFOLEdBQVVSLElBQUlNLE9BQWQ7QUFDQUwsc0JBQU1RLENBQU4sR0FBVVQsSUFBSU8sT0FBZDtBQUNIO0FBQ0QsbUJBQU9OLEtBQVA7QUFDSDtBQWxDTDtBQUFBO0FBQUEsOEJBb0NVUyxDQXBDVixFQXFDSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQUlDLGVBQUo7QUFDQSxnQkFBSSxLQUFLYixPQUFULEVBQ0E7QUFDSWEseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLaEIsT0FBeEIsR0FBa0MsSUFBSSxLQUFLQSxPQUFwRDtBQUNILGFBSEQsTUFLQTtBQUNJZSx5QkFBU0YsRUFBRUcsTUFBRixHQUFXLENBQVgsR0FBZSxJQUFJLEtBQUtoQixPQUF4QixHQUFrQyxJQUFJLEtBQUtBLE9BQXBEO0FBQ0g7QUFDRCxnQkFBSUksUUFBUSxLQUFLYSxrQkFBTCxDQUF3QkosQ0FBeEIsQ0FBWjs7QUFFQSxnQkFBSUssaUJBQUo7QUFDQSxnQkFBSSxDQUFDLEtBQUtqQixNQUFWLEVBQ0E7QUFDSWlCLDJCQUFXLEtBQUtwQixNQUFMLENBQVlxQixPQUFaLENBQW9CZixLQUFwQixDQUFYO0FBQ0g7QUFDRCxpQkFBS04sTUFBTCxDQUFZc0IsS0FBWixDQUFrQlQsQ0FBbEIsSUFBdUJJLE1BQXZCO0FBQ0EsaUJBQUtqQixNQUFMLENBQVlzQixLQUFaLENBQWtCUixDQUFsQixJQUF1QkcsTUFBdkI7QUFDQSxpQkFBS2pCLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsRUFBRUMsVUFBVSxLQUFLeEIsTUFBakIsRUFBeUJ5QixNQUFNLE9BQS9CLEVBQTNCO0FBQ0EsZ0JBQU1DLFFBQVEsS0FBSzFCLE1BQUwsQ0FBWTJCLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLGdCQUFJRCxLQUFKLEVBQ0E7QUFDSUEsc0JBQU1BLEtBQU47QUFDSDs7QUFFRCxnQkFBSSxLQUFLdkIsTUFBVCxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWTRCLFVBQVosQ0FBdUIsS0FBS3pCLE1BQTVCO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksb0JBQU0wQixXQUFXLEtBQUs3QixNQUFMLENBQVk4QixRQUFaLENBQXFCVixRQUFyQixDQUFqQjtBQUNBLHFCQUFLcEIsTUFBTCxDQUFZYSxDQUFaLElBQWlCUCxNQUFNTyxDQUFOLEdBQVVnQixTQUFTaEIsQ0FBcEM7QUFDQSxxQkFBS2IsTUFBTCxDQUFZYyxDQUFaLElBQWlCUixNQUFNUSxDQUFOLEdBQVVlLFNBQVNmLENBQXBDO0FBQ0g7QUFDRCxpQkFBS2QsTUFBTCxDQUFZdUIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUt4QixNQUFqQixFQUF5QnlCLE1BQU0sT0FBL0IsRUFBMUI7QUFDQSxpQkFBS3pCLE1BQUwsQ0FBWXVCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRVEsT0FBTyxFQUFFQyxJQUFJakIsRUFBRWtCLE1BQVIsRUFBZ0JDLElBQUluQixFQUFFRyxNQUF0QixFQUE4QmlCLElBQUlwQixFQUFFcUIsTUFBcEMsRUFBVCxFQUF1REMsT0FBT3RCLENBQTlELEVBQWlFUyxVQUFVLEtBQUt4QixNQUFoRixFQUExQjtBQUNBZSxjQUFFdUIsY0FBRjtBQUNIO0FBakZMOztBQUFBO0FBQUEsRUFBcUMxQyxNQUFyQyIsImZpbGUiOiJ3aGVlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2hlZWwgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHdoZWVsKHt3aGVlbDoge2R4LCBkeSwgZHp9LCBldmVudCwgdmlld3BvcnR9KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDAuMVxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2VcclxuICAgIH1cclxuXHJcbiAgICBnZXRQb2ludGVyUG9zaXRpb24oZXZ0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBwb2ludCA9IG5ldyBQSVhJLlBvaW50KClcclxuICAgICAgICBpZiAodGhpcy5wYXJlbnQuaW50ZXJhY3Rpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5pbnRlcmFjdGlvbi5tYXBQb3NpdGlvblRvUG9pbnQocG9pbnQsIGV2dC5jbGllbnRYLCBldnQuY2xpZW50WSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcG9pbnQueCA9IGV2dC5jbGllbnRYXHJcbiAgICAgICAgICAgIHBvaW50LnkgPSBldnQuY2xpZW50WVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9pbnRcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZVxyXG4gICAgICAgIGlmICh0aGlzLnJldmVyc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxICsgdGhpcy5wZXJjZW50IDogMSAtIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxIC0gdGhpcy5wZXJjZW50IDogMSArIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLmdldFBvaW50ZXJQb3NpdGlvbihlKVxyXG5cclxuICAgICAgICBsZXQgb2xkUG9pbnRcclxuICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb2xkUG9pbnQgPSB0aGlzLnBhcmVudC50b0xvY2FsKHBvaW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS54ICo9IGNoYW5nZVxyXG4gICAgICAgIHRoaXMucGFyZW50LnNjYWxlLnkgKj0gY2hhbmdlXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnem9vbWVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICd3aGVlbCcgfSlcclxuICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BvaW50ID0gdGhpcy5wYXJlbnQudG9HbG9iYWwob2xkUG9pbnQpXHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnggKz0gcG9pbnQueCAtIG5ld1BvaW50LnhcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueSArPSBwb2ludC55IC0gbmV3UG9pbnQueVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnd2hlZWwnIH0pXHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnd2hlZWwnLCB7IHdoZWVsOiB7IGR4OiBlLmRlbHRhWCwgZHk6IGUuZGVsdGFZLCBkejogZS5kZWx0YVogfSwgZXZlbnQ6IGUsIHZpZXdwb3J0OiB0aGlzLnBhcmVudH0pXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcbn0iXX0=