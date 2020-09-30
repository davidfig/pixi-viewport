(function () {
    'use strict';

    exports.__esModule = true;
    var PIXI = require("pixi.js");
    var __1 = require("../../../");
    window.onload = function () {
        function rand(n) {
            return Math.round(Math.random() * n);
        }
        var app = new PIXI.Application();
        app.view.style.textAlign = 'center';
        document.body.appendChild(app.view);
        var div = document.createElement('div');
        div.innerHTML = '<div>Rollup + typescript <a href="https://https://github.com/davidfig/pixi-viewport">pixi-viewport</a>: viewport.drag().pinch().decelerate()</div>';
        document.body.appendChild(div);
        var viewport = new __1.Viewport({ screenWidth: app.view.offsetWidth, screenHeight: app.view.offsetHeight });
        app.stage.addChild(viewport);
        for (var i = 0; i < 10000; i++) {
            var sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            viewport.addChild(sprite);
            sprite.tint = rand(0xffffff);
            sprite.position.set(rand(10000), rand(10000));
        }
        viewport
            .moveCenter(5000, 5000)
            .drag()
            .pinch()
            .decelerate();
    };

}());
//# sourceMappingURL=index.js.map
