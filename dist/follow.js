'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');

module.exports = function (_Plugin) {
    _inherits(Follow, _Plugin);

    /**
     * @private
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
            var deltaX = toX - center.x;
            var deltaY = toY - center.y;
            if (deltaX || deltaY) {
                if (this.speed) {
                    var _angle = Math.atan2(toY - center.y, toX - center.x);
                    var changeX = Math.cos(_angle) * this.speed;
                    var changeY = Math.sin(_angle) * this.speed;
                    var x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                    var y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;
                    this.parent.moveCenter(x, y);
                    this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                } else {
                    this.parent.moveCenter(toX, toY);
                    this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                }
            }
        }
    }]);

    return Follow;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mb2xsb3cuanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ0YXJnZXQiLCJvcHRpb25zIiwic3BlZWQiLCJyYWRpdXMiLCJwYXVzZWQiLCJjZW50ZXIiLCJ0b1giLCJ4IiwidG9ZIiwieSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJhbmdsZSIsImF0YW4yIiwiY29zIiwic2luIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2hhbmdlWCIsImNoYW5nZVkiLCJhYnMiLCJtb3ZlQ2VudGVyIiwiZW1pdCIsInZpZXdwb3J0IiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsVUFBUixDQUFmOztBQUVBQyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7O0FBUUEsb0JBQVlDLE1BQVosRUFBb0JDLE1BQXBCLEVBQTRCQyxPQUE1QixFQUNBO0FBQUE7O0FBQUEsb0hBQ1VGLE1BRFY7O0FBRUlFLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsY0FBS0MsS0FBTCxHQUFhRCxRQUFRQyxLQUFSLElBQWlCLENBQTlCO0FBQ0EsY0FBS0YsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsY0FBS0csTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUxKO0FBTUM7O0FBakJMO0FBQUE7QUFBQSxpQ0FvQkk7QUFDSSxnQkFBSSxLQUFLQyxNQUFULEVBQ0E7QUFDSTtBQUNIOztBQUVELGdCQUFNQyxTQUFTLEtBQUtOLE1BQUwsQ0FBWU0sTUFBM0I7QUFDQSxnQkFBSUMsTUFBTSxLQUFLTixNQUFMLENBQVlPLENBQXRCO0FBQUEsZ0JBQXlCQyxNQUFNLEtBQUtSLE1BQUwsQ0FBWVMsQ0FBM0M7QUFDQSxnQkFBSSxLQUFLTixNQUFULEVBQ0E7QUFDSSxvQkFBTU8sV0FBV0MsS0FBS0MsSUFBTCxDQUFVRCxLQUFLRSxHQUFMLENBQVMsS0FBS2IsTUFBTCxDQUFZUyxDQUFaLEdBQWdCSixPQUFPSSxDQUFoQyxFQUFtQyxDQUFuQyxJQUF3Q0UsS0FBS0UsR0FBTCxDQUFTLEtBQUtiLE1BQUwsQ0FBWU8sQ0FBWixHQUFnQkYsT0FBT0UsQ0FBaEMsRUFBbUMsQ0FBbkMsQ0FBbEQsQ0FBakI7QUFDQSxvQkFBSUcsV0FBVyxLQUFLUCxNQUFwQixFQUNBO0FBQ0ksd0JBQU1XLFFBQVFILEtBQUtJLEtBQUwsQ0FBVyxLQUFLZixNQUFMLENBQVlTLENBQVosR0FBZ0JKLE9BQU9JLENBQWxDLEVBQXFDLEtBQUtULE1BQUwsQ0FBWU8sQ0FBWixHQUFnQkYsT0FBT0UsQ0FBNUQsQ0FBZDtBQUNBRCwwQkFBTSxLQUFLTixNQUFMLENBQVlPLENBQVosR0FBZ0JJLEtBQUtLLEdBQUwsQ0FBU0YsS0FBVCxJQUFrQixLQUFLWCxNQUE3QztBQUNBSywwQkFBTSxLQUFLUixNQUFMLENBQVlTLENBQVosR0FBZ0JFLEtBQUtNLEdBQUwsQ0FBU0gsS0FBVCxJQUFrQixLQUFLWCxNQUE3QztBQUNILGlCQUxELE1BT0E7QUFDSTtBQUNIO0FBQ0o7QUFDRCxnQkFBTWUsU0FBU1osTUFBTUQsT0FBT0UsQ0FBNUI7QUFDQSxnQkFBTVksU0FBU1gsTUFBTUgsT0FBT0ksQ0FBNUI7QUFDQSxnQkFBSVMsVUFBVUMsTUFBZCxFQUNBO0FBQ0ksb0JBQUksS0FBS2pCLEtBQVQsRUFDQTtBQUNJLHdCQUFNWSxTQUFRSCxLQUFLSSxLQUFMLENBQVdQLE1BQU1ILE9BQU9JLENBQXhCLEVBQTJCSCxNQUFNRCxPQUFPRSxDQUF4QyxDQUFkO0FBQ0Esd0JBQU1hLFVBQVVULEtBQUtLLEdBQUwsQ0FBU0YsTUFBVCxJQUFrQixLQUFLWixLQUF2QztBQUNBLHdCQUFNbUIsVUFBVVYsS0FBS00sR0FBTCxDQUFTSCxNQUFULElBQWtCLEtBQUtaLEtBQXZDO0FBQ0Esd0JBQU1LLElBQUlJLEtBQUtXLEdBQUwsQ0FBU0YsT0FBVCxJQUFvQlQsS0FBS1csR0FBTCxDQUFTSixNQUFULENBQXBCLEdBQXVDWixHQUF2QyxHQUE2Q0QsT0FBT0UsQ0FBUCxHQUFXYSxPQUFsRTtBQUNBLHdCQUFNWCxJQUFJRSxLQUFLVyxHQUFMLENBQVNELE9BQVQsSUFBb0JWLEtBQUtXLEdBQUwsQ0FBU0gsTUFBVCxDQUFwQixHQUF1Q1gsR0FBdkMsR0FBNkNILE9BQU9JLENBQVAsR0FBV1ksT0FBbEU7QUFDQSx5QkFBS3RCLE1BQUwsQ0FBWXdCLFVBQVosQ0FBdUJoQixDQUF2QixFQUEwQkUsQ0FBMUI7QUFDQSx5QkFBS1YsTUFBTCxDQUFZeUIsSUFBWixDQUFpQixPQUFqQixFQUEwQixFQUFFQyxVQUFVLEtBQUsxQixNQUFqQixFQUF5QjJCLE1BQU0sUUFBL0IsRUFBMUI7QUFDSCxpQkFURCxNQVdBO0FBQ0kseUJBQUszQixNQUFMLENBQVl3QixVQUFaLENBQXVCakIsR0FBdkIsRUFBNEJFLEdBQTVCO0FBQ0EseUJBQUtULE1BQUwsQ0FBWXlCLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsRUFBRUMsVUFBVSxLQUFLMUIsTUFBakIsRUFBeUIyQixNQUFNLFFBQS9CLEVBQTFCO0FBQ0g7QUFDSjtBQUNKO0FBOURMOztBQUFBO0FBQUEsRUFBc0MvQixNQUF0QyIsImZpbGUiOiJmb2xsb3cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZvbGxvdyBleHRlbmRzIFBsdWdpblxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7UElYSS5EaXNwbGF5T2JqZWN0fSB0YXJnZXQgdG8gZm9sbG93IChvYmplY3QgbXVzdCBpbmNsdWRlIHt4OiB4LWNvb3JkaW5hdGUsIHk6IHktY29vcmRpbmF0ZX0pXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuc3BlZWQ9MF0gdG8gZm9sbG93IGluIHBpeGVscy9mcmFtZSAoMD10ZWxlcG9ydCB0byBsb2NhdGlvbilcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5yYWRpdXNdIHJhZGl1cyAoaW4gd29ybGQgY29vcmRpbmF0ZXMpIG9mIGNlbnRlciBjaXJjbGUgd2hlcmUgbW92ZW1lbnQgaXMgYWxsb3dlZCB3aXRob3V0IG1vdmluZyB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCB0YXJnZXQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQgfHwgMFxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSBvcHRpb25zLnJhZGl1c1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjZW50ZXIgPSB0aGlzLnBhcmVudC5jZW50ZXJcclxuICAgICAgICBsZXQgdG9YID0gdGhpcy50YXJnZXQueCwgdG9ZID0gdGhpcy50YXJnZXQueVxyXG4gICAgICAgIGlmICh0aGlzLnJhZGl1cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMudGFyZ2V0LnkgLSBjZW50ZXIueSwgMikgKyBNYXRoLnBvdyh0aGlzLnRhcmdldC54IC0gY2VudGVyLngsIDIpKVxyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPiB0aGlzLnJhZGl1cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMudGFyZ2V0LnkgLSBjZW50ZXIueSwgdGhpcy50YXJnZXQueCAtIGNlbnRlci54KVxyXG4gICAgICAgICAgICAgICAgdG9YID0gdGhpcy50YXJnZXQueCAtIE1hdGguY29zKGFuZ2xlKSAqIHRoaXMucmFkaXVzXHJcbiAgICAgICAgICAgICAgICB0b1kgPSB0aGlzLnRhcmdldC55IC0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5yYWRpdXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IHRvWCAtIGNlbnRlci54XHJcbiAgICAgICAgY29uc3QgZGVsdGFZID0gdG9ZIC0gY2VudGVyLnlcclxuICAgICAgICBpZiAoZGVsdGFYIHx8IGRlbHRhWSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNwZWVkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIodG9ZIC0gY2VudGVyLnksIHRvWCAtIGNlbnRlci54KVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hhbmdlWCA9IE1hdGguY29zKGFuZ2xlKSAqIHRoaXMuc3BlZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVkgPSBNYXRoLnNpbihhbmdsZSkgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gTWF0aC5hYnMoY2hhbmdlWCkgPiBNYXRoLmFicyhkZWx0YVgpID8gdG9YIDogY2VudGVyLnggKyBjaGFuZ2VYXHJcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gTWF0aC5hYnMoY2hhbmdlWSkgPiBNYXRoLmFicyhkZWx0YVkpID8gdG9ZIDogY2VudGVyLnkgKyBjaGFuZ2VZXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKHgsIHkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdtb3ZlZCcsIHsgdmlld3BvcnQ6IHRoaXMucGFyZW50LCB0eXBlOiAnZm9sbG93JyB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0b1gsIHRvWSlcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ21vdmVkJywgeyB2aWV3cG9ydDogdGhpcy5wYXJlbnQsIHR5cGU6ICdmb2xsb3cnIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=