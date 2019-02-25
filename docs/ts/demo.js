"use strict";
exports.__esModule = true;
var PIXI = require("pixi.js");
var Viewport = require("../../");
var SettingsPanel = require("settingspanel");
var originals = [], width = window.innerWidth * 3, height = window.innerHeight * 3, stars = (width + height) / 10;
function createPage(name) {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.userSelect = 'none';
    var div = document.createElement('div');
    div.style.fontSize = '1.75em';
    div.innerHTML = "viewport." + name + "() example for <a href=\"https://github.com/davidfig/pixi-viewport.git/\">github.com/davidfig/pixi-viewport/</a></div>";
    document.body.appendChild(div);
}
function createApplication() {
    exports.renderer = new PIXI.Application({ transparent: true, width: window.innerWidth, height: window.innerHeight, resolution: window.devicePixelRatio });
    document.body.appendChild(exports.renderer.view);
    exports.renderer.view.style.position = 'fixed';
    exports.renderer.view.style.width = '100vw';
    exports.renderer.view.style.height = '100vh';
    exports.renderer.view.style.top = 0;
    exports.renderer.view.style.left = 0;
    exports.renderer.view.style.background = 'rgba(0,0,0,.1)';
}
function createViewport() {
    exports.viewport = exports.renderer.stage.addChild(new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: width,
        worldHeight: height
    }));
}
function createWorld() {
    var g = exports.viewport.addChild(new PIXI.Graphics());
    g.lineStyle(5, 0xff0000).drawRect(0, 0, width, height).lineStyle(0);
    for (var i = 0; i < stars; i++) {
        var box = exports.viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
        box.tint = Math.floor(Math.random() * 0xffffff);
        box.width = box.height = 20;
        box.position.set(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
    }
}
function createGUI(name, options, callback) {
    originals = [];
    for (var key in options) {
        originals[key] = options[key];
    }
    exports.panel = new SettingsPanel();
    exports.panel.button(name + '.options', function () { });
    var style = { 'textAlign': 'right' };
    var size = 5;
    var _loop_1 = function (key) {
        var title = key + ': ';
        if (typeof options[key] === 'boolean') {
            var input_1 = exports.panel.input(title, function (value) {
                if (value && value.toLowerCase() !== 'false') {
                    options[key] = true;
                    input_1.value = 'true';
                }
                else {
                    options[key] = false;
                    input_1.value = 'false';
                }
                callback();
            }, { original: options[key] ? 'true' : 'false', size: size, sameLine: true, style: style });
        }
        else if (isNaN(options[key])) {
            var input_2 = exports.panel.input(title, function (value) {
                if (value === '') {
                    options[key] = originals[key];
                }
                else {
                    options[key] = value;
                }
                input_2.value = value;
                callback();
            }, { original: options[key], size: size, sameLine: true, style: style });
        }
        else {
            exports.panel.input(title, function (value) {
                options[key] = value.indexOf('.') === -1 ? parseInt(value) : parseFloat(value);
                callback();
            }, { original: options[key], size: size, sameLine: true, style: style });
        }
    };
    for (var key in options) {
        _loop_1(key);
    }
    callback();
}
function demo(name, options, callback) {
    createPage(name);
    createApplication();
    createViewport();
    createWorld();
    createGUI(name, options, callback);
    window.onresize = function () {
        exports.renderer.renderer.resize(window.innerWidth, window.innerHeight);
        exports.viewport.resize(window.innerWidth, window.innerHeight);
    };
}
exports.demo = demo;
