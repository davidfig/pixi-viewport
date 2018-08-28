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
            var point = this.parent.getPointerPosition(e);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImUiLCJwYXVzZWQiLCJjaGFuZ2UiLCJkZWx0YVkiLCJwb2ludCIsImdldFBvaW50ZXJQb3NpdGlvbiIsIm9sZFBvaW50IiwidG9Mb2NhbCIsInNjYWxlIiwieCIsInkiLCJlbWl0Iiwidmlld3BvcnQiLCJ0eXBlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJ3aGVlbCIsImR4IiwiZGVsdGFYIiwiZHkiLCJkeiIsImRlbHRhWiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUxKO0FBTUM7O0FBbkJMO0FBQUE7QUFBQSw4QkFxQlVDLENBckJWLEVBc0JJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBSUMsZUFBSjtBQUNBLGdCQUFJLEtBQUtILE9BQVQsRUFDQTtBQUNJRyx5QkFBU0YsRUFBRUcsTUFBRixHQUFXLENBQVgsR0FBZSxJQUFJLEtBQUtOLE9BQXhCLEdBQWtDLElBQUksS0FBS0EsT0FBcEQ7QUFDSCxhQUhELE1BS0E7QUFDSUsseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLTixPQUF4QixHQUFrQyxJQUFJLEtBQUtBLE9BQXBEO0FBQ0g7QUFDRCxnQkFBSU8sUUFBUSxLQUFLVCxNQUFMLENBQVlVLGtCQUFaLENBQStCTCxDQUEvQixDQUFaOztBQUVBLGdCQUFJTSxpQkFBSjtBQUNBLGdCQUFJLENBQUMsS0FBS1IsTUFBVixFQUNBO0FBQ0lRLDJCQUFXLEtBQUtYLE1BQUwsQ0FBWVksT0FBWixDQUFvQkgsS0FBcEIsQ0FBWDtBQUNIO0FBQ0QsaUJBQUtULE1BQUwsQ0FBWWEsS0FBWixDQUFrQkMsQ0FBbEIsSUFBdUJQLE1BQXZCO0FBQ0EsaUJBQUtQLE1BQUwsQ0FBWWEsS0FBWixDQUFrQkUsQ0FBbEIsSUFBdUJSLE1BQXZCO0FBQ0EsaUJBQUtQLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsUUFBakIsRUFBMkIsRUFBRUMsVUFBVSxLQUFLakIsTUFBakIsRUFBeUJrQixNQUFNLE9BQS9CLEVBQTNCO0FBQ0EsZ0JBQU1DLFFBQVEsS0FBS25CLE1BQUwsQ0FBWW9CLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLGdCQUFJRCxLQUFKLEVBQ0E7QUFDSUEsc0JBQU1BLEtBQU47QUFDSDs7QUFFRCxnQkFBSSxLQUFLaEIsTUFBVCxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWXFCLFVBQVosQ0FBdUIsS0FBS2xCLE1BQTVCO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksb0JBQU1tQixXQUFXLEtBQUt0QixNQUFMLENBQVl1QixRQUFaLENBQXFCWixRQUFyQixDQUFqQjtBQUNBLHFCQUFLWCxNQUFMLENBQVljLENBQVosSUFBaUJMLE1BQU1LLENBQU4sR0FBVVEsU0FBU1IsQ0FBcEM7QUFDQSxxQkFBS2QsTUFBTCxDQUFZZSxDQUFaLElBQWlCTixNQUFNTSxDQUFOLEdBQVVPLFNBQVNQLENBQXBDO0FBQ0g7QUFDRCxpQkFBS2YsTUFBTCxDQUFZZ0IsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUtqQixNQUFqQixFQUF5QmtCLE1BQU0sT0FBL0IsRUFBMUI7QUFDQSxpQkFBS2xCLE1BQUwsQ0FBWWdCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRVEsT0FBTyxFQUFFQyxJQUFJcEIsRUFBRXFCLE1BQVIsRUFBZ0JDLElBQUl0QixFQUFFRyxNQUF0QixFQUE4Qm9CLElBQUl2QixFQUFFd0IsTUFBcEMsRUFBVCxFQUF1REMsT0FBT3pCLENBQTlELEVBQWlFWSxVQUFVLEtBQUtqQixNQUFoRixFQUExQjtBQUNBSyxjQUFFMEIsY0FBRjtBQUNIO0FBbEVMOztBQUFBO0FBQUEsRUFBcUNuQyxNQUFyQyIsImZpbGUiOiJ3aGVlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2hlZWwgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHdoZWVsKHt3aGVlbDoge2R4LCBkeSwgZHp9LCBldmVudCwgdmlld3BvcnR9KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDAuMVxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2VcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZVxyXG4gICAgICAgIGlmICh0aGlzLnJldmVyc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxICsgdGhpcy5wZXJjZW50IDogMSAtIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxIC0gdGhpcy5wZXJjZW50IDogMSArIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLnBhcmVudC5nZXRQb2ludGVyUG9zaXRpb24oZSlcclxuXHJcbiAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCAqPSBjaGFuZ2VcclxuICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICo9IGNoYW5nZVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3pvb21lZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnd2hlZWwnIH0pXHJcbiAgICAgICAgY29uc3QgY2xhbXAgPSB0aGlzLnBhcmVudC5wbHVnaW5zWydjbGFtcC16b29tJ11cclxuICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjbGFtcC5jbGFtcCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jZW50ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRoaXMuY2VudGVyKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQb2ludCA9IHRoaXMucGFyZW50LnRvR2xvYmFsKG9sZFBvaW50KVxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC54ICs9IHBvaW50LnggLSBuZXdQb2ludC54XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnkgKz0gcG9pbnQueSAtIG5ld1BvaW50LnlcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnbW92ZWQnLCB7IHZpZXdwb3J0OiB0aGlzLnBhcmVudCwgdHlwZTogJ3doZWVsJyB9KVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsJywgeyB3aGVlbDogeyBkeDogZS5kZWx0YVgsIGR5OiBlLmRlbHRhWSwgZHo6IGUuZGVsdGFaIH0sIGV2ZW50OiBlLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG59Il19