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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mb2xsb3cuanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXJlbnQiLCJ0YXJnZXQiLCJvcHRpb25zIiwic3BlZWQiLCJyYWRpdXMiLCJwYXVzZWQiLCJjZW50ZXIiLCJ0b1giLCJ4IiwidG9ZIiwieSIsImRpc3RhbmNlIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJhbmdsZSIsImF0YW4yIiwiY29zIiwic2luIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2hhbmdlWCIsImNoYW5nZVkiLCJhYnMiLCJtb3ZlQ2VudGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7O0FBRUFDLE9BQU9DLE9BQVA7QUFBQTs7QUFFSTs7Ozs7Ozs7QUFRQSxvQkFBWUMsTUFBWixFQUFvQkMsTUFBcEIsRUFBNEJDLE9BQTVCLEVBQ0E7QUFBQTs7QUFBQSxvSEFDVUYsTUFEVjs7QUFFSUUsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxLQUFMLEdBQWFELFFBQVFDLEtBQVIsSUFBaUIsQ0FBOUI7QUFDQSxjQUFLRixNQUFMLEdBQWNBLE1BQWQ7QUFDQSxjQUFLRyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBTEo7QUFNQzs7QUFqQkw7QUFBQTtBQUFBLGlDQW9CSTtBQUNJLGdCQUFJLEtBQUtDLE1BQVQsRUFDQTtBQUNJO0FBQ0g7O0FBRUQsZ0JBQU1DLFNBQVMsS0FBS04sTUFBTCxDQUFZTSxNQUEzQjtBQUNBLGdCQUFJQyxNQUFNLEtBQUtOLE1BQUwsQ0FBWU8sQ0FBdEI7QUFBQSxnQkFBeUJDLE1BQU0sS0FBS1IsTUFBTCxDQUFZUyxDQUEzQztBQUNBLGdCQUFJLEtBQUtOLE1BQVQsRUFDQTtBQUNJLG9CQUFNTyxXQUFXQyxLQUFLQyxJQUFMLENBQVVELEtBQUtFLEdBQUwsQ0FBUyxLQUFLYixNQUFMLENBQVlTLENBQVosR0FBZ0JKLE9BQU9JLENBQWhDLEVBQW1DLENBQW5DLElBQXdDRSxLQUFLRSxHQUFMLENBQVMsS0FBS2IsTUFBTCxDQUFZTyxDQUFaLEdBQWdCRixPQUFPRSxDQUFoQyxFQUFtQyxDQUFuQyxDQUFsRCxDQUFqQjtBQUNBLG9CQUFJRyxXQUFXLEtBQUtQLE1BQXBCLEVBQ0E7QUFDSSx3QkFBTVcsUUFBUUgsS0FBS0ksS0FBTCxDQUFXLEtBQUtmLE1BQUwsQ0FBWVMsQ0FBWixHQUFnQkosT0FBT0ksQ0FBbEMsRUFBcUMsS0FBS1QsTUFBTCxDQUFZTyxDQUFaLEdBQWdCRixPQUFPRSxDQUE1RCxDQUFkO0FBQ0FELDBCQUFNLEtBQUtOLE1BQUwsQ0FBWU8sQ0FBWixHQUFnQkksS0FBS0ssR0FBTCxDQUFTRixLQUFULElBQWtCLEtBQUtYLE1BQTdDO0FBQ0FLLDBCQUFNLEtBQUtSLE1BQUwsQ0FBWVMsQ0FBWixHQUFnQkUsS0FBS00sR0FBTCxDQUFTSCxLQUFULElBQWtCLEtBQUtYLE1BQTdDO0FBQ0gsaUJBTEQsTUFPQTtBQUNJO0FBQ0g7QUFDSjtBQUNELGdCQUFJLEtBQUtELEtBQVQsRUFDQTtBQUNJLG9CQUFNZ0IsU0FBU1osTUFBTUQsT0FBT0UsQ0FBNUI7QUFDQSxvQkFBTVksU0FBU1gsTUFBTUgsT0FBT0ksQ0FBNUI7QUFDQSxvQkFBSVMsVUFBVUMsTUFBZCxFQUNBO0FBQ0ksd0JBQU1MLFNBQVFILEtBQUtJLEtBQUwsQ0FBV1AsTUFBTUgsT0FBT0ksQ0FBeEIsRUFBMkJILE1BQU1ELE9BQU9FLENBQXhDLENBQWQ7QUFDQSx3QkFBTWEsVUFBVVQsS0FBS0ssR0FBTCxDQUFTRixNQUFULElBQWtCLEtBQUtaLEtBQXZDO0FBQ0Esd0JBQU1tQixVQUFVVixLQUFLTSxHQUFMLENBQVNILE1BQVQsSUFBa0IsS0FBS1osS0FBdkM7QUFDQSx3QkFBTUssSUFBSUksS0FBS1csR0FBTCxDQUFTRixPQUFULElBQW9CVCxLQUFLVyxHQUFMLENBQVNKLE1BQVQsQ0FBcEIsR0FBdUNaLEdBQXZDLEdBQTZDRCxPQUFPRSxDQUFQLEdBQVdhLE9BQWxFO0FBQ0Esd0JBQU1YLElBQUlFLEtBQUtXLEdBQUwsQ0FBU0QsT0FBVCxJQUFvQlYsS0FBS1csR0FBTCxDQUFTSCxNQUFULENBQXBCLEdBQXVDWCxHQUF2QyxHQUE2Q0gsT0FBT0ksQ0FBUCxHQUFXWSxPQUFsRTtBQUNBLHlCQUFLdEIsTUFBTCxDQUFZd0IsVUFBWixDQUF1QmhCLENBQXZCLEVBQTBCRSxDQUExQjtBQUNIO0FBQ0osYUFiRCxNQWVBO0FBQ0kscUJBQUtWLE1BQUwsQ0FBWXdCLFVBQVosQ0FBdUJqQixHQUF2QixFQUE0QkUsR0FBNUI7QUFDSDtBQUNKO0FBNURMOztBQUFBO0FBQUEsRUFBc0NiLE1BQXRDIiwiZmlsZSI6ImZvbGxvdy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRm9sbG93IGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtQSVhJLkRpc3BsYXlPYmplY3R9IHRhcmdldCB0byBmb2xsb3cgKG9iamVjdCBtdXN0IGluY2x1ZGUge3g6IHgtY29vcmRpbmF0ZSwgeTogeS1jb29yZGluYXRlfSlcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zcGVlZD0wXSB0byBmb2xsb3cgaW4gcGl4ZWxzL2ZyYW1lICgwPXRlbGVwb3J0IHRvIGxvY2F0aW9uKVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnJhZGl1c10gcmFkaXVzIChpbiB3b3JsZCBjb29yZGluYXRlcykgb2YgY2VudGVyIGNpcmNsZSB3aGVyZSBtb3ZlbWVudCBpcyBhbGxvd2VkIHdpdGhvdXQgbW92aW5nIHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHRhcmdldCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcihwYXJlbnQpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnNwZWVkID0gb3B0aW9ucy5zcGVlZCB8fCAwXHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXRcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IG9wdGlvbnMucmFkaXVzXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgIGxldCB0b1ggPSB0aGlzLnRhcmdldC54LCB0b1kgPSB0aGlzLnRhcmdldC55XHJcbiAgICAgICAgaWYgKHRoaXMucmFkaXVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy50YXJnZXQueSAtIGNlbnRlci55LCAyKSArIE1hdGgucG93KHRoaXMudGFyZ2V0LnggLSBjZW50ZXIueCwgMikpXHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IHRoaXMucmFkaXVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy50YXJnZXQueSAtIGNlbnRlci55LCB0aGlzLnRhcmdldC54IC0gY2VudGVyLngpXHJcbiAgICAgICAgICAgICAgICB0b1ggPSB0aGlzLnRhcmdldC54IC0gTWF0aC5jb3MoYW5nbGUpICogdGhpcy5yYWRpdXNcclxuICAgICAgICAgICAgICAgIHRvWSA9IHRoaXMudGFyZ2V0LnkgLSBNYXRoLnNpbihhbmdsZSkgKiB0aGlzLnJhZGl1c1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3BlZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBkZWx0YVggPSB0b1ggLSBjZW50ZXIueFxyXG4gICAgICAgICAgICBjb25zdCBkZWx0YVkgPSB0b1kgLSBjZW50ZXIueVxyXG4gICAgICAgICAgICBpZiAoZGVsdGFYIHx8IGRlbHRhWSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHRvWSAtIGNlbnRlci55LCB0b1ggLSBjZW50ZXIueClcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoYW5nZVggPSBNYXRoLmNvcyhhbmdsZSkgKiB0aGlzLnNwZWVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VZID0gTWF0aC5zaW4oYW5nbGUpICogdGhpcy5zcGVlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeCA9IE1hdGguYWJzKGNoYW5nZVgpID4gTWF0aC5hYnMoZGVsdGFYKSA/IHRvWCA6IGNlbnRlci54ICsgY2hhbmdlWFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeSA9IE1hdGguYWJzKGNoYW5nZVkpID4gTWF0aC5hYnMoZGVsdGFZKSA/IHRvWSA6IGNlbnRlci55ICsgY2hhbmdlWVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih4LCB5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodG9YLCB0b1kpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19