'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Plugin = require('./plugin');
var Ease = require('pixi-ease');
var exists = require('exists');

module.exports = function (_Plugin) {
    _inherits(SnapZoom, _Plugin);

    /**
     * @private
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     * @param {boolean} [options.removeOnComplete] removes this plugin after snapping is complete
     * @param {boolean} [options.removeOnInterrupt] removes this plugin if interrupted by any user input
     * @param {boolean} [options.forceStart] starts the snap immediately regardless of whether the viewport is at the desired zoom
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    function SnapZoom(parent, options) {
        _classCallCheck(this, SnapZoom);

        var _this = _possibleConstructorReturn(this, (SnapZoom.__proto__ || Object.getPrototypeOf(SnapZoom)).call(this, parent));

        options = options || {};
        _this.width = options.width;
        _this.height = options.height;
        if (_this.width > 0) {
            _this.x_scale = parent._screenWidth / _this.width;
        }
        if (_this.height > 0) {
            _this.y_scale = parent._screenHeight / _this.height;
        }
        _this.xIndependent = exists(_this.x_scale);
        _this.yIndependent = exists(_this.y_scale);
        _this.x_scale = _this.xIndependent ? _this.x_scale : _this.y_scale;
        _this.y_scale = _this.yIndependent ? _this.y_scale : _this.x_scale;

        _this.time = exists(options.time) ? options.time : 1000;
        _this.ease = options.ease || 'easeInOutSine';
        _this.center = options.center;
        _this.stopOnResize = options.stopOnResize;
        _this.removeOnComplete = exists(options.removeOnComplete) ? options.removeOnComplete : true;
        _this.interrupt = exists(options.interrupt) ? options.interrupt : true;
        if (_this.time === 0) {
            parent.container.scale.x = _this.x_scale;
            parent.container.scale.y = _this.y_scale;
            if (_this.removeOnComplete) {
                _this.parent.removePlugin('snap-zoom');
            }
        } else if (options.forceStart) {
            _this.snapping = new Ease.to(_this.parent.scale, { x: _this.x_scale, y: _this.y_scale }, _this.time, { ease: _this.ease });
            _this.parent.emit('snap-zoom-start', _this.parent);
        }
        return _this;
    }

    _createClass(SnapZoom, [{
        key: 'resize',
        value: function resize() {
            this.snapping = null;

            if (this.width > 0) {
                this.x_scale = this.parent._screenWidth / this.width;
            }
            if (this.height > 0) {
                this.y_scale = this.parent._screenHeight / this.height;
            }
            this.x_scale = this.xIndependent ? this.x_scale : this.y_scale;
            this.y_scale = this.yIndependent ? this.y_scale : this.x_scale;
        }
    }, {
        key: 'reset',
        value: function reset() {
            this.snapping = null;
        }
    }, {
        key: 'down',
        value: function down() {
            if (this.removeOnInterrupt) {
                this.parent.removePlugin('snap-zoom');
            } else if (this.interrupt) {
                this.snapping = null;
            }
        }
    }, {
        key: 'update',
        value: function update(elapsed) {
            if (this.paused) {
                return;
            }
            if (this.interrupt && this.parent.countDownPointers() !== 0) {
                return;
            }

            var oldCenter = void 0;
            if (!this.center) {
                oldCenter = this.parent.center;
            }
            if (!this.snapping) {
                if (this.parent.scale.x !== this.x_scale || this.parent.scale.y !== this.y_scale) {
                    this.snapping = new Ease.to(this.parent.scale, { x: this.x_scale, y: this.y_scale }, this.time, { ease: this.ease });
                    this.parent.emit('snap-zoom-start', this.parent);
                }
            } else if (this.snapping) {
                if (this.snapping.update(elapsed)) {
                    if (this.removeOnComplete) {
                        this.parent.removePlugin('snap-zoom');
                    }
                    this.parent.emit('snap-zoom-end', this.parent);
                    this.snapping = null;
                }
                var clamp = this.parent.plugins['clamp-zoom'];
                if (clamp) {
                    clamp.clamp();
                }
                if (!this.center) {
                    this.parent.moveCenter(oldCenter);
                } else {
                    this.parent.moveCenter(this.center);
                }
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            this.snapping = null;
            _get(SnapZoom.prototype.__proto__ || Object.getPrototypeOf(SnapZoom.prototype), 'resume', this).call(this);
        }
    }]);

    return SnapZoom;
}(Plugin);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLXpvb20uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIkVhc2UiLCJleGlzdHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIndpZHRoIiwiaGVpZ2h0IiwieF9zY2FsZSIsIl9zY3JlZW5XaWR0aCIsInlfc2NhbGUiLCJfc2NyZWVuSGVpZ2h0IiwieEluZGVwZW5kZW50IiwieUluZGVwZW5kZW50IiwidGltZSIsImVhc2UiLCJjZW50ZXIiLCJzdG9wT25SZXNpemUiLCJyZW1vdmVPbkNvbXBsZXRlIiwiaW50ZXJydXB0IiwiY29udGFpbmVyIiwic2NhbGUiLCJ4IiwieSIsInJlbW92ZVBsdWdpbiIsImZvcmNlU3RhcnQiLCJzbmFwcGluZyIsInRvIiwiZW1pdCIsInJlbW92ZU9uSW50ZXJydXB0IiwiZWxhcHNlZCIsInBhdXNlZCIsImNvdW50RG93blBvaW50ZXJzIiwib2xkQ2VudGVyIiwidXBkYXRlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxzQkFBWUMsTUFBWixFQUFvQkMsT0FBcEIsRUFDQTtBQUFBOztBQUFBLHdIQUNVRCxNQURWOztBQUVJQyxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGNBQUtDLEtBQUwsR0FBYUQsUUFBUUMsS0FBckI7QUFDQSxjQUFLQyxNQUFMLEdBQWNGLFFBQVFFLE1BQXRCO0FBQ0EsWUFBSSxNQUFLRCxLQUFMLEdBQWEsQ0FBakIsRUFDQTtBQUNJLGtCQUFLRSxPQUFMLEdBQWVKLE9BQU9LLFlBQVAsR0FBc0IsTUFBS0gsS0FBMUM7QUFDSDtB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LEVBQWtDLEtBQUt4QixNQUF2QztBQUNBLHlCQUFLc0IsUUFBTCxHQUFnQixJQUFoQjtBQUNIO0FBQ0Qsb0JBQU1TLFFBQVEsS0FBSy9CLE1BQUwsQ0FBWWdDLE9BQVosQ0FBb0IsWUFBcEIsQ0FBZDtBQUNBLG9CQUFJRCxLQUFKLEVBQ0E7QUFDSUEsMEJBQU1BLEtBQU47QUFDSDtBQUNELG9CQUFJLENBQUMsS0FBS25CLE1BQVYsRUFDQTtBQUNJLHlCQUFLWixNQUFMLENBQVlpQyxVQUFaLENBQXVCSixTQUF2QjtBQUNILGlCQUhELE1BS0E7QUFDSSx5QkFBSzdCLE1BQUwsQ0FBWWlDLFVBQVosQ0FBdUIsS0FBS3JCLE1BQTVCO0FBQ0g7QUFDSjtBQUNKO0FBL0lMO0FBQUE7QUFBQSxpQ0FrSkk7QUFDSSxpQkFBS1UsUUFBTCxHQUFnQixJQUFoQjtBQUNBO0FBQ0g7QUFySkw7O0FBQUE7QUFBQSxFQUF3QzVCLE1BQXhDIiwiZmlsZSI6InNuYXAtem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJylcclxuY29uc3QgRWFzZSA9IHJlcXVpcmUoJ3BpeGktZWFzZScpXHJcbmNvbnN0IGV4aXN0cyA9IHJlcXVpcmUoJ2V4aXN0cycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNuYXBab29tIGV4dGVuZHMgUGx1Z2luXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqIEBwYXJhbSB7Vmlld3BvcnR9IHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoXSB0aGUgZGVzaXJlZCB3aWR0aCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5oZWlnaHRdIHRoZSBkZXNpcmVkIGhlaWdodCB0byBzbmFwICh0byBtYWludGFpbiBhc3BlY3QgcmF0aW8sIGNob29zZSBvbmx5IHdpZHRoIG9yIGhlaWdodClcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50aW1lPTEwMDBdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gW29wdGlvbnMuZWFzZT1lYXNlSW5PdXRTaW5lXSBlYXNlIGZ1bmN0aW9uIG9yIG5hbWUgKHNlZSBodHRwOi8vZWFzaW5ncy5uZXQvIGZvciBzdXBwb3J0ZWQgbmFtZXMpXHJcbiAgICAgKiBAcGFyYW0ge1BJWEkuUG9pbnR9IFtvcHRpb25zLmNlbnRlcl0gcGxhY2UgdGhpcyBwb2ludCBhdCBjZW50ZXIgZHVyaW5nIHpvb20gaW5zdGVhZCBvZiBjZW50ZXIgb2YgdGhlIHZpZXdwb3J0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmludGVycnVwdD10cnVlXSBwYXVzZSBzbmFwcGluZyB3aXRoIGFueSB1c2VyIGlucHV0IG9uIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlXSByZW1vdmVzIHRoaXMgcGx1Z2luIGFmdGVyIHNuYXBwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnJlbW92ZU9uSW50ZXJydXB0XSByZW1vdmVzIHRoaXMgcGx1Z2luIGlmIGludGVycnVwdGVkIGJ5IGFueSB1c2VyIGlucHV0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmZvcmNlU3RhcnRdIHN0YXJ0cyB0aGUgc25hcCBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHZpZXdwb3J0IGlzIGF0IHRoZSBkZXNpcmVkIHpvb21cclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIGZpdCBhbmltYXRpb24gc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgZml0IHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICogQGV2ZW50IHNuYXAtem9vbS1lbmQoVmlld3BvcnQpIGVtaXR0ZWQgZWFjaCB0aW1lIGZpdCByZWFjaGVzIGl0cyB0YXJnZXRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKHBhcmVudClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG4gICAgICAgIGlmICh0aGlzLndpZHRoID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueF9zY2FsZSA9IHBhcmVudC5fc2NyZWVuV2lkdGggLyB0aGlzLndpZHRoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmhlaWdodCA+IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnlfc2NhbGUgPSBwYXJlbnQuX3NjcmVlbkhlaWdodCAvIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueEluZGVwZW5kZW50ID0gZXhpc3RzKHRoaXMueF9zY2FsZSlcclxuICAgICAgICB0aGlzLnlJbmRlcGVuZGVudCA9IGV4aXN0cyh0aGlzLnlfc2NhbGUpXHJcbiAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy54SW5kZXBlbmRlbnQgPyB0aGlzLnhfc2NhbGUgOiB0aGlzLnlfc2NhbGVcclxuICAgICAgICB0aGlzLnlfc2NhbGUgPSB0aGlzLnlJbmRlcGVuZGVudCA/IHRoaXMueV9zY2FsZSA6IHRoaXMueF9zY2FsZVxyXG5cclxuICAgICAgICB0aGlzLnRpbWUgPSBleGlzdHMob3B0aW9ucy50aW1lKSA/IG9wdGlvbnMudGltZSA6IDEwMDBcclxuICAgICAgICB0aGlzLmVhc2UgPSBvcHRpb25zLmVhc2UgfHwgJ2Vhc2VJbk91dFNpbmUnXHJcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcHRpb25zLmNlbnRlclxyXG4gICAgICAgIHRoaXMuc3RvcE9uUmVzaXplID0gb3B0aW9ucy5zdG9wT25SZXNpemVcclxuICAgICAgICB0aGlzLnJlbW92ZU9uQ29tcGxldGUgPSBleGlzdHMob3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlKSA/IG9wdGlvbnMucmVtb3ZlT25Db21wbGV0ZSA6IHRydWVcclxuICAgICAgICB0aGlzLmludGVycnVwdCA9IGV4aXN0cyhvcHRpb25zLmludGVycnVwdCkgPyBvcHRpb25zLmludGVycnVwdCA6IHRydWVcclxuICAgICAgICBpZiAodGhpcy50aW1lID09PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGFyZW50LmNvbnRhaW5lci5zY2FsZS54ID0gdGhpcy54X3NjYWxlXHJcbiAgICAgICAgICAgIHBhcmVudC5jb250YWluZXIuc2NhbGUueSA9IHRoaXMueV9zY2FsZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkNvbXBsZXRlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5mb3JjZVN0YXJ0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG5ldyBFYXNlLnRvKHRoaXMucGFyZW50LnNjYWxlLCB7IHg6IHRoaXMueF9zY2FsZSwgeTogdGhpcy55X3NjYWxlIH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC16b29tLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2l6ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuXHJcbiAgICAgICAgaWYgKHRoaXMud2lkdGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy54X3NjYWxlID0gdGhpcy5wYXJlbnQuX3NjcmVlbldpZHRoIC8gdGhpcy53aWR0aFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5oZWlnaHQgPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy55X3NjYWxlID0gdGhpcy5wYXJlbnQuX3NjcmVlbkhlaWdodCAvIHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueF9zY2FsZSA9IHRoaXMueEluZGVwZW5kZW50ID8gdGhpcy54X3NjYWxlIDogdGhpcy55X3NjYWxlXHJcbiAgICAgICAgdGhpcy55X3NjYWxlID0gdGhpcy55SW5kZXBlbmRlbnQgPyB0aGlzLnlfc2NhbGUgOiB0aGlzLnhfc2NhbGVcclxuICAgIH1cclxuXHJcbiAgICByZXNldCgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBkb3duKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5yZW1vdmVPbkludGVycnVwdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pbnRlcnJ1cHQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJydXB0ICYmIHRoaXMucGFyZW50LmNvdW50RG93blBvaW50ZXJzKCkgIT09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvbGRDZW50ZXJcclxuICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb2xkQ2VudGVyID0gdGhpcy5wYXJlbnQuY2VudGVyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5zbmFwcGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudC5zY2FsZS54ICE9PSB0aGlzLnhfc2NhbGUgfHwgdGhpcy5wYXJlbnQuc2NhbGUueSAhPT0gdGhpcy55X3NjYWxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbmV3IEVhc2UudG8odGhpcy5wYXJlbnQuc2NhbGUsIHsgeDogdGhpcy54X3NjYWxlLCB5OiB0aGlzLnlfc2NhbGUgfSwgdGhpcy50aW1lLCB7IGVhc2U6IHRoaXMuZWFzZSB9KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC16b29tLXN0YXJ0JywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5zbmFwcGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNuYXBwaW5nLnVwZGF0ZShlbGFwc2VkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVtb3ZlT25Db21wbGV0ZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5yZW1vdmVQbHVnaW4oJ3NuYXAtem9vbScpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5lbWl0KCdzbmFwLXpvb20tZW5kJywgdGhpcy5wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGNsYW1wID0gdGhpcy5wYXJlbnQucGx1Z2luc1snY2xhbXAtem9vbSddXHJcbiAgICAgICAgICAgIGlmIChjbGFtcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xhbXAuY2xhbXAoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIob2xkQ2VudGVyKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQubW92ZUNlbnRlcih0aGlzLmNlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN1bWUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICAgICAgc3VwZXIucmVzdW1lKClcclxuICAgIH1cclxufSJdfQ==