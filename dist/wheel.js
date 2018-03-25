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
            var point = new PIXI.Point(0, 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93aGVlbC5qcyJdLCJuYW1lcyI6WyJQbHVnaW4iLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsIm9wdGlvbnMiLCJwZXJjZW50IiwiY2VudGVyIiwicmV2ZXJzZSIsImV2dCIsInBvaW50IiwiUElYSSIsIlBvaW50IiwiaW50ZXJhY3Rpb24iLCJtYXBQb3NpdGlvblRvUG9pbnQiLCJjbGllbnRYIiwiY2xpZW50WSIsIngiLCJ5IiwiZSIsInBhdXNlZCIsImNoYW5nZSIsImRlbHRhWSIsImdldFBvaW50ZXJQb3NpdGlvbiIsIm9sZFBvaW50IiwidG9Mb2NhbCIsInNjYWxlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciIsIm5ld1BvaW50IiwidG9HbG9iYWwiLCJwcmV2ZW50RGVmYXVsdCIsImVtaXQiLCJ3aGVlbCIsImR4IiwiZGVsdGFYIiwiZHkiLCJkeiIsImRlbHRhWiIsImV2ZW50Iiwidmlld3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLFVBQVIsQ0FBZjs7QUFFQUMsT0FBT0MsT0FBUDtBQUFBOztBQUVJOzs7Ozs7Ozs7O0FBVUEsbUJBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSxrSEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxPQUFMLEdBQWVELFFBQVFDLE9BQVIsSUFBbUIsR0FBbEM7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsY0FBS0MsT0FBTCxHQUFlSCxRQUFRRyxPQUF2QjtBQUxKO0FBTUM7O0FBbkJMO0FBQUE7QUFBQSwyQ0FxQnVCQyxHQXJCdkIsRUFxQjRCO0FBQ3RCLGdCQUFJQyxRQUFRLElBQUlDLEtBQUtDLEtBQVQsQ0FBZSxDQUFmLEVBQWlCLENBQWpCLENBQVo7QUFDQSxnQkFBSSxLQUFLUixNQUFMLENBQVlTLFdBQWhCLEVBQTZCO0FBQzNCLHFCQUFLVCxNQUFMLENBQVlTLFdBQVosQ0FBd0JDLGtCQUF4QixDQUEyQ0osS0FBM0MsRUFBa0RELElBQUlNLE9BQXRELEVBQStETixJQUFJTyxPQUFuRTtBQUNELGFBRkQsTUFFTztBQUNMTixzQkFBTU8sQ0FBTixHQUFVUixJQUFJTSxPQUFkO0FBQ0FMLHNCQUFNUSxDQUFOLEdBQVVULElBQUlPLE9BQWQ7QUFDRDtBQUNELG1CQUFPTixLQUFQO0FBQ0Q7QUE5Qkw7QUFBQTtBQUFBLDhCQWdDVVMsQ0FoQ1YsRUFpQ0k7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFJQyxlQUFKO0FBQ0EsZ0JBQUksS0FBS2IsT0FBVCxFQUNBO0FBQ0lhLHlCQUFTRixFQUFFRyxNQUFGLEdBQVcsQ0FBWCxHQUFlLElBQUksS0FBS2hCLE9BQXhCLEdBQWtDLElBQUksS0FBS0EsT0FBcEQ7QUFDSCxhQUhELE1BS0E7QUFDSWUseUJBQVNGLEVBQUVHLE1BQUYsR0FBVyxDQUFYLEdBQWUsSUFBSSxLQUFLaEIsT0FBeEIsR0FBa0MsSUFBSSxLQUFLQSxPQUFwRDtBQUNIO0FBQ0QsZ0JBQUlJLFFBQVEsS0FBS2Esa0JBQUwsQ0FBd0JKLENBQXhCLENBQVo7O0FBRUEsZ0JBQUlLLGlCQUFKO0FBQ0EsZ0JBQUksQ0FBQyxLQUFLakIsTUFBVixFQUNBO0FBQ0lpQiwyQkFBVyxLQUFLcEIsTUFBTCxDQUFZcUIsT0FBWixDQUFvQmYsS0FBcEIsQ0FBWDtBQUNIO0FBQ0QsaUJBQUtOLE1BQUwsQ0FBWXNCLEtBQVosQ0FBa0JULENBQWxCLElBQXVCSSxNQUF2QjtBQUNBLGlCQUFLakIsTUFBTCxDQUFZc0IsS0FBWixDQUFrQlIsQ0FBbEIsSUFBdUJHLE1BQXZCO0FBQ0EsZ0JBQU1NLFFBQVEsS0FBS3ZCLE1BQUwsQ0FBWXdCLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLGdCQUFJRCxLQUFKLEVBQ0E7QUFDSUEsc0JBQU1BLEtBQU47QUFDSDs7QUFFRCxnQkFBSSxLQUFLcEIsTUFBVCxFQUNBO0FBQ0kscUJBQUtILE1BQUwsQ0FBWXlCLFVBQVosQ0FBdUIsS0FBS3RCLE1BQTVCO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksb0JBQU11QixXQUFXLEtBQUsxQixNQUFMLENBQVkyQixRQUFaLENBQXFCUCxRQUFyQixDQUFqQjtBQUNBLHFCQUFLcEIsTUFBTCxDQUFZYSxDQUFaLElBQWlCUCxNQUFNTyxDQUFOLEdBQVVhLFNBQVNiLENBQXBDO0FBQ0EscUJBQUtiLE1BQUwsQ0FBWWMsQ0FBWixJQUFpQlIsTUFBTVEsQ0FBTixHQUFVWSxTQUFTWixDQUFwQztBQUNIO0FBQ0RDLGNBQUVhLGNBQUY7QUFDQSxpQkFBSzVCLE1BQUwsQ0FBWTZCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsT0FBTyxFQUFFQyxJQUFJaEIsRUFBRWlCLE1BQVIsRUFBZ0JDLElBQUlsQixFQUFFRyxNQUF0QixFQUE4QmdCLElBQUluQixFQUFFb0IsTUFBcEMsRUFBVCxFQUF1REMsT0FBT3JCLENBQTlELEVBQWlFc0IsVUFBVSxLQUFLckMsTUFBaEYsRUFBMUI7QUFDSDtBQTNFTDs7QUFBQTtBQUFBLEVBQXFDSixNQUFyQyIsImZpbGUiOiJ3aGVlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgV2hlZWwgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICogQHBhcmFtIHtWaWV3cG9ydH0gcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMucGVyY2VudD0wLjFdIHBlcmNlbnQgdG8gc2Nyb2xsIHdpdGggZWFjaCBzcGluXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJldmVyc2VdIHJldmVyc2UgdGhlIGRpcmVjdGlvbiBvZiB0aGUgc2Nyb2xsXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjdXJyZW50IG1vdXNlIHBvc2l0aW9uXHJcbiAgICAgKlxyXG4gICAgICogQGV2ZW50IHdoZWVsKHt3aGVlbDoge2R4LCBkeSwgZHp9LCBldmVudCwgdmlld3BvcnR9KVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gb3B0aW9ucy5wZXJjZW50IHx8IDAuMVxyXG4gICAgICAgIHRoaXMuY2VudGVyID0gb3B0aW9ucy5jZW50ZXJcclxuICAgICAgICB0aGlzLnJldmVyc2UgPSBvcHRpb25zLnJldmVyc2VcclxuICAgIH1cclxuXHJcbiAgICBnZXRQb2ludGVyUG9zaXRpb24oZXZ0KSB7XHJcbiAgICAgIGxldCBwb2ludCA9IG5ldyBQSVhJLlBvaW50KDAsMCk7XHJcbiAgICAgIGlmICh0aGlzLnBhcmVudC5pbnRlcmFjdGlvbikge1xyXG4gICAgICAgIHRoaXMucGFyZW50LmludGVyYWN0aW9uLm1hcFBvc2l0aW9uVG9Qb2ludChwb2ludCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwb2ludC54ID0gZXZ0LmNsaWVudFg7XHJcbiAgICAgICAgcG9pbnQueSA9IGV2dC5jbGllbnRZO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwb2ludDtcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnBhdXNlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZVxyXG4gICAgICAgIGlmICh0aGlzLnJldmVyc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxICsgdGhpcy5wZXJjZW50IDogMSAtIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSBlLmRlbHRhWSA+IDAgPyAxIC0gdGhpcy5wZXJjZW50IDogMSArIHRoaXMucGVyY2VudFxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLmdldFBvaW50ZXJQb3NpdGlvbihlKTtcclxuXHJcbiAgICAgICAgbGV0IG9sZFBvaW50XHJcbiAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9sZFBvaW50ID0gdGhpcy5wYXJlbnQudG9Mb2NhbChwb2ludClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wYXJlbnQuc2NhbGUueCAqPSBjaGFuZ2VcclxuICAgICAgICB0aGlzLnBhcmVudC5zY2FsZS55ICo9IGNoYW5nZVxyXG4gICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgaWYgKGNsYW1wKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3UG9pbnQgPSB0aGlzLnBhcmVudC50b0dsb2JhbChvbGRQb2ludClcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQueCArPSBwb2ludC54IC0gbmV3UG9pbnQueFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC55ICs9IHBvaW50LnkgLSBuZXdQb2ludC55XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3doZWVsJywgeyB3aGVlbDogeyBkeDogZS5kZWx0YVgsIGR5OiBlLmRlbHRhWSwgZHo6IGUuZGVsdGFaIH0sIGV2ZW50OiBlLCB2aWV3cG9ydDogdGhpcy5wYXJlbnR9KVxyXG4gICAgfVxyXG59Il19