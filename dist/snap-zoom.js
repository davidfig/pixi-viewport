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
     * @param {Viewport} parent
     * @param {object} [options]
     * @param {number} [options.width] the desired width to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.height] the desired height to snap (to maintain aspect ratio, choose only width or height)
     * @param {number} [options.time=1000]
     * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
     * @param {boolean} [options.removeOnComplete=true] removes this plugin after fitting is complete
     * @param {PIXI.Point} [options.center] place this point at center during zoom instead of center of the viewport
     * @param {boolean} [options.interrupt=true] pause snapping with any user input on the viewport
     *
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
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

        if (_this.time == 0) {
            parent.container.scale.x = _this.x_scale;
            parent.container.scale.y = _this.y_scale;
            if (_this.removeOnComplete) {
                _this.parent.removePlugin('snap-zoom');
            }
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
            this.snapping = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zbmFwLXpvb20uanMiXSwibmFtZXMiOlsiUGx1Z2luIiwicmVxdWlyZSIsIkVhc2UiLCJleGlzdHMiLCJtb2R1bGUiLCJleHBvcnRzIiwicGFyZW50Iiwib3B0aW9ucyIsIndpZHRoIiwiaGVpZ2h0IiwieF9zY2FsZSIsIl9zY3JlZW5XaWR0aCIsInlfc2NhbGUiLCJfc2NyZWVuSGVpZ2h0IiwieEluZGVwZW5kZW50IiwieUluZGVwZW5kZW50IiwidGltZSIsImVhc2UiLCJjZW50ZXIiLCJzdG9wT25SZXNpemUiLCJyZW1vdmVPbkNvbXBsZXRlIiwiaW50ZXJydXB0IiwiY29udGFpbmVyIiwic2NhbGUiLCJ4IiwieSIsInJlbW92ZVBsdWdpbiIsInNuYXBwaW5nIiwiZWxhcHNlZCIsInBhdXNlZCIsImNvdW50RG93blBvaW50ZXJzIiwib2xkQ2VudGVyIiwidG8iLCJlbWl0IiwidXBkYXRlIiwiY2xhbXAiLCJwbHVnaW5zIiwibW92ZUNlbnRlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFNQyxPQUFPRCxRQUFRLFdBQVIsQ0FBYjtBQUNBLElBQU1FLFNBQVNGLFFBQVEsUUFBUixDQUFmOztBQUVBRyxPQUFPQyxPQUFQO0FBQUE7O0FBRUk7Ozs7Ozs7Ozs7Ozs7O0FBY0Esc0JBQVlDLE1BQVosRUFBb0JDLE9BQXBCLEVBQ0E7QUFBQTs7QUFBQSx3SEFDVUQsTUFEVjs7QUFFSUMsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxjQUFLQyxLQUFMLEdBQWFELFFBQVFDLEtBQXJCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjRixRQUFRRSxNQUF0QjtBQUNBLFlBQUksTUFBS0QsS0FBTCxHQUFhLENBQWpCLEVBQ0E7QUFDSSxrQkFBS0UsT0FBTCxHQUFlSixPQUFPSyxZQUFQLEdBQXNCLE1BQUtILEtBQTFDO0FBQ0g7QUFDRCxZQUFJLE1BQUtDLE1BQUwsR0FBYyxDQUFsQixFQUNBO0FB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bnRlbnQiOlsiY29uc3QgUGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKVxyXG5jb25zdCBFYXNlID0gcmVxdWlyZSgncGl4aS1lYXNlJylcclxuY29uc3QgZXhpc3RzID0gcmVxdWlyZSgnZXhpc3RzJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU25hcFpvb20gZXh0ZW5kcyBQbHVnaW5cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge1ZpZXdwb3J0fSBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aF0gdGhlIGRlc2lyZWQgd2lkdGggdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMuaGVpZ2h0XSB0aGUgZGVzaXJlZCBoZWlnaHQgdG8gc25hcCAodG8gbWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBjaG9vc2Ugb25seSB3aWR0aCBvciBoZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudGltZT0xMDAwXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IFtvcHRpb25zLmVhc2U9ZWFzZUluT3V0U2luZV0gZWFzZSBmdW5jdGlvbiBvciBuYW1lIChzZWUgaHR0cDovL2Vhc2luZ3MubmV0LyBmb3Igc3VwcG9ydGVkIG5hbWVzKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlPXRydWVdIHJlbW92ZXMgdGhpcyBwbHVnaW4gYWZ0ZXIgZml0dGluZyBpcyBjb21wbGV0ZVxyXG4gICAgICogQHBhcmFtIHtQSVhJLlBvaW50fSBbb3B0aW9ucy5jZW50ZXJdIHBsYWNlIHRoaXMgcG9pbnQgYXQgY2VudGVyIGR1cmluZyB6b29tIGluc3RlYWQgb2YgY2VudGVyIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbnRlcnJ1cHQ9dHJ1ZV0gcGF1c2Ugc25hcHBpbmcgd2l0aCBhbnkgdXNlciBpbnB1dCBvbiB0aGUgdmlld3BvcnRcclxuICAgICAqXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLXN0YXJ0KFZpZXdwb3J0KSBlbWl0dGVkIGVhY2ggdGltZSBhIGZpdCBhbmltYXRpb24gc3RhcnRzXHJcbiAgICAgKiBAZXZlbnQgc25hcC16b29tLWVuZChWaWV3cG9ydCkgZW1pdHRlZCBlYWNoIHRpbWUgZml0IHJlYWNoZXMgaXRzIHRhcmdldFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIocGFyZW50KVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGhcclxuICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0XHJcbiAgICAgICAgaWYgKHRoaXMud2lkdGggPiAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy54X3NjYWxlID0gcGFyZW50Ll9zY3JlZW5XaWR0aCAvIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueV9zY2FsZSA9IHBhcmVudC5fc2NyZWVuSGVpZ2h0IC8gdGhpcy5oZWlnaHRcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy54SW5kZXBlbmRlbnQgPSBleGlzdHModGhpcy54X3NjYWxlKVxyXG4gICAgICAgIHRoaXMueUluZGVwZW5kZW50ID0gZXhpc3RzKHRoaXMueV9zY2FsZSlcclxuICAgICAgICB0aGlzLnhfc2NhbGUgPSB0aGlzLnhJbmRlcGVuZGVudCA/IHRoaXMueF9zY2FsZSA6IHRoaXMueV9zY2FsZVxyXG4gICAgICAgIHRoaXMueV9zY2FsZSA9IHRoaXMueUluZGVwZW5kZW50ID8gdGhpcy55X3NjYWxlIDogdGhpcy54X3NjYWxlXHJcblxyXG4gICAgICAgIHRoaXMudGltZSA9IGV4aXN0cyhvcHRpb25zLnRpbWUpID8gb3B0aW9ucy50aW1lIDogMTAwMFxyXG4gICAgICAgIHRoaXMuZWFzZSA9IG9wdGlvbnMuZWFzZSB8fCAnZWFzZUluT3V0U2luZSdcclxuICAgICAgICB0aGlzLmNlbnRlciA9IG9wdGlvbnMuY2VudGVyXHJcbiAgICAgICAgdGhpcy5zdG9wT25SZXNpemUgPSBvcHRpb25zLnN0b3BPblJlc2l6ZVxyXG4gICAgICAgIHRoaXMucmVtb3ZlT25Db21wbGV0ZSA9IGV4aXN0cyhvcHRpb25zLnJlbW92ZU9uQ29tcGxldGUpID8gb3B0aW9ucy5yZW1vdmVPbkNvbXBsZXRlIDogdHJ1ZVxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0ID0gZXhpc3RzKG9wdGlvbnMuaW50ZXJydXB0KSA/IG9wdGlvbnMuaW50ZXJydXB0IDogdHJ1ZVxyXG5cclxuICAgICAgICBpZiAodGhpcy50aW1lID09IDApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwYXJlbnQuY29udGFpbmVyLnNjYWxlLnggPSB0aGlzLnhfc2NhbGVcclxuICAgICAgICAgICAgcGFyZW50LmNvbnRhaW5lci5zY2FsZS55ID0gdGhpcy55X3NjYWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU9uQ29tcGxldGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnJlbW92ZVBsdWdpbignc25hcC16b29tJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNpemUoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcblxyXG4gICAgICAgIGlmICh0aGlzLndpZHRoID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueF9zY2FsZSA9IHRoaXMucGFyZW50Ll9zY3JlZW5XaWR0aCAvIHRoaXMud2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaGVpZ2h0ID4gMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMueV9zY2FsZSA9IHRoaXMucGFyZW50Ll9zY3JlZW5IZWlnaHQgLyB0aGlzLmhlaWdodFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnhfc2NhbGUgPSB0aGlzLnhJbmRlcGVuZGVudCA/IHRoaXMueF9zY2FsZSA6IHRoaXMueV9zY2FsZVxyXG4gICAgICAgIHRoaXMueV9zY2FsZSA9IHRoaXMueUluZGVwZW5kZW50ID8gdGhpcy55X3NjYWxlIDogdGhpcy54X3NjYWxlXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc25hcHBpbmcgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgZG93bigpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoZWxhcHNlZClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5wYXVzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmludGVycnVwdCAmJiB0aGlzLnBhcmVudC5jb3VudERvd25Qb2ludGVycygpICE9PSAwKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2xkQ2VudGVyXHJcbiAgICAgICAgaWYgKCF0aGlzLmNlbnRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9sZENlbnRlciA9IHRoaXMucGFyZW50LmNlbnRlclxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnQuc2NhbGUueCAhPT0gdGhpcy54X3NjYWxlIHx8IHRoaXMucGFyZW50LnNjYWxlLnkgIT09IHRoaXMueV9zY2FsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG5ldyBFYXNlLnRvKHRoaXMucGFyZW50LnNjYWxlLCB7IHg6IHRoaXMueF9zY2FsZSwgeTogdGhpcy55X3NjYWxlIH0sIHRoaXMudGltZSwgeyBlYXNlOiB0aGlzLmVhc2UgfSlcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmVtaXQoJ3NuYXAtem9vbS1zdGFydCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuc25hcHBpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zbmFwcGluZy51cGRhdGUoZWxhcHNlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJlbW92ZU9uQ29tcGxldGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQucmVtb3ZlUGx1Z2luKCdzbmFwLXpvb20nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuZW1pdCgnc25hcC16b29tLWVuZCcsIHRoaXMucGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFwcGluZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjbGFtcCA9IHRoaXMucGFyZW50LnBsdWdpbnNbJ2NsYW1wLXpvb20nXVxyXG4gICAgICAgICAgICBpZiAoY2xhbXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsYW1wLmNsYW1wKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2VudGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5tb3ZlQ2VudGVyKG9sZENlbnRlcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Lm1vdmVDZW50ZXIodGhpcy5jZW50ZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdW1lKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLnNuYXBwaW5nID0gbnVsbFxyXG4gICAgICAgIHN1cGVyLnJlc3VtZSgpXHJcbiAgICB9XHJcbn0iXX0=