(function (polyfill, accessibility, extract, interaction, prepare, utils, PIXI$1, core, loaders, particles, spritesheet, spriteTiling, textBitmap, ticker, filterAlpha, filterBlur, filterColorMatrix, filterDisplacement, filterFxaa, filterNoise, mixinCacheAsBitmap, mixinGetChildByName, mixinGetGlobalPosition, constants, display, graphics, math, mesh, meshExtras, runner, sprite, spriteAnimated, text, settings) {
    'use strict';

    /*!
     * pixi.js - v5.0.3
     * Compiled Sun, 19 May 2019 19:03:31 UTC
     *
     * pixi.js is licensed under the MIT License.
     * http://www.opensource.org/licenses/mit-license
     */

    // Install renderer plugins
    core.Renderer.registerPlugin('accessibility', accessibility.AccessibilityManager);
    core.Renderer.registerPlugin('extract', extract.Extract);
    core.Renderer.registerPlugin('interaction', interaction.InteractionManager);
    core.Renderer.registerPlugin('particle', particles.ParticleRenderer);
    core.Renderer.registerPlugin('prepare', prepare.Prepare);
    core.Renderer.registerPlugin('batch', core.BatchRenderer);
    core.Renderer.registerPlugin('tilingSprite', spriteTiling.TilingSpriteRenderer);

    loaders.Loader.registerPlugin(textBitmap.BitmapFontLoader);
    loaders.Loader.registerPlugin(spritesheet.SpritesheetLoader);

    PIXI$1.Application.registerPlugin(ticker.TickerPlugin);
    PIXI$1.Application.registerPlugin(loaders.AppLoaderPlugin);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var alea = createCommonjsModule(function (module) {
    // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
    // http://baagoe.com/en/RandomMusings/javascript/
    // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
    // Original work is under MIT license -

    // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.



    (function(global, module, define) {

    function Alea(seed) {
      var me = this, mash = Mash();

      me.next = function() {
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
        me.s0 = me.s1;
        me.s1 = me.s2;
        return me.s2 = t - (me.c = t | 0);
      };

      // Apply the seeding algorithm from Baagoe.
      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);
      if (me.s0 < 0) { me.s0 += 1; }
      me.s1 -= mash(seed);
      if (me.s1 < 0) { me.s1 += 1; }
      me.s2 -= mash(seed);
      if (me.s2 < 0) { me.s2 += 1; }
      mash = null;
    }

    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }

    function impl(seed, opts) {
      var xg = new Alea(seed),
          state = opts && opts.state,
          prng = xg.next;
      prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
      prng.double = function() {
        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    function Mash() {
      var n = 0xefc8249d;

      var mash = function(data) {
        data = String(data);
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      return mash;
    }


    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.alea = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var xor128 = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xor128" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;

      // Set up generator function.
      me.next = function() {
        var t = me.x ^ (me.x << 11);
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
      };

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor128 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var xorwow = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xorwow" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var t = (me.x ^ (me.x >>> 2));
        me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
        return (me.d = (me.d + 362437 | 0)) +
           (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
      };

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;
      me.v = 0;

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        if (k == strseed.length) {
          me.d = me.x << 10 ^ me.x >>> 4;
        }
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      t.v = f.v;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorwow = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var xorshift7 = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xorshift7" algorithm by
    // François Panneton and Pierre L'ecuyer:
    // "On the Xorgshift Random Number Generators"
    // http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        // Update xor generator.
        var X = me.x, i = me.i, t, v;
        t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
        t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
        t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
        X[i] = v;
        me.i = (i + 1) & 7;
        return v;
      };

      function init(me, seed) {
        var j, w, X = [];

        if (seed === (seed | 0)) {
          // Seed state array using a 32-bit integer.
          w = X[0] = seed;
        } else {
          // Seed state using a string.
          seed = '' + seed;
          for (j = 0; j < seed.length; ++j) {
            X[j & 7] = (X[j & 7] << 15) ^
                (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
          }
        }
        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) X.push(0);
        for (j = 0; j < 8 && X[j] === 0; ++j);
        if (j == 8) w = X[7] = -1; else w = X[j];

        me.x = X;
        me.i = 0;

        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
          me.next();
        }
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.x = f.x.slice();
      t.i = f.i;
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.x) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorshift7 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var xor4096 = createCommonjsModule(function (module) {
    // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
    //
    // This fast non-cryptographic random number generator is designed for
    // use in Monte-Carlo algorithms. It combines a long-period xorshift
    // generator with a Weyl generator, and it passes all common batteries
    // of stasticial tests for randomness while consuming only a few nanoseconds
    // for each prng generated.  For background on the generator, see Brent's
    // paper: "Some long-period random number generators using shifts and xors."
    // http://arxiv.org/pdf/1004.3115v1.pdf
    //
    // Usage:
    //
    // var xor4096 = require('xor4096');
    // random = xor4096(1);                        // Seed with int32 or string.
    // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
    // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
    //
    // For nonzero numeric keys, this impelementation provides a sequence
    // identical to that by Brent's xorgens 3 implementaion in C.  This
    // implementation also provides for initalizing the generator with
    // string seeds, or for saving and restoring the state of the generator.
    //
    // On Chrome, this prng benchmarks about 2.1 times slower than
    // Javascript's built-in Math.random().

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        var w = me.w,
            X = me.X, i = me.i, t, v;
        // Update Weyl generator.
        me.w = w = (w + 0x61c88647) | 0;
        // Update xor generator.
        v = X[(i + 34) & 127];
        t = X[i = ((i + 1) & 127)];
        v ^= v << 13;
        t ^= t << 17;
        v ^= v >>> 15;
        t ^= t >>> 12;
        // Update Xor generator array state.
        v = X[i] = v ^ t;
        me.i = i;
        // Result is the combination.
        return (v + (w ^ (w >>> 16))) | 0;
      };

      function init(me, seed) {
        var t, v, i, j, w, X = [], limit = 128;
        if (seed === (seed | 0)) {
          // Numeric seeds initialize v, which is used to generates X.
          v = seed;
          seed = null;
        } else {
          // String seeds are mixed into v and X one character at a time.
          seed = seed + '\0';
          v = 0;
          limit = Math.max(limit, seed.length);
        }
        // Initialize circular array and weyl value.
        for (i = 0, j = -32; j < limit; ++j) {
          // Put the unicode characters into the array, and shuffle them.
          if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
          // After 32 shuffles, take v as the starting w value.
          if (j === 0) w = v;
          v ^= v << 10;
          v ^= v >>> 15;
          v ^= v << 4;
          v ^= v >>> 13;
          if (j >= 0) {
            w = (w + 0x61c88647) | 0;     // Weyl.
            t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
            i = (0 == t) ? i + 1 : 0;     // Count zeroes.
          }
        }
        // We have detected all zeroes; make the key nonzero.
        if (i >= 128) {
          X[(seed && seed.length || 0) & 127] = -1;
        }
        // Run the generator 512 times to further mix the state before using it.
        // Factoring this as a function slows the main generator, so it is just
        // unrolled here.  The weyl generator is not advanced while warming up.
        i = 127;
        for (j = 4 * 128; j > 0; --j) {
          v = X[(i + 34) & 127];
          t = X[i = ((i + 1) & 127)];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          X[i] = v ^ t;
        }
        // Storing state as object members is faster than using closure variables.
        me.w = w;
        me.X = X;
        me.i = i;
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.i = f.i;
      t.w = f.w;
      t.X = f.X.slice();
      return t;
    }
    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.X) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor4096 = impl;
    }

    })(
      commonjsGlobal,                                     // window object or global
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var tychei = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "Tyche-i" prng algorithm by
    // Samuel Neves and Filipe Araujo.
    // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var b = me.b, c = me.c, d = me.d, a = me.a;
        b = (b << 25) ^ (b >>> 7) ^ c;
        c = (c - d) | 0;
        d = (d << 24) ^ (d >>> 8) ^ a;
        a = (a - b) | 0;
        me.b = b = (b << 20) ^ (b >>> 12) ^ c;
        me.c = c = (c - d) | 0;
        me.d = (d << 16) ^ (c >>> 16) ^ a;
        return me.a = (a - b) | 0;
      };

      /* The following is non-inverted tyche, which has better internal
       * bit diffusion, but which is about 25% slower than tyche-i in JS.
      me.next = function() {
        var a = me.a, b = me.b, c = me.c, d = me.d;
        a = (me.a + me.b | 0) >>> 0;
        d = me.d ^ a; d = d << 16 ^ d >>> 16;
        c = me.c + d | 0;
        b = me.b ^ c; b = b << 12 ^ d >>> 20;
        me.a = a = a + b | 0;
        d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
        me.c = c = c + d | 0;
        b = b ^ c;
        return me.b = (b << 7 ^ b >>> 25);
      }
      */

      me.a = 0;
      me.b = 0;
      me.c = 2654435769 | 0;
      me.d = 1367130551;

      if (seed === Math.floor(seed)) {
        // Integer seed.
        me.a = (seed / 0x100000000) | 0;
        me.b = seed | 0;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 20; k++) {
        me.b ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.a = f.a;
      t.b = f.b;
      t.c = f.c;
      t.d = f.d;
      return t;
    }
    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.tychei = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'   // present with an AMD loader
    );
    });

    var require$$0 = {};

    var seedrandom = createCommonjsModule(function (module) {
    /*
    Copyright 2014 David Bau.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */

    (function (pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //

    // Detect the global object, even if operating in strict mode.
    // http://stackoverflow.com/a/14387057/265298
    var global = (0, eval)('this'),
        width = 256,        // each RC4 output is 0 <= x < 256
        chunks = 6,         // at least six RC4 outputs for each double
        digits = 52,        // there are 52 significant digits in a double
        rngname = 'random', // rngname: name for Math.random and Math.seedrandom
        startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto;         // node.js crypto module, initialized at the bottom.

    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
      var key = [];
      options = (options == true) ? { entropy: true } : (options || {});

      // Flatten the seed string or build one from local entropy if needed.
      var shortseed = mixkey(flatten(
        options.entropy ? [seed, tostring(pool)] :
        (seed == null) ? autoseed() : seed, 3), key);

      // Use the seed to initialize an ARC4 generator.
      var arc4 = new ARC4(key);

      // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.
      var prng = function() {
        var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
            d = startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
        while (n < significance) {          // Fill up all significant digits by
          n = (n + x) * width;              //   shifting numerator and
          d *= width;                       //   denominator and generating a
          x = arc4.g(1);                    //   new least-significant-byte.
        }
        while (n >= overflow) {             // To avoid rounding up, before adding
          n /= 2;                           //   last byte, shift everything
          d /= 2;                           //   right using integer math until
          x >>>= 1;                         //   we have exactly the desired bits.
        }
        return (n + x) / d;                 // Form the number within [0, 1).
      };

      prng.int32 = function() { return arc4.g(4) | 0; };
      prng.quick = function() { return arc4.g(4) / 0x100000000; };
      prng.double = prng;

      // Mix the randomness into accumulated entropy.
      mixkey(tostring(arc4.S), pool);

      // Calling convention: what to return as a function of prng, seed, is_math.
      return (options.pass || callback ||
          function(prng, seed, is_math_call, state) {
            if (state) {
              // Load the arc4 state from the given state if it has an S array.
              if (state.S) { copy(state, arc4); }
              // Only provide the .state method if requested via options.state.
              prng.state = function() { return copy(arc4, {}); };
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) { math[rngname] = prng; return seed; }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
          })(
      prng,
      shortseed,
      'global' in options ? options.global : (this == math),
      options.state);
    }

    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    function ARC4(key) {
      var t, keylen = key.length,
          me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

      // The empty key [] is treated as [0].
      if (!keylen) { key = [keylen++]; }

      // Set up S using the standard key scheduling algorithm.
      while (i < width) {
        s[i] = i++;
      }
      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
        s[j] = t;
      }

      // The "g" method returns the next (count) outputs as one number.
      (me.g = function(count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
          t = s[i = mask & (i + 1)];
          r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        me.i = i; me.j = j;
        return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      })(width);
    }

    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
      var result = [], typ = (typeof obj), prop;
      if (depth && typ == 'object') {
        for (prop in obj) {
          try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
        }
      }
      return (result.length ? result : typ == 'string' ? obj : obj + '\0');
    }

    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
      var stringseed = seed + '', smear, j = 0;
      while (j < stringseed.length) {
        key[mask & j] =
          mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
      }
      return tostring(key);
    }

    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
      try {
        var out;
        if (nodecrypto && (out = nodecrypto.randomBytes)) {
          // The use of 'out' to remember randomBytes makes tight minified code.
          out = out(width);
        } else {
          out = new Uint8Array(width);
          (global.crypto || global.msCrypto).getRandomValues(out);
        }
        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date, global, plugins, global.screen, tostring(pool)];
      }
    }

    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    }

    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);

    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (module.exports) {
      module.exports = seedrandom;
      // When in node.js, try using crypto package for autoseeding.
      try {
        nodecrypto = require$$0;
      } catch (ex) {}
    } else {
      // When included as a plain script, set up Math.seedrandom global.
      math['seed' + rngname] = seedrandom;
    }


    // End anonymous scope, and pass initial values.
    })(
      [],     // pool: entropy pool starts empty
      Math    // math: package containing random, pow, and seedrandom
    );
    });

    // A library of seedable RNGs implemented in Javascript.
    //
    // Usage:
    //
    // var seedrandom = require('seedrandom');
    // var random = seedrandom(1); // or any seed.
    // var x = random();       // 0 <= x < 1.  Every bit is random.
    // var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

    // alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
    // Period: ~2^116
    // Reported to pass all BigCrush tests.


    // xor128, a pure xor-shift generator by George Marsaglia.
    // Period: 2^128-1.
    // Reported to fail: MatrixRank and LinearComp.


    // xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
    // Period: 2^192-2^32
    // Reported to fail: CollisionOver, SimpPoker, and LinearComp.


    // xorshift7, by François Panneton and Pierre L'ecuyer, takes
    // a different approach: it adds robustness by allowing more shifts
    // than Marsaglia's original three.  It is a 7-shift generator
    // with 256 bits, that passes BigCrush with no systmatic failures.
    // Period 2^256-1.
    // No systematic BigCrush failures reported.


    // xor4096, by Richard Brent, is a 4096-bit xor-shift with a
    // very long period that also adds a Weyl generator. It also passes
    // BigCrush with no systematic failures.  Its long period may
    // be useful if you have many generators and need to avoid
    // collisions.
    // Period: 2^4128-2^32.
    // No systematic BigCrush failures reported.


    // Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
    // number generator derived from ChaCha, a modern stream cipher.
    // https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
    // Period: ~2^127
    // No systematic BigCrush failures reported.


    // The original ARC4-based prng included in this library.
    // Period: ~2^1600


    seedrandom.alea = alea;
    seedrandom.xor128 = xor128;
    seedrandom.xorwow = xorwow;
    seedrandom.xorshift7 = xorshift7;
    seedrandom.xor4096 = xor4096;
    seedrandom.tychei = tychei;

    var seedrandom$1 = seedrandom;

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    // yy-random
    // by David Figatner
    // MIT license
    // copyright YOPEY YOPEY LLC 2016-17
    // https://github.com/davidfig/random



    var Random = function () {
        function Random() {
            _classCallCheck(this, Random);

            this.generator = Math.random;
        }

        /**
         * generates a seeded number
         * @param {number} seed
         * @param {object} [options]
         * @param {string} [PRNG="alea"] - name of algorithm, see https://github.com/davidbau/seedrandom
         * @param {(boolean|string)} [state] - can include the state returned from save()
         */


        _createClass(Random, [{
            key: 'seed',
            value: function seed(_seed, options) {
                options = options || {};
                this.generator = seedrandom$1[options.PRNG || 'alea'](_seed, { state: options.state });
                this.options = options;
            }

            /**
             * saves the state of the random generator
             * can only be used after Random.seed() is called with options.state = true
             * @returns {number} state
             */

        }, {
            key: 'save',
            value: function save() {
                if (this.generator !== Math.random) {
                    return this.generator.state();
                }
            }

            /**
             * restores the state of the random generator
             * @param {number} state
             */

        }, {
            key: 'restore',
            value: function restore(state) {
                this.generator = seedrandom$1[this.options.PRNG || 'alea']('', { state: state });
            }

            /**
             * changes the generator to use the old Math.sin-based random function
             * based on : http://stackoverflow.com/questions/521295/javascript-random-seeds
             * (deprecated) Use only for compatibility purposes
             * @param {number} seed
             */

        }, {
            key: 'seedOld',
            value: function seedOld(seed) {
                this.generator = function () {
                    var x = Math.sin(seed++) * 10000;
                    return x - Math.floor(x);
                };
            }

            /**
             * create a separate random generator using the seed
             * @param {number} seed
             * @return {object}
             */

        }, {
            key: 'separateSeed',
            value: function separateSeed(seed) {
                var random = new Random();
                random.seed(seed);
                return random;
            }

            /**
             * resets the random number this.generator to Math.random()
             */

        }, {
            key: 'reset',
            value: function reset() {
                this.generator = Math.random;
            }

            /**
             * returns a random number using the this.generator between [0, ceiling - 1]
             * @param {number} ceiling
             * @param {boolean} [useFloat=false]
             * @return {number}
             */

        }, {
            key: 'get',
            value: function get(ceiling, useFloat) {
                var negative = ceiling < 0 ? -1 : 1;
                ceiling *= negative;
                var result = void 0;
                if (useFloat) {
                    result = this.generator() * ceiling;
                } else {
                    result = Math.floor(this.generator() * ceiling);
                }
                return result * negative;
            }

            /**
             * returns a random integer between 0 - Number.MAX_SAFE_INTEGER
             * @return {number}
             */

        }, {
            key: 'getHuge',
            value: function getHuge() {
                return this.get(Number.MAX_SAFE_INTEGER);
            }

            /**
             * random number [middle - range, middle + range]
             * @param {number} middle
             * @param {number} delta
             * @param {boolean} [useFloat=false]
             * @return {number}
             */

        }, {
            key: 'middle',
            value: function middle(_middle, delta, useFloat) {
                var half = delta / 2;
                return this.range(_middle - half, _middle + half, useFloat);
            }

            /**
             * random number [start, end]
             * @param {number} start
             * @param {number} end
             * @param {boolean} [useFloat=false] if true, then range is (start, end)--i.e., not inclusive to start and end
             * @return {number}
             */

        }, {
            key: 'range',
            value: function range(start, end, useFloat) {
                // case where there is no range
                if (end === start) {
                    return end;
                }

                if (useFloat) {
                    return this.get(end - start, true) + start;
                } else {
                    var range = void 0;
                    if (start < 0 && end > 0) {
                        range = -start + end + 1;
                    } else if (start === 0 && end > 0) {
                        range = end + 1;
                    } else if (start < 0 && end === 0) {
                        range = start - 1;
                        start = 1;
                    } else if (start < 0 && end < 0) {
                        range = end - start - 1;
                    } else {
                        range = end - start + 1;
                    }
                    return Math.floor(this.generator() * range) + start;
                }
            }

            /**
             * an array of random numbers between [start, end]
             * @param {number} start
             * @param {number} end
             * @param {number} count
             * @param {boolean} [useFloat=false]
             * @return {number[]}
             */

        }, {
            key: 'rangeMultiple',
            value: function rangeMultiple(start, end, count, useFloat) {
                var array = [];
                for (var i = 0; i < count; i++) {
                    array.push(this.range(start, end, useFloat));
                }
                return array;
            }

            /**
             * an array of random numbers between [middle - range, middle + range]
             * @param {number} middle
             * @param {number} range
             * @param {number} count
             * @param {boolean} [useFloat=false]
             * @return {number[]}
             */

        }, {
            key: 'middleMultiple',
            value: function middleMultiple(middle, range, count, useFloat) {
                var array = [];
                for (var i = 0; i < count; i++) {
                    array.push(middle(middle, range, useFloat));
                }
                return array;
            }

            /**
             * @param {number} [chance=0.5]
             * returns random sign (either +1 or -1)
             * @return {number}
             */

        }, {
            key: 'sign',
            value: function sign(chance) {
                chance = chance || 0.5;
                return this.generator() < chance ? 1 : -1;
            }

            /**
             * tells you whether a random chance was achieved
             * @param {number} [percent=0.5]
             * @return {boolean}
             */

        }, {
            key: 'chance',
            value: function chance(percent) {
                return this.generator() < (percent || 0.5);
            }

            /**
             * returns a random angle in radians [0 - 2 * Math.PI)
             */

        }, {
            key: 'angle',
            value: function angle() {
                return this.get(Math.PI * 2, true);
            }

            /**
             * Shuffle array (either in place or copied)
             * from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
             * @param {Array} array
             * @param {boolean} [copy=false] whether to shuffle in place (default) or return a new shuffled array
             * @return {Array} a shuffled array
             */

        }, {
            key: 'shuffle',
            value: function shuffle(array, copy) {
                if (copy) {
                    array = array.slice();
                }
                if (array.length === 0) {
                    return array;
                }

                var currentIndex = array.length,
                    temporaryValue = void 0,
                    randomIndex = void 0;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {
                    // Pick a remaining element...
                    randomIndex = this.get(currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }

            /**
             * picks a random element from an array
             * @param {Array} array
             * @return {*}
             */

        }, {
            key: 'pick',
            value: function pick(array, remove) {
                if (!remove) {
                    return array[this.get(array.length)];
                } else {
                    var pick = this.get(array.length);
                    var temp = array[pick];
                    array.splice(pick, 1);
                    return temp;
                }
            }

            /**
             * returns a random property from an object
             * from http://stackoverflow.com/questions/2532218/pick-random-property-from-a-javascript-object
             * @param {object} obj
             * @return {*}
             */

        }, {
            key: 'property',
            value: function property(obj) {
                var result;
                var count = 0;
                for (var prop in obj) {
                    if (this.chance(1 / ++count)) {
                        result = prop;
                    }
                }
                return result;
            }

            /**
             * creates a random set where each entry is a value between [min, max]
             * @param {number} min
             * @param {number} max
             * @param {number} amount of numbers in set
             * @param {number[]}
             */

        }, {
            key: 'set',
            value: function set(min, max, amount) {
                var set = [],
                    all = [],
                    i;
                for (i = min; i < max; i++) {
                    all.push(i);
                }

                for (i = 0; i < amount; i++) {
                    var found = this.get(all.length);
                    set.push(all[found]);
                    all.splice(found, 1);
                }
                return set;
            }

            /**
             * returns a set of numbers with a randomly even distribution (i.e., no overlapping and filling the space)
             * @param {number} start position
             * @param {number} end position
             * @param {number} count of non-start/end points
             * @param {boolean} [includeStart=false] includes start point (count++)
             * @param {boolean} [includeEnd=false] includes end point (count++)
             * @param {boolean} [useFloat=false]
             * @param {number[]}
             */

        }, {
            key: 'distribution',
            value: function distribution(start, end, count, includeStart, includeEnd, useFloat) {
                var interval = Math.floor((end - start) / count);
                var halfInterval = interval / 2;
                var quarterInterval = interval / 4;
                var set = [];
                if (includeStart) {
                    set.push(start);
                }
                for (var i = 0; i < count; i++) {
                    set.push(start + i * interval + halfInterval + this.range(-quarterInterval, quarterInterval, useFloat));
                }
                if (includeEnd) {
                    set.push(end);
                }
                return set;
            }

            /**
             * returns a random number based on weighted probability between [min, max]
             * from http://stackoverflow.com/questions/22656126/javascript-random-number-with-weighted-probability
             * @param {number} min value
             * @param {number} max value
             * @param {number} target for average value
             * @param {number} stddev - standard deviation
             */

        }, {
            key: 'weightedProbabilityInt',
            value: function weightedProbabilityInt(min, max, target, stddev) {
                function normRand() {
                    var x1 = void 0,
                        x2 = void 0,
                        rad = void 0;
                    do {
                        x1 = 2 * this.get(1, true) - 1;
                        x2 = 2 * this.get(1, true) - 1;
                        rad = x1 * x1 + x2 * x2;
                    } while (rad >= 1 || rad === 0);
                    var c = Math.sqrt(-2 * Math.log(rad) / rad);
                    return x1 * c;
                }

                stddev = stddev || 1;
                if (Math.random() < 0.81546) {
                    while (true) {
                        var sample = normRand() * stddev + target;
                        if (sample >= min && sample <= max) {
                            return sample;
                        }
                    }
                } else {
                    return this.range(min, max);
                }
            }

            /*
             * returns a random hex color (0 - 0xffffff)
             * @return {number}
             */

        }, {
            key: 'color',
            value: function color() {
                return this.get(0xffffff);
            }
        }]);

        return Random;
    }();

    var yyRandom = new Random();

    let renderer;
    let viewport;

    function init()
    {
        renderer = new PIXI$1.Renderer();
        update();
    }

    function update()
    {
        if (viewport && viewport.dirty)
        {
            renderer.render(viewport);
            viewport.dirty = false;
        }
        requestAnimationFrame(update);
    }

    function draw(viewportIn, size, dot, count)
    {
        viewport = viewportIn;
        const g = viewport.addChild(new PIXI$1.Graphics());
        g.beginFill(0xeeeeee).drawRect(0, 0, size, size).endFill();
        g.lineStyle(10, 0).drawRect(10, 10, size - 20, size - 20);
        for (let i = 0; i < count; i++)
        {
            const sprite = viewport.addChild(new PIXI$1.Sprite(PIXI$1.Texture.WHITE));
            sprite.width = sprite.height = yyRandom.get(dot);
            sprite.anchor.set(0.5);
            sprite.position.set(yyRandom.range(dot, size - dot), yyRandom.range(dot, size - dot));
            sprite.rotation = yyRandom.get(Math.PI * 2, true);
        }
    }

    // import { Viewport } from '..'

    const SIZE = 10000;
    const DOT = 100;
    const COUNT = 1000;

    describe('Viewport', () =>
    {
        describe('new Viewport()', () =>
        {
            init();
            let viewport = new Viewport();
            draw(viewport, SIZE, DOT, COUNT);
            assert.equal(viewport.screenWidth, window.innerWidth);
            assert.equal(viewport.screenHeight, window.innerHeight);
            assert.isNull(viewport._worldWidth);
            assert.isNull(viewport._worldHeight);
            assert.equal(viewport.threshold, 5);
            assert.isTrue(viewport.options.passiveWheel);
            assert.isFalse(viewport.options.stopPropagation);
            assert.isNull(viewport.forceHitArea);
            assert.isTrue(viewport.options.passiveWheel);
            assert.isFunction(viewport.tickerFunction);
            assert.isUndefined(viewport.interaction);
        });

        describe('new Viewport(options)', () =>
        {
            const ticker = new PIXI.Ticker();
            const divWheel = document.createElement('div');
            const forceHitArea = new PIXI.Rectangle(0, 0, 100, 100);
            const viewport = new Viewport(
            {
                screenWidth: 100,
                screenHeight: 101,
                worldWidth: 1000,
                worldHeight: 1001,
                threshold: 10,
                passiveWheel: false,
                stopPropagation: true,
                forceHitArea,
                noTicker: true,
                ticker,
                interaction: renderer.plugins.interaction,
                divWheel
            });
            assert.equal(viewport.screenWidth, 100);
            assert.equal(viewport.screenHeight, 101);
            assert.equal(viewport.worldWidth, 1000);
            assert.equal(viewport.worldHeight, 1001);
            assert.equal(viewport.threshold, 10);
            assert.isFalse(viewport.options.passiveWheel);
            assert.isTrue(viewport.options.stopPropagation);
            assert.equal(viewport.hitArea, forceHitArea);
            assert.isNotFunction(viewport.tickerFunction);
            assert.equal(viewport.options.ticker, ticker);
            assert.equal(viewport.options.interaction, renderer.plugins.interaction);
            assert.equal(viewport.options.divWheel, divWheel);
        });
    });
    // function sizing()
    // {
    //     log('Testing resize()...')
    //     const viewport = new Viewport()
    //     draw.draw(viewport, SIZE, DOT, COUNT)
    //     viewport.resize(101, 102)
    //     draw.renderer.resize(101, 102)
    //     if (assert.equal(viewport.screenWidth, 101) &&
    //         assert.equal(viewport.screenHeight, 102) &&
    //         assert.equal(viewport.worldWidth, 10000) &&
    //         assert.equal(viewport.worldHeight, 10000))
    //         pass()
    //     else return fail()

    //     log('Testing getVisibleBounds()...')
    //     const bounds = viewport.getVisibleBounds()
    //     if (assert.isZero(bounds.x) &&
    //         assert.isZero(bounds.y) &&
    //         assert.equal(bounds.width, 101) &&
    //         assert.equal(bounds.height, 102))
    //         pass()
    //     else return fail()

    //     log('Testing zoom() and center...')
    //     viewport.zoom(100, true)
    //     if (assert.equal(viewport.center.x, 50.5) &&
    //         assert.equal(viewport.center.y, 51))
    //         pass()
    //     else return fail()

    //     log('Testing worldScreenWidth and worldScreenHeight...')
    //     if (assert.equalRounded(viewport.worldScreenWidth, 201) &&
    //         assert.equalRounded(viewport.worldScreenHeight, 203))
    //         pass()
    //     else return fail()

    //     log('Testing toWorld()...')
    //     const world = viewport.toWorld(50, 50)
    //     if (assert.equalRounded(world.x, 50) &&
    //         assert.equalRounded(world.y, 49))
    //         pass()
    //     else return fail()

    //     log('Testing toScreen()...')
    //     const screen = viewport.toScreen(100, 100)
    //     if (assert.equalRounded(screen.x, 75) &&
    //         assert.equalRounded(screen.y, 76))
    //         pass()
    //     else return fail()

    //     log('Testing screenWorldWidth and screenWorldHeight...')
    //     if (assert.equalRounded(viewport.screenWorldWidth, 5025) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 5025))
    //         pass()
    //     else return fail()

    //     log('Testing moveCenter(), top, bottom, left, and right...')
    //     viewport.moveCenter(500, 500)
    //     if (assert.equalRounded(viewport.top, 399) &&
    //         assert.equalRounded(viewport.bottom, 601) &&
    //         assert.equalRounded(viewport.left, 400) &&
    //         assert.equalRounded(viewport.right, 601))
    //         pass()
    //     else return fail()

    //     log('Testing moveCorner() and corner...')
    //     viewport.moveCorner(11, 12)
    //     if (assert.equalRounded(viewport.corner.x, 11) &&
    //         assert.equalRounded(viewport.corner.y, 12))
    //         pass()
    //     else return fail()

    //     log('Testing fitWidth(n, true)...')
    //     viewport.fitWidth(1000, true)
    //     if (assert.equalRounded(viewport.screenWorldWidth, 1010) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 1010) &&
    //         assert.equalRounded(viewport.center.x, 112) &&
    //         assert.equalRounded(viewport.center.y, 113))
    //         pass()
    //     else return fail()

    //     log('Testing fitWidth(n, false, false)...')
    //     viewport.fitWidth(500, false, false)
    //     if (assert.equalRounded(viewport.center.x, 56) &&
    //         assert.equalRounded(viewport.center.y, 113) &&
    //         assert.equalRounded(viewport.screenWorldWidth, 2020) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 1010))
    //         pass()
    //     else return fail()

    //     log('Testing fitHeight(n, true)...')
    //     viewport.fitHeight(400, true)
    //     if (assert.equalRounded(viewport.screenWorldWidth, 2550) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 2550) &&
    //         assert.equalRounded(viewport.center.x, 56) &&
    //         assert.equalRounded(viewport.center.y, 113))
    //         pass()
    //     else return fail()

    //     log('Testing fitHeight(n, false, false)...')
    //     viewport.moveCenter(202, 22)
    //     viewport.fitHeight(800, false, false)
    //     if (assert.equalRounded(viewport.center.x, 202) &&
    //         assert.equalRounded(viewport.center.y, 44) &&
    //         assert.equalRounded(viewport.worldScreenHeight, 800) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 1275))
    //         pass()
    //     else return fail()

    //     log('Testing fitWorld()...')
    //     viewport.fitWorld()
    //     viewport.moveCorner(0, 0)
    //     if (
    //         assert.equalRounded(viewport.center.x, 5000) &&
    //         assert.equalRounded(viewport.center.y, 5050) &&
    //         assert.equalRounded(viewport.screenWorldWidth, 101) &&
    //         assert.equalRounded(viewport.screenWorldHeight, 101))
    //         pass()
    //     else return fail()
    // }

}(null, accessibility, extract, interaction, prepare, utils, PIXI$1, core, loaders, particles, spritesheet, spriteTiling, textBitmap, ticker, filterAlpha, filterBlur, filterColorMatrix, filterDisplacement, filterFxaa, filterNoise, null, null, null, constants, display, graphics, math, mesh, meshExtras, runner, sprite, spriteAnimated, text, settings));
//# sourceMappingURL=index.js.map
