'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Follow, _Plugin);

    /**
     * @param {Viewport} parent
     * @param {PIXI.DisplayObject} target to follow (object must include {x: x-coordinate, y: y-coordinate})
     * @param {object} [options]
     * @param {number} [options.speed=0] to follow in pixels/frame (0=teleport to location)
     * @param {number} [options.radius] radius (in world coordinates) of center circle where movement is allowed without moving the viewport
     */
    function Follow(parent, target, options) {
        _classCallCheck(this, Follow);

        var _this = _possibleConstructorReturn(this, (Follow.__proto__ || Object.getPrototypeOf(Follow)).call(this, parent));

        options = options || {};
        _this.speed = options.speed || 0;
        _this.target = target;
        _this.radius = options.radius;
        return _this;
    }

    _createClass(Follow, [{
        key: 'update',
        value: function update() {
            if (this.paused) {
                return;
            }

            var center = this.parent.center;
            var toX = this.target.x,
                toY = this.target.y;
            if (this.radius) {
                var distance = Math.sqrt(Math.pow(this.target.y - center.y, 2) + Math.pow(this.target.x - center.x, 2));
                if (distance > this.radius) {
                    var angle = Math.atan2(this.target.y - center.y, this.target.x - center.x);
                    toX = this.target.x - Math.cos(angle) * this.radius;
                    toY = this.target.y - Math.sin(angle) * this.radius;
                } else {
                    return;
                }
            }
            if (this.speed) {
                var deltaX = toX - center.x;
                var deltaY = toY - center.y;
                if (deltaX || deltaY) {
                    var _angle = Math.atan2(toY - center.y, toX - center.x);
                    var changeX = Math.cos(_angle) * this.speed;
                    var changeY = Math.sin(_angle) * this.speed;
                    var x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                    var y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                    this.parent.moveCenter(x, y);
                }
            } else {
                this.parent.moveCenter(toX, toY);
            }
        }
    }]);

    return Follow;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mb2xsb3cuanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ0YXJnZXQiLCJvcHRpb25zIiwic3BlZWQiLCJyYWRpdXMiLCJwYXVzZWQiLCJjZW50ZXIiLCJ0b1giLCJ4IiwidG9ZIiwieSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJhbmdsZSIsImF0YW4yIiwiY29zIiwic2luIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2hhbmdlWCIsImNoYW5nZVkiLCJhYnMiLCJtb3ZlQ2VudGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7OztBQU9BLG9CQUFZQyxNQUFaLEVBQW9CQyxNQUFwQixFQUE0QkMsT0FBNUIsRUFDQTtBQUFBOztBQUFBLG9IQUNVRixNQURWOztBQUVJRSxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLEtBQUwsR0FBYUQsUUFBUUMsS0FBUixJQUFpQixDQUE5QjtBQUNBLGNBQUtGLE1BQUwsR0FBY0EsTUFBZDtBQUNBLGNBQUtHLE1BQUwsR0FBY0YsUUFBUUUsTUFBdEI7QUFMSjtBQU1DOztBQWhCTDtBQUFBO0FBQUEsaUNBbUJJO0FBQ0ksZ0JBQUksS0FBS0MsTUFBVCxFQUNBO0FBQ0k7QUFDSDs7QUFFRCxnQkFBTUMsU0FBUyxLQUFLTixNQUFMLENBQVlNLE1BQTNCO0FBQ0EsZ0JBQUlDLE1BQU0sS0FBS04sTUFBTCxDQUFZTyxDQUF0QjtBQUFBLGdCQUF5QkMsTUFBTSxLQUFLUixNQUFMLENBQVlTLENBQTNDO0FBQ0EsZ0JBQUksS0FBS04sTUFBVCxFQUNBO0FBQ0ksb0JBQU1PLFdBQVdDLEtBQUtDLElBQUwsQ0FBVUQsS0FBS0UsR0FBTCxDQUFTLEtBQUtiLE1BQUwsQ0FBWVMsQ0FBWixHQUFnQkosT0FBT0ksQ0FBaEMsRUFBbUMsQ0FBbkMsSUFBd0NFLEtBQUtFLEdBQUwsQ0FBUyxLQUFLYixNQUFMLENBQVlPLENBQVosR0FBZ0JGLE9BQU9FLENBQWhDLEVBQW1DLENBQW5DLENBQWxELENBQWpCO0FBQ0Esb0JBQUlHLFdBQVcsS0FBS1AsTUFBcEIsRUFDQTtBQUNJLHdCQUFNVyxRQUFRSCxLQUFLSSxLQUFMLENBQVcsS0FBS2YsTUFBTCxDQUFZUyxDQUFaLEdBQWdCSixPQUFPSSxDQUFsQyxFQUFxQyxLQUFLVCxNQUFMLENBQVlPLENBQVosR0FBZ0JGLE9BQU9FLENBQTVELENBQWQ7QUFDQUQsMEJBQU0sS0FBS04sTUFBTCxDQUFZTyxDQUFaLEdBQWdCSSxLQUFLSyxHQUFMLENBQVNGLEtBQVQsSUFBa0IsS0FBS1gsTUFBN0M7QUFDQUssMEJBQU0sS0FBS1IsTUFBTCxDQUFZUyxDQUFaLEdBQWdCRSxLQUFLTSxHQUFMLENBQVNILEtBQVQsSUFBa0IsS0FBS1gsTUFBN0M7QUFDSCxpQkFMRCxNQU9BO0FBQ0k7QUFDSDtBQUNKO0FBQ0QsZ0JBQUksS0FBS0QsS0FBVCxFQUNBO0FBQ0ksb0JBQU1nQixTQUFTWixNQUFNRCxPQUFPRSxDQUE1QjtBQUNBLG9CQUFNWSxTQUFTWCxNQUFNSCxPQUFPSSxDQUE1QjtBQUNBLG9CQUFJUyxVQUFVQyxNQUFkLEVBQ0E7QUFDSSx3QkFBTUwsU0FBUUgsS0FBS0ksS0FBTCxDQUFXUCxNQUFNSCxPQUFPSSxDQUF4QixFQUEyQkgsTUFBTUQsT0FBT0UsQ0FBeEMsQ0FBZDtBQUNBLHdCQUFNYSxVQUFVVCxLQUFLSyxHQUFMLENBQVNGLE1BQVQsSUFBa0IsS0FBS1osS0FBdkM7QUFDQSx3QkFBTW1CLFVBQVVWLEtBQUtNLEdBQUwsQ0FBU0gsTUFBVCxJQUFrQixLQUFLWixLQUF2QztBQUNBLHdCQUFNSyxJQUFJSSxLQUFLVyxHQUFMLENBQVNGLE9BQVQsSUFBb0JULEtBQUtXLEdBQUwsQ0FBU0osTUFBVCxDQUFwQixHQUF1Q1osR0FBdkMsR0FBNkNELE9BQU9FLENBQVAsR0FBV2EsT0FBbEU7QUFDQSx3QkFBTVgsSUFBSUUsS0FBS1csR0FBTCxDQUFTRCxPQUFULElBQW9CVixLQUFLVyxHQUFMLENBQVNILE1BQVQsQ0FBcEIsR0FBdUNYLEdBQXZDLEdBQTZDSCxPQUFPSSxDQUFQLEdBQVdZLE9BQWxFO0FBQ0EseUJBQUt0QixNQUFMLENBQVl3QixVQUFaLENBQXVCaEIsQ0FBdkIsRUFBMEJFLENBQTFCO0FBQ0g7QUFDSixhQWJELE1BZUE7QUFDSSxxQkFBS1YsTUFBTCxDQUFZd0IsVUFBWixDQUF1QmpCLEdBQXZCLEVBQTRCRSxHQUE1QjtBQUNIO0FBQ0o7QUEzREw7O0FBQUE7QUFBQSxFQUFzQ2IsTUFBdEMiLCJmaWxlIjoiZm9sbG93LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBGb2xsb3cgZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQgfHwgMFxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1c1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICBsZXQgdG9YID0gdGhpcy50YXJnZXQueCwgdG9ZID0gdGhpcy50YXJnZXQueVxyXG4gICAgICAgIGlmICh0aGlzLnJhZGl1cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMudGFyZ2V0LnkgLSBjZW50ZXIueSwgMikgKyBNYXRoLnBvdyh0aGlzLnRhcmdldC54IC0gY2VudGVyLngsIDIpKVxyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPiB0aGlzLnJhZGl1cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMudGFyZ2V0LnkgLSBjZW50ZXIueSwgdGhpcy50YXJnZXQueCAtIGNlbnRlci54KVxyXG4gICAgICAgICAgICAgICAgdG9YID0gdGhpcy50YXJnZXQueCAtIE1hdGguY29zKGFuZ2xlKSAqIHRoaXMucmFkaXVzXHJcbiAgICAgICAgICAgICAgICB0b1kgPSB0aGlzLnRhcmdldC55IC0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5yYWRpdXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNwZWVkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGVsdGFYID0gdG9YIC0gY2VudGVyLnhcclxuICAgICAgICAgICAgY29uc3QgZGVsdGFZID0gdG9ZIC0gY2VudGVyLnlcclxuICAgICAgICAgICAgaWYgKGRlbHRhWCB8fCBkZWx0YVkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMih0b1kgLSBjZW50ZXIueSwgdG9YIC0gY2VudGVyLngpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VYID0gTWF0aC5jb3MoYW5nbGUpICogdGhpcy5zcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlWSA9IE1hdGguc2luKGFuZ2xlKSAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmFicyhjaGFuZ2VYKSA+IE1hdGguYWJzKGRlbHRhWCkgPyB0b1ggOiBjZW50ZXIueCArIGNoYW5nZVhcclxuICAgICAgICAgICAgICAgIGNvbnN0IHkgPSBNYXRoLmFicyhjaGFuZ2VZKSA+IE1hdGguYWJzKGRlbHRhWSkgPyB0b1kgOiBjZW50ZXIueSArIGNoYW5nZVlcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIoeCwgeSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHRvWCwgdG9ZKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==