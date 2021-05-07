<<<<<<< HEAD
<<<<<<< HEAD
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("pixi.js")):"function"==typeof define&&define.amd?define(["exports","pixi.js"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).Viewport={},t.PIXI)}(this,(function(t,e){"use strict";function i(t){if(t&&t.__esModule)return t;var e=Object.create(null);return t&&Object.keys(t).forEach((function(i){if("default"!==i){var s=Object.getOwnPropertyDescriptor(t,i);Object.defineProperty(e,i,s.get?s:{enumerable:!0,get:function(){return t[i]}})}})),e.default=t,Object.freeze(e)}var s=i(e);function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}function r(t,e,i){return e&&o(t.prototype,e),i&&o(t,i),t}function h(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&l(t,e)}function a(t){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function l(t,e){return(l=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function p(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function c(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?p(t):e}function u(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,s=a(t);if(e){var n=a(this).constructor;i=Reflect.construct(s,arguments,n)}else i=s.apply(this,arguments);return c(this,i)}}function d(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=a(t)););return t}function f(t,e,i){return(f="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,i){var s=d(t,e);if(s){var n=Object.getOwnPropertyDescriptor(s,e);return n.get?n.get.call(i):n.value}})(t,e,i||t)}function v(t,e,i,s){return(v="undefined"!=typeof Reflect&&Reflect.set?Reflect.set:function(t,e,i,s){var n,o=d(t,e);if(o){if((n=Object.getOwnPropertyDescriptor(o,e)).set)return n.set.call(s,i),!0;if(!n.writable)return!1}if(n=Object.getOwnPropertyDescriptor(s,e)){if(!n.writable)return!1;n.value=i,Object.defineProperty(s,e,n)}else!function(t,e,i){e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i}(s,e,i);return!0})(t,e,i,s)}function y(t,e,i,s,n){if(!v(t,e,i,s||t)&&n)throw new Error("failed to set property");return i}function g(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,s=new Array(e);i<e;i++)s[i]=t[i];return s}function m(t,e){var i;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(i=function(t,e){if(t){if("string"==typeof t)return g(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);return"Object"===i&&t.constructor&&(i=t.constructor.name),"Map"===i||"Set"===i?Array.from(t):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?g(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var s=0,n=function(){};return{s:n,n:function(){return s>=t.length?{done:!0}:{done:!1,value:t[s++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r=!0,h=!1;return{s:function(){i=t[Symbol.iterator]()},n:function(){var t=i.next();return r=t.done,t},e:function(t){h=!0,o=t},f:function(){try{r||null==i.return||i.return()}finally{if(h)throw o}}}}var w=function(){function t(e){n(this,t),this.viewport=e,this.touches=[],this.addListeners()}return r(t,[{key:"addListeners",value:function(){var t=this;this.viewport.interactive=!0,this.viewport.forceHitArea||(this.viewport.hitArea=new e.Rectangle(0,0,this.viewport.worldWidth,this.viewport.worldHeight)),this.viewport.on("pointerdown",this.down,this),this.viewport.on("pointermove",this.move,this),this.viewport.on("pointerup",this.up,this),this.viewport.on("pointerupoutside",this.up,this),this.viewport.on("pointercancel",this.up,this),this.viewport.on("pointerout",this.up,this),this.wheelFunction=function(e){return t.handleWheel(e)},this.viewport.options.divWheel.addEventListener("wheel",this.wheelFunction,{passive:this.viewport.options.passiveWheel}),this.isMouseDown=!1}},{key:"destroy",value:function(){this.viewport.options.divWheel.removeEventListener("wheel",this.wheelFunction)}},{key:"down",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){if("mouse"===t.data.pointerType?this.isMouseDown=!0:this.get(t.data.pointerId)||this.touches.push({id:t.data.pointerId,last:null}),1===this.count()){this.last=t.data.global.clone();var e=this.viewport.plugins.get("decelerate",!0),i=this.viewport.plugins.get("bounce",!0);e&&e.isActive()||i&&i.isActive()?this.clickedAvailable=!1:this.clickedAvailable=!0}else this.clickedAvailable=!1;this.viewport.plugins.down(t)&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"clear",value:function(){this.isMouseDown=!1,this.touches=[],this.last=null}},{key:"checkThreshold",value:function(t){return Math.abs(t)>=this.viewport.threshold}},{key:"move",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){var e=this.viewport.plugins.move(t);if(this.clickedAvailable){var i=t.data.global.x-this.last.x,s=t.data.global.y-this.last.y;(this.checkThreshold(i)||this.checkThreshold(s))&&(this.clickedAvailable=!1)}e&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"up",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){"mouse"===t.data.pointerType&&(this.isMouseDown=!1),"mouse"!==t.data.pointerType&&this.remove(t.data.pointerId);var e=this.viewport.plugins.up(t);this.clickedAvailable&&0===this.count()&&(this.viewport.emit("clicked",{event:t,screen:this.last,world:this.viewport.toWorld(this.last),viewport:this}),this.clickedAvailable=!1),e&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"getPointerPosition",value:function(t){var i=new e.Point;return this.viewport.options.interaction?this.viewport.options.interaction.mapPositionToPoint(i,t.clientX,t.clientY):(i.x=t.clientX,i.y=t.clientY),i}},{key:"handleWheel",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible&&(!this.viewport.options.interaction||this.viewport.options.interaction.interactionDOMElement===t.target)){var e=this.viewport.toLocal(this.getPointerPosition(t));if(this.viewport.left<=e.x&&e.x<=this.viewport.right&&this.viewport.top<=e.y&&e.y<=this.viewport.bottom)this.viewport.plugins.wheel(t)&&!this.viewport.options.passiveWheel&&t.preventDefault()}}},{key:"pause",value:function(){this.touches=[],this.isMouseDown=!1}},{key:"get",value:function(t){var e,i=m(this.touches);try{for(i.s();!(e=i.n()).done;){var s=e.value;if(s.id===t)return s}}catch(t){i.e(t)}finally{i.f()}return null}},{key:"remove",value:function(t){for(var e=0;e<this.touches.length;e++)if(this.touches[e].id===t)return void this.touches.splice(e,1)}},{key:"count",value:function(){return(this.isMouseDown?1:0)+this.touches.length}}]),t}(),x=["drag","pinch","wheel","follow","mouse-edges","decelerate","aniamte","bounce","snap-zoom","clamp-zoom","snap","clamp"],k=function(){function t(e){n(this,t),this.viewport=e,this.list=[],this.plugins={}}return r(t,[{key:"add",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:x.length;this.plugins[t]=e;var s=x.indexOf(t);-1!==s&&x.splice(s,1),x.splice(i,0,t),this.sort()}},{key:"get",value:function(t,e){return e&&this.plugins[t]&&this.plugins[t].paused?null:this.plugins[t]}},{key:"update",value:function(t){var e,i=m(this.list);try{for(i.s();!(e=i.n()).done;){e.value.update(t)}}catch(t){i.e(t)}finally{i.f()}}},{key:"resize",value:function(){var t,e=m(this.list);try{for(e.s();!(t=e.n()).done;){t.value.resize()}}catch(t){e.e(t)}finally{e.f()}}},{key:"reset",value:function(){var t,e=m(this.list);try{for(e.s();!(t=e.n()).done;){t.value.reset()}}catch(t){e.e(t)}finally{e.f()}}},{key:"removeAll",value:function(){this.plugins={},this.sort()}},{key:"remove",value:function(t){this.plugins[t]&&(delete this.plugins[t],this.viewport.emit(t+"-remove"),this.sort())}},{key:"pause",value:function(t){this.plugins[t]&&this.plugins[t].pause()}},{key:"resume",value:function(t){this.plugins[t]&&this.plugins[t].resume()}},{key:"sort",value:function(){this.list=[];var t,e=m(x);try{for(e.s();!(t=e.n()).done;){var i=t.value;this.plugins[i]&&this.list.push(this.plugins[i])}}catch(t){e.e(t)}finally{e.f()}}},{key:"down",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.down(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"move",value:function(t){var e,i=!1,s=m(this.viewport.plugins.list);try{for(s.s();!(e=s.n()).done;){e.value.move(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"up",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.up(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"wheel",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.wheel(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}}]),t}(),b=function(){function t(e){n(this,t),this.parent=e,this.paused=!1}return r(t,[{key:"destroy",value:function(){}},{key:"down",value:function(){return!1}},{key:"move",value:function(){return!1}},{key:"up",value:function(){return!1}},{key:"wheel",value:function(){return!1}},{key:"update",value:function(){}},{key:"resize",value:function(){}},{key:"reset",value:function(){}},{key:"pause",value:function(){this.paused=!0}},{key:"resume",value:function(){this.paused=!1}}]),t}(),W={direction:"all",pressDrag:!0,wheel:!0,wheelScroll:1,reverse:!1,clampWheel:!1,underflow:"center",factor:1,mouseButtons:"all",keyToPress:null,ignoreKeyToPressOnTouch:!1,lineHeight:20},H=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},W,o),e.moved=!1,e.reverse=e.options.reverse?1:-1,e.xDirection=!e.options.direction||"all"===e.options.direction||"x"===e.options.direction,e.yDirection=!e.options.direction||"all"===e.options.direction||"y"===e.options.direction,e.keyIsPressed=!1,e.parseUnderflow(),e.mouseButtons(e.options.mouseButtons),e.options.keyToPress&&e.handleKeyPresses(e.options.keyToPress),e}return r(s,[{key:"handleKeyPresses",value:function(t){var e=this;window.addEventListener("keydown",(function(i){t.includes(i.code)&&(e.keyIsPressed=!0)})),window.addEventListener("keyup",(function(i){t.includes(i.code)&&(e.keyIsPressed=!1)}))}},{key:"mouseButtons",value:function(t){this.mouse=t&&"all"!==t?[-1!==t.indexOf("left"),-1!==t.indexOf("middle"),-1!==t.indexOf("right")]:[!0,!0,!0]}},{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"center"===t?(this.underflowX=0,this.underflowY=0):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0)}},{key:"checkButtons",value:function(t){var e="mouse"===t.data.pointerType,i=this.parent.input.count();return!(!(1===i||i>1&&!this.parent.plugins.get("pinch",!0))||e&&!this.mouse[t.data.button])}},{key:"checkKeyPress",value:function(t){return!!(!this.options.keyToPress||this.keyIsPressed||this.options.ignoreKeyToPressOnTouch&&"touch"===t.data.pointerType)}},{key:"down",value:function(t){if(!this.paused&&this.options.pressDrag)return this.checkButtons(t)&&this.checkKeyPress(t)?(this.last={x:t.data.global.x,y:t.data.global.y},this.current=t.data.pointerId,!0):void(this.last=null)}},{key:"active",get:function(){return this.moved}},{key:"move",value:function(t){if(!this.paused&&this.options.pressDrag&&this.last&&this.current===t.data.pointerId){var i=t.data.global.x,s=t.data.global.y,n=this.parent.input.count();if(1===n||n>1&&!this.parent.plugins.get("pinch",!0)){var o=i-this.last.x,r=s-this.last.y;if(this.moved||this.xDirection&&this.parent.input.checkThreshold(o)||this.yDirection&&this.parent.input.checkThreshold(r)){var h={x:i,y:s};return this.xDirection&&(this.parent.x+=(h.x-this.last.x)*this.options.factor),this.yDirection&&(this.parent.y+=(h.y-this.last.y)*this.options.factor),this.last=h,this.moved||this.parent.emit("drag-start",{event:t,screen:new e.Point(this.last.x,this.last.y),world:this.parent.toWorld(new e.Point(this.last.x,this.last.y)),viewport:this.parent}),this.moved=!0,this.parent.emit("moved",{viewport:this.parent,type:"drag"}),!0}}else this.moved=!1}}},{key:"up",value:function(t){if(!this.paused){var i=this.parent.input.touches;if(1===i.length){var s=i[0];return s.last&&(this.last={x:s.last.x,y:s.last.y},this.current=s.id),this.moved=!1,!0}if(this.last&&this.moved){var n=new e.Point(this.last.x,this.last.y);return this.parent.emit("drag-end",{event:t,screen:n,world:this.parent.toWorld(n),viewport:this.parent}),this.last=null,this.moved=!1,!0}}}},{key:"wheel",value:function(t){if(!this.paused&&this.options.wheel){var e=this.parent.plugins.get("wheel",!0);if(!e){var i=t.deltaMode?this.options.lineHeight:1;return this.xDirection&&(this.parent.x+=t.deltaX*i*this.options.wheelScroll*this.reverse),this.yDirection&&(this.parent.y+=t.deltaY*i*this.options.wheelScroll*this.reverse),this.options.clampWheel&&this.clamp(),this.parent.emit("wheel-scroll",this.parent),this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.parent.options.passiveWheel||t.preventDefault(),!0}}}},{key:"resume",value:function(){this.last=null,this.paused=!1}},{key:"clamp",value:function(){var t=this.parent.plugins.get("decelerate",!0)||{};if("y"!==this.options.clampWheel)if(this.parent.screenWorldWidth<this.parent.screenWidth)switch(this.underflowX){case-1:this.parent.x=0;break;case 1:this.parent.x=this.parent.screenWidth-this.parent.screenWorldWidth;break;default:this.parent.x=(this.parent.screenWidth-this.parent.screenWorldWidth)/2}else this.parent.left<0?(this.parent.x=0,t.x=0):this.parent.right>this.parent.worldWidth&&(this.parent.x=-this.parent.worldWidth*this.parent.scale.x+this.parent.screenWidth,t.x=0);if("x"!==this.options.clampWheel)if(this.parent.screenWorldHeight<this.parent.screenHeight)switch(this.underflowY){case-1:this.parent.y=0;break;case 1:this.parent.y=this.parent.screenHeight-this.parent.screenWorldHeight;break;default:this.parent.y=(this.parent.screenHeight-this.parent.screenWorldHeight)/2}else this.parent.top<0&&(this.parent.y=0,t.y=0),this.parent.bottom>this.parent.worldHeight&&(this.parent.y=-this.parent.worldHeight*this.parent.scale.y+this.parent.screenHeight,t.y=0)}}]),s}(b),S={noDrag:!1,percent:1,center:null,factor:1,axis:"all"},O=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},S,o),s}return r(i,[{key:"down",value:function(){if(this.parent.input.count()>=2)return this.active=!0,!0}},{key:"isAxisX",value:function(){return["all","x"].includes(this.options.axis)}},{key:"isAxisY",value:function(){return["all","y"].includes(this.options.axis)}},{key:"move",value:function(t){if(!this.paused&&this.active){var e=t.data.global.x,i=t.data.global.y,s=this.parent.input.touches;if(s.length>=2){var n=s[0],o=s[1],r=n.last&&o.last?Math.sqrt(Math.pow(o.last.x-n.last.x,2)+Math.pow(o.last.y-n.last.y,2)):null;if(n.id===t.data.pointerId?n.last={x:e,y:i,data:t.data}:o.id===t.data.pointerId&&(o.last={x:e,y:i,data:t.data}),r){var h,a={x:n.last.x+(o.last.x-n.last.x)/2,y:n.last.y+(o.last.y-n.last.y)/2};this.options.center||(h=this.parent.toLocal(a));var l=Math.sqrt(Math.pow(o.last.x-n.last.x,2)+Math.pow(o.last.y-n.last.y,2)),p=(1-r/(l=0===l?l=1e-10:l))*this.options.percent*(this.isAxisX()?this.parent.scale.x:this.parent.scale.y);this.isAxisX()&&(this.parent.scale.x+=p),this.isAxisY()&&(this.parent.scale.y+=p),this.parent.emit("zoomed",{viewport:this.parent,type:"pinch",center:a});var c=this.parent.plugins.get("clamp-zoom",!0);if(c&&c.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var u=this.parent.toGlobal(h);this.parent.x+=(a.x-u.x)*this.options.factor,this.parent.y+=(a.y-u.y)*this.options.factor,this.parent.emit("moved",{viewport:this.parent,type:"pinch"})}!this.options.noDrag&&this.lastCenter&&(this.parent.x+=(a.x-this.lastCenter.x)*this.options.factor,this.parent.y+=(a.y-this.lastCenter.y)*this.options.factor,this.parent.emit("moved",{viewport:this.parent,type:"pinch"})),this.lastCenter=a,this.moved=!0}else this.pinching||(this.parent.emit("pinch-start",this.parent),this.pinching=!0);return!0}}}},{key:"up",value:function(){if(this.pinching&&this.parent.input.touches.length<=1)return this.active=!1,this.lastCenter=null,this.pinching=!1,this.moved=!1,this.parent.emit("pinch-end",this.parent),!0}}]),i}(b),M={left:!1,right:!1,top:!1,bottom:!1,direction:null,underflow:"center"},C=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},M,o),s.options.direction&&(s.options.left="x"===s.options.direction||"all"===s.options.direction||null,s.options.right="x"===s.options.direction||"all"===s.options.direction||null,s.options.top="y"===s.options.direction||"all"===s.options.direction||null,s.options.bottom="y"===s.options.direction||"all"===s.options.direction||null),s.parseUnderflow(),s.last={x:null,y:null,scaleX:null,scaleY:null},s.update(),s}return r(i,[{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"none"===t?this.noUnderflow=!0:"center"===t?(this.underflowX=this.underflowY=0,this.noUnderflow=!1):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0,this.noUnderflow=!1)}},{key:"move",value:function(){return this.update(),!1}},{key:"update",value:function(){if(!this.paused&&(this.parent.x!==this.last.x||this.parent.y!==this.last.y||this.parent.scale.x!==this.last.scaleX||this.parent.scale.y!==this.last.scaleY)){var t={x:this.parent.x,y:this.parent.y},e=this.parent.plugins.decelerate||{};if(null!==this.options.left||null!==this.options.right){var i=!1;if(!this.noUnderflow&&this.parent.screenWorldWidth<this.parent.screenWidth)switch(this.underflowX){case-1:0!==this.parent.x&&(this.parent.x=0,i=!0);break;case 1:this.parent.x!==this.parent.screenWidth-this.parent.screenWorldWidth&&(this.parent.x=this.parent.screenWidth-this.parent.screenWorldWidth,i=!0);break;default:this.parent.x!==(this.parent.screenWidth-this.parent.screenWorldWidth)/2&&(this.parent.x=(this.parent.screenWidth-this.parent.screenWorldWidth)/2,i=!0)}else null!==this.options.left&&this.parent.left<(!0===this.options.left?0:this.options.left)&&(this.parent.x=-(!0===this.options.left?0:this.options.left)*this.parent.scale.x,e.x=0,i=!0),null!==this.options.right&&this.parent.right>(!0===this.options.right?this.parent.worldWidth:this.options.right)&&(this.parent.x=-(!0===this.options.right?this.parent.worldWidth:this.options.right)*this.parent.scale.x+this.parent.screenWidth,e.x=0,i=!0);i&&this.parent.emit("moved",{viewport:this.parent,original:t,type:"clamp-x"})}if(null!==this.options.top||null!==this.options.bottom){var s=!1;if(!this.noUnderflow&&this.parent.screenWorldHeight<this.parent.screenHeight)switch(this.underflowY){case-1:0!==this.parent.y&&(this.parent.y=0,s=!0);break;case 1:this.parent.y!==this.parent.screenHeight-this.parent.screenWorldHeight&&(this.parent.y=this.parent.screenHeight-this.parent.screenWorldHeight,s=!0);break;default:this.parent.y!==(this.parent.screenHeight-this.parent.screenWorldHeight)/2&&(this.parent.y=(this.parent.screenHeight-this.parent.screenWorldHeight)/2,s=!0)}else null!==this.options.top&&this.parent.top<(!0===this.options.top?0:this.options.top)&&(this.parent.y=-(!0===this.options.top?0:this.options.top)*this.parent.scale.y,e.y=0,s=!0),null!==this.options.bottom&&this.parent.bottom>(!0===this.options.bottom?this.parent.worldHeight:this.options.bottom)&&(this.parent.y=-(!0===this.options.bottom?this.parent.worldHeight:this.options.bottom)*this.parent.scale.y+this.parent.screenHeight,e.y=0,s=!0);s&&this.parent.emit("moved",{viewport:this.parent,original:t,type:"clamp-y"})}this.last.x=this.parent.x,this.last.y=this.parent.y,this.last.scaleX=this.parent.scale.x,this.last.scaleY=this.parent.scale.y}}},{key:"reset",value:function(){this.update()}}]),i}(b),P={minWidth:null,minHeight:null,maxWidth:null,maxHeight:null,minScale:null,maxScale:null,independent:!1},z=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},P,o),s.clamp(),s}return r(i,[{key:"resize",value:function(){this.clamp()}},{key:"clamp",value:function(){if(!this.paused)if(this.options.minWidth||this.options.minHeight||this.options.maxWidth||this.options.maxHeight){var t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight;if(null!==this.options.minWidth&&t<this.options.minWidth){var i=this.parent.scale.x;this.parent.fitWidth(this.options.minWidth,!1,!1,!0),this.options.independent||(this.parent.scale.y*=this.parent.scale.x/i),t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.maxWidth&&t>this.options.maxWidth){var s=this.parent.scale.x;this.parent.fitWidth(this.options.maxWidth,!1,!1,!0),this.options.independent||(this.parent.scale.y*=this.parent.scale.x/s),t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.minHeight&&e<this.options.minHeight){var n=this.parent.scale.y;this.parent.fitHeight(this.options.minHeight,!1,!1,!0),this.options.independent||(this.parent.scale.x*=this.parent.scale.y/n),t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.maxHeight&&e>this.options.maxHeight){var o=this.parent.scale.y;this.parent.fitHeight(this.options.maxHeight,!1,!1,!0),this.options.independent||(this.parent.scale.x*=this.parent.scale.y/o),this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}}else if(this.options.minScale||this.options.maxScale){var r=this.parent.scale.x;null!==this.options.minScale&&r<this.options.minScale&&(r=this.options.minScale),null!==this.options.maxScale&&r>this.options.maxScale&&(r=this.options.maxScale),r!==this.parent.scale.x&&(this.parent.scale.set(r),this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"}))}else{if(this.options.minScaleX||this.options.maxScaleX){var h=this.parent.scale.x;null!==this.options.minScaleX&&h<this.options.minScaleX?h=this.options.minScaleX:null!==this.options.maxScaleX&&h>this.options.maxScaleX&&(h=this.options.maxScaleX)}if(this.options.minScaleY||this.options.maxScaleY){var a=this.parent.scale.Y;null!==this.options.minScaleY&&a<this.options.minScaleY?a=this.options.minScaleY:null!==this.options.maxScaleY&&a>this.options.maxScaleY&&(a=this.options.maxScaleY)}}}},{key:"reset",value:function(){this.clamp()}}]),i}(b),I={friction:.98,bounce:.8,minSpeed:.01},X=16,Y=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},I,o),s.saved=[],s.timeSinceRelease=0,s.reset(),s.parent.on("moved",(function(t){return s.moved(t)})),s}return r(i,[{key:"destroy",value:function(){this.parent}},{key:"down",value:function(){this.saved=[],this.x=this.y=!1}},{key:"isActive",value:function(){return this.x||this.y}},{key:"move",value:function(){if(!this.paused){var t=this.parent.input.count();(1===t||t>1&&!this.parent.plugins.get("pinch",!0))&&(this.saved.push({x:this.parent.x,y:this.parent.y,time:performance.now()}),this.saved.length>60&&this.saved.splice(0,30))}}},{key:"moved",value:function(t){if(this.saved.length){var e=this.saved[this.saved.length-1];"clamp-x"===t.type?e.x===t.original.x&&(e.x=this.parent.x):"clamp-y"===t.type&&e.y===t.original.y&&(e.y=this.parent.y)}}},{key:"up",value:function(){if(0===this.parent.input.count()&&this.saved.length){var t,e=performance.now(),i=m(this.saved);try{for(i.s();!(t=i.n()).done;){var s=t.value;if(s.time>=e-100){var n=e-s.time;this.x=(this.parent.x-s.x)/n,this.y=(this.parent.y-s.y)/n,this.percentChangeX=this.percentChangeY=this.options.friction,this.timeSinceRelease=0;break}}}catch(t){i.e(t)}finally{i.f()}}}},{key:"activate",value:function(t){void 0!==(t=t||{}).x&&(this.x=t.x,this.percentChangeX=this.options.friction),void 0!==t.y&&(this.y=t.y,this.percentChangeY=this.options.friction)}},{key:"update",value:function(t){if(!this.paused){var e=this.x||this.y,i=this.timeSinceRelease,s=this.timeSinceRelease+t;if(this.x){var n=this.percentChangeX,o=Math.log(n);this.parent.x+=this.x*X/o*(Math.pow(n,s/X)-Math.pow(n,i/X))}if(this.y){var r=this.percentChangeY,h=Math.log(r);this.parent.y+=this.y*X/h*(Math.pow(r,s/X)-Math.pow(r,i/X))}this.timeSinceRelease+=t,this.x*=Math.pow(this.percentChangeX,t/X),this.y*=Math.pow(this.percentChangeY,t/X),Math.abs(this.x)<this.options.minSpeed&&(this.x=0),Math.abs(this.y)<this.options.minSpeed&&(this.y=0),e&&this.parent.emit("moved",{viewport:this.parent,type:"decelerate"})}}},{key:"reset",value:function(){this.x=this.y=null}}]),i}(b),A="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var j=function(t){var e={exports:{}};return t(e,e.exports),e.exports}((function(t,e){(function(){var e;(function(e){t.exports=e})(e={linear:function(t,e,i,s){return i*t/s+e},easeInQuad:function(t,e,i,s){return i*(t/=s)*t+e},easeOutQuad:function(t,e,i,s){return-i*(t/=s)*(t-2)+e},easeInOutQuad:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t+e:-i/2*(--t*(t-2)-1)+e},easeInCubic:function(t,e,i,s){return i*(t/=s)*t*t+e},easeOutCubic:function(t,e,i,s){return i*((t=t/s-1)*t*t+1)+e},easeInOutCubic:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t+e:i/2*((t-=2)*t*t+2)+e},easeInQuart:function(t,e,i,s){return i*(t/=s)*t*t*t+e},easeOutQuart:function(t,e,i,s){return-i*((t=t/s-1)*t*t*t-1)+e},easeInOutQuart:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t*t+e:-i/2*((t-=2)*t*t*t-2)+e},easeInQuint:function(t,e,i,s){return i*(t/=s)*t*t*t*t+e},easeOutQuint:function(t,e,i,s){return i*((t=t/s-1)*t*t*t*t+1)+e},easeInOutQuint:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t*t*t+e:i/2*((t-=2)*t*t*t*t+2)+e},easeInSine:function(t,e,i,s){return-i*Math.cos(t/s*(Math.PI/2))+i+e},easeOutSine:function(t,e,i,s){return i*Math.sin(t/s*(Math.PI/2))+e},easeInOutSine:function(t,e,i,s){return-i/2*(Math.cos(Math.PI*t/s)-1)+e},easeInExpo:function(t,e,i,s){return 0===t?e:i*Math.pow(2,10*(t/s-1))+e},easeOutExpo:function(t,e,i,s){return t===s?e+i:i*(1-Math.pow(2,-10*t/s))+e},easeInOutExpo:function(t,e,i,s){return(t/=s/2)<1?i/2*Math.pow(2,10*(t-1))+e:i/2*(2-Math.pow(2,-10*--t))+e},easeInCirc:function(t,e,i,s){return-i*(Math.sqrt(1-(t/=s)*t)-1)+e},easeOutCirc:function(t,e,i,s){return i*Math.sqrt(1-(t=t/s-1)*t)+e},easeInOutCirc:function(t,e,i,s){return(t/=s/2)<1?-i/2*(Math.sqrt(1-t*t)-1)+e:i/2*(Math.sqrt(1-(t-=2)*t)+1)+e},easeInElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s),(o=0)||(o=.3*s),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),-n*Math.pow(2,10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)+e},easeOutElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s),(o=0)||(o=.3*s),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),n*Math.pow(2,-10*t)*Math.sin((t*s-r)*(2*Math.PI)/o)+i+e},easeInOutElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s/2),(o=0)||(o=s*(.3*1.5)),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),t<1?n*Math.pow(2,10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)*-.5+e:n*Math.pow(2,-10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)*.5+i+e},easeInBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),i*(t/=s)*t*((n+1)*t-n)+e},easeOutBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),i*((t=t/s-1)*t*((n+1)*t+n)+1)+e},easeInOutBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),(t/=s/2)<1?i/2*(t*t*((1+(n*=1.525))*t-n))+e:i/2*((t-=2)*t*((1+(n*=1.525))*t+n)+2)+e},easeInBounce:function(t,i,s,n){return s-e.easeOutBounce(n-t,0,s,n)+i},easeOutBounce:function(t,e,i,s){return(t/=s)<1/2.75?i*(7.5625*t*t)+e:t<2/2.75?i*(7.5625*(t-=1.5/2.75)*t+.75)+e:t<2.5/2.75?i*(7.5625*(t-=2.25/2.75)*t+.9375)+e:i*(7.5625*(t-=2.625/2.75)*t+.984375)+e},easeInOutBounce:function(t,i,s,n){return t<n/2?.5*e.easeInBounce(2*t,0,s,n)+i:.5*e.easeOutBounce(2*t-n,0,s,n)+.5*s+i}})}).call(A)}));function _(t,e){return t?"function"==typeof t?t:"string"==typeof t?j[t]:void 0:j[e]}var D={sides:"all",friction:.5,time:150,ease:"easeInOutSine",underflow:"center",bounceBox:null},T=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},D,o),e.ease=_(e.options.ease,"easeInOutSine"),e.options.sides&&("all"===e.options.sides?e.top=e.bottom=e.left=e.right=!0:"horizontal"===e.options.sides?e.right=e.left=!0:"vertical"===e.options.sides?e.top=e.bottom=!0:(e.top=-1!==e.options.sides.indexOf("top"),e.bottom=-1!==e.options.sides.indexOf("bottom"),e.left=-1!==e.options.sides.indexOf("left"),e.right=-1!==e.options.sides.indexOf("right"))),e.parseUnderflow(),e.last={},e.reset(),e}return r(s,[{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"center"===t?(this.underflowX=0,this.underflowY=0):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0)}},{key:"isActive",value:function(){return null!==this.toX||null!==this.toY}},{key:"down",value:function(){this.toX=this.toY=null}},{key:"up",value:function(){this.bounce()}},{key:"update",value:function(t){if(!this.paused){if(this.bounce(),this.toX){var e=this.toX;e.time+=t,this.parent.emit("moved",{viewport:this.parent,type:"bounce-x"}),e.time>=this.options.time?(this.parent.x=e.end,this.toX=null,this.parent.emit("bounce-x-end",this.parent)):this.parent.x=this.ease(e.time,e.start,e.delta,this.options.time)}if(this.toY){var i=this.toY;i.time+=t,this.parent.emit("moved",{viewport:this.parent,type:"bounce-y"}),i.time>=this.options.time?(this.parent.y=i.end,this.toY=null,this.parent.emit("bounce-y-end",this.parent)):this.parent.y=this.ease(i.time,i.start,i.delta,this.options.time)}}}},{key:"calcUnderflowX",value:function(){var t;switch(this.underflowX){case-1:t=0;break;case 1:t=this.parent.screenWidth-this.parent.screenWorldWidth;break;default:t=(this.parent.screenWidth-this.parent.screenWorldWidth)/2}return t}},{key:"calcUnderflowY",value:function(){var t;switch(this.underflowY){case-1:t=0;break;case 1:t=this.parent.screenHeight-this.parent.screenWorldHeight;break;default:t=(this.parent.screenHeight-this.parent.screenWorldHeight)/2}return t}},{key:"oob",value:function(){var t=this.options.bounceBox;if(t){var i=void 0===t.x?0:t.x,s=void 0===t.y?0:t.y,n=void 0===t.width?this.parent.worldWidth:t.width,o=void 0===t.height?this.parent.worldHeight:t.height;return{left:this.parent.left<i,right:this.parent.right>n,top:this.parent.top<s,bottom:this.parent.bottom>o,topLeft:new e.Point(i*this.parent.scale.x,s*this.parent.scale.y),bottomRight:new e.Point(n*this.parent.scale.x-this.parent.screenWidth,o*this.parent.scale.y-this.parent.screenHeight)}}return{left:this.parent.left<0,right:this.parent.right>this.parent.worldWidth,top:this.parent.top<0,bottom:this.parent.bottom>this.parent.worldHeight,topLeft:new e.Point(0,0),bottomRight:new e.Point(this.parent.worldWidth*this.parent.scale.x-this.parent.screenWidth,this.parent.worldHeight*this.parent.scale.y-this.parent.screenHeight)}}},{key:"bounce",value:function(){if(!this.paused){var t,e=this.parent.plugins.get("decelerate",!0);e&&(e.x||e.y)&&(e.x&&e.percentChangeX===e.options.friction||e.y&&e.percentChangeY===e.options.friction)&&(((t=this.oob()).left&&this.left||t.right&&this.right)&&(e.percentChangeX=this.options.friction),(t.top&&this.top||t.bottom&&this.bottom)&&(e.percentChangeY=this.options.friction));var i=this.parent.plugins.get("drag",!0)||{},s=this.parent.plugins.get("pinch",!0)||{};if(e=e||{},!(i.active||s.active||this.toX&&this.toY||e.x&&e.y)){var n=(t=t||this.oob()).topLeft,o=t.bottomRight;if(!this.toX&&!e.x){var r=null;t.left&&this.left?r=this.parent.screenWorldWidth<this.parent.screenWidth?this.calcUnderflowX():-n.x:t.right&&this.right&&(r=this.parent.screenWorldWidth<this.parent.screenWidth?this.calcUnderflowX():-o.x),null!==r&&this.parent.x!==r&&(this.toX={time:0,start:this.parent.x,delta:r-this.parent.x,end:r},this.parent.emit("bounce-x-start",this.parent))}if(!this.toY&&!e.y){var h=null;t.top&&this.top?h=this.parent.screenWorldHeight<this.parent.screenHeight?this.calcUnderflowY():-n.y:t.bottom&&this.bottom&&(h=this.parent.screenWorldHeight<this.parent.screenHeight?this.calcUnderflowY():-o.y),null!==h&&this.parent.y!==h&&(this.toY={time:0,start:this.parent.y,delta:h-this.parent.y,end:h},this.parent.emit("bounce-y-start",this.parent))}}}}},{key:"reset",value:function(){this.toX=this.toY=null,this.bounce()}}]),s}(b),V={topLeft:!1,friction:.8,time:1e3,ease:"easeInOutSine",interrupt:!0,removeOnComplete:!1,removeOnInterrupt:!1,forceStart:!1},R=function(t){h(i,t);var e=u(i);function i(t,s,o){var r,h=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};return n(this,i),(r=e.call(this,t)).options=Object.assign({},V,h),r.ease=_(h.ease,"easeInOutSine"),r.x=s,r.y=o,r.options.forceStart&&r.snapStart(),r}return r(i,[{key:"snapStart",value:function(){this.percent=0,this.snapping={time:0};var t=this.options.topLeft?this.parent.corner:this.parent.center;this.deltaX=this.x-t.x,this.deltaY=this.y-t.y,this.startX=t.x,this.startY=t.y,this.parent.emit("snap-start",this.parent)}},{key:"wheel",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("snap")}},{key:"down",value:function(){this.options.removeOnInterrupt?this.parent.plugins.remove("snap"):this.options.interrupt&&(this.snapping=null)}},{key:"up",value:function(){if(0===this.parent.input.count()){var t=this.parent.plugins.get("decelerate",!0);t&&(t.x||t.y)&&(t.percentChangeX=t.percentChangeY=this.options.friction)}}},{key:"update",value:function(t){if(!(this.paused||this.options.interrupt&&0!==this.parent.input.count()))if(this.snapping){var e,i,s,n=this.snapping;if(n.time+=t,n.time>this.options.time)e=!0,i=this.startX+this.deltaX,s=this.startY+this.deltaY;else{var o=this.ease(n.time,0,1,this.options.time);i=this.startX+this.deltaX*o,s=this.startY+this.deltaY*o}this.options.topLeft?this.parent.moveCorner(i,s):this.parent.moveCenter(i,s),this.parent.emit("moved",{viewport:this.parent,type:"snap"}),e&&(this.options.removeOnComplete&&this.parent.plugins.remove("snap"),this.parent.emit("snap-end",this.parent),this.snapping=null)}else{var r=this.options.topLeft?this.parent.corner:this.parent.center;r.x===this.x&&r.y===this.y||this.snapStart()}}}]),i}(b),B={width:0,height:0,time:1e3,ease:"easeInOutSine",center:null,interrupt:!0,removeOnComplete:!1,removeOnInterrupts:!1,forceStart:!1,noMove:!1},L=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},B,o),s.ease=_(s.options.ease),s.options.width>0&&(s.xScale=t.screenWidth/s.options.width),s.options.height>0&&(s.yScale=t.screenHeight/s.options.height),s.xIndependent=!!s.xScale,s.yIndependent=!!s.yScale,s.xScale=s.xIndependent?s.xScale:s.yScale,s.yScale=s.yIndependent?s.yScale:s.xScale,0===s.options.time?(t.container.scale.x=s.xScale,t.container.scale.y=s.yScale,s.options.removeOnComplete&&s.parent.plugins.remove("snap-zoom")):o.forceStart&&s.createSnapping(),s}return r(i,[{key:"createSnapping",value:function(){this.parent.scale;var t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,i=this.parent.screenWidth/this.xScale,s=this.parent.screenHeight/this.yScale;this.snapping={time:0,startX:t,startY:e,deltaX:i-t,deltaY:s-e},this.parent.emit("snap-zoom-start",this.parent)}},{key:"resize",value:function(){this.snapping=null,this.options.width>0&&(this.xScale=this.parent.screenWidth/this.options.width),this.options.height>0&&(this.yScale=this.parent.screenHeight/this.options.height),this.xScale=this.xIndependent?this.xScale:this.yScale,this.yScale=this.yIndependent?this.yScale:this.xScale}},{key:"wheel",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("snap-zoom")}},{key:"down",value:function(){this.options.removeOnInterrupt?this.parent.plugins.remove("snap-zoom"):this.options.interrupt&&(this.snapping=null)}},{key:"update",value:function(t){var e;if(!this.paused&&(!this.options.interrupt||0===this.parent.input.count()))if(this.options.center||this.options.noMove||(e=this.parent.center),this.snapping){if(this.snapping){var i=this.snapping;if(i.time+=t,i.time>=this.options.time)this.parent.scale.set(this.xScale,this.yScale),this.options.removeOnComplete&&this.parent.plugins.remove("snap-zoom"),this.parent.emit("snap-zoom-end",this.parent),this.snapping=null;else{var s=this.snapping,n=this.ease(s.time,s.startX,s.deltaX,this.options.time),o=this.ease(s.time,s.startY,s.deltaY,this.options.time);this.parent.scale.x=this.parent.screenWidth/n,this.parent.scale.y=this.parent.screenHeight/o}var r=this.parent.plugins.get("clamp-zoom",!0);r&&r.clamp(),this.options.noMove||(this.options.center?this.parent.moveCenter(this.options.center):this.parent.moveCenter(e))}}else this.parent.scale.x===this.xScale&&this.parent.scale.y===this.yScale||this.createSnapping()}},{key:"resume",value:function(){this.snapping=null,f(a(i.prototype),"resume",this).call(this)}}]),i}(b),E={speed:0,acceleration:null,radius:null},U=function(t){h(i,t);var e=u(i);function i(t,s){var o,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return n(this,i),(o=e.call(this,t)).target=s,o.options=Object.assign({},E,r),o.velocity={x:0,y:0},o}return r(i,[{key:"update",value:function(t){if(!this.paused){var e=this.parent.center,i=this.target.x,s=this.target.y;if(this.options.radius){if(!(Math.sqrt(Math.pow(this.target.y-e.y,2)+Math.pow(this.target.x-e.x,2))>this.options.radius))return;var n=Math.atan2(this.target.y-e.y,this.target.x-e.x);i=this.target.x-Math.cos(n)*this.options.radius,s=this.target.y-Math.sin(n)*this.options.radius}var o=i-e.x,r=s-e.y;if(o||r)if(this.options.speed)if(this.options.acceleration){var h=Math.atan2(s-e.y,i-e.x),a=Math.sqrt(Math.pow(o,2)+Math.pow(r,2));if(a){var l=(Math.pow(this.velocity.x,2)+Math.pow(this.velocity.y,2))/(2*this.options.acceleration);this.velocity=a>l?{x:Math.min(this.velocity.x+this.options.acceleration*t,this.options.speed),y:Math.min(this.velocity.y+this.options.acceleration*t,this.options.speed)}:{x:Math.max(this.velocity.x-this.options.acceleration*this.options.speed,0),y:Math.max(this.velocity.y-this.options.acceleration*this.options.speed,0)};var p=Math.cos(h)*this.velocity.x,c=Math.sin(h)*this.velocity.y,u=Math.abs(p)>Math.abs(o)?i:e.x+p,d=Math.abs(c)>Math.abs(r)?s:e.y+c;this.parent.moveCenter(u,d),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}}else{var f=Math.atan2(s-e.y,i-e.x),v=Math.cos(f)*this.options.speed,y=Math.sin(f)*this.options.speed,g=Math.abs(v)>Math.abs(o)?i:e.x+v,m=Math.abs(y)>Math.abs(r)?s:e.y+y;this.parent.moveCenter(g,m),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}else this.parent.moveCenter(i,s),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}}}]),i}(b),q={percent:.1,smooth:!1,interrupt:!0,reverse:!1,center:null,lineHeight:20,axis:"all"},F=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},q,o),s}return r(i,[{key:"down",value:function(){this.options.interrupt&&(this.smoothing=null)}},{key:"isAxisX",value:function(){return["all","x"].includes(this.options.axis)}},{key:"isAxisY",value:function(){return["all","y"].includes(this.options.axis)}},{key:"update",value:function(){if(this.smoothing){var t,e=this.smoothingCenter,i=this.smoothing;this.options.center||(t=this.parent.toLocal(e)),this.isAxisX()&&(this.parent.scale.x+=i.x),this.isAxisY()&&(this.parent.scale.y+=i.y),this.parent.emit("zoomed",{viewport:this.parent,type:"wheel"});var s=this.parent.plugins.get("clamp-zoom",!0);if(s&&s.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var n=this.parent.toGlobal(t);this.parent.x+=e.x-n.x,this.parent.y+=e.y-n.y}this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.smoothingCount++,this.smoothingCount>=this.options.smooth&&(this.smoothing=null)}}},{key:"wheel",value:function(t){if(!this.paused){var e=this.parent.input.getPointerPosition(t),i=(this.options.reverse?-1:1)*-t.deltaY*(t.deltaMode?this.options.lineHeight:1)/500,s=Math.pow(2,(1+this.options.percent)*i);if(this.options.smooth){var n={x:this.smoothing?this.smoothing.x*(this.options.smooth-this.smoothingCount):0,y:this.smoothing?this.smoothing.y*(this.options.smooth-this.smoothingCount):0};this.smoothing={x:((this.parent.scale.x+n.x)*s-this.parent.scale.x)/this.options.smooth,y:((this.parent.scale.y+n.y)*s-this.parent.scale.y)/this.options.smooth},this.smoothingCount=0,this.smoothingCenter=e}else{var o;this.options.center||(o=this.parent.toLocal(e)),this.isAxisX()&&(this.parent.scale.x*=s),this.isAxisY()&&(this.parent.scale.y*=s),this.parent.emit("zoomed",{viewport:this.parent,type:"wheel"});var r=this.parent.plugins.get("clamp-zoom",!0);if(r&&r.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var h=this.parent.toGlobal(o);this.parent.x+=e.x-h.x,this.parent.y+=e.y-h.y}}return this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.parent.emit("wheel",{wheel:{dx:t.deltaX,dy:t.deltaY,dz:t.deltaZ},event:t,viewport:this.parent}),!this.parent.options.passiveWheel||void 0}}}]),i}(b),Q={radius:null,distance:null,top:null,bottom:null,left:null,right:null,speed:8,reverse:!1,noDecelerate:!1,linear:!1,allowButtons:!1},Z=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},Q,o),s.reverse=s.options.reverse?1:-1,s.radiusSquared=Math.pow(s.options.radius,2),s.resize(),s}return r(i,[{key:"resize",value:function(){var t=this.options.distance;null!==t?(this.left=t,this.top=t,this.right=this.parent.worldScreenWidth-t,this.bottom=this.parent.worldScreenHeight-t):this.radius||(this.left=this.options.left,this.top=this.options.top,this.right=null===this.options.right?null:this.parent.worldScreenWidth-this.options.right,this.bottom=null===this.options.bottom?null:this.parent.worldScreenHeight-this.options.bottom)}},{key:"down",value:function(){this.paused||this.options.allowButtons||(this.horizontal=this.vertical=null)}},{key:"move",value:function(t){if(!this.paused&&!("mouse"!==t.data.pointerType&&1!==t.data.identifier||!this.options.allowButtons&&0!==t.data.buttons)){var e=t.data.global.x,i=t.data.global.y;if(this.radiusSquared){var s=this.parent.toScreen(this.parent.center);if(Math.pow(s.x-e,2)+Math.pow(s.y-i,2)>=this.radiusSquared){var n=Math.atan2(s.y-i,s.x-e);this.options.linear?(this.horizontal=Math.round(Math.cos(n))*this.options.speed*this.reverse*.06,this.vertical=Math.round(Math.sin(n))*this.options.speed*this.reverse*.06):(this.horizontal=Math.cos(n)*this.options.speed*this.reverse*.06,this.vertical=Math.sin(n)*this.options.speed*this.reverse*.06)}else this.horizontal&&this.decelerateHorizontal(),this.vertical&&this.decelerateVertical(),this.horizontal=this.vertical=0}else null!==this.left&&e<this.left?this.horizontal=1*this.reverse*this.options.speed*.06:null!==this.right&&e>this.right?this.horizontal=-1*this.reverse*this.options.speed*.06:(this.decelerateHorizontal(),this.horizontal=0),null!==this.top&&i<this.top?this.vertical=1*this.reverse*this.options.speed*.06:null!==this.bottom&&i>this.bottom?this.vertical=-1*this.reverse*this.options.speed*.06:(this.decelerateVertical(),this.vertical=0)}}},{key:"decelerateHorizontal",value:function(){var t=this.parent.plugins.get("decelerate",!0);this.horizontal&&t&&!this.options.noDecelerate&&t.activate({x:this.horizontal*this.options.speed*this.reverse/(1e3/60)})}},{key:"decelerateVertical",value:function(){var t=this.parent.plugins.get("decelerate",!0);this.vertical&&t&&!this.options.noDecelerate&&t.activate({y:this.vertical*this.options.speed*this.reverse/(1e3/60)})}},{key:"up",value:function(){this.paused||(this.horizontal&&this.decelerateHorizontal(),this.vertical&&this.decelerateVertical(),this.horizontal=this.vertical=null)}},{key:"update",value:function(){if(!this.paused&&(this.horizontal||this.vertical)){var t=this.parent.center;this.horizontal&&(t.x+=this.horizontal*this.options.speed),this.vertical&&(t.y+=this.vertical*this.options.speed),this.parent.moveCenter(t),this.parent.emit("moved",{viewport:this.parent,type:"mouse-edges"})}}}]),i}(b),K={removeOnInterrupt:!1,ease:"linear",time:1e3},G=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},K,o),e.options.ease=_(e.options.ease),e.setupPosition(),e.setupZoom(),e}return r(s,[{key:"setupPosition",value:function(){void 0!==this.options.position?(this.startX=this.parent.center.x,this.startY=this.parent.center.y,this.deltaX=this.options.position.x-this.parent.center.x,this.deltaY=this.options.position.y-this.parent.center.y,this.keepCenter=!1):this.keepCenter=!0}},{key:"setupZoom",value:function(){this.width=null,this.height=null,void 0!==this.options.scale?this.width=this.parent.screenWidth/this.options.scale:void 0!==this.options.scaleX||void 0!==this.options.scaleY?(void 0!==this.options.scaleX&&(this.width=this.parent.screenWidth/this.options.scaleX),void 0!==this.options.scaleY&&(this.height=this.parent.screenHeight/this.options.scaleY)):(void 0!==this.options.width&&(this.width=this.options.width),void 0!==this.options.height&&(this.height=this.options.height)),null!==typeof this.width&&(this.startWidth=this.parent.screenWidthInWorldPixels,this.deltaWidth=this.width-this.startWidth),null!==typeof this.height&&(this.startHeight=this.parent.screenHeightInWorldPixels,this.deltaHeight=this.height-this.startHeight),this.time=0}},{key:"down",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("animate")}},{key:"complete",value:function(){this.parent.plugins.remove("animate"),null!==this.width&&this.parent.fitWidth(this.width,this.keepCenter,null===this.height),null!==this.height&&this.parent.fitHeight(this.height,this.keepCenter,null===this.width),this.keepCenter||this.parent.moveCenter(this.options.position.x,this.options.position.y),this.parent.emit("animate-end",this.parent),this.options.callbackOnComplete&&this.options.callbackOnComplete(this.parent)}},{key:"update",value:function(t){if(!this.paused)if(this.time+=t,this.time>=this.options.time)this.complete();else{var i=new e.Point(this.parent.scale.x,this.parent.scale.y),s=this.options.ease(this.time,0,1,this.options.time);if(null!==this.width&&this.parent.fitWidth(this.startWidth+this.deltaWidth*s,this.keepCenter,null===this.height),null!==this.height&&this.parent.fitHeight(this.startHeight+this.deltaHeight*s,this.keepCenter,null===this.width),null===this.width?this.parent.scale.x=this.parent.scale.y:null===this.height&&(this.parent.scale.y=this.parent.scale.x),!this.keepCenter){var n=new e.Point(this.parent.x,this.parent.y);this.parent.moveCenter(this.startX+this.deltaX*s,this.startY+this.deltaY*s),this.parent.emit("moved",{viewport:this.parent,original:n,type:"animate"})}(this.width||this.height)&&this.parent.emit("zoomed",{viewport:this.parent,original:i,type:"animate"}),this.keepCenter}}}]),s}(b),N={screenWidth:window.innerWidth,screenHeight:window.innerHeight,worldWidth:null,worldHeight:null,threshold:5,passiveWheel:!0,stopPropagation:!1,forceHitArea:null,noTicker:!1,interaction:null,disableOnContextMenu:!1},$=function(t){h(o,t);var i=u(o);function o(){var t,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(n(this,o),(t=i.call(this)).options=Object.assign({},N,r),r.ticker)t.options.ticker=r.ticker;else{var h,a=s;h=parseInt(/^(\d+)\./.exec(e.VERSION)[1])<5?a.ticker.shared:a.Ticker.shared,t.options.ticker=r.ticker||h}return t.screenWidth=t.options.screenWidth,t.screenHeight=t.options.screenHeight,t._worldWidth=t.options.worldWidth,t._worldHeight=t.options.worldHeight,t.forceHitArea=t.options.forceHitArea,t.threshold=t.options.threshold,t.options.divWheel=t.options.divWheel||document.body,t.options.disableOnContextMenu&&(t.options.divWheel.oncontextmenu=function(t){return t.preventDefault()}),t.options.noTicker||(t.tickerFunction=function(){return t.update(t.options.ticker.elapsedMS)},t.options.ticker.add(t.tickerFunction)),t.input=new w(p(t)),t.plugins=new k(p(t)),t}return r(o,[{key:"destroy",value:function(t){this.options.noTicker||this.options.ticker.remove(this.tickerFunction),this.input.destroy(),f(a(o.prototype),"destroy",this).call(this,t)}},{key:"update",value:function(t){this.pause||(this.plugins.update(t),this.lastViewport&&(this.lastViewport.x!==this.x||this.lastViewport.y!==this.y?this.moving=!0:this.moving&&(this.emit("moved-end",this),this.moving=!1),this.lastViewport.scaleX!==this.scale.x||this.lastViewport.scaleY!==this.scale.y?this.zooming=!0:this.zooming&&(this.emit("zoomed-end",this),this.zooming=!1)),this.forceHitArea||(this._hitAreaDefault=new e.Rectangle(this.left,this.top,this.worldScreenWidth,this.worldScreenHeight),this.hitArea=this._hitAreaDefault),this._dirty=this._dirty||!this.lastViewport||this.lastViewport.x!==this.x||this.lastViewport.y!==this.y||this.lastViewport.scaleX!==this.scale.x||this.lastViewport.scaleY!==this.scale.y,this.lastViewport={x:this.x,y:this.y,scaleX:this.scale.x,scaleY:this.scale.y},this.emit("frame-end",this))}},{key:"resize",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.innerWidth,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window.innerHeight,i=arguments.length>2?arguments[2]:void 0,s=arguments.length>3?arguments[3]:void 0;this.screenWidth=t,this.screenHeight=e,void 0!==i&&(this._worldWidth=i),void 0!==s&&(this._worldHeight=s),this.plugins.resize(),this.dirty=!0}},{key:"worldWidth",get:function(){return this._worldWidth?this._worldWidth:this.width/this.scale.x},set:function(t){this._worldWidth=t,this.plugins.resize()}},{key:"worldHeight",get:function(){return this._worldHeight?this._worldHeight:this.height/this.scale.y},set:function(t){this._worldHeight=t,this.plugins.resize()}},{key:"getVisibleBounds",value:function(){return new e.Rectangle(this.left,this.top,this.worldScreenWidth,this.worldScreenHeight)}},{key:"toWorld",value:function(t,i){return 2===arguments.length?this.toLocal(new e.Point(t,i)):this.toLocal(t)}},{key:"toScreen",value:function(t,i){return 2===arguments.length?this.toGlobal(new e.Point(t,i)):this.toGlobal(t)}},{key:"worldScreenWidth",get:function(){return this.screenWidth/this.scale.x}},{key:"worldScreenHeight",get:function(){return this.screenHeight/this.scale.y}},{key:"screenWorldWidth",get:function(){return this.worldWidth*this.scale.x}},{key:"screenWorldHeight",get:function(){return this.worldHeight*this.scale.y}},{key:"center",get:function(){return new e.Point(this.worldScreenWidth/2-this.x/this.scale.x,this.worldScreenHeight/2-this.y/this.scale.y)},set:function(t){this.moveCenter(t)}},{key:"moveCenter",value:function(){var t,e;isNaN(arguments[0])?(t=arguments[0].x,e=arguments[0].y):(t=arguments[0],e=arguments[1]);var i=(this.worldScreenWidth/2-t)*this.scale.x,s=(this.worldScreenHeight/2-e)*this.scale.y;return this.x===i&&this.y===s||(this.position.set(i,s),this.plugins.reset(),this.dirty=!0),this}},{key:"corner",get:function(){return new e.Point(-this.x/this.scale.x,-this.y/this.scale.y)},set:function(t){this.moveCorner(t)}},{key:"moveCorner",value:function(){var t,e;return 1===arguments.length?(t=-arguments[0].x*this.scale.x,e=-arguments[0].y*this.scale.y):(t=-arguments[0]*this.scale.x,e=-arguments[1]*this.scale.y),t===this.x&&e===this.y||(this.position.set(t,e),this.plugins.reset(),this.dirty=!0),this}},{key:"screenWidthInWorldPixels",get:function(){return this.screenWidth/this.scale.x}},{key:"screenHeightInWorldPixels",get:function(){return this.screenHeight/this.scale.y}},{key:"findFitWidth",value:function(t){return this.screenWidth/t}},{key:"findFitHeight",value:function(t){return this.screenHeight/t}},{key:"findFit",value:function(t,e){var i=this.screenWidth/t,s=this.screenHeight/e;return Math.min(i,s)}},{key:"findCover",value:function(t,e){var i=this.screenWidth/t,s=this.screenHeight/e;return Math.max(i,s)}},{key:"fitWidth",value:function(t,e){var i,s=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=arguments.length>3?arguments[3]:void 0;e&&(i=this.center),this.scale.x=this.screenWidth/t,s&&(this.scale.y=this.scale.x);var o=this.plugins.get("clamp-zoom",!0);return!n&&o&&o.clamp(),e&&this.moveCenter(i),this}},{key:"fitHeight",value:function(t,e){var i,s=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=arguments.length>3?arguments[3]:void 0;e&&(i=this.center),this.scale.y=this.screenHeight/t,s&&(this.scale.x=this.scale.y);var o=this.plugins.get("clamp-zoom",!0);return!n&&o&&o.clamp(),e&&this.moveCenter(i),this}},{key:"fitWorld",value:function(t){var e;t&&(e=this.center),this.scale.x=this.screenWidth/this.worldWidth,this.scale.y=this.screenHeight/this.worldHeight,this.scale.x<this.scale.y?this.scale.y=this.scale.x:this.scale.x=this.scale.y;var i=this.plugins.get("clamp-zoom",!0);return i&&i.clamp(),t&&this.moveCenter(e),this}},{key:"fit",value:function(t){var e,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.worldWidth,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.worldHeight;t&&(e=this.center),this.scale.x=this.screenWidth/i,this.scale.y=this.screenHeight/s,this.scale.x<this.scale.y?this.scale.y=this.scale.x:this.scale.x=this.scale.y;var n=this.plugins.get("clamp-zoom",!0);return n&&n.clamp(),t&&this.moveCenter(e),this}},{key:"visible",set:function(t){t||this.input.clear(),y(a(o.prototype),"visible",t,this,!0)}},{key:"setZoom",value:function(t,e){var i;e&&(i=this.center),this.scale.set(t);var s=this.plugins.get("clamp-zoom",!0);return s&&s.clamp(),e&&this.moveCenter(i),this}},{key:"zoomPercent",value:function(t,e){return this.setZoom(this.scale.x+this.scale.x*t,e)}},{key:"zoom",value:function(t,e){return this.fitWidth(t+this.worldScreenWidth,e),this}},{key:"scaled",get:function(){return this.scale.x},set:function(t){this.setZoom(t,!0)}},{key:"snapZoom",value:function(t){return this.plugins.add("snap-zoom",new L(this,t)),this}},{key:"OOB",value:function(){return{left:this.left<0,right:this.right>this.worldWidth,top:this.top<0,bottom:this.bottom>this._worldHeight,cornerPoint:new e.Point(this.worldWidth*this.scale.x-this.screenWidth,this.worldHeight*this.scale.y-this.screenHeight)}}},{key:"right",get:function(){return-this.x/this.scale.x+this.worldScreenWidth},set:function(t){this.x=-t*this.scale.x+this.screenWidth,this.plugins.reset()}},{key:"left",get:function(){return-this.x/this.scale.x},set:function(t){this.x=-t*this.scale.x,this.plugins.reset()}},{key:"top",get:function(){return-this.y/this.scale.y},set:function(t){this.y=-t*this.scale.y,this.plugins.reset()}},{key:"bottom",get:function(){return-this.y/this.scale.y+this.worldScreenHeight},set:function(t){this.y=-t*this.scale.y+this.screenHeight,this.plugins.reset()}},{key:"dirty",get:function(){return this._dirty},set:function(t){this._dirty=t}},{key:"forceHitArea",get:function(){return this._forceHitArea},set:function(t){t?(this._forceHitArea=t,this.hitArea=t):(this._forceHitArea=null,this.hitArea=new e.Rectangle(0,0,this.worldWidth,this.worldHeight))}},{key:"drag",value:function(t){return this.plugins.add("drag",new H(this,t)),this}},{key:"clamp",value:function(t){return this.plugins.add("clamp",new C(this,t)),this}},{key:"decelerate",value:function(t){return this.plugins.add("decelerate",new Y(this,t)),this}},{key:"bounce",value:function(t){return this.plugins.add("bounce",new T(this,t)),this}},{key:"pinch",value:function(t){return this.plugins.add("pinch",new O(this,t)),this}},{key:"snap",value:function(t,e,i){return this.plugins.add("snap",new R(this,t,e,i)),this}},{key:"follow",value:function(t,e){return this.plugins.add("follow",new U(this,t,e)),this}},{key:"wheel",value:function(t){return this.plugins.add("wheel",new F(this,t)),this}},{key:"animate",value:function(t){return this.plugins.add("animate",new G(this,t)),this}},{key:"clampZoom",value:function(t){return this.plugins.add("clamp-zoom",new z(this,t)),this}},{key:"mouseEdges",value:function(t){return this.plugins.add("mouse-edges",new Z(this,t)),this}},{key:"pause",get:function(){return this._pause},set:function(t){this._pause=t,this.lastViewport=null,this.moving=!1,this.zooming=!1,t&&this.input.pause()}},{key:"ensureVisible",value:function(t,e,i,s,n){n&&(i>this.worldScreenWidth||s>this.worldScreenHeight)&&(this.fit(!0,i,s),this.emit("zoomed",{viewport:this,type:"ensureVisible"}));var o=!1;t<this.left?(this.left=t,o=!0):t+i>this.right&&(this.right=t+i,o=!0),e<this.top?(this.top=e,o=!0):e+s>this.bottom&&(this.bottom=e+s,o=!0),o&&this.emit("moved",{viewport:this,type:"ensureVisible"})}}]),o}(e.Container);t.Plugin=b,t.Viewport=$,Object.defineProperty(t,"__esModule",{value:!0})}));
=======
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("pixi.js")):"function"==typeof define&&define.amd?define(["exports","pixi.js"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).Viewport={},t.PIXI)}(this,(function(t,e){"use strict";function i(t){if(t&&t.__esModule)return t;var e=Object.create(null);return t&&Object.keys(t).forEach((function(i){if("default"!==i){var s=Object.getOwnPropertyDescriptor(t,i);Object.defineProperty(e,i,s.get?s:{enumerable:!0,get:function(){return t[i]}})}})),e.default=t,Object.freeze(e)}var s=i(e);function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}function r(t,e,i){return e&&o(t.prototype,e),i&&o(t,i),t}function h(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&l(t,e)}function a(t){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function l(t,e){return(l=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function p(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function c(t,e){return!e||"object"!=typeof e&&"function"!=typeof e?p(t):e}function u(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,s=a(t);if(e){var n=a(this).constructor;i=Reflect.construct(s,arguments,n)}else i=s.apply(this,arguments);return c(this,i)}}function d(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=a(t)););return t}function f(t,e,i){return(f="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,i){var s=d(t,e);if(s){var n=Object.getOwnPropertyDescriptor(s,e);return n.get?n.get.call(i):n.value}})(t,e,i||t)}function v(t,e,i,s){return(v="undefined"!=typeof Reflect&&Reflect.set?Reflect.set:function(t,e,i,s){var n,o=d(t,e);if(o){if((n=Object.getOwnPropertyDescriptor(o,e)).set)return n.set.call(s,i),!0;if(!n.writable)return!1}if(n=Object.getOwnPropertyDescriptor(s,e)){if(!n.writable)return!1;n.value=i,Object.defineProperty(s,e,n)}else!function(t,e,i){e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i}(s,e,i);return!0})(t,e,i,s)}function y(t,e,i,s,n){if(!v(t,e,i,s||t)&&n)throw new Error("failed to set property");return i}function g(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,s=new Array(e);i<e;i++)s[i]=t[i];return s}function m(t,e){var i;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(i=function(t,e){if(t){if("string"==typeof t)return g(t,e);var i=Object.prototype.toString.call(t).slice(8,-1);return"Object"===i&&t.constructor&&(i=t.constructor.name),"Map"===i||"Set"===i?Array.from(t):"Arguments"===i||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?g(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){i&&(t=i);var s=0,n=function(){};return{s:n,n:function(){return s>=t.length?{done:!0}:{done:!1,value:t[s++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r=!0,h=!1;return{s:function(){i=t[Symbol.iterator]()},n:function(){var t=i.next();return r=t.done,t},e:function(t){h=!0,o=t},f:function(){try{r||null==i.return||i.return()}finally{if(h)throw o}}}}var w=function(){function t(e){n(this,t),this.viewport=e,this.touches=[],this.addListeners()}return r(t,[{key:"addListeners",value:function(){var t=this;this.viewport.interactive=!0,this.viewport.forceHitArea||(this.viewport.hitArea=new e.Rectangle(0,0,this.viewport.worldWidth,this.viewport.worldHeight)),this.viewport.on("pointerdown",this.down,this),this.viewport.on("pointermove",this.move,this),this.viewport.on("pointerup",this.up,this),this.viewport.on("pointerupoutside",this.up,this),this.viewport.on("pointercancel",this.up,this),this.viewport.on("pointerout",this.up,this),this.wheelFunction=function(e){return t.handleWheel(e)},this.viewport.options.divWheel.addEventListener("wheel",this.wheelFunction,{passive:this.viewport.options.passiveWheel}),this.isMouseDown=!1}},{key:"destroy",value:function(){this.viewport.options.divWheel.removeEventListener("wheel",this.wheelFunction)}},{key:"down",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){if("mouse"===t.data.pointerType?this.isMouseDown=!0:this.get(t.data.pointerId)||this.touches.push({id:t.data.pointerId,last:null}),1===this.count()){this.last=t.data.global.clone();var e=this.viewport.plugins.get("decelerate",!0),i=this.viewport.plugins.get("bounce",!0);e&&e.isActive()||i&&i.isActive()?this.clickedAvailable=!1:this.clickedAvailable=!0}else this.clickedAvailable=!1;this.viewport.plugins.down(t)&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"clear",value:function(){this.isMouseDown=!1,this.touches=[],this.last=null}},{key:"checkThreshold",value:function(t){return Math.abs(t)>=this.viewport.threshold}},{key:"move",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){var e=this.viewport.plugins.move(t);if(this.clickedAvailable){var i=t.data.global.x-this.last.x,s=t.data.global.y-this.last.y;(this.checkThreshold(i)||this.checkThreshold(s))&&(this.clickedAvailable=!1)}e&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"up",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible){"mouse"===t.data.pointerType&&(this.isMouseDown=!1),"mouse"!==t.data.pointerType&&this.remove(t.data.pointerId);var e=this.viewport.plugins.up(t);this.clickedAvailable&&0===this.count()&&(this.viewport.emit("clicked",{event:t,screen:this.last,world:this.viewport.toWorld(this.last),viewport:this}),this.clickedAvailable=!1),e&&this.viewport.options.stopPropagation&&t.stopPropagation()}}},{key:"getPointerPosition",value:function(t){var i=new e.Point;return this.viewport.options.interaction?this.viewport.options.interaction.mapPositionToPoint(i,t.clientX,t.clientY):(i.x=t.clientX,i.y=t.clientY),i}},{key:"handleWheel",value:function(t){if(!this.viewport.pause&&this.viewport.worldVisible&&(!this.viewport.options.interaction||this.viewport.options.interaction.interactionDOMElement===t.target)){var e=this.viewport.toLocal(this.getPointerPosition(t));if(this.viewport.left<=e.x&&e.x<=this.viewport.right&&this.viewport.top<=e.y&&e.y<=this.viewport.bottom)this.viewport.plugins.wheel(t)&&!this.viewport.options.passiveWheel&&t.preventDefault()}}},{key:"pause",value:function(){this.touches=[],this.isMouseDown=!1}},{key:"get",value:function(t){var e,i=m(this.touches);try{for(i.s();!(e=i.n()).done;){var s=e.value;if(s.id===t)return s}}catch(t){i.e(t)}finally{i.f()}return null}},{key:"remove",value:function(t){for(var e=0;e<this.touches.length;e++)if(this.touches[e].id===t)return void this.touches.splice(e,1)}},{key:"count",value:function(){return(this.isMouseDown?1:0)+this.touches.length}}]),t}(),x=["drag","pinch","wheel","follow","mouse-edges","decelerate","aniamte","bounce","snap-zoom","clamp-zoom","snap","clamp"],k=function(){function t(e){n(this,t),this.viewport=e,this.list=[],this.plugins={}}return r(t,[{key:"add",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:x.length;this.plugins[t]=e;var s=x.indexOf(t);-1!==s&&x.splice(s,1),x.splice(i,0,t),this.sort()}},{key:"get",value:function(t,e){return e&&this.plugins[t]&&this.plugins[t].paused?null:this.plugins[t]}},{key:"update",value:function(t){var e,i=m(this.list);try{for(i.s();!(e=i.n()).done;){e.value.update(t)}}catch(t){i.e(t)}finally{i.f()}}},{key:"resize",value:function(){var t,e=m(this.list);try{for(e.s();!(t=e.n()).done;){t.value.resize()}}catch(t){e.e(t)}finally{e.f()}}},{key:"reset",value:function(){var t,e=m(this.list);try{for(e.s();!(t=e.n()).done;){t.value.reset()}}catch(t){e.e(t)}finally{e.f()}}},{key:"removeAll",value:function(){this.plugins={},this.sort()}},{key:"remove",value:function(t){this.plugins[t]&&(delete this.plugins[t],this.viewport.emit(t+"-remove"),this.sort())}},{key:"pause",value:function(t){this.plugins[t]&&this.plugins[t].pause()}},{key:"resume",value:function(t){this.plugins[t]&&this.plugins[t].resume()}},{key:"sort",value:function(){this.list=[];var t,e=m(x);try{for(e.s();!(t=e.n()).done;){var i=t.value;this.plugins[i]&&this.list.push(this.plugins[i])}}catch(t){e.e(t)}finally{e.f()}}},{key:"down",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.down(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"move",value:function(t){var e,i=!1,s=m(this.viewport.plugins.list);try{for(s.s();!(e=s.n()).done;){e.value.move(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"up",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.up(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}},{key:"wheel",value:function(t){var e,i=!1,s=m(this.list);try{for(s.s();!(e=s.n()).done;){e.value.wheel(t)&&(i=!0)}}catch(t){s.e(t)}finally{s.f()}return i}}]),t}(),b=function(){function t(e){n(this,t),this.parent=e,this.paused=!1}return r(t,[{key:"destroy",value:function(){}},{key:"down",value:function(){return!1}},{key:"move",value:function(){return!1}},{key:"up",value:function(){return!1}},{key:"wheel",value:function(){return!1}},{key:"update",value:function(){}},{key:"resize",value:function(){}},{key:"reset",value:function(){}},{key:"pause",value:function(){this.paused=!0}},{key:"resume",value:function(){this.paused=!1}}]),t}(),W={direction:"all",pressDrag:!0,wheel:!0,wheelScroll:1,reverse:!1,clampWheel:!1,underflow:"center",factor:1,mouseButtons:"all",keyToPress:null,ignoreKeyToPressOnTouch:!1,lineHeight:20},H=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},W,o),e.moved=!1,e.reverse=e.options.reverse?1:-1,e.xDirection=!e.options.direction||"all"===e.options.direction||"x"===e.options.direction,e.yDirection=!e.options.direction||"all"===e.options.direction||"y"===e.options.direction,e.keyIsPressed=!1,e.parseUnderflow(),e.mouseButtons(e.options.mouseButtons),e.options.keyToPress&&e.handleKeyPresses(e.options.keyToPress),e}return r(s,[{key:"handleKeyPresses",value:function(t){var e=this;window.addEventListener("keydown",(function(i){t.includes(i.code)&&(e.keyIsPressed=!0)})),window.addEventListener("keyup",(function(i){t.includes(i.code)&&(e.keyIsPressed=!1)}))}},{key:"mouseButtons",value:function(t){this.mouse=t&&"all"!==t?[-1!==t.indexOf("left"),-1!==t.indexOf("middle"),-1!==t.indexOf("right")]:[!0,!0,!0]}},{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"center"===t?(this.underflowX=0,this.underflowY=0):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0)}},{key:"checkButtons",value:function(t){var e="mouse"===t.data.pointerType,i=this.parent.input.count();return!(!(1===i||i>1&&!this.parent.plugins.get("pinch",!0))||e&&!this.mouse[t.data.button])}},{key:"checkKeyPress",value:function(t){return!!(!this.options.keyToPress||this.keyIsPressed||this.options.ignoreKeyToPressOnTouch&&"touch"===t.data.pointerType)}},{key:"down",value:function(t){if(!this.paused&&this.options.pressDrag)return this.checkButtons(t)&&this.checkKeyPress(t)?(this.last={x:t.data.global.x,y:t.data.global.y},this.current=t.data.pointerId,!0):void(this.last=null)}},{key:"active",get:function(){return this.moved}},{key:"move",value:function(t){if(!this.paused&&this.options.pressDrag&&this.last&&this.current===t.data.pointerId){var i=t.data.global.x,s=t.data.global.y,n=this.parent.input.count();if(1===n||n>1&&!this.parent.plugins.get("pinch",!0)){var o=i-this.last.x,r=s-this.last.y;if(this.moved||this.xDirection&&this.parent.input.checkThreshold(o)||this.yDirection&&this.parent.input.checkThreshold(r)){var h={x:i,y:s};return this.xDirection&&(this.parent.x+=(h.x-this.last.x)*this.options.factor),this.yDirection&&(this.parent.y+=(h.y-this.last.y)*this.options.factor),this.last=h,this.moved||this.parent.emit("drag-start",{event:t,screen:new e.Point(this.last.x,this.last.y),world:this.parent.toWorld(new e.Point(this.last.x,this.last.y)),viewport:this.parent}),this.moved=!0,this.parent.emit("moved",{viewport:this.parent,type:"drag"}),!0}}else this.moved=!1}}},{key:"up",value:function(t){if(!this.paused){var i=this.parent.input.touches;if(1===i.length){var s=i[0];return s.last&&(this.last={x:s.last.x,y:s.last.y},this.current=s.id),this.moved=!1,!0}if(this.last&&this.moved){var n=new e.Point(this.last.x,this.last.y);return this.parent.emit("drag-end",{event:t,screen:n,world:this.parent.toWorld(n),viewport:this.parent}),this.last=null,this.moved=!1,!0}}}},{key:"wheel",value:function(t){if(!this.paused&&this.options.wheel){var e=this.parent.plugins.get("wheel",!0);if(!e){var i=t.deltaMode?this.options.lineHeight:1;return this.xDirection&&(this.parent.x+=t.deltaX*i*this.options.wheelScroll*this.reverse),this.yDirection&&(this.parent.y+=t.deltaY*i*this.options.wheelScroll*this.reverse),this.options.clampWheel&&this.clamp(),this.parent.emit("wheel-scroll",this.parent),this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.parent.options.passiveWheel||t.preventDefault(),!0}}}},{key:"resume",value:function(){this.last=null,this.paused=!1}},{key:"clamp",value:function(){var t=this.parent.plugins.get("decelerate",!0)||{};if("y"!==this.options.clampWheel)if(this.parent.screenWorldWidth<this.parent.screenWidth)switch(this.underflowX){case-1:this.parent.x=0;break;case 1:this.parent.x=this.parent.screenWidth-this.parent.screenWorldWidth;break;default:this.parent.x=(this.parent.screenWidth-this.parent.screenWorldWidth)/2}else this.parent.left<0?(this.parent.x=0,t.x=0):this.parent.right>this.parent.worldWidth&&(this.parent.x=-this.parent.worldWidth*this.parent.scale.x+this.parent.screenWidth,t.x=0);if("x"!==this.options.clampWheel)if(this.parent.screenWorldHeight<this.parent.screenHeight)switch(this.underflowY){case-1:this.parent.y=0;break;case 1:this.parent.y=this.parent.screenHeight-this.parent.screenWorldHeight;break;default:this.parent.y=(this.parent.screenHeight-this.parent.screenWorldHeight)/2}else this.parent.top<0&&(this.parent.y=0,t.y=0),this.parent.bottom>this.parent.worldHeight&&(this.parent.y=-this.parent.worldHeight*this.parent.scale.y+this.parent.screenHeight,t.y=0)}}]),s}(b),O={noDrag:!1,percent:1,center:null,factor:1,axis:"all"},M=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},O,o),s}return r(i,[{key:"down",value:function(){if(this.parent.input.count()>=2)return this.active=!0,!0}},{key:"isAxisX",value:function(){return["all","x"].includes(this.options.axis)}},{key:"isAxisY",value:function(){return["all","y"].includes(this.options.axis)}},{key:"move",value:function(t){if(!this.paused&&this.active){var e=t.data.global.x,i=t.data.global.y,s=this.parent.input.touches;if(s.length>=2){var n=s[0],o=s[1],r=n.last&&o.last?Math.sqrt(Math.pow(o.last.x-n.last.x,2)+Math.pow(o.last.y-n.last.y,2)):null;if(n.id===t.data.pointerId?n.last={x:e,y:i,data:t.data}:o.id===t.data.pointerId&&(o.last={x:e,y:i,data:t.data}),r){var h,a={x:n.last.x+(o.last.x-n.last.x)/2,y:n.last.y+(o.last.y-n.last.y)/2};this.options.center||(h=this.parent.toLocal(a));var l=Math.sqrt(Math.pow(o.last.x-n.last.x,2)+Math.pow(o.last.y-n.last.y,2)),p=(1-r/(l=0===l?l=1e-10:l))*this.options.percent*(this.isAxisX()?this.parent.scale.x:this.parent.scale.y);this.isAxisX()&&(this.parent.scale.x+=p),this.isAxisY()&&(this.parent.scale.y+=p),this.parent.emit("zoomed",{viewport:this.parent,type:"pinch",center:a});var c=this.parent.plugins.get("clamp-zoom",!0);if(c&&c.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var u=this.parent.toGlobal(h);this.parent.x+=(a.x-u.x)*this.options.factor,this.parent.y+=(a.y-u.y)*this.options.factor,this.parent.emit("moved",{viewport:this.parent,type:"pinch"})}!this.options.noDrag&&this.lastCenter&&(this.parent.x+=(a.x-this.lastCenter.x)*this.options.factor,this.parent.y+=(a.y-this.lastCenter.y)*this.options.factor,this.parent.emit("moved",{viewport:this.parent,type:"pinch"})),this.lastCenter=a,this.moved=!0}else this.pinching||(this.parent.emit("pinch-start",this.parent),this.pinching=!0);return!0}}}},{key:"up",value:function(){if(this.pinching&&this.parent.input.touches.length<=1)return this.active=!1,this.lastCenter=null,this.pinching=!1,this.moved=!1,this.parent.emit("pinch-end",this.parent),!0}}]),i}(b),S={left:!1,right:!1,top:!1,bottom:!1,direction:null,underflow:"center"},C=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},S,o),s.options.direction&&(s.options.left="x"===s.options.direction||"all"===s.options.direction||null,s.options.right="x"===s.options.direction||"all"===s.options.direction||null,s.options.top="y"===s.options.direction||"all"===s.options.direction||null,s.options.bottom="y"===s.options.direction||"all"===s.options.direction||null),s.parseUnderflow(),s.last={x:null,y:null,scaleX:null,scaleY:null},s.update(),s}return r(i,[{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"none"===t?this.noUnderflow=!0:"center"===t?(this.underflowX=this.underflowY=0,this.noUnderflow=!1):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0,this.noUnderflow=!1)}},{key:"move",value:function(){return this.update(),!1}},{key:"update",value:function(){if(!this.paused&&(this.parent.x!==this.last.x||this.parent.y!==this.last.y||this.parent.scale.x!==this.last.scaleX||this.parent.scale.y!==this.last.scaleY)){var t={x:this.parent.x,y:this.parent.y},e=this.parent.plugins.decelerate||{};if(null!==this.options.left||null!==this.options.right){var i=!1;if(!this.noUnderflow&&this.parent.screenWorldWidth<this.parent.screenWidth)switch(this.underflowX){case-1:0!==this.parent.x&&(this.parent.x=0,i=!0);break;case 1:this.parent.x!==this.parent.screenWidth-this.parent.screenWorldWidth&&(this.parent.x=this.parent.screenWidth-this.parent.screenWorldWidth,i=!0);break;default:this.parent.x!==(this.parent.screenWidth-this.parent.screenWorldWidth)/2&&(this.parent.x=(this.parent.screenWidth-this.parent.screenWorldWidth)/2,i=!0)}else null!==this.options.left&&this.parent.left<(!0===this.options.left?0:this.options.left)&&(this.parent.x=-(!0===this.options.left?0:this.options.left)*this.parent.scale.x,e.x=0,i=!0),null!==this.options.right&&this.parent.right>(!0===this.options.right?this.parent.worldWidth:this.options.right)&&(this.parent.x=-(!0===this.options.right?this.parent.worldWidth:this.options.right)*this.parent.scale.x+this.parent.screenWidth,e.x=0,i=!0);i&&this.parent.emit("moved",{viewport:this.parent,original:t,type:"clamp-x"})}if(null!==this.options.top||null!==this.options.bottom){var s=!1;if(!this.noUnderflow&&this.parent.screenWorldHeight<this.parent.screenHeight)switch(this.underflowY){case-1:0!==this.parent.y&&(this.parent.y=0,s=!0);break;case 1:this.parent.y!==this.parent.screenHeight-this.parent.screenWorldHeight&&(this.parent.y=this.parent.screenHeight-this.parent.screenWorldHeight,s=!0);break;default:this.parent.y!==(this.parent.screenHeight-this.parent.screenWorldHeight)/2&&(this.parent.y=(this.parent.screenHeight-this.parent.screenWorldHeight)/2,s=!0)}else null!==this.options.top&&this.parent.top<(!0===this.options.top?0:this.options.top)&&(this.parent.y=-(!0===this.options.top?0:this.options.top)*this.parent.scale.y,e.y=0,s=!0),null!==this.options.bottom&&this.parent.bottom>(!0===this.options.bottom?this.parent.worldHeight:this.options.bottom)&&(this.parent.y=-(!0===this.options.bottom?this.parent.worldHeight:this.options.bottom)*this.parent.scale.y+this.parent.screenHeight,e.y=0,s=!0);s&&this.parent.emit("moved",{viewport:this.parent,original:t,type:"clamp-y"})}this.last.x=this.parent.x,this.last.y=this.parent.y,this.last.scaleX=this.parent.scale.x,this.last.scaleY=this.parent.scale.y}}},{key:"reset",value:function(){this.update()}}]),i}(b),P={minWidth:null,minHeight:null,maxWidth:null,maxHeight:null,minScale:null,maxScale:null},z=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},P,o),s.clamp(),s}return r(i,[{key:"resize",value:function(){this.clamp()}},{key:"clamp",value:function(){if(!this.paused)if(this.options.minWidth||this.options.minHeight||this.options.maxWidth||this.options.maxHeight){var t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight;if(null!==this.options.minWidth&&t<this.options.minWidth){var i=this.parent.scale.x;this.parent.fitWidth(this.options.minWidth,!1,!1,!0),this.parent.scale.y*=this.parent.scale.x/i,t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.maxWidth&&t>this.options.maxWidth){var s=this.parent.scale.x;this.parent.fitWidth(this.options.maxWidth,!1,!1,!0),this.parent.scale.y*=this.parent.scale.x/s,t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.minHeight&&e<this.options.minHeight){var n=this.parent.scale.y;this.parent.fitHeight(this.options.minHeight,!1,!1,!0),this.parent.scale.x*=this.parent.scale.y/n,t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}if(null!==this.options.maxHeight&&e>this.options.maxHeight){var o=this.parent.scale.y;this.parent.fitHeight(this.options.maxHeight,!1,!1,!0),this.parent.scale.x*=this.parent.scale.y/o,this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"})}}else{var r=this.parent.scale.x;null!==this.options.minScale&&r<this.options.minScale&&(r=this.options.minScale),null!==this.options.maxScale&&r>this.options.maxScale&&(r=this.options.maxScale),r!==this.parent.scale.x&&(this.parent.scale.set(r),this.parent.emit("zoomed",{viewport:this.parent,type:"clamp-zoom"}))}}},{key:"reset",value:function(){this.clamp()}}]),i}(b),I={friction:.98,bounce:.8,minSpeed:.01},X=16,Y=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},I,o),s.saved=[],s.timeSinceRelease=0,s.reset(),s.parent.on("moved",(function(t){return s.moved(t)})),s}return r(i,[{key:"destroy",value:function(){this.parent}},{key:"down",value:function(){this.saved=[],this.x=this.y=!1}},{key:"isActive",value:function(){return this.x||this.y}},{key:"move",value:function(){if(!this.paused){var t=this.parent.input.count();(1===t||t>1&&!this.parent.plugins.get("pinch",!0))&&(this.saved.push({x:this.parent.x,y:this.parent.y,time:performance.now()}),this.saved.length>60&&this.saved.splice(0,30))}}},{key:"moved",value:function(t){if(this.saved.length){var e=this.saved[this.saved.length-1];"clamp-x"===t.type?e.x===t.original.x&&(e.x=this.parent.x):"clamp-y"===t.type&&e.y===t.original.y&&(e.y=this.parent.y)}}},{key:"up",value:function(){if(0===this.parent.input.count()&&this.saved.length){var t,e=performance.now(),i=m(this.saved);try{for(i.s();!(t=i.n()).done;){var s=t.value;if(s.time>=e-100){var n=e-s.time;this.x=(this.parent.x-s.x)/n,this.y=(this.parent.y-s.y)/n,this.percentChangeX=this.percentChangeY=this.options.friction,this.timeSinceRelease=0;break}}}catch(t){i.e(t)}finally{i.f()}}}},{key:"activate",value:function(t){void 0!==(t=t||{}).x&&(this.x=t.x,this.percentChangeX=this.options.friction),void 0!==t.y&&(this.y=t.y,this.percentChangeY=this.options.friction)}},{key:"update",value:function(t){if(!this.paused){var e=this.x||this.y,i=this.timeSinceRelease,s=this.timeSinceRelease+t;if(this.x){var n=this.percentChangeX,o=Math.log(n);this.parent.x+=this.x*X/o*(Math.pow(n,s/X)-Math.pow(n,i/X))}if(this.y){var r=this.percentChangeY,h=Math.log(r);this.parent.y+=this.y*X/h*(Math.pow(r,s/X)-Math.pow(r,i/X))}this.timeSinceRelease+=t,this.x*=Math.pow(this.percentChangeX,t/X),this.y*=Math.pow(this.percentChangeY,t/X),Math.abs(this.x)<this.options.minSpeed&&(this.x=0),Math.abs(this.y)<this.options.minSpeed&&(this.y=0),e&&this.parent.emit("moved",{viewport:this.parent,type:"decelerate"})}}},{key:"reset",value:function(){this.x=this.y=null}}]),i}(b),A="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var j=function(t){var e={exports:{}};return t(e,e.exports),e.exports}((function(t,e){(function(){var e;(function(e){t.exports=e})(e={linear:function(t,e,i,s){return i*t/s+e},easeInQuad:function(t,e,i,s){return i*(t/=s)*t+e},easeOutQuad:function(t,e,i,s){return-i*(t/=s)*(t-2)+e},easeInOutQuad:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t+e:-i/2*(--t*(t-2)-1)+e},easeInCubic:function(t,e,i,s){return i*(t/=s)*t*t+e},easeOutCubic:function(t,e,i,s){return i*((t=t/s-1)*t*t+1)+e},easeInOutCubic:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t+e:i/2*((t-=2)*t*t+2)+e},easeInQuart:function(t,e,i,s){return i*(t/=s)*t*t*t+e},easeOutQuart:function(t,e,i,s){return-i*((t=t/s-1)*t*t*t-1)+e},easeInOutQuart:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t*t+e:-i/2*((t-=2)*t*t*t-2)+e},easeInQuint:function(t,e,i,s){return i*(t/=s)*t*t*t*t+e},easeOutQuint:function(t,e,i,s){return i*((t=t/s-1)*t*t*t*t+1)+e},easeInOutQuint:function(t,e,i,s){return(t/=s/2)<1?i/2*t*t*t*t*t+e:i/2*((t-=2)*t*t*t*t+2)+e},easeInSine:function(t,e,i,s){return-i*Math.cos(t/s*(Math.PI/2))+i+e},easeOutSine:function(t,e,i,s){return i*Math.sin(t/s*(Math.PI/2))+e},easeInOutSine:function(t,e,i,s){return-i/2*(Math.cos(Math.PI*t/s)-1)+e},easeInExpo:function(t,e,i,s){return 0===t?e:i*Math.pow(2,10*(t/s-1))+e},easeOutExpo:function(t,e,i,s){return t===s?e+i:i*(1-Math.pow(2,-10*t/s))+e},easeInOutExpo:function(t,e,i,s){return(t/=s/2)<1?i/2*Math.pow(2,10*(t-1))+e:i/2*(2-Math.pow(2,-10*--t))+e},easeInCirc:function(t,e,i,s){return-i*(Math.sqrt(1-(t/=s)*t)-1)+e},easeOutCirc:function(t,e,i,s){return i*Math.sqrt(1-(t=t/s-1)*t)+e},easeInOutCirc:function(t,e,i,s){return(t/=s/2)<1?-i/2*(Math.sqrt(1-t*t)-1)+e:i/2*(Math.sqrt(1-(t-=2)*t)+1)+e},easeInElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s),(o=0)||(o=.3*s),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),-n*Math.pow(2,10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)+e},easeOutElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s),(o=0)||(o=.3*s),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),n*Math.pow(2,-10*t)*Math.sin((t*s-r)*(2*Math.PI)/o)+i+e},easeInOutElastic:function(t,e,i,s){var n,o,r;return r=1.70158,0===t||(t/=s/2),(o=0)||(o=s*(.3*1.5)),(n=i)<Math.abs(i)?(n=i,r=o/4):r=o/(2*Math.PI)*Math.asin(i/n),t<1?n*Math.pow(2,10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)*-.5+e:n*Math.pow(2,-10*(t-=1))*Math.sin((t*s-r)*(2*Math.PI)/o)*.5+i+e},easeInBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),i*(t/=s)*t*((n+1)*t-n)+e},easeOutBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),i*((t=t/s-1)*t*((n+1)*t+n)+1)+e},easeInOutBack:function(t,e,i,s,n){return void 0===n&&(n=1.70158),(t/=s/2)<1?i/2*(t*t*((1+(n*=1.525))*t-n))+e:i/2*((t-=2)*t*((1+(n*=1.525))*t+n)+2)+e},easeInBounce:function(t,i,s,n){return s-e.easeOutBounce(n-t,0,s,n)+i},easeOutBounce:function(t,e,i,s){return(t/=s)<1/2.75?i*(7.5625*t*t)+e:t<2/2.75?i*(7.5625*(t-=1.5/2.75)*t+.75)+e:t<2.5/2.75?i*(7.5625*(t-=2.25/2.75)*t+.9375)+e:i*(7.5625*(t-=2.625/2.75)*t+.984375)+e},easeInOutBounce:function(t,i,s,n){return t<n/2?.5*e.easeInBounce(2*t,0,s,n)+i:.5*e.easeOutBounce(2*t-n,0,s,n)+.5*s+i}})}).call(A)}));function _(t,e){return t?"function"==typeof t?t:"string"==typeof t?j[t]:void 0:j[e]}var D={sides:"all",friction:.5,time:150,ease:"easeInOutSine",underflow:"center",bounceBox:null},T=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},D,o),e.ease=_(e.options.ease,"easeInOutSine"),e.options.sides&&("all"===e.options.sides?e.top=e.bottom=e.left=e.right=!0:"horizontal"===e.options.sides?e.right=e.left=!0:"vertical"===e.options.sides?e.top=e.bottom=!0:(e.top=-1!==e.options.sides.indexOf("top"),e.bottom=-1!==e.options.sides.indexOf("bottom"),e.left=-1!==e.options.sides.indexOf("left"),e.right=-1!==e.options.sides.indexOf("right"))),e.parseUnderflow(),e.last={},e.reset(),e}return r(s,[{key:"parseUnderflow",value:function(){var t=this.options.underflow.toLowerCase();"center"===t?(this.underflowX=0,this.underflowY=0):(this.underflowX=-1!==t.indexOf("left")?-1:-1!==t.indexOf("right")?1:0,this.underflowY=-1!==t.indexOf("top")?-1:-1!==t.indexOf("bottom")?1:0)}},{key:"isActive",value:function(){return null!==this.toX||null!==this.toY}},{key:"down",value:function(){this.toX=this.toY=null}},{key:"up",value:function(){this.bounce()}},{key:"update",value:function(t){if(!this.paused){if(this.bounce(),this.toX){var e=this.toX;e.time+=t,this.parent.emit("moved",{viewport:this.parent,type:"bounce-x"}),e.time>=this.options.time?(this.parent.x=e.end,this.toX=null,this.parent.emit("bounce-x-end",this.parent)):this.parent.x=this.ease(e.time,e.start,e.delta,this.options.time)}if(this.toY){var i=this.toY;i.time+=t,this.parent.emit("moved",{viewport:this.parent,type:"bounce-y"}),i.time>=this.options.time?(this.parent.y=i.end,this.toY=null,this.parent.emit("bounce-y-end",this.parent)):this.parent.y=this.ease(i.time,i.start,i.delta,this.options.time)}}}},{key:"calcUnderflowX",value:function(){var t;switch(this.underflowX){case-1:t=0;break;case 1:t=this.parent.screenWidth-this.parent.screenWorldWidth;break;default:t=(this.parent.screenWidth-this.parent.screenWorldWidth)/2}return t}},{key:"calcUnderflowY",value:function(){var t;switch(this.underflowY){case-1:t=0;break;case 1:t=this.parent.screenHeight-this.parent.screenWorldHeight;break;default:t=(this.parent.screenHeight-this.parent.screenWorldHeight)/2}return t}},{key:"oob",value:function(){var t=this.options.bounceBox;if(t){var i=void 0===t.x?0:t.x,s=void 0===t.y?0:t.y,n=void 0===t.width?this.parent.worldWidth:t.width,o=void 0===t.height?this.parent.worldHeight:t.height;return{left:this.parent.left<i,right:this.parent.right>n,top:this.parent.top<s,bottom:this.parent.bottom>o,topLeft:new e.Point(i*this.parent.scale.x,s*this.parent.scale.y),bottomRight:new e.Point(n*this.parent.scale.x-this.parent.screenWidth,o*this.parent.scale.y-this.parent.screenHeight)}}return{left:this.parent.left<0,right:this.parent.right>this.parent.worldWidth,top:this.parent.top<0,bottom:this.parent.bottom>this.parent.worldHeight,topLeft:new e.Point(0,0),bottomRight:new e.Point(this.parent.worldWidth*this.parent.scale.x-this.parent.screenWidth,this.parent.worldHeight*this.parent.scale.y-this.parent.screenHeight)}}},{key:"bounce",value:function(){if(!this.paused){var t,e=this.parent.plugins.get("decelerate",!0);e&&(e.x||e.y)&&(e.x&&e.percentChangeX===e.options.friction||e.y&&e.percentChangeY===e.options.friction)&&(((t=this.oob()).left&&this.left||t.right&&this.right)&&(e.percentChangeX=this.options.friction),(t.top&&this.top||t.bottom&&this.bottom)&&(e.percentChangeY=this.options.friction));var i=this.parent.plugins.get("drag",!0)||{},s=this.parent.plugins.get("pinch",!0)||{};if(e=e||{},!(i.active||s.active||this.toX&&this.toY||e.x&&e.y)){var n=(t=t||this.oob()).topLeft,o=t.bottomRight;if(!this.toX&&!e.x){var r=null;t.left&&this.left?r=this.parent.screenWorldWidth<this.parent.screenWidth?this.calcUnderflowX():-n.x:t.right&&this.right&&(r=this.parent.screenWorldWidth<this.parent.screenWidth?this.calcUnderflowX():-o.x),null!==r&&this.parent.x!==r&&(this.toX={time:0,start:this.parent.x,delta:r-this.parent.x,end:r},this.parent.emit("bounce-x-start",this.parent))}if(!this.toY&&!e.y){var h=null;t.top&&this.top?h=this.parent.screenWorldHeight<this.parent.screenHeight?this.calcUnderflowY():-n.y:t.bottom&&this.bottom&&(h=this.parent.screenWorldHeight<this.parent.screenHeight?this.calcUnderflowY():-o.y),null!==h&&this.parent.y!==h&&(this.toY={time:0,start:this.parent.y,delta:h-this.parent.y,end:h},this.parent.emit("bounce-y-start",this.parent))}}}}},{key:"reset",value:function(){this.toX=this.toY=null,this.bounce()}}]),s}(b),V={topLeft:!1,friction:.8,time:1e3,ease:"easeInOutSine",interrupt:!0,removeOnComplete:!1,removeOnInterrupt:!1,forceStart:!1},R=function(t){h(i,t);var e=u(i);function i(t,s,o){var r,h=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};return n(this,i),(r=e.call(this,t)).options=Object.assign({},V,h),r.ease=_(h.ease,"easeInOutSine"),r.x=s,r.y=o,r.options.forceStart&&r.snapStart(),r}return r(i,[{key:"snapStart",value:function(){this.percent=0,this.snapping={time:0};var t=this.options.topLeft?this.parent.corner:this.parent.center;this.deltaX=this.x-t.x,this.deltaY=this.y-t.y,this.startX=t.x,this.startY=t.y,this.parent.emit("snap-start",this.parent)}},{key:"wheel",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("snap")}},{key:"down",value:function(){this.options.removeOnInterrupt?this.parent.plugins.remove("snap"):this.options.interrupt&&(this.snapping=null)}},{key:"up",value:function(){if(0===this.parent.input.count()){var t=this.parent.plugins.get("decelerate",!0);t&&(t.x||t.y)&&(t.percentChangeX=t.percentChangeY=this.options.friction)}}},{key:"update",value:function(t){if(!(this.paused||this.options.interrupt&&0!==this.parent.input.count()))if(this.snapping){var e,i,s,n=this.snapping;if(n.time+=t,n.time>this.options.time)e=!0,i=this.startX+this.deltaX,s=this.startY+this.deltaY;else{var o=this.ease(n.time,0,1,this.options.time);i=this.startX+this.deltaX*o,s=this.startY+this.deltaY*o}this.options.topLeft?this.parent.moveCorner(i,s):this.parent.moveCenter(i,s),this.parent.emit("moved",{viewport:this.parent,type:"snap"}),e&&(this.options.removeOnComplete&&this.parent.plugins.remove("snap"),this.parent.emit("snap-end",this.parent),this.snapping=null)}else{var r=this.options.topLeft?this.parent.corner:this.parent.center;r.x===this.x&&r.y===this.y||this.snapStart()}}}]),i}(b),B={width:0,height:0,time:1e3,ease:"easeInOutSine",center:null,interrupt:!0,removeOnComplete:!1,removeOnInterrupts:!1,forceStart:!1,noMove:!1},L=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},B,o),s.ease=_(s.options.ease),s.options.width>0&&(s.xScale=t.screenWidth/s.options.width),s.options.height>0&&(s.yScale=t.screenHeight/s.options.height),s.xIndependent=!!s.xScale,s.yIndependent=!!s.yScale,s.xScale=s.xIndependent?s.xScale:s.yScale,s.yScale=s.yIndependent?s.yScale:s.xScale,0===s.options.time?(t.container.scale.x=s.xScale,t.container.scale.y=s.yScale,s.options.removeOnComplete&&s.parent.plugins.remove("snap-zoom")):o.forceStart&&s.createSnapping(),s}return r(i,[{key:"createSnapping",value:function(){this.parent.scale;var t=this.parent.worldScreenWidth,e=this.parent.worldScreenHeight,i=this.parent.screenWidth/this.xScale,s=this.parent.screenHeight/this.yScale;this.snapping={time:0,startX:t,startY:e,deltaX:i-t,deltaY:s-e},this.parent.emit("snap-zoom-start",this.parent)}},{key:"resize",value:function(){this.snapping=null,this.options.width>0&&(this.xScale=this.parent.screenWidth/this.options.width),this.options.height>0&&(this.yScale=this.parent.screenHeight/this.options.height),this.xScale=this.xIndependent?this.xScale:this.yScale,this.yScale=this.yIndependent?this.yScale:this.xScale}},{key:"wheel",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("snap-zoom")}},{key:"down",value:function(){this.options.removeOnInterrupt?this.parent.plugins.remove("snap-zoom"):this.options.interrupt&&(this.snapping=null)}},{key:"update",value:function(t){var e;if(!this.paused&&(!this.options.interrupt||0===this.parent.input.count()))if(this.options.center||this.options.noMove||(e=this.parent.center),this.snapping){if(this.snapping){var i=this.snapping;if(i.time+=t,i.time>=this.options.time)this.parent.scale.set(this.xScale,this.yScale),this.options.removeOnComplete&&this.parent.plugins.remove("snap-zoom"),this.parent.emit("snap-zoom-end",this.parent),this.snapping=null;else{var s=this.snapping,n=this.ease(s.time,s.startX,s.deltaX,this.options.time),o=this.ease(s.time,s.startY,s.deltaY,this.options.time);this.parent.scale.x=this.parent.screenWidth/n,this.parent.scale.y=this.parent.screenHeight/o}var r=this.parent.plugins.get("clamp-zoom",!0);r&&r.clamp(),this.options.noMove||(this.options.center?this.parent.moveCenter(this.options.center):this.parent.moveCenter(e))}}else this.parent.scale.x===this.xScale&&this.parent.scale.y===this.yScale||this.createSnapping()}},{key:"resume",value:function(){this.snapping=null,f(a(i.prototype),"resume",this).call(this)}}]),i}(b),E={speed:0,acceleration:null,radius:null},U=function(t){h(i,t);var e=u(i);function i(t,s){var o,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return n(this,i),(o=e.call(this,t)).target=s,o.options=Object.assign({},E,r),o.velocity={x:0,y:0},o}return r(i,[{key:"update",value:function(t){if(!this.paused){var e=this.parent.center,i=this.target.x,s=this.target.y;if(this.options.radius){if(!(Math.sqrt(Math.pow(this.target.y-e.y,2)+Math.pow(this.target.x-e.x,2))>this.options.radius))return;var n=Math.atan2(this.target.y-e.y,this.target.x-e.x);i=this.target.x-Math.cos(n)*this.options.radius,s=this.target.y-Math.sin(n)*this.options.radius}var o=i-e.x,r=s-e.y;if(o||r)if(this.options.speed)if(this.options.acceleration){var h=Math.atan2(s-e.y,i-e.x),a=Math.sqrt(Math.pow(o,2)+Math.pow(r,2));if(a){var l=(Math.pow(this.velocity.x,2)+Math.pow(this.velocity.y,2))/(2*this.options.acceleration);this.velocity=a>l?{x:Math.min(this.velocity.x+this.options.acceleration*t,this.options.speed),y:Math.min(this.velocity.y+this.options.acceleration*t,this.options.speed)}:{x:Math.max(this.velocity.x-this.options.acceleration*this.options.speed,0),y:Math.max(this.velocity.y-this.options.acceleration*this.options.speed,0)};var p=Math.cos(h)*this.velocity.x,c=Math.sin(h)*this.velocity.y,u=Math.abs(p)>Math.abs(o)?i:e.x+p,d=Math.abs(c)>Math.abs(r)?s:e.y+c;this.parent.moveCenter(u,d),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}}else{var f=Math.atan2(s-e.y,i-e.x),v=Math.cos(f)*this.options.speed,y=Math.sin(f)*this.options.speed,g=Math.abs(v)>Math.abs(o)?i:e.x+v,m=Math.abs(y)>Math.abs(r)?s:e.y+y;this.parent.moveCenter(g,m),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}else this.parent.moveCenter(i,s),this.parent.emit("moved",{viewport:this.parent,type:"follow"})}}}]),i}(b),q={percent:.1,smooth:!1,interrupt:!0,reverse:!1,center:null,lineHeight:20,axis:"all"},F=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},q,o),s}return r(i,[{key:"down",value:function(){this.options.interrupt&&(this.smoothing=null)}},{key:"isAxisX",value:function(){return["all","x"].includes(this.options.axis)}},{key:"isAxisY",value:function(){return["all","y"].includes(this.options.axis)}},{key:"update",value:function(){if(this.smoothing){var t,e=this.smoothingCenter,i=this.smoothing;this.options.center||(t=this.parent.toLocal(e)),this.isAxisX()&&(this.parent.scale.x+=i.x),this.isAxisY()&&(this.parent.scale.y+=i.y),this.parent.emit("zoomed",{viewport:this.parent,type:"wheel"});var s=this.parent.plugins.get("clamp-zoom",!0);if(s&&s.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var n=this.parent.toGlobal(t);this.parent.x+=e.x-n.x,this.parent.y+=e.y-n.y}this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.smoothingCount++,this.smoothingCount>=this.options.smooth&&(this.smoothing=null)}}},{key:"wheel",value:function(t){if(!this.paused){var e=this.parent.input.getPointerPosition(t),i=(this.options.reverse?-1:1)*-t.deltaY*(t.deltaMode?this.options.lineHeight:1)/500,s=Math.pow(2,(1+this.options.percent)*i);if(this.options.smooth){var n={x:this.smoothing?this.smoothing.x*(this.options.smooth-this.smoothingCount):0,y:this.smoothing?this.smoothing.y*(this.options.smooth-this.smoothingCount):0};this.smoothing={x:((this.parent.scale.x+n.x)*s-this.parent.scale.x)/this.options.smooth,y:((this.parent.scale.y+n.y)*s-this.parent.scale.y)/this.options.smooth},this.smoothingCount=0,this.smoothingCenter=e}else{var o;this.options.center||(o=this.parent.toLocal(e)),this.isAxisX()&&(this.parent.scale.x*=s),this.isAxisY()&&(this.parent.scale.y*=s),this.parent.emit("zoomed",{viewport:this.parent,type:"wheel"});var r=this.parent.plugins.get("clamp-zoom",!0);if(r&&r.clamp(),this.options.center)this.parent.moveCenter(this.options.center);else{var h=this.parent.toGlobal(o);this.parent.x+=e.x-h.x,this.parent.y+=e.y-h.y}}return this.parent.emit("moved",{viewport:this.parent,type:"wheel"}),this.parent.emit("wheel",{wheel:{dx:t.deltaX,dy:t.deltaY,dz:t.deltaZ},event:t,viewport:this.parent}),!this.parent.options.passiveWheel||void 0}}}]),i}(b),Q={radius:null,distance:null,top:null,bottom:null,left:null,right:null,speed:8,reverse:!1,noDecelerate:!1,linear:!1,allowButtons:!1},Z=function(t){h(i,t);var e=u(i);function i(t){var s,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,i),(s=e.call(this,t)).options=Object.assign({},Q,o),s.reverse=s.options.reverse?1:-1,s.radiusSquared=Math.pow(s.options.radius,2),s.resize(),s}return r(i,[{key:"resize",value:function(){var t=this.options.distance;null!==t?(this.left=t,this.top=t,this.right=this.parent.worldScreenWidth-t,this.bottom=this.parent.worldScreenHeight-t):this.radius||(this.left=this.options.left,this.top=this.options.top,this.right=null===this.options.right?null:this.parent.worldScreenWidth-this.options.right,this.bottom=null===this.options.bottom?null:this.parent.worldScreenHeight-this.options.bottom)}},{key:"down",value:function(){this.paused||this.options.allowButtons||(this.horizontal=this.vertical=null)}},{key:"move",value:function(t){if(!this.paused&&!("mouse"!==t.data.pointerType&&1!==t.data.identifier||!this.options.allowButtons&&0!==t.data.buttons)){var e=t.data.global.x,i=t.data.global.y;if(this.radiusSquared){var s=this.parent.toScreen(this.parent.center);if(Math.pow(s.x-e,2)+Math.pow(s.y-i,2)>=this.radiusSquared){var n=Math.atan2(s.y-i,s.x-e);this.options.linear?(this.horizontal=Math.round(Math.cos(n))*this.options.speed*this.reverse*.06,this.vertical=Math.round(Math.sin(n))*this.options.speed*this.reverse*.06):(this.horizontal=Math.cos(n)*this.options.speed*this.reverse*.06,this.vertical=Math.sin(n)*this.options.speed*this.reverse*.06)}else this.horizontal&&this.decelerateHorizontal(),this.vertical&&this.decelerateVertical(),this.horizontal=this.vertical=0}else null!==this.left&&e<this.left?this.horizontal=1*this.reverse*this.options.speed*.06:null!==this.right&&e>this.right?this.horizontal=-1*this.reverse*this.options.speed*.06:(this.decelerateHorizontal(),this.horizontal=0),null!==this.top&&i<this.top?this.vertical=1*this.reverse*this.options.speed*.06:null!==this.bottom&&i>this.bottom?this.vertical=-1*this.reverse*this.options.speed*.06:(this.decelerateVertical(),this.vertical=0)}}},{key:"decelerateHorizontal",value:function(){var t=this.parent.plugins.get("decelerate",!0);this.horizontal&&t&&!this.options.noDecelerate&&t.activate({x:this.horizontal*this.options.speed*this.reverse/(1e3/60)})}},{key:"decelerateVertical",value:function(){var t=this.parent.plugins.get("decelerate",!0);this.vertical&&t&&!this.options.noDecelerate&&t.activate({y:this.vertical*this.options.speed*this.reverse/(1e3/60)})}},{key:"up",value:function(){this.paused||(this.horizontal&&this.decelerateHorizontal(),this.vertical&&this.decelerateVertical(),this.horizontal=this.vertical=null)}},{key:"update",value:function(){if(!this.paused&&(this.horizontal||this.vertical)){var t=this.parent.center;this.horizontal&&(t.x+=this.horizontal*this.options.speed),this.vertical&&(t.y+=this.vertical*this.options.speed),this.parent.moveCenter(t),this.parent.emit("moved",{viewport:this.parent,type:"mouse-edges"})}}}]),i}(b),K={removeOnInterrupt:!1,ease:"linear",time:1e3},G=function(t){h(s,t);var i=u(s);function s(t){var e,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return n(this,s),(e=i.call(this,t)).options=Object.assign({},K,o),e.options.ease=_(e.options.ease),e.setupPosition(),e.setupZoom(),e}return r(s,[{key:"setupPosition",value:function(){void 0!==this.options.position?(this.startX=this.parent.center.x,this.startY=this.parent.center.y,this.deltaX=this.options.position.x-this.parent.center.x,this.deltaY=this.options.position.y-this.parent.center.y,this.keepCenter=!1):this.keepCenter=!0}},{key:"setupZoom",value:function(){this.width=null,this.height=null,void 0!==this.options.scale?this.width=this.parent.screenWidth/this.options.scale:void 0!==this.options.scaleX||void 0!==this.options.scaleY?(void 0!==this.options.scaleX&&(this.width=this.parent.screenWidth/this.options.scaleX),void 0!==this.options.scaleY&&(this.height=this.parent.screenHeight/this.options.scaleY)):(void 0!==this.options.width&&(this.width=this.options.width),void 0!==this.options.height&&(this.height=this.options.height)),null!==typeof this.width&&(this.startWidth=this.parent.screenWidthInWorldPixels,this.deltaWidth=this.width-this.startWidth),null!==typeof this.height&&(this.startHeight=this.parent.screenHeightInWorldPixels,this.deltaHeight=this.height-this.startHeight),this.time=0}},{key:"down",value:function(){this.options.removeOnInterrupt&&this.parent.plugins.remove("animate")}},{key:"complete",value:function(){this.parent.plugins.remove("animate"),null!==this.width&&this.parent.fitWidth(this.width,this.keepCenter,null===this.height),null!==this.height&&this.parent.fitHeight(this.height,this.keepCenter,null===this.width),this.keepCenter||this.parent.moveCenter(this.options.position.x,this.options.position.y),this.parent.emit("animate-end",this.parent),this.options.callbackOnComplete&&this.options.callbackOnComplete(this.parent)}},{key:"update",value:function(t){if(!this.paused)if(this.time+=t,this.time>=this.options.time)this.complete();else{var i=new e.Point(this.parent.scale.x,this.parent.scale.y),s=this.options.ease(this.time,0,1,this.options.time);if(null!==this.width&&this.parent.fitWidth(this.startWidth+this.deltaWidth*s,this.keepCenter,null===this.height),null!==this.height&&this.parent.fitHeight(this.startHeight+this.deltaHeight*s,this.keepCenter,null===this.width),null===this.width?this.parent.scale.x=this.parent.scale.y:null===this.height&&(this.parent.scale.y=this.parent.scale.x),!this.keepCenter){var n=new e.Point(this.parent.x,this.parent.y);this.parent.moveCenter(this.startX+this.deltaX*s,this.startY+this.deltaY*s),this.parent.emit("moved",{viewport:this.parent,original:n,type:"animate"})}(this.width||this.height)&&this.parent.emit("zoomed",{viewport:this.parent,original:i,type:"animate"}),this.keepCenter}}}]),s}(b),N={screenWidth:window.innerWidth,screenHeight:window.innerHeight,worldWidth:null,worldHeight:null,threshold:5,passiveWheel:!0,stopPropagation:!1,forceHitArea:null,noTicker:!1,interaction:null,disableOnContextMenu:!1},$=function(t){h(o,t);var i=u(o);function o(){var t,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(n(this,o),(t=i.call(this)).options=Object.assign({},N,r),r.ticker)t.options.ticker=r.ticker;else{var h,a=s;h=parseInt(/^(\d+)\./.exec(e.VERSION)[1])<5?a.ticker.shared:a.Ticker.shared,t.options.ticker=r.ticker||h}return t.screenWidth=t.options.screenWidth,t.screenHeight=t.options.screenHeight,t._worldWidth=t.options.worldWidth,t._worldHeight=t.options.worldHeight,t.forceHitArea=t.options.forceHitArea,t.threshold=t.options.threshold,t.options.divWheel=t.options.divWheel||document.body,t.options.disableOnContextMenu&&(t.options.divWheel.oncontextmenu=function(t){return t.preventDefault()}),t.options.noTicker||(t.tickerFunction=function(){return t.update(t.options.ticker.elapsedMS)},t.options.ticker.add(t.tickerFunction)),t.input=new w(p(t)),t.plugins=new k(p(t)),t}return r(o,[{key:"destroy",value:function(t){this.options.noTicker||this.options.ticker.remove(this.tickerFunction),this.input.destroy(),f(a(o.prototype),"destroy",this).call(this,t)}},{key:"update",value:function(t){this.pause||(this.plugins.update(t),this.lastViewport&&(this.lastViewport.x!==this.x||this.lastViewport.y!==this.y?this.moving=!0:this.moving&&(this.emit("moved-end",this),this.moving=!1),this.lastViewport.scaleX!==this.scale.x||this.lastViewport.scaleY!==this.scale.y?this.zooming=!0:this.zooming&&(this.emit("zoomed-end",this),this.zooming=!1)),this.forceHitArea||(this._hitAreaDefault=new e.Rectangle(this.left,this.top,this.worldScreenWidth,this.worldScreenHeight),this.hitArea=this._hitAreaDefault),this._dirty=this._dirty||!this.lastViewport||this.lastViewport.x!==this.x||this.lastViewport.y!==this.y||this.lastViewport.scaleX!==this.scale.x||this.lastViewport.scaleY!==this.scale.y,this.lastViewport={x:this.x,y:this.y,scaleX:this.scale.x,scaleY:this.scale.y},this.emit("frame-end",this))}},{key:"resize",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.innerWidth,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window.innerHeight,i=arguments.length>2?arguments[2]:void 0,s=arguments.length>3?arguments[3]:void 0;this.screenWidth=t,this.screenHeight=e,void 0!==i&&(this._worldWidth=i),void 0!==s&&(this._worldHeight=s),this.plugins.resize(),this.dirty=!0}},{key:"worldWidth",get:function(){return this._worldWidth?this._worldWidth:this.width/this.scale.x},set:function(t){this._worldWidth=t,this.plugins.resize()}},{key:"worldHeight",get:function(){return this._worldHeight?this._worldHeight:this.height/this.scale.y},set:function(t){this._worldHeight=t,this.plugins.resize()}},{key:"getVisibleBounds",value:function(){return new e.Rectangle(this.left,this.top,this.worldScreenWidth,this.worldScreenHeight)}},{key:"toWorld",value:function(t,i){return 2===arguments.length?this.toLocal(new e.Point(t,i)):this.toLocal(t)}},{key:"toScreen",value:function(t,i){return 2===arguments.length?this.toGlobal(new e.Point(t,i)):this.toGlobal(t)}},{key:"worldScreenWidth",get:function(){return this.screenWidth/this.scale.x}},{key:"worldScreenHeight",get:function(){return this.screenHeight/this.scale.y}},{key:"screenWorldWidth",get:function(){return this.worldWidth*this.scale.x}},{key:"screenWorldHeight",get:function(){return this.worldHeight*this.scale.y}},{key:"center",get:function(){return new e.Point(this.worldScreenWidth/2-this.x/this.scale.x,this.worldScreenHeight/2-this.y/this.scale.y)},set:function(t){this.moveCenter(t)}},{key:"moveCenter",value:function(){var t,e;isNaN(arguments[0])?(t=arguments[0].x,e=arguments[0].y):(t=arguments[0],e=arguments[1]);var i=(this.worldScreenWidth/2-t)*this.scale.x,s=(this.worldScreenHeight/2-e)*this.scale.y;return this.x===i&&this.y===s||(this.position.set(i,s),this.plugins.reset(),this.dirty=!0),this}},{key:"corner",get:function(){return new e.Point(-this.x/this.scale.x,-this.y/this.scale.y)},set:function(t){this.moveCorner(t)}},{key:"moveCorner",value:function(){var t,e;return 1===arguments.length?(t=-arguments[0].x*this.scale.x,e=-arguments[0].y*this.scale.y):(t=-arguments[0]*this.scale.x,e=-arguments[1]*this.scale.y),t===this.x&&e===this.y||(this.position.set(t,e),this.plugins.reset(),this.dirty=!0),this}},{key:"screenWidthInWorldPixels",get:function(){return this.screenWidth/this.scale.x}},{key:"screenHeightInWorldPixels",get:function(){return this.screenHeight/this.scale.y}},{key:"findFitWidth",value:function(t){return this.screenWidth/t}},{key:"findFitHeight",value:function(t){return this.screenHeight/t}},{key:"findFit",value:function(t,e){var i=this.screenWidth/t,s=this.screenHeight/e;return Math.min(i,s)}},{key:"findCover",value:function(t,e){var i=this.screenWidth/t,s=this.screenHeight/e;return Math.max(i,s)}},{key:"fitWidth",value:function(t,e){var i,s=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=arguments.length>3?arguments[3]:void 0;e&&(i=this.center),this.scale.x=this.screenWidth/t,s&&(this.scale.y=this.scale.x);var o=this.plugins.get("clamp-zoom",!0);return!n&&o&&o.clamp(),e&&this.moveCenter(i),this}},{key:"fitHeight",value:function(t,e){var i,s=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=arguments.length>3?arguments[3]:void 0;e&&(i=this.center),this.scale.y=this.screenHeight/t,s&&(this.scale.x=this.scale.y);var o=this.plugins.get("clamp-zoom",!0);return!n&&o&&o.clamp(),e&&this.moveCenter(i),this}},{key:"fitWorld",value:function(t){var e;t&&(e=this.center),this.scale.x=this.screenWidth/this.worldWidth,this.scale.y=this.screenHeight/this.worldHeight,this.scale.x<this.scale.y?this.scale.y=this.scale.x:this.scale.x=this.scale.y;var i=this.plugins.get("clamp-zoom",!0);return i&&i.clamp(),t&&this.moveCenter(e),this}},{key:"fit",value:function(t){var e,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.worldWidth,s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.worldHeight;t&&(e=this.center),this.scale.x=this.screenWidth/i,this.scale.y=this.screenHeight/s,this.scale.x<this.scale.y?this.scale.y=this.scale.x:this.scale.x=this.scale.y;var n=this.plugins.get("clamp-zoom",!0);return n&&n.clamp(),t&&this.moveCenter(e),this}},{key:"visible",set:function(t){t||this.input.clear(),y(a(o.prototype),"visible",t,this,!0)}},{key:"setZoom",value:function(t,e){var i;e&&(i=this.center),this.scale.set(t);var s=this.plugins.get("clamp-zoom",!0);return s&&s.clamp(),e&&this.moveCenter(i),this}},{key:"zoomPercent",value:function(t,e){return this.setZoom(this.scale.x+this.scale.x*t,e)}},{key:"zoom",value:function(t,e){return this.fitWidth(t+this.worldScreenWidth,e),this}},{key:"scaled",get:function(){return this.scale.x},set:function(t){this.setZoom(t,!0)}},{key:"snapZoom",value:function(t){return this.plugins.add("snap-zoom",new L(this,t)),this}},{key:"OOB",value:function(){return{left:this.left<0,right:this.right>this.worldWidth,top:this.top<0,bottom:this.bottom>this._worldHeight,cornerPoint:new e.Point(this.worldWidth*this.scale.x-this.screenWidth,this.worldHeight*this.scale.y-this.screenHeight)}}},{key:"right",get:function(){return-this.x/this.scale.x+this.worldScreenWidth},set:function(t){this.x=-t*this.scale.x+this.screenWidth,this.plugins.reset()}},{key:"left",get:function(){return-this.x/this.scale.x},set:function(t){this.x=-t*this.scale.x,this.plugins.reset()}},{key:"top",get:function(){return-this.y/this.scale.y},set:function(t){this.y=-t*this.scale.y,this.plugins.reset()}},{key:"bottom",get:function(){return-this.y/this.scale.y+this.worldScreenHeight},set:function(t){this.y=-t*this.scale.y+this.screenHeight,this.plugins.reset()}},{key:"dirty",get:function(){return this._dirty},set:function(t){this._dirty=t}},{key:"forceHitArea",get:function(){return this._forceHitArea},set:function(t){t?(this._forceHitArea=t,this.hitArea=t):(this._forceHitArea=null,this.hitArea=new e.Rectangle(0,0,this.worldWidth,this.worldHeight))}},{key:"drag",value:function(t){return this.plugins.add("drag",new H(this,t)),this}},{key:"clamp",value:function(t){return this.plugins.add("clamp",new C(this,t)),this}},{key:"decelerate",value:function(t){return this.plugins.add("decelerate",new Y(this,t)),this}},{key:"bounce",value:function(t){return this.plugins.add("bounce",new T(this,t)),this}},{key:"pinch",value:function(t){return this.plugins.add("pinch",new M(this,t)),this}},{key:"snap",value:function(t,e,i){return this.plugins.add("snap",new R(this,t,e,i)),this}},{key:"follow",value:function(t,e){return this.plugins.add("follow",new U(this,t,e)),this}},{key:"wheel",value:function(t){return this.plugins.add("wheel",new F(this,t)),this}},{key:"animate",value:function(t){return this.plugins.add("animate",new G(this,t)),this}},{key:"clampZoom",value:function(t){return this.plugins.add("clamp-zoom",new z(this,t)),this}},{key:"mouseEdges",value:function(t){return this.plugins.add("mouse-edges",new Z(this,t)),this}},{key:"pause",get:function(){return this._pause},set:function(t){this._pause=t,this.lastViewport=null,this.moving=!1,this.zooming=!1,t&&this.input.pause()}},{key:"ensureVisible",value:function(t,e,i,s,n){n&&(i>this.worldScreenWidth||s>this.worldScreenHeight)&&(this.fit(!0,i,s),this.emit("zoomed",{viewport:this,type:"ensureVisible"}));var o=!1;t<this.left?(this.left=t,o=!0):t+i>this.right&&(this.right=t+i,o=!0),e<this.top?(this.top=e,o=!0):e+s>this.bottom&&(this.bottom=e+s,o=!0),o&&this.emit("moved",{viewport:this,type:"ensureVisible"})}}]),o}(e.Container);t.Plugin=b,t.Viewport=$,Object.defineProperty(t,"__esModule",{value:!0})}));
>>>>>>> 1cd95bf5ba8e4a3e6e8e9da3e481997b6fd47112
=======
/* eslint-disable */
 
/*!
 * pixi-viewport - v4.3.0
 * Compiled Thu, 22 Apr 2021 09:02:07 UTC
 *
 * pixi-viewport is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, David Figatner, All Rights Reserved
 */
this.PIXI = this.PIXI || {};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@pixi/math'), require('penner'), require('@pixi/display'), require('@pixi/ticker')) :
    typeof define === 'function' && define.amd ? define(['exports', '@pixi/math', 'penner', '@pixi/display', '@pixi/ticker'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pixi_viewport = {}, global.PIXI, global.Penner, global.PIXI, global.PIXI));
}(this, (function (exports, math, Penner, display, ticker) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Penner__default = /*#__PURE__*/_interopDefaultLegacy(Penner);

    /**
     * Derive this class to create user-defined plugins
     *
     * @public
     */
    class Plugin
    {
        /** The viewport to which this plugin is attached. */
        

        /**
         * Flags whether this plugin has been "paused".
         *
         * @see Plugin#pause
         * @see Plugin#resume
         */
        

        /** @param {Viewport} parent */
        constructor(parent)
        {
            this.parent = parent;
            this.paused = false;
        }

        /** Called when plugin is removed */
         destroy()
        {
            // Override for implementation
        }

        /** Handler for pointerdown PIXI event */
         down(_e)
        {
            return false;
        }

        /** Handler for pointermove PIXI event */
         move(_e)
        {
            return false;
        }

        /** Handler for pointerup PIXI event */
         up(_e)
        {
            return false;
        }

        /** Handler for wheel event on div */
         wheel(_e)
        {
            return false;
        }

        /**
         * Called on each tick
         * @param {number} elapsed time in millisecond since last update
         */
         update(_delta)
        {
            // Override for implementation
        }

        /** Called when the viewport is resized */
         resize()
        {
            // Override for implementation
        }

        /** Called when the viewport is manually moved */
         reset()
        {
            // Override for implementation
        }

        /** Pause the plugin */
         pause()
        {
            this.paused = true;
        }

        /** Un-pause the plugin */
         resume()
        {
            this.paused = false;
        }
    }

    // eslint-disable-next-line

    /**
     * Returns correct Penner equation using string or Function.
     *
     * @internal
     * @ignore
     * @param {(function|string)} [ease]
     * @param {defaults} default penner equation to use if none is provided
     */
    function ease(ease, defaults)
    {
        if (!ease)
        {
            return Penner__default['default'][defaults]
        }
        else if (typeof ease === 'function')
        {
            return ease
        }
        else if (typeof ease === 'string')
        {
            return Penner__default['default'][ease]
        }
    }

    /** Options for {@link Animate}. */








































    const DEFAULT_ANIMATE_OPTIONS = {
        removeOnInterrupt: false,
        ease: 'linear',
        time: 1000,
    };

    /**
     * Animation plugin.
     *
     * @see Viewport#animate
     * @fires animate-end
     */
    class Animate extends Plugin
    {
        

        /** The starting x-coordinate of the viewport. */
        

        /** The starting y-coordinate of the viewport. */
        

        /** The change in the x-coordinate of the viewport through the animation.*/
        

        /** The change in the y-coordinate of the viewport through the animation. */
        

        /** Marks whether the center of the viewport is preserved in the animation. */
        

        /** The starting viewport width. */
         __init() {this.startWidth = null;}

        /** The starting viewport height. */
         __init2() {this.startHeight = null;}

        /** The change in the viewport's width through the animation. */
         __init3() {this.deltaWidth = null;}

        /** The change in the viewport's height through the animation. */
         __init4() {this.deltaHeight = null;}

        /** The viewport's width post-animation. */
         __init5() {this.width = null;}

        /** The viewport's height post-animation. */
         __init6() {this.height = null;}

        /** The time since the animation started. */
         __init7() {this.time = 0;}

        /**
         * This is called by {@link Viewport.animate}.
         *
         * @param parent
         * @param options
         */
        constructor(parent, options = {})
        {
            super(parent);Animate.prototype.__init.call(this);Animate.prototype.__init2.call(this);Animate.prototype.__init3.call(this);Animate.prototype.__init4.call(this);Animate.prototype.__init5.call(this);Animate.prototype.__init6.call(this);Animate.prototype.__init7.call(this);;

            this.options = Object.assign({}, DEFAULT_ANIMATE_OPTIONS, options);
            this.options.ease = ease(this.options.ease);

            this.setupPosition();
            this.setupZoom();

            this.time = 0;
        }

        /**
         * Setup `startX`, `startY`, `deltaX`, `deltaY`, `keepCenter`.
         *
         * This is called during construction.
         */
         setupPosition()
        {
            if (typeof this.options.position !== 'undefined')
            {
                this.startX = this.parent.center.x;
                this.startY = this.parent.center.y;
                this.deltaX = this.options.position.x - this.parent.center.x;
                this.deltaY = this.options.position.y - this.parent.center.y;
                this.keepCenter = false;
            }
            else
            {
                this.keepCenter = true;
            }
        }

        /**
         * Setup `startWidth, `startHeight`, `deltaWidth, `deltaHeight, `width`, `height`.
         *
         * This is called during construction.
         */
         setupZoom()
        {
            this.width = null;
            this.height = null;

            if (typeof this.options.scale !== 'undefined')
            {
                this.width = this.parent.screenWidth / this.options.scale;
            }
            else if (typeof this.options.scaleX !== 'undefined' || typeof this.options.scaleY !== 'undefined')
            {
                if (typeof this.options.scaleX !== 'undefined')
                {
                    // screenSizeInWorldPixels = screenWidth / scale
                    this.width = this.parent.screenWidth / this.options.scaleX;
                }
                if (typeof this.options.scaleY !== 'undefined')
                {
                    this.height = this.parent.screenHeight / this.options.scaleY;
                }
            }
            else
            {
                if (typeof this.options.width !== 'undefined')
                {
                    this.width = this.options.width;
                }
                if (typeof this.options.height !== 'undefined')
                {
                    this.height = this.options.height;
                }
            }

            if (this.width !== null)
            {
                this.startWidth = this.parent.screenWidthInWorldPixels;
                this.deltaWidth = this.width - this.startWidth;
            }
            if (this.height !== null)
            {
                this.startHeight = this.parent.screenHeightInWorldPixels;
                this.deltaHeight = this.height - this.startHeight;
            }
        }

         down()
        {
            if (this.options.removeOnInterrupt)
            {
                this.parent.plugins.remove('animate');
            }

            return false;
        }

         complete()
        {
            this.parent.plugins.remove('animate');
            if (this.width !== null)
            {
                this.parent.fitWidth(this.width, this.keepCenter, this.height === null);
            }
            if (this.height !== null)
            {
                this.parent.fitHeight(this.height, this.keepCenter, this.width === null);
            }
            if (!this.keepCenter)
            {
                this.parent.moveCenter(this.options.position );
            }

            this.parent.emit('animate-end', this.parent);

            if (this.options.callbackOnComplete)
            {
                this.options.callbackOnComplete(this.parent);
            }
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }
            this.time += elapsed;

            if (this.time >= this.options.time)
            {
                this.complete();
            }
            else
            {
                const originalZoom = new math.Point(this.parent.scale.x, this.parent.scale.y);
                const percent = this.options.ease(this.time, 0, 1, this.options.time);

                if (this.width !== null)
                {
                    const startWidth = this.startWidth ;
                    const deltaWidth = this.deltaWidth ;

                    this.parent.fitWidth(
                        startWidth + (deltaWidth * percent),
                        this.keepCenter,
                        this.height === null);
                }
                if (this.height !== null)
                {
                    const startHeight = this.startHeight ;
                    const deltaHeight = this.deltaHeight ;

                    this.parent.fitHeight(
                        startHeight + (deltaHeight * percent),
                        this.keepCenter,
                        this.width === null);
                }
                if (this.width === null)
                {
                    this.parent.scale.x = this.parent.scale.y;
                }
                else if (this.height === null)
                {
                    this.parent.scale.y = this.parent.scale.x;
                }
                if (!this.keepCenter)
                {
                    const startX = this.startX ;
                    const startY = this.startY ;
                    const deltaX = this.deltaX ;
                    const deltaY = this.deltaY ;
                    const original = new math.Point(this.parent.x, this.parent.y);

                    this.parent.moveCenter(startX + (deltaX * percent), startY + (deltaY * percent));
                    this.parent.emit('moved', { viewport: this.parent, original, type: 'animate' });
                }
                if (this.width || this.height)
                {
                    this.parent.emit('zoomed', { viewport: this.parent, original: originalZoom, type: 'animate' });
                }
            }
        }
    }

    function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }





    /** Options for {@link Bounce}. */







































    const DEFAULT_BOUNCE_OPTIONS = {
        sides: 'all',
        friction: 0.5,
        time: 150,
        ease: 'easeInOutSine',
        underflow: 'center',
        bounceBox: null
    };

    /**
     * @fires bounce-start-x
     * @fires bounce.end-x
     * @fires bounce-start-y
     * @fires bounce-end-y
     * @public
     */
    class Bounce extends Plugin
    {
        /** The options passed to initialize this plugin, cannot be modified again. */
        

        /** Holds whether to bounce from left side. */
         

        /** Holds whether to bounce from top side. */
        

        /** Holds whether to bounce from right side. */
        

        /** Holds whether to bounce from bottom side. */
        

        /** Direction of underflow along x-axis. */
        

        /** Direction of underflow along y-axis. */
        

        /** Easing */
        

        /** Bounce state along x-axis */
        

        /** Bounce state along y-axis */
        

        /**
         * This is called by {@link Viewport.bounce}.
         */
        constructor(parent, options = {})
        {
            super(parent);

            this.options = Object.assign({}, DEFAULT_BOUNCE_OPTIONS, options);
            this.ease = ease(this.options.ease, 'easeInOutSine');

            if (this.options.sides)
            {
                if (this.options.sides === 'all')
                {
                    this.top = this.bottom = this.left = this.right = true;
                }
                else if (this.options.sides === 'horizontal')
                {
                    this.right = this.left = true;
                    this.top = this.bottom = false;
                }
                else if (this.options.sides === 'vertical')
                {
                    this.left = this.right = false;
                    this.top = this.bottom = true;
                }
                else
                {
                    this.top = this.options.sides.indexOf('top') !== -1;
                    this.bottom = this.options.sides.indexOf('bottom') !== -1;
                    this.left = this.options.sides.indexOf('left') !== -1;
                    this.right = this.options.sides.indexOf('right') !== -1;
                }
            } else {
                this.left = this.top = this.right = this.bottom = false;
            }

            const clamp = this.options.underflow.toLowerCase();

            if (clamp === 'center')
            {
                this.underflowX = 0;
                this.underflowY = 0;
            }
            else
            {
                this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
                this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
            }

            this.reset();
        }

         isActive()
        {
            return this.toX !== null || this.toY !== null;
        }

         down()
        {
            this.toX = this.toY = null;

            return false;
        }

         up()
        {
            this.bounce();

            return false;
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }

            this.bounce();

            if (this.toX)
            {
                const toX = this.toX;

                toX.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' });

                if (toX.time >= this.options.time)
                {
                    this.parent.x = toX.end;
                    this.toX = null;
                    this.parent.emit('bounce-x-end', this.parent);
                }
                else
                {
                    this.parent.x = this.ease(toX.time, toX.start, toX.delta, this.options.time);
                }
            }

            if (this.toY)
            {
                const toY = this.toY;

                toY.time += elapsed;
                this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' });

                if (toY.time >= this.options.time)
                {
                    this.parent.y = toY.end;
                    this.toY = null;
                    this.parent.emit('bounce-y-end', this.parent);
                }
                else
                {
                    this.parent.y = this.ease(toY.time, toY.start, toY.delta, this.options.time);
                }
            }
        }

        /** @internal */
         calcUnderflowX()
        {
            let x;

            switch (this.underflowX)
            {
                case -1:
                    x = 0;
                    break;
                case 1:
                    x = (this.parent.screenWidth - this.parent.screenWorldWidth);
                    break;
                default:
                    x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
            }

            return x;
        }

        /** @internal */
         calcUnderflowY()
        {
            let y;

            switch (this.underflowY)
            {
                case -1:
                    y = 0;
                    break;
                case 1:
                    y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                    break;
                default:
                    y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
            }

            return y;
        }

         oob()
        {
            const box = this.options.bounceBox;

            if (box)
            {
                const x1 = typeof box.x === 'undefined' ? 0 : box.x;
                const y1 = typeof box.y === 'undefined' ? 0 : box.y;
                const width = typeof box.width === 'undefined' ? this.parent.worldWidth : box.width;
                const height = typeof box.height === 'undefined' ? this.parent.worldHeight : box.height;

                return {
                    left: this.parent.left < x1,
                    right: this.parent.right > width,
                    top: this.parent.top < y1,
                    bottom: this.parent.bottom > height,
                    topLeft: new math.Point(
                        x1 * this.parent.scale.x,
                        y1 * this.parent.scale.y
                    ),
                    bottomRight: new math.Point(
                        width * this.parent.scale.x - this.parent.screenWidth,
                        height * this.parent.scale.y - this.parent.screenHeight
                    )
                };
            }

            return {
                left: this.parent.left < 0,
                right: this.parent.right > this.parent.worldWidth,
                top: this.parent.top < 0,
                bottom: this.parent.bottom > this.parent.worldHeight,
                topLeft: new math.Point(0, 0),
                bottomRight: new math.Point(
                    this.parent.worldWidth * this.parent.scale.x - this.parent.screenWidth,
                    this.parent.worldHeight * this.parent.scale.y - this.parent.screenHeight
                )
            };
        }

         bounce()
        {
            if (this.paused)
            {
                return;
            }

            let oob;
            let decelerate





     = this.parent.plugins.get('decelerate', true) ;

            if (decelerate && (decelerate.x || decelerate.y))
            {
                if ((decelerate.x && decelerate.percentChangeX === _optionalChain$1([decelerate, 'access', _ => _.options, 'optionalAccess', _2 => _2.friction])) || (decelerate.y && decelerate.percentChangeY === _optionalChain$1([decelerate, 'access', _3 => _3.options, 'optionalAccess', _4 => _4.friction])))
                {
                    oob = this.oob();
                    if ((oob.left && this.left) || (oob.right && this.right))
                    {
                        decelerate.percentChangeX = this.options.friction;
                    }
                    if ((oob.top && this.top) || (oob.bottom && this.bottom))
                    {
                        decelerate.percentChangeY = this.options.friction;
                    }
                }
            }
            const drag = this.parent.plugins.get('drag', true) || {};
            const pinch = this.parent.plugins.get('pinch', true) || {};

            decelerate = decelerate || {};

            if (!_optionalChain$1([drag, 'optionalAccess', _5 => _5.active]) && !_optionalChain$1([pinch, 'optionalAccess', _6 => _6.active]) && ((!this.toX || !this.toY) && (!decelerate.x || !decelerate.y)))
            {
                oob = oob || this.oob();
                const topLeft = oob.topLeft;
                const bottomRight = oob.bottomRight;

                if (!this.toX && !decelerate.x)
                {
                    let x = null;

                    if (oob.left && this.left)
                    {
                        x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -topLeft.x;
                    }
                    else if (oob.right && this.right)
                    {
                        x = (this.parent.screenWorldWidth < this.parent.screenWidth) ? this.calcUnderflowX() : -bottomRight.x;
                    }
                    if (x !== null && this.parent.x !== x)
                    {
                        this.toX = { time: 0, start: this.parent.x, delta: x - this.parent.x, end: x };
                        this.parent.emit('bounce-x-start', this.parent);
                    }
                }
                if (!this.toY && !decelerate.y)
                {
                    let y = null;

                    if (oob.top && this.top)
                    {
                        y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -topLeft.y;
                    }
                    else if (oob.bottom && this.bottom)
                    {
                        y = (this.parent.screenWorldHeight < this.parent.screenHeight) ? this.calcUnderflowY() : -bottomRight.y;
                    }
                    if (y !== null && this.parent.y !== y)
                    {
                        this.toY = { time: 0, start: this.parent.y, delta: y - this.parent.y, end: y };
                        this.parent.emit('bounce-y-start', this.parent);
                    }
                }
            }
        }

         reset()
        {
            this.toX = this.toY = null;
            this.bounce();
        }
    }

    /**
     * There are three ways to clamp:
     * 1. direction: 'all' = the world is clamped to its world boundaries, ie, you cannot drag any part of the world offscreen
     *    direction: 'x' | 'y' = only the x or y direction is clamped to its world boundary
     * 2. left, right, top, bottom = true | number = the world is clamped to the world's pixel location for each side;
     *    if any of these are set to true, then the location is set to the boundary [0, viewport.worldWidth/viewport.worldHeight]
     *    eg: to allow the world to be completely dragged offscreen, set [-viewport.worldWidth, -viewport.worldHeight, viewport.worldWidth * 2, viewport.worldHeight * 2]
     *
     * Underflow determines what happens when the world is smaller than the viewport
     * 1. none = the world is clamped but there is no special behavior
     * 2. center = the world is centered on the viewport
     * 3. combination of top/bottom/center and left/right/center (case insensitive) = the world is stuck to the appropriate boundaries
     *
     */













































    const DEFAULT_CLAMP_OPTIONS = {
        left: false,
        right: false,
        top: false,
        bottom: false,
        direction: null,
        underflow: 'center'
    };

    /**
     * Plugin to clamp the viewport to a specific world bounding box.
     *
     * @public
     */
    class Clamp extends Plugin
    {
        /** Options used to initialize this plugin, cannot be modified later. */
        

        /** Last state of viewport */
        






        
        
        

        /**
         * This is called by {@link Viewport.clamp}.
         */
        constructor(parent, options  = {})
        {
            super(parent);
            this.options = Object.assign({}, DEFAULT_CLAMP_OPTIONS, options);

            if (this.options.direction)
            {
                this.options.left = this.options.direction === 'x' || this.options.direction === 'all' ? true : null;
                this.options.right = this.options.direction === 'x' || this.options.direction === 'all' ? true : null;
                this.options.top = this.options.direction === 'y' || this.options.direction === 'all' ? true : null;
                this.options.bottom = this.options.direction === 'y' || this.options.direction === 'all' ? true : null;
            }

            this.parseUnderflow();
            this.last = { x: null, y: null, scaleX: null, scaleY: null };
            this.update();
        }

         parseUnderflow()
        {
            const clamp = this.options.underflow.toLowerCase();

            if (clamp === 'none')
            {
                this.noUnderflow = true;
            }
            else if (clamp === 'center')
            {
                this.underflowX = this.underflowY = 0;
                this.noUnderflow = false;
            }
            else
            {
                this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
                this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
                this.noUnderflow = false;
            }
        }

         move()
        {
            this.update();

            return false;
        }

         update()
        {
            if (this.paused)
            {
                return;
            }

            // only clamp on change
            if (this.parent.x === this.last.x
                && this.parent.y === this.last.y
                && this.parent.scale.x === this.last.scaleX
                && this.parent.scale.y === this.last.scaleY)
            {
                return;
            }
            const original = { x: this.parent.x, y: this.parent.y };
            // TODO: Fix
            const decelerate = (this.parent.plugins ).decelerate || {};

            if (this.options.left !== null || this.options.right !== null)
            {
                let moved = false;

                if (!this.noUnderflow && this.parent.screenWorldWidth < this.parent.screenWidth)
                {
                    switch (this.underflowX)
                    {
                        case -1:
                            if (this.parent.x !== 0)
                            {
                                this.parent.x = 0;
                                moved = true;
                            }
                            break;
                        case 1:
                            if (this.parent.x !== this.parent.screenWidth - this.parent.screenWorldWidth)
                            {
                                this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                                moved = true;
                            }
                            break;
                        default:
                            if (this.parent.x !== (this.parent.screenWidth - this.parent.screenWorldWidth) / 2)
                            {
                                this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                                moved = true;
                            }
                    }
                }
                else
                {
                    if (this.options.left !== null)
                    {
                        if (this.parent.left < (this.options.left === true ? 0 : this.options.left))
                        {
                            this.parent.x = -(this.options.left === true ? 0 : this.options.left) * this.parent.scale.x;
                            decelerate.x = 0;
                            moved = true;
                        }
                    }
                    if (this.options.right !== null)
                    {
                        if (this.parent.right > (this.options.right === true ? this.parent.worldWidth : this.options.right))
                        {
                            this.parent.x = -(this.options.right === true ? this.parent.worldWidth : this.options.right) * this.parent.scale.x + this.parent.screenWidth;
                            decelerate.x = 0;
                            moved = true;
                        }
                    }
                }
                if (moved)
                {
                    this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-x' });
                }
            }
            if (this.options.top !== null || this.options.bottom !== null)
            {
                let moved = false;

                if (!this.noUnderflow && this.parent.screenWorldHeight < this.parent.screenHeight)
                {
                    switch (this.underflowY)
                    {
                        case -1:
                            if (this.parent.y !== 0)
                            {
                                this.parent.y = 0;
                                moved = true;
                            }
                            break;
                        case 1:
                            if (this.parent.y !== this.parent.screenHeight - this.parent.screenWorldHeight)
                            {
                                this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                                moved = true;
                            }
                            break;
                        default:
                            if (this.parent.y !== (this.parent.screenHeight - this.parent.screenWorldHeight) / 2)
                            {
                                this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                                moved = true;
                            }
                    }
                }
                else
                {
                    if (this.options.top !== null)
                    {
                        if (this.parent.top < (this.options.top === true ? 0 : this.options.top))
                        {
                            this.parent.y = -(this.options.top === true ? 0 : this.options.top)
                                * this.parent.scale.y;
                            decelerate.y = 0;
                            moved = true;
                        }
                    }
                    if (this.options.bottom !== null)
                    {
                        if (this.parent.bottom > (this.options.bottom === true ? this.parent.worldHeight : this.options.bottom))
                        {
                            this.parent.y = -(this.options.bottom === true ? this.parent.worldHeight : this.options.bottom)
                                * this.parent.scale.y + this.parent.screenHeight;
                            decelerate.y = 0;
                            moved = true;
                        }
                    }
                }
                if (moved)
                {
                    this.parent.emit('moved', { viewport: this.parent, original, type: 'clamp-y' });
                }
            }
            this.last.x = this.parent.x;
            this.last.y = this.parent.y;
            this.last.scaleX = this.parent.scale.x;
            this.last.scaleY = this.parent.scale.y;
        }

         reset()
        {
            this.update();
        }
    }

    /**
     * Options for {@link ClampZoom}.
     *
     * Use either minimum width/height or minimum scale
     */





















    const DEFAULT_CLAMP_ZOOM_OPTIONS = {
        minWidth: null,
        minHeight: null,
        maxWidth: null,
        maxHeight: null,
        minScale: null,
        maxScale: null
    };

    /**
     * Plugin to clamp the viewport's zoom to a specific range.
     *
     * @public
     */
    class ClampZoom extends Plugin
    {
        

        /**
         * This is called by {@link Viewport.clampZoom}.
         */
        constructor(parent, options = {})
        {
            super(parent);
            this.options = Object.assign({}, DEFAULT_CLAMP_ZOOM_OPTIONS, options);

            this.clamp();
        }

         resize()
        {
            this.clamp();
        }

        /** Clamp the viewport's zoom immediately. */
         clamp()
        {
            if (this.paused)
            {
                return;
            }

            if (this.options.minWidth || this.options.minHeight || this.options.maxWidth || this.options.maxHeight)
            {
                let width = this.parent.worldScreenWidth;
                let height = this.parent.worldScreenHeight;

                if (this.options.minWidth !== null && width < this.options.minWidth)
                {
                    const original = this.parent.scale.x;

                    this.parent.fitWidth(this.options.minWidth, false, false, true);
                    this.parent.scale.y *= this.parent.scale.x / original;
                    width = this.parent.worldScreenWidth;
                    height = this.parent.worldScreenHeight;
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
                }
                if (this.options.maxWidth !== null && width > this.options.maxWidth)
                {
                    const original = this.parent.scale.x;

                    this.parent.fitWidth(this.options.maxWidth, false, false, true);
                    this.parent.scale.y *= this.parent.scale.x / original;
                    width = this.parent.worldScreenWidth;
                    height = this.parent.worldScreenHeight;
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
                }
                if (this.options.minHeight !== null && height < this.options.minHeight)
                {
                    const original = this.parent.scale.y;

                    this.parent.fitHeight(this.options.minHeight, false, false, true);
                    this.parent.scale.x *= this.parent.scale.y / original;
                    width = this.parent.worldScreenWidth;
                    height = this.parent.worldScreenHeight;
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
                }
                if (this.options.maxHeight !== null && height > this.options.maxHeight)
                {
                    const original = this.parent.scale.y;

                    this.parent.fitHeight(this.options.maxHeight, false, false, true);
                    this.parent.scale.x *= this.parent.scale.y / original;
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
                }
            }
            else
            {
                let scale = this.parent.scale.x;

                if (this.options.minScale !== null && scale < this.options.minScale)
                {
                    scale = this.options.minScale;
                }
                if (this.options.maxScale !== null && scale > this.options.maxScale)
                {
                    scale = this.options.maxScale;
                }
                if (scale !== this.parent.scale.x)
                {
                    this.parent.scale.set(scale);
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
                }
            }
        }

         reset()
        {
            this.clamp();
        }
    }

    const DEFAULT_DECELERATE_OPTIONS = {
        friction: 0.98,
        bounce: 0.8,
        minSpeed: 0.01
    };

    /**
     * Time period of decay (1 frame)
     *
     * @internal
     * @ignore
     */
    const TP = 16;

    /**
     * Plugin to decelerate viewport velocity smoothly after panning ends.
     *
     * @public
     */
    class Decelerate extends Plugin
    {
        /** Options used to initialize this plugin. */
        

        /**
         * x-component of the velocity of viewport provided by this plugin, at the current time.
         *
         * This is measured in px/frame, where a frame is normalized to 16 milliseconds.
         */
        

        /**
         * y-component of the velocity of the viewport provided by this plugin, at the current time.
         *
         * This is measured in px/frame, where a frame is normalized to 16 milliseconds.
         */
        

        /**
         * The decay factor for the x-component of the viewport.
         *
         * The viewport's velocity decreased by this amount each 16 milliseconds.
         */
        

        /**
         * The decay factor for the y-component of the viewport.
         *
         * The viewport's velocity decreased by this amount each 16 milliseconds.
         */
        

        /** Saved list of recent viewport position snapshots, to estimate velocity. */
        

        /** The time since the user released panning of the viewport. */
        

        /**
         * This is called by {@link Viewport.decelerate}.
         */
        constructor(parent, options = {})
        {
            super(parent);

            this.options = Object.assign({}, DEFAULT_DECELERATE_OPTIONS, options);
            this.saved = [];
            this.timeSinceRelease = 0;

            this.reset();
            this.parent.on('moved', (data) => this.moved(data));
        }

         down()
        {
            this.saved = [];
            this.x = this.y = null;

            return false;
        }

         isActive()
        {
            return !!(this.x || this.y);
        }

         move()
        {
            if (this.paused)
            {
                return false;
            }

            const count = this.parent.input.count();

            if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch', true)))
            {
                this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() });

                if (this.saved.length > 60)
                {
                    this.saved.splice(0, 30);
                }
            }

            // Silently recording viewport positions
            return false;
        }

        /** Listener to viewport's "moved" event. */
         moved(data)
        {
            if (this.saved.length)
            {
                const last = this.saved[this.saved.length - 1];

                if (data.type === 'clamp-x')
                {
                    if (last.x === data.original.x)
                    {
                        last.x = this.parent.x;
                    }
                }
                else if (data.type === 'clamp-y')
                {
                    if (last.y === data.original.y)
                    {
                        last.y = this.parent.y;
                    }
                }
            }
        }

         up()
        {
            if (this.parent.input.count() === 0 && this.saved.length)
            {
                const now = performance.now();

                for (const save of this.saved)
                {
                    if (save.time >= now - 100)
                    {
                        const time = now - save.time;

                        this.x = (this.parent.x - save.x) / time;
                        this.y = (this.parent.y - save.y) / time;
                        this.percentChangeX = this.percentChangeY = this.options.friction;
                        this.timeSinceRelease = 0;
                        break;
                    }
                }
            }

            return false;
        }

        /**
         * Manually activate deceleration, starting from the (x, y) velocity components passed in the options.
         *
         * @param {object} options
         * @param {number} [options.x] - Specify x-component of initial velocity.
         * @param {number} [options.y] - Specify y-component of initial velocity.
         */
         activate(options)
        {
            options = options || {};

            if (typeof options.x !== 'undefined')
            {
                this.x = options.x;
                this.percentChangeX = this.options.friction;
            }
            if (typeof options.y !== 'undefined')
            {
                this.y = options.y;
                this.percentChangeY = this.options.friction;
            }
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }

            /*
             * See https://github.com/davidfig/pixi-viewport/issues/271 for math.
             *
             * The viewport velocity (this.x, this.y) decays exponentially by the the decay factor
             * (this.percentChangeX, this.percentChangeY) each frame. This velocity function is integrated
             * to calculate the displacement.
             */

            const moved = this.x || this.y;

            const ti = this.timeSinceRelease;
            const tf = this.timeSinceRelease + elapsed;

            if (this.x)
            {
                const k = this.percentChangeX;
                const lnk = Math.log(k);

                // Apply velocity delta on the viewport x-coordinate.
                this.parent.x += ((this.x * TP) / lnk) * (Math.pow(k, tf / TP) - Math.pow(k, ti / TP));

                // Apply decay on x-component of velocity
                this.x *= Math.pow(this.percentChangeX, elapsed / TP);
            }
            if (this.y)
            {
                const k = this.percentChangeY;
                const lnk = Math.log(k);

                // Apply velocity delta on the viewport y-coordinate.
                this.parent.y += ((this.y * TP) / lnk) * (Math.pow(k, tf / TP) - Math.pow(k, ti / TP));

                // Apply decay on y-component of velocity
                this.y *= Math.pow(this.percentChangeY, elapsed / TP);
            }

            this.timeSinceRelease += elapsed;

            // End decelerate velocity once it goes under a certain amount of precision.
            if (Math.abs(this.x || 0) < this.options.minSpeed)
            {
                this.x = 0;
            }
            if (Math.abs(this.y || 0) < this.options.minSpeed)
            {
                this.y = 0;
            }

            if (moved)
            {
                this.parent.emit('moved', { viewport: this.parent, type: 'decelerate' });
            }
        }

         reset()
        {
            this.x = this.y = null;
        }
    }

    /** Options for {@link Drag}. */


























































































    const DEFAULT_DRAG_OPTIONS = {
        direction: 'all',
        pressDrag: true,
        wheel: true,
        wheelScroll: 1,
        reverse: false,
        clampWheel: false,
        underflow: 'center',
        factor: 1,
        mouseButtons: 'all',
        keyToPress: null,
        ignoreKeyToPressOnTouch: false,
        lineHeight: 20,
    };

    /**
     * Plugin to enable panning/dragging of the viewport to move around.
     *
     * @public
     */
    class Drag extends Plugin
    {
        /** Options used to initialize this plugin, cannot be modified later. */
        

        /** Flags when viewport is moving. */
        

        /** Factor to apply from {@link IDecelerateOptions}'s reverse. */
        

        /** Holds whether dragging is enabled along the x-axis. */
        

        /** Holds whether dragging is enabled along the y-axis. */
        

        /** Flags whether the keys required to drag are pressed currently. */
        

        /** Holds whether the left, center, and right buttons are required to pan. */
        

        /** Underflow factor along x-axis */
        

        /** Underflow factor along y-axis */
        

        /** Last pointer position while panning. */
        

        /** The ID of the pointer currently panning the viewport. */
        

        /**
         * This is called by {@link Viewport.drag}.
         */
        constructor(parent, options = {})
        {
            super(parent);

            this.options = Object.assign({}, DEFAULT_DRAG_OPTIONS, options);
            this.moved = false;
            this.reverse = this.options.reverse ? 1 : -1;
            this.xDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'x';
            this.yDirection = !this.options.direction || this.options.direction === 'all' || this.options.direction === 'y';
            this.keyIsPressed = false;

            this.parseUnderflow();
            this.mouseButtons(this.options.mouseButtons);

            if (this.options.keyToPress)
            {
                this.handleKeyPresses(this.options.keyToPress);
            }
        }

        /**
         * Handles keypress events and set the keyIsPressed boolean accordingly
         *
         * @param {array} codes - key codes that can be used to trigger drag event
         */
         handleKeyPresses(codes)
        {
            window.addEventListener('keydown', (e) =>
            {
                if (codes.includes(e.code))
                { this.keyIsPressed = true; }
            });

            window.addEventListener('keyup', (e) =>
            {
                if (codes.includes(e.code))
                { this.keyIsPressed = false; }
            });
        }

        /**
         * initialize mousebuttons array
         * @param {string} buttons
         */
         mouseButtons(buttons)
        {
            if (!buttons || buttons === 'all')
            {
                this.mouse = [true, true, true];
            }
            else
            {
                this.mouse = [
                    buttons.indexOf('left') !== -1,
                    buttons.indexOf('middle') !== -1,
                    buttons.indexOf('right') !== -1
                ];
            }
        }

         parseUnderflow()
        {
            const clamp = this.options.underflow.toLowerCase();

            if (clamp === 'center')
            {
                this.underflowX = 0;
                this.underflowY = 0;
            }
            else
            {
                this.underflowX = (clamp.indexOf('left') !== -1) ? -1 : (clamp.indexOf('right') !== -1) ? 1 : 0;
                this.underflowY = (clamp.indexOf('top') !== -1) ? -1 : (clamp.indexOf('bottom') !== -1) ? 1 : 0;
            }
        }

        /**
         * @param {PIXI.InteractionEvent} event
         * @returns {boolean}
         */
         checkButtons(event)
        {
            const isMouse = event.data.pointerType === 'mouse';
            const count = this.parent.input.count();

            if ((count === 1) || (count > 1 && !this.parent.plugins.get('pinch', true)))
            {
                if (!isMouse || this.mouse[event.data.button])
                {
                    return true;
                }
            }

            return false;
        }

        /**
         * @param {PIXI.InteractionEvent} event
         * @returns {boolean}
         */
         checkKeyPress(event)
        {
            return (!this.options.keyToPress
                || this.keyIsPressed
                || (this.options.ignoreKeyToPressOnTouch && event.data.pointerType === 'touch'));
        }

         down(event)
        {
            if (this.paused || !this.options.pressDrag)
            {
                return false;
            }
            if (this.checkButtons(event) && this.checkKeyPress(event))
            {
                this.last = { x: event.data.global.x, y: event.data.global.y };
                this.current = event.data.pointerId;

                return true;
            }
            this.last = null;

            return false;
        }

        get active()
        {
            return this.moved;
        }

         move(event)
        {
            if (this.paused || !this.options.pressDrag)
            {
                return false;
            }
            if (this.last && this.current === event.data.pointerId)
            {
                const x = event.data.global.x;
                const y = event.data.global.y;
                const count = this.parent.input.count();

                if (count === 1 || (count > 1 && !this.parent.plugins.get('pinch', true)))
                {
                    const distX = x - this.last.x;
                    const distY = y - this.last.y;

                    if (this.moved
                        || ((this.xDirection && this.parent.input.checkThreshold(distX))
                        || (this.yDirection && this.parent.input.checkThreshold(distY))))
                    {
                        const newPoint = { x, y };

                        if (this.xDirection)
                        {
                            this.parent.x += (newPoint.x - this.last.x) * this.options.factor;
                        }
                        if (this.yDirection)
                        {
                            this.parent.y += (newPoint.y - this.last.y) * this.options.factor;
                        }
                        this.last = newPoint;
                        if (!this.moved)
                        {
                            this.parent.emit('drag-start', {
                                event,
                                screen: new math.Point(this.last.x, this.last.y),
                                world: this.parent.toWorld(new math.Point(this.last.x, this.last.y)),
                                viewport: this.parent
                            });
                        }
                        this.moved = true;
                        this.parent.emit('moved', { viewport: this.parent, type: 'drag' });

                        return true;
                    }
                }
                else
                {
                    this.moved = false;
                }
            }

            return false;
        }

         up(event)
        {
            if (this.paused)
            {
                return false;
            }

            const touches = this.parent.input.touches;

            if (touches.length === 1)
            {
                const pointer = touches[0];

                if (pointer.last)
                {
                    this.last = { x: pointer.last.x, y: pointer.last.y };
                    this.current = pointer.id;
                }
                this.moved = false;

                return true;
            }
            else if (this.last)
            {
                if (this.moved)
                {
                    const screen = new math.Point(this.last.x, this.last.y);

                    this.parent.emit('drag-end', {
                        event, screen,
                        world: this.parent.toWorld(screen),
                        viewport: this.parent,
                    });
                    this.last = null;
                    this.moved = false;

                    return true;
                }
            }

            return false;
        }

         wheel(event)
        {
            if (this.paused)
            {
                return false;
            }

            if (this.options.wheel)
            {
                const wheel = this.parent.plugins.get('wheel', true);

                if (!wheel)
                {
                    const step = event.deltaMode ? this.options.lineHeight : 1;

                    if (this.xDirection)
                    {
                        this.parent.x += event.deltaX * step * this.options.wheelScroll * this.reverse;
                    }
                    if (this.yDirection)
                    {
                        this.parent.y += event.deltaY * step * this.options.wheelScroll * this.reverse;
                    }
                    if (this.options.clampWheel)
                    {
                        this.clamp();
                    }
                    this.parent.emit('wheel-scroll', this.parent);
                    this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
                    if (!this.parent.options.passiveWheel)
                    {
                        event.preventDefault();
                    }

                    return true;
                }
            }

            return false;
        }

         resume()
        {
            this.last = null;
            this.paused = false;
        }

         clamp()
        {
            const decelerate = this.parent.plugins.get('decelerate', true) || {};

            if (this.options.clampWheel !== 'y')
            {
                if (this.parent.screenWorldWidth < this.parent.screenWidth)
                {
                    switch (this.underflowX)
                    {
                        case -1:
                            this.parent.x = 0;
                            break;
                        case 1:
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth);
                            break;
                        default:
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                    }
                }
                else
                if (this.parent.left < 0)
                {
                    this.parent.x = 0;
                    decelerate.x = 0;
                }
                else if (this.parent.right > this.parent.worldWidth)
                {
                    this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth;
                    decelerate.x = 0;
                }
            }
            if (this.options.clampWheel !== 'x')
            {
                if (this.parent.screenWorldHeight < this.parent.screenHeight)
                {
                    switch (this.underflowY)
                    {
                        case -1:
                            this.parent.y = 0;
                            break;
                        case 1:
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight);
                            break;
                        default:
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                    }
                }
                else
                {
                    if (this.parent.top < 0)
                    {
                        this.parent.y = 0;
                        decelerate.y = 0;
                    }
                    if (this.parent.bottom > this.parent.worldHeight)
                    {
                        this.parent.y = -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight;
                        decelerate.y = 0;
                    }
                }
            }
        }
    }

    /** Options for {@link Follow}. */
























    const DEFAULT_FOLLOW_OPTIONS = {
        speed: 0,
        acceleration: null,
        radius: null
    };

    /**
     * Plugin to follow a display-object.
     *
     * @see Viewport.follow
     * @public
     */
    class Follow extends Plugin
    {
        /** The options used to initialize this plugin. */
        

        /** The target this plugin will make the viewport follow. */
        

        /** The velocity provided the viewport by following, at the current time. */
        

        /**
         * This is called by {@link Viewport.follow}.
         *
         * @param parent
         * @param target - target to follow
         * @param options
         */
        constructor(parent, target, options = {})
        {
            super(parent);

            this.target = target;
            this.options = Object.assign({}, DEFAULT_FOLLOW_OPTIONS, options);
            this.velocity = { x: 0, y: 0 };
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }

            const center = this.parent.center;
            let toX = this.target.x;
            let toY = this.target.y;

            if (this.options.radius)
            {
                const distance = Math.sqrt(Math.pow(this.target.y - center.y, 2) + Math.pow(this.target.x - center.x, 2));

                if (distance > this.options.radius)
                {
                    const angle = Math.atan2(this.target.y - center.y, this.target.x - center.x);

                    toX = this.target.x - (Math.cos(angle) * this.options.radius);
                    toY = this.target.y - (Math.sin(angle) * this.options.radius);
                }
                else
                {
                    return;
                }
            }

            const deltaX = toX - center.x;
            const deltaY = toY - center.y;

            if (deltaX || deltaY)
            {
                if (this.options.speed)
                {
                    if (this.options.acceleration)
                    {
                        const angle = Math.atan2(toY - center.y, toX - center.x);
                        const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

                        if (distance)
                        {
                            const decelerationDistance = (Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) / (2 * this.options.acceleration);

                            if (distance > decelerationDistance)
                            {
                                this.velocity = {
                                    x: Math.min(this.velocity.x + this.options.acceleration * elapsed, this.options.speed),
                                    y: Math.min(this.velocity.y + this.options.acceleration * elapsed, this.options.speed)
                                };
                            }
                            else
                            {
                                this.velocity = {
                                    x: Math.max(this.velocity.x - this.options.acceleration * this.options.speed, 0),
                                    y: Math.max(this.velocity.y - this.options.acceleration * this.options.speed, 0)
                                };
                            }
                            const changeX = Math.cos(angle) * this.velocity.x;
                            const changeY = Math.sin(angle) * this.velocity.y;
                            const x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                            const y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;

                            this.parent.moveCenter(x, y);
                            this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                        }
                    }
                    else
                    {
                        const angle = Math.atan2(toY - center.y, toX - center.x);
                        const changeX = Math.cos(angle) * this.options.speed;
                        const changeY = Math.sin(angle) * this.options.speed;
                        const x = Math.abs(changeX) > Math.abs(deltaX) ? toX : center.x + changeX;
                        const y = Math.abs(changeY) > Math.abs(deltaY) ? toY : center.y + changeY;

                        this.parent.moveCenter(x, y);
                        this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                    }
                }
                else
                {
                    this.parent.moveCenter(toX, toY);
                    this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                }
            }
        }
    }

    /** Insets for mouse edges scrolling regions */










































    const MOUSE_EDGES_OPTIONS = {
        radius: null,
        distance: null,
        top: null,
        bottom: null,
        left: null,
        right: null,
        speed: 8,
        reverse: false,
        noDecelerate: false,
        linear: false,
        allowButtons: false,
    };

    /**
     * Scroll viewport when mouse hovers near one of the edges.
     *
     * @event mouse-edge-start(Viewport) emitted when mouse-edge starts
     * @event mouse-edge-end(Viewport) emitted when mouse-edge ends
     */
    class MouseEdges extends Plugin
    {
        /** Options used to initialize this plugin, cannot be modified later. */
        

        /** Factor from reverse option. */
        

        /** Radius squared */
        

        /** Scroll region size on the left side. */
        

        /** Scroll region size on the top size. */
        

        /** Scroll region size on the right side. */
        

        /** Scroll region size on the bottom side. */
        

        

        

        /**
         * This is called by {@link Viewport.mouseEdges}.
         */
        constructor(parent, options = {})
        {
            super(parent);

            this.options = Object.assign({}, MOUSE_EDGES_OPTIONS, options);
            this.reverse = this.options.reverse ? 1 : -1;
            this.radiusSquared = typeof this.options.radius === 'number' ? Math.pow(this.options.radius, 2) : null;

            this.resize();
        }

         resize()
        {
            const distance = this.options.distance;

            if (distance !== null)
            {
                this.left = distance;
                this.top = distance;
                this.right = this.parent.worldScreenWidth - distance;
                this.bottom = this.parent.worldScreenHeight - distance;
            }
            else if (!this.options.radius)
            {
                this.left = this.options.left;
                this.top = this.options.top;
                this.right = this.options.right === null ? null : this.parent.worldScreenWidth - this.options.right;
                this.bottom = this.options.bottom === null ? null : this.parent.worldScreenHeight - this.options.bottom;
            }
        }

         down()
        {
            if (this.paused)
            {
                return false;
            }
            if (!this.options.allowButtons)
            {
                this.horizontal = this.vertical = null;
            }

            return false;
        }

         move(event)
        {
            if (this.paused)
            {
                return false;
            }
            if ((event.data.pointerType !== 'mouse' && event.data.identifier !== 1)
                || (!this.options.allowButtons && event.data.buttons !== 0))
            {
                return false;
            }

            const x = event.data.global.x;
            const y = event.data.global.y;

            if (this.radiusSquared)
            {
                const center = this.parent.toScreen(this.parent.center);
                const distance = Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2);

                if (distance >= this.radiusSquared)
                {
                    const angle = Math.atan2(center.y - y, center.x - x);

                    if (this.options.linear)
                    {
                        this.horizontal = Math.round(Math.cos(angle)) * this.options.speed * this.reverse * (60 / 1000);
                        this.vertical = Math.round(Math.sin(angle)) * this.options.speed * this.reverse * (60 / 1000);
                    }
                    else
                    {
                        this.horizontal = Math.cos(angle) * this.options.speed * this.reverse * (60 / 1000);
                        this.vertical = Math.sin(angle) * this.options.speed * this.reverse * (60 / 1000);
                    }
                }
                else
                {
                    if (this.horizontal)
                    {
                        this.decelerateHorizontal();
                    }
                    if (this.vertical)
                    {
                        this.decelerateVertical();
                    }

                    this.horizontal = this.vertical = 0;
                }
            }
            else
            {
                if (this.left !== null && x < this.left)
                {
                    this.horizontal = Number(this.reverse) * this.options.speed * (60 / 1000);
                }
                else if (this.right !== null && x > this.right)
                {
                    this.horizontal = -1 * this.reverse * this.options.speed * (60 / 1000);
                }
                else
                {
                    this.decelerateHorizontal();
                    this.horizontal = 0;
                }
                if (this.top !== null && y < this.top)
                {
                    this.vertical = Number(this.reverse) * this.options.speed * (60 / 1000);
                }
                else if (this.bottom !== null && y > this.bottom)
                {
                    this.vertical = -1 * this.reverse * this.options.speed * (60 / 1000);
                }
                else
                {
                    this.decelerateVertical();
                    this.vertical = 0;
                }
            }

            return false;
        }

         decelerateHorizontal()
        {
            const decelerate = this.parent.plugins.get('decelerate', true);

            if (this.horizontal && decelerate && !this.options.noDecelerate)
            {
                decelerate.activate({ x: (this.horizontal * this.options.speed * this.reverse) / (1000 / 60) });
            }
        }

         decelerateVertical()
        {
            const decelerate = this.parent.plugins.get('decelerate', true);

            if (this.vertical && decelerate && !this.options.noDecelerate)
            {
                decelerate.activate({ y: (this.vertical * this.options.speed * this.reverse) / (1000 / 60) });
            }
        }

         up()
        {
            if (this.paused)
            {
                return false;
            }
            if (this.horizontal)
            {
                this.decelerateHorizontal();
            }
            if (this.vertical)
            {
                this.decelerateVertical();
            }
            this.horizontal = this.vertical = null;

            return false;
        }

         update()
        {
            if (this.paused)
            {
                return;
            }

            if (this.horizontal || this.vertical)
            {
                const center = this.parent.center;

                if (this.horizontal)
                {
                    center.x += this.horizontal * this.options.speed;
                }
                if (this.vertical)
                {
                    center.y += this.vertical * this.options.speed;
                }

                this.parent.moveCenter(center);
                this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' });
            }
        }
    }

    /** Options for {@link Pinch}. */


























    const DEFAULT_PINCH_OPTIONS = {
        noDrag: false,
        percent: 1,
        center: null,
        factor: 1,
        axis: 'all',
    };

    /**
     * Plugin for enabling two-finger pinching (or dragging).
     *
     * @public
     */
    class Pinch extends Plugin
    {
        /** Options used to initialize this plugin. */
        

        /** Flags whether this plugin is active, i.e. a pointer is down on the viewport. */
         __init() {this.active = false;}

        /** Flags whether the viewport is being pinched. */
         __init2() {this.pinching = false;}

         __init3() {this.moved = false;}
        

        /**
         * This is called by {@link Viewport.pinch}.
         */
        constructor(parent, options = {})
        {
            super(parent);Pinch.prototype.__init.call(this);Pinch.prototype.__init2.call(this);Pinch.prototype.__init3.call(this);;
            this.options = Object.assign({}, DEFAULT_PINCH_OPTIONS, options);
        }

         down()
        {
            if (this.parent.input.count() >= 2)
            {
                this.active = true;
                return true;
            }

            return false;
        }

         isAxisX()
        {
            return ['all', 'x'].includes(this.options.axis);
        }

         isAxisY()
        {
            return ['all', 'y'].includes(this.options.axis);
        }

         move(e)
        {
            if (this.paused || !this.active)
            {
                return false;
            }

            const x = e.data.global.x;
            const y = e.data.global.y;

            const pointers = this.parent.input.touches;

            if (pointers.length >= 2)
            {
                const first = pointers[0] ;
                const second = pointers[1] ;
                const last = (first.last && second.last)
                    ? Math.sqrt(Math.pow(second.last.x - first.last.x, 2) + Math.pow(second.last.y - first.last.y, 2))
                    : null;

                if (first.id === e.data.pointerId)
                {
                    first.last = { x, y, data: e.data } ;
                }
                else if (second.id === e.data.pointerId)
                {
                    second.last = { x, y, data: e.data } ;
                }
                if (last)
                {
                    let oldPoint;

                    const point = {
                        x: (first.last ).x +
                            ((second.last ).x - (first.last ).x) / 2,
                        y: (first.last ).y +
                            ((second.last ).y - (first.last ).y) / 2,
                    };

                    if (!this.options.center)
                    {
                        oldPoint = this.parent.toLocal(point);
                    }
                    let dist = Math.sqrt(Math.pow(
                        (second.last ).x - (first.last ).x, 2) +
                        Math.pow((second.last ).y - (first.last ).y, 2));

                    dist = dist === 0 ? dist = 0.0000000001 : dist;

                    const change = (1 - last / dist) * this.options.percent
                        * (this.isAxisX() ? this.parent.scale.x : this.parent.scale.y);

                    if (this.isAxisX())
                    {
                        this.parent.scale.x += change;
                    }
                    if (this.isAxisY())
                    {
                        this.parent.scale.y += change;
                    }

                    this.parent.emit('zoomed', { viewport: this.parent, type: 'pinch', center: point });

                    const clamp = this.parent.plugins.get('clamp-zoom', true);

                    if (clamp)
                    {
                        clamp.clamp();
                    }
                    if (this.options.center)
                    {
                        this.parent.moveCenter(this.options.center);
                    }
                    else
                    {
                        const newPoint = this.parent.toGlobal(oldPoint );

                        this.parent.x += (point.x - newPoint.x) * this.options.factor;
                        this.parent.y += (point.y - newPoint.y) * this.options.factor;
                        this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                    }
                    if (!this.options.noDrag && this.lastCenter)
                    {
                        this.parent.x += (point.x - this.lastCenter.x) * this.options.factor;
                        this.parent.y += (point.y - this.lastCenter.y) * this.options.factor;
                        this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                    }

                    this.lastCenter = point;
                    this.moved = true;
                }
                else if (!this.pinching)
                {
                    this.parent.emit('pinch-start', this.parent);
                    this.pinching = true;
                }

                return true;
            }

            return false;
        }

         up()
        {
            if (this.pinching)
            {
                if (this.parent.input.touches.length <= 1)
                {
                    this.active = false;
                    this.lastCenter = null;
                    this.pinching = false;
                    this.moved = false;
                    this.parent.emit('pinch-end', this.parent);

                    return true;
                }
            }

            return false;
        }
    }

    const DEFAULT_SNAP_OPTIONS = {
        topLeft: false,
        friction: 0.8,
        time: 1000,
        ease: 'easeInOutSine',
        interrupt: true,
        removeOnComplete: false,
        removeOnInterrupt: false,
        forceStart: false
    };

    /**
     * @event snap-start(Viewport) emitted each time a snap animation starts
     * @event snap-restart(Viewport) emitted each time a snap resets because of a change in viewport size
     * @event snap-end(Viewport) emitted each time snap reaches its target
     * @event snap-remove(Viewport) emitted if snap plugin is removed
     */
    class Snap extends Plugin
    {
        
        
        
        

        
        
        
        
        
        

        /**
         * This is called by {@link Viewport.snap}.
         */
        constructor(parent, x, y, options = {})
        {
            super(parent);
            this.options = Object.assign({}, DEFAULT_SNAP_OPTIONS, options);
            this.ease = ease(options.ease, 'easeInOutSine');
            this.x = x;
            this.y = y;

            if (this.options.forceStart)
            {
                this.snapStart();
            }
        }

         snapStart()
        {
            this.percent = 0;
            this.snapping = { time: 0 };
            const current = this.options.topLeft ? this.parent.corner : this.parent.center;

            this.deltaX = this.x - current.x;
            this.deltaY = this.y - current.y;
            this.startX = current.x;
            this.startY = current.y;
            this.parent.emit('snap-start', this.parent);
        }

         wheel()
        {
            if (this.options.removeOnInterrupt)
            {
                this.parent.plugins.remove('snap');
            }

            return false;
        }

         down()
        {
            if (this.options.removeOnInterrupt)
            {
                this.parent.plugins.remove('snap');
            }
            else if (this.options.interrupt)
            {
                this.snapping = null;
            }

            return false;
        }

         up()
        {
            if (this.parent.input.count() === 0)
            {
                const decelerate = this.parent.plugins.get('decelerate', true);

                if (decelerate && (decelerate.x || decelerate.y))
                {
                    decelerate.percentChangeX = decelerate.percentChangeY = this.options.friction;
                }
            }

            return false;
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }
            if (this.options.interrupt && this.parent.input.count() !== 0)
            {
                return;
            }
            if (!this.snapping)
            {
                const current = this.options.topLeft ? this.parent.corner : this.parent.center;

                if (current.x !== this.x || current.y !== this.y)
                {
                    this.snapStart();
                }
            }
            else
            {
                const snapping = this.snapping;

                snapping.time += elapsed;
                let finished;
                let x;
                let y;

                const startX = this.startX ;
                const startY = this.startY ;
                const deltaX = this.deltaX ;
                const deltaY = this.deltaY ;

                if (snapping.time > this.options.time)
                {
                    finished = true;
                    x = startX + deltaX;
                    y = startY + deltaY;
                }
                else
                {
                    const percent = this.ease(snapping.time, 0, 1, this.options.time);

                    x = startX + (deltaX * percent);
                    y = startY + (deltaY * percent);
                }
                if (this.options.topLeft)
                {
                    this.parent.moveCorner(x, y);
                }
                else
                {
                    this.parent.moveCenter(x, y);
                }

                this.parent.emit('moved', { viewport: this.parent, type: 'snap' });

                if (finished)
                {
                    if (this.options.removeOnComplete)
                    {
                        this.parent.plugins.remove('snap');
                    }
                    this.parent.emit('snap-end', this.parent);
                    this.snapping = null;
                }
            }
        }
    }

    /** Options for {@link SnapZoom}. */

























































    const DEFAULT_SNAP_ZOOM_OPTIONS = {
        width: 0,
        height: 0,
        time: 1000,
        ease: 'easeInOutSine',
        center: null,
        interrupt: true,
        removeOnComplete: false,
        removeOnInterrupt: false,
        forceStart: false,
        noMove: false
    };

    /**
     * @event snap-zoom-start(Viewport) emitted each time a fit animation starts
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     * @event snap-zoom-end(Viewport) emitted each time fit reaches its target
     */
    class SnapZoom extends Plugin
    {
        

        
        
        
        
        
        







        /**
         * This is called by {@link Viewport.snapZoom}.
         */
        constructor(parent, options = {})
        {
            super(parent);

            this.options = Object.assign({}, DEFAULT_SNAP_ZOOM_OPTIONS, options);
            this.ease = ease(this.options.ease);

            // Assign defaults for typescript.
            this.xIndependent = false;
            this.yIndependent = false;
            this.xScale = 0;
            this.yScale = 0;

            if (this.options.width > 0)
            {
                this.xScale = parent.screenWidth / this.options.width;
                this.xIndependent = true;
            }
            if (this.options.height > 0)
            {
                this.yScale = parent.screenHeight / this.options.height;
                this.yIndependent = true;
            }

            this.xScale = this.xIndependent ? (this.xScale ) : (this.yScale );
            this.yScale = this.yIndependent ? (this.yScale ) : this.xScale;

            if (this.options.time === 0)
            {
                // TODO: Fix this
                // @ts-expect-error todo
                parent.container.scale.x = this.xScale;

                // TODO: Fix this
                // @ts-expect-error todo
                parent.container.scale.y = this.yScale;

                if (this.options.removeOnComplete)
                {
                    this.parent.plugins.remove('snap-zoom');
                }
            }
            else if (options.forceStart)
            {
                this.createSnapping();
            }
        }

         createSnapping()
        {
            const startWorldScreenWidth = this.parent.worldScreenWidth;
            const startWorldScreenHeight = this.parent.worldScreenHeight;
            const endWorldScreenWidth = this.parent.screenWidth / this.xScale;
            const endWorldScreenHeight = this.parent.screenHeight / this.yScale;

            this.snapping = {
                time: 0,
                startX: startWorldScreenWidth,
                startY: startWorldScreenHeight,
                deltaX: endWorldScreenWidth - startWorldScreenWidth,
                deltaY: endWorldScreenHeight - startWorldScreenHeight
            };

            this.parent.emit('snap-zoom-start', this.parent);
        }

         resize()
        {
            this.snapping = null;

            if (this.options.width > 0)
            {
                this.xScale = this.parent.screenWidth / this.options.width;
            }
            if (this.options.height > 0)
            {
                this.yScale = this.parent.screenHeight / this.options.height;
            }
            this.xScale = this.xIndependent ? this.xScale : this.yScale;
            this.yScale = this.yIndependent ? this.yScale : this.xScale;
        }

         wheel()
        {
            if (this.options.removeOnInterrupt)
            {
                this.parent.plugins.remove('snap-zoom');
            }

            return false;
        }

         down()
        {
            if (this.options.removeOnInterrupt)
            {
                this.parent.plugins.remove('snap-zoom');
            }
            else if (this.options.interrupt)
            {
                this.snapping = null;
            }

            return false;
        }

         update(elapsed)
        {
            if (this.paused)
            {
                return;
            }
            if (this.options.interrupt && this.parent.input.count() !== 0)
            {
                return;
            }

            let oldCenter;

            if (!this.options.center && !this.options.noMove)
            {
                oldCenter = this.parent.center;
            }
            if (!this.snapping)
            {
                if (this.parent.scale.x !== this.xScale || this.parent.scale.y !== this.yScale)
                {
                    this.createSnapping();
                }
            }
            else if (this.snapping)
            {
                const snapping = this.snapping;

                snapping.time += elapsed;

                if (snapping.time >= this.options.time)
                {
                    this.parent.scale.set(this.xScale, this.yScale);
                    if (this.options.removeOnComplete)
                    {
                        this.parent.plugins.remove('snap-zoom');
                    }
                    this.parent.emit('snap-zoom-end', this.parent);
                    this.snapping = null;
                }
                else
                {
                    const snapping = this.snapping;
                    const worldScreenWidth = this.ease(snapping.time, snapping.startX, snapping.deltaX, this.options.time);
                    const worldScreenHeight = this.ease(snapping.time, snapping.startY, snapping.deltaY, this.options.time);

                    this.parent.scale.x = this.parent.screenWidth / worldScreenWidth;
                    this.parent.scale.y = this.parent.screenHeight / worldScreenHeight;
                }
                const clamp = this.parent.plugins.get('clamp-zoom', true);

                if (clamp)
                {
                    clamp.clamp();
                }
                if (!this.options.noMove)
                {
                    if (!this.options.center)
                    {
                        this.parent.moveCenter(oldCenter );
                    }
                    else
                    {
                        this.parent.moveCenter(this.options.center);
                    }
                }
            }
        }

         resume()
        {
            this.snapping = null;
            super.resume();
        }
    }

    /** Options for {@link Wheel}. */




















































    const DEFAULT_WHEEL_OPTIONS = {
        percent: 0.1,
        smooth: false,
        interrupt: true,
        reverse: false,
        center: null,
        lineHeight: 20,
        axis: 'all',
    };

    /**
     * Plugin for handling wheel scrolling for viewport zoom.
     *
     * @event wheel({wheel: {dx, dy, dz}, event, viewport})
     */
    class Wheel extends Plugin
    {
        

        
        
        

        /**
         * This is called by {@link Viewport.wheel}.
         */
        constructor(parent, options = {})
        {
            super(parent);
            this.options = Object.assign({}, DEFAULT_WHEEL_OPTIONS, options);
        }

         down()
        {
            if (this.options.interrupt)
            {
                this.smoothing = null;
            }

            return false;
        }

         isAxisX()
        {
            return ['all', 'x'].includes(this.options.axis);
        }

         isAxisY()
        {
            return ['all', 'y'].includes(this.options.axis);
        }

         update()
        {
            if (this.smoothing)
            {
                const point = this.smoothingCenter;
                const change = this.smoothing;
                let oldPoint;

                if (!this.options.center)
                {
                    oldPoint = this.parent.toLocal(point );
                }
                if (this.isAxisX())
                {
                    this.parent.scale.x += change.x;
                }
                if (this.isAxisY())
                {
                    this.parent.scale.y += change.y;
                }

                this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
                const clamp = this.parent.plugins.get('clamp-zoom', true);

                if (clamp)
                {
                    clamp.clamp();
                }
                if (this.options.center)
                {
                    this.parent.moveCenter(this.options.center);
                }
                else
                {
                    const newPoint = this.parent.toGlobal(oldPoint );

                    this.parent.x += (point ).x - newPoint.x;
                    this.parent.y += (point ).y - newPoint.y;
                }

                this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
                (this.smoothingCount )++;

                if (this.smoothingCount  >= this.options.smooth)
                {
                    this.smoothing = null;
                }
            }
        }

         wheel(e)
        {
            if (this.paused)
            {
                return;
            }

            const point = this.parent.input.getPointerPosition(e);
            const sign = this.options.reverse ? -1 : 1;
            const step = sign * -e.deltaY * (e.deltaMode ? this.options.lineHeight : 1) / 500;
            const change = Math.pow(2, (1 + this.options.percent) * step);

            if (this.options.smooth)
            {
                const original = {
                    x: this.smoothing ? this.smoothing.x * (this.options.smooth - (this.smoothingCount )) : 0,
                    y: this.smoothing ? this.smoothing.y * (this.options.smooth - (this.smoothingCount )) : 0
                };

                this.smoothing = {
                    x: ((this.parent.scale.x + original.x) * change - this.parent.scale.x) / this.options.smooth,
                    y: ((this.parent.scale.y + original.y) * change - this.parent.scale.y) / this.options.smooth,
                };
                this.smoothingCount = 0;
                this.smoothingCenter = point;
            }
            else
            {
                let oldPoint;

                if (!this.options.center)
                {
                    oldPoint = this.parent.toLocal(point);
                }
                if (this.isAxisX())
                {
                    this.parent.scale.x *= change;
                }
                if (this.isAxisY())
                {
                    this.parent.scale.y *= change;
                }
                this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
                const clamp = this.parent.plugins.get('clamp-zoom', true);

                if (clamp)
                {
                    clamp.clamp();
                }
                if (this.options.center)
                {
                    this.parent.moveCenter(this.options.center);
                }
                else
                {
                    const newPoint = this.parent.toGlobal(oldPoint );

                    this.parent.x += point.x - newPoint.x;
                    this.parent.y += point.y - newPoint.y;
                }
            }

            this.parent.emit('moved', { viewport: this.parent, type: 'wheel' });
            this.parent.emit('wheel', { wheel: { dx: e.deltaX, dy: e.deltaY, dz: e.deltaZ }, event: e, viewport: this.parent });

            if (!this.parent.options.passiveWheel)
            {
                return true;
            }
        }
    }

    /**
     * Handles all input for Viewport
     *
     * @internal
     * @ignore
     * @private
     */
    class InputManager
    {
        

        
        
        
        
        /** List of active touches on viewport */
        

        constructor(viewport)
        {
            this.viewport = viewport;
            this.touches = [];

            this.addListeners();
        }

        /** Add input listeners */
         addListeners()
        {
            this.viewport.interactive = true;
            if (!this.viewport.forceHitArea)
            {
                this.viewport.hitArea = new math.Rectangle(0, 0, this.viewport.worldWidth, this.viewport.worldHeight);
            }
            this.viewport.on('pointerdown', this.down, this);
            this.viewport.on('pointermove', this.move, this);
            this.viewport.on('pointerup', this.up, this);
            this.viewport.on('pointerupoutside', this.up, this);
            this.viewport.on('pointercancel', this.up, this);
            this.viewport.on('pointerout', this.up, this);
            this.wheelFunction = (e) => this.handleWheel(e);
            this.viewport.options.divWheel.addEventListener(
                'wheel',
                this.wheelFunction ,
                { passive: this.viewport.options.passiveWheel });
            this.isMouseDown = false;
        }

        /**
         * Removes all event listeners from viewport
         * (useful for cleanup of wheel when removing viewport)
         */
         destroy()
        {
            this.viewport.options.divWheel.removeEventListener('wheel', this.wheelFunction );
        }

        /**
         * handle down events for viewport
         *
         * @param {PIXI.InteractionEvent} event
         */
         down(event)
        {
            if (this.viewport.pause || !this.viewport.worldVisible)
            {
                return;
            }
            if (event.data.pointerType === 'mouse')
            {
                this.isMouseDown = true;
            }
            else if (!this.get(event.data.pointerId))
            {
                this.touches.push({ id: event.data.pointerId, last: null });
            }
            if (this.count() === 1)
            {
                this.last = event.data.global.clone();

                // clicked event does not fire if viewport is decelerating or bouncing
                const decelerate = this.viewport.plugins.get('decelerate', true);
                const bounce = this.viewport.plugins.get('bounce', true);

                if ((!decelerate || !decelerate.isActive()) && (!bounce || !bounce.isActive()))
                {
                    this.clickedAvailable = true;
                }
                else
                {
                    this.clickedAvailable = false;
                }
            }
            else
            {
                this.clickedAvailable = false;
            }

            const stop = this.viewport.plugins.down(event);

            if (stop && this.viewport.options.stopPropagation)
            {
                event.stopPropagation();
            }
        }

        /** Clears all pointer events */
         clear()
        {
            this.isMouseDown = false;
            this.touches = [];
            this.last = null;
        }

        /**
         * @param {number} change
         * @returns whether change exceeds threshold
         */
         checkThreshold(change)
        {
            if (Math.abs(change) >= this.viewport.threshold)
            {
                return true;
            }

            return false;
        }

        /** Handle move events for viewport */
         move(event)
        {
            if (this.viewport.pause || !this.viewport.worldVisible)
            {
                return;
            }

            const stop = this.viewport.plugins.move(event);

            if (this.clickedAvailable && this.last)
            {
                const distX = event.data.global.x - this.last.x;
                const distY = event.data.global.y - this.last.y;

                if (this.checkThreshold(distX) || this.checkThreshold(distY))
                {
                    this.clickedAvailable = false;
                }
            }

            if (stop && this.viewport.options.stopPropagation)
            {
                event.stopPropagation();
            }
        }

        /** Handle up events for viewport */
         up(event)
        {
            if (this.viewport.pause || !this.viewport.worldVisible)
            {
                return;
            }

            if (event.data.pointerType === 'mouse')
            {
                this.isMouseDown = false;
            }

            if (event.data.pointerType !== 'mouse')
            {
                this.remove(event.data.pointerId);
            }

            const stop = this.viewport.plugins.up(event);

            if (this.clickedAvailable && this.count() === 0 && this.last)
            {
                this.viewport.emit('clicked', {
                    event,
                    screen: this.last,
                    world: this.viewport.toWorld(this.last),
                    viewport: this
                });
                this.clickedAvailable = false;
            }

            if (stop && this.viewport.options.stopPropagation)
            {
                event.stopPropagation();
            }
        }

        /** Gets pointer position if this.interaction is set */
         getPointerPosition(event)
        {
            const point = new math.Point();

            if (this.viewport.options.interaction)
            {
                this.viewport.options.interaction.mapPositionToPoint(point, event.clientX, event.clientY);
            }
            else
            {
                point.x = event.clientX;
                point.y = event.clientY;
            }

            return point;
        }

        /** Handle wheel events */
         handleWheel(event)
        {
            if (this.viewport.pause || !this.viewport.worldVisible)
            {
                return;
            }

            // do not handle events coming from other elements
            if (this.viewport.options.interaction
                && (this.viewport.options.interaction ).interactionDOMElement !== event.target)
            {
                return;
            }

            // only handle wheel events where the mouse is over the viewport
            const point = this.viewport.toLocal(this.getPointerPosition(event));

            if (this.viewport.left <= point.x
                && point.x <= this.viewport.right
                && this.viewport.top <= point.y
                && point.y <= this.viewport.bottom)
            {
                const stop = this.viewport.plugins.wheel(event);

                if (stop && !this.viewport.options.passiveWheel)
                {
                    event.preventDefault();
                }
            }
        }

         pause()
        {
            this.touches = [];
            this.isMouseDown = false;
        }

        /** Get touch by id */
         get(id)
        {
            for (const touch of this.touches)
            {
                if (touch.id === id)
                {
                    return touch;
                }
            }

            return null;
        }

        /** Remove touch by number */
        remove(id)
        {
            for (let i = 0; i < this.touches.length; i++)
            {
                if (this.touches[i].id === id)
                {
                    this.touches.splice(i, 1);

                    return;
                }
            }
        }

        /**
         * @returns {number} count of mouse/touch pointers that are down on the viewport
         */
        count()
        {
            return (this.isMouseDown ? 1 : 0) + this.touches.length;
        }
    }

    function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

















    const PLUGIN_ORDER = [
        'drag',
        'pinch',
        'wheel',
        'follow',
        'mouse-edges',
        'decelerate',
        'aniamte',
        'bounce',
        'snap-zoom',
        'clamp-zoom',
        'snap',
        'clamp',
    ];

    /**
     * Use this to access current plugins or add user-defined plugins
     *
     * @public
     */
    class PluginManager
    {
        /** Maps mounted plugins by their type */
        

        /**
         * List of plugins mounted
         *
         * This list is kept sorted by the internal priority of plugins (hard-coded).
         */
        

        /** The viewport using the plugins managed by `this`. */
        

        /** This is called by {@link Viewport} to initialize the {@link Viewport.plugins plugins}. */
        constructor(viewport)
        {
            this.viewport = viewport;
            this.list = [];
            this.plugins = {};
        }

        /**
         * Inserts a named plugin or a user plugin into the viewport
         * default plugin order: 'drag', 'pinch', 'wheel', 'follow', 'mouse-edges', 'decelerate', 'bounce',
         * 'snap-zoom', 'clamp-zoom', 'snap', 'clamp'
         *
         * @param {string} name of plugin
         * @param {Plugin} plugin - instantiated Plugin class
         * @param {number} index to insert userPlugin (otherwise inserts it at the end)
         */
         add(name, plugin, index = PLUGIN_ORDER.length)
        {
            this.plugins[name] = plugin;

            const current = PLUGIN_ORDER.indexOf(name);

            if (current !== -1)
            {
                PLUGIN_ORDER.splice(current, 1);
            }

            PLUGIN_ORDER.splice(index, 0, name);
            this.sort();
        }

        













        /**
         * Get plugin
         *
         * @param {string} name of plugin
         * @param {boolean} [ignorePaused] return null if plugin is paused
         */
         get(name, ignorePaused)
        {
            if (ignorePaused)
            {
                if (_optionalChain([this, 'access', _ => _.plugins, 'access', _2 => _2[name], 'optionalAccess', _3 => _3.paused]))
                {
                    return null;
                }
            }

            return this.plugins[name] ;
        }

        /**
         * Update all active plugins
         *
         * @internal
         * @ignore
         * @param {number} elapsed type in milliseconds since last update
         */
         update(elapsed)
        {
            for (const plugin of this.list)
            {
                plugin.update(elapsed);
            }
        }

        /**
         * Resize all active plugins
         *
         * @internal
         * @ignore
         */
         resize()
        {
            for (const plugin of this.list)
            {
                plugin.resize();
            }
        }

        /** Clamps and resets bounce and decelerate (as needed) after manually moving viewport */
         reset()
        {
            for (const plugin of this.list)
            {
                plugin.reset();
            }
        }

        /** removes all installed plugins */
         removeAll()
        {
            this.plugins = {};
            this.sort();
        }

        /**
         * Removes installed plugin
         *
         * @param {string} name of plugin (e.g., 'drag', 'pinch')
         */
         remove(name)
        {
            if (this.plugins[name])
            {
                delete this.plugins[name];
                this.viewport.emit(`${name}-remove`);
                this.sort();
            }
        }

        /**
         * Pause plugin
         *
         * @param {string} name of plugin (e.g., 'drag', 'pinch')
         */
         pause(name)
        {
            _optionalChain([this, 'access', _4 => _4.plugins, 'access', _5 => _5[name], 'optionalAccess', _6 => _6.pause, 'call', _7 => _7()]);
        }

        /**
         * Resume plugin
         *
         * @param {string} name of plugin (e.g., 'drag', 'pinch')
         */
         resume(name)
        {
            _optionalChain([this, 'access', _8 => _8.plugins, 'access', _9 => _9[name], 'optionalAccess', _10 => _10.resume, 'call', _11 => _11()]);
        }

        /**
         * Sort plugins according to PLUGIN_ORDER
         *
         * @internal
         * @ignore
         */
         sort()
        {
            this.list = [];

            for (const plugin of PLUGIN_ORDER)
            {
                if (this.plugins[plugin])
                {
                    this.list.push(this.plugins[plugin] );
                }
            }
        }

        /**
         * Handle down for all plugins
         *
         * @internal
         * @ignore
         */
         down(event)
        {
            let stop = false;

            for (const plugin of this.list)
            {
                if (plugin.down(event))
                {
                    stop = true;
                }
            }

            return stop;
        }

        /**
         * Handle move for all plugins
         *
         * @internal
         * @ignore
         */
         move(event)
        {
            let stop = false;

            for (const plugin of this.viewport.plugins.list)
            {
                if (plugin.move(event))
                {
                    stop = true;
                }
            }

            return stop;
        }

        /**
         * Handle up for all plugins
         *
         * @internal
         * @ignore
         */
         up(event)
        {
            let stop = false;

            for (const plugin of this.list)
            {
                if (plugin.up(event))
                {
                    stop = true;
                }
            }

            return stop;
        }

        /**
         * Handle wheel event for all plugins
         *
         * @internal
         * @ignore
         */
         wheel(e)
        {
            let result = false;

            for (const plugin of this.list)
            {
                if (plugin.wheel(e))
                {
                    result = true;
                }
            }

            return result;
        }
    }

    /** Options for {@link Viewport}. */
























































































    const DEFAULT_VIEWPORT_OPTIONS = {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: null,
        worldHeight: null,
        threshold: 5,
        passiveWheel: true,
        stopPropagation: false,
        forceHitArea: null,
        noTicker: false,
        interaction: null,
        disableOnContextMenu: false,
        ticker: ticker.Ticker.shared,
    };

    /**
     * Main class to use when creating a Viewport
     *
     * @public
     * @fires clicked
     * @fires drag-start
     * @fires drag-end
     * @fires drag-remove
     * @fires pinch-start
     * @fires pinch-end
     * @fires pinch-remove
     * @fires snap-start
     * @fires snap-end
     * @fires snap-remove
     * @fires snap-zoom-start
     * @fires snap-zoom-end
     * @fires snap-zoom-remove
     * @fires bounce-x-start
     * @fires bounce-x-end
     * @fires bounce-y-start
     * @fires bounce-y-end
     * @fires bounce-remove
     * @fires wheel
     * @fires wheel-remove
     * @fires wheel-scroll
     * @fires wheel-scroll-remove
     * @fires mouse-edge-start
     * @fires mouse-edge-end
     * @fires mouse-edge-remove
     * @fires moved
     * @fires moved-end
     * @fires zoomed
     * @fires zoomed-end
     * @fires frame-end
     */
    class Viewport extends display.Container
    {
        /** Flags whether the viewport is being panned */
        

        
        

        /** Number of pixels to move to trigger an input event (e.g., drag, pinch) or disable a clicked event */
        

        

        /** Use this to add user plugins or access existing plugins (e.g., to pause, resume, or remove them) */
        

        /** Flags whether the viewport zoom is being changed. */
        

        

        /** The options passed when creating this viewport, merged with the default values */
        

        
        
        
        
        
        
        

        /**
         * @param options
         */
        constructor(options = {})
        {
            super();
            this.options = Object.assign(
                {},
                { divWheel: document.body },
                DEFAULT_VIEWPORT_OPTIONS,
                options
            );

            this.screenWidth = this.options.screenWidth;
            this.screenHeight = this.options.screenHeight;

            this._worldWidth = this.options.worldWidth;
            this._worldHeight = this.options.worldHeight;
            this.forceHitArea = this.options.forceHitArea;
            this.threshold = this.options.threshold;

            this.options.divWheel = this.options.divWheel || document.body;

            if (this.options.disableOnContextMenu)
            {
                this.options.divWheel.oncontextmenu = (e) => e.preventDefault();
            }
            if (!this.options.noTicker)
            {
                this.tickerFunction = () => this.update(this.options.ticker.elapsedMS);
                this.options.ticker.add(this.tickerFunction);
            }

            this.input = new InputManager(this);
            this.plugins = new PluginManager(this);
        }

        /** Overrides PIXI.Container's destroy to also remove the 'wheel' and PIXI.Ticker listeners */
        destroy(options)
        {
            if (!this.options.noTicker && this.tickerFunction)
            {
                this.options.ticker.remove(this.tickerFunction);
            }

            this.input.destroy();
            super.destroy(options);
        }

        /**
         * Update viewport on each frame.
         *
         * By default, you do not need to call this unless you set `options.noTicker=true`.
         *
         * @param {number} elapsed time in milliseconds since last update
         */
        update(elapsed)
        {
            if (!this.pause)
            {
                this.plugins.update(elapsed);

                if (this.lastViewport)
                {
                    // Check for moved-end event
                    if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y)
                    {
                        this.moving = true;
                    }
                    else if (this.moving)
                    {
                        this.emit('moved-end', this);
                        this.moving = false;
                    }

                    // Check for zoomed-end event
                    if (this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y)
                    {
                        this.zooming = true;
                    }
                    else  if (this.zooming)
                    {
                        this.emit('zoomed-end', this);
                        this.zooming = false;
                    }
                }

                if (!this.forceHitArea)
                {
                    this._hitAreaDefault = new math.Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
                    this.hitArea = this._hitAreaDefault;
                }

                this._dirty = this._dirty || !this.lastViewport
                    || this.lastViewport.x !== this.x || this.lastViewport.y !== this.y
                    || this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y;

                this.lastViewport = {
                    x: this.x,
                    y: this.y,
                    scaleX: this.scale.x,
                    scaleY: this.scale.y
                };
                this.emit('frame-end', this);
            }
        }

        /** Use this to set screen and world sizes, needed for pinch/wheel/clamp/bounce. */
        resize(
            screenWidth = window.innerWidth,
            screenHeight = window.innerHeight,
            worldWidth,
            worldHeight
        )
        {
            this.screenWidth = screenWidth;
            this.screenHeight = screenHeight;

            if (typeof worldWidth !== 'undefined')
            {
                this._worldWidth = worldWidth;
            }
            if (typeof worldHeight !== 'undefined')
            {
                this._worldHeight = worldHeight;
            }

            this.plugins.resize();
            this.dirty = true;
        }

        /** World width, in pixels */
        get worldWidth()
        {
            if (this._worldWidth)
            {
                return this._worldWidth;
            }

            return this.width / this.scale.x;
        }
        set worldWidth(value)
        {
            this._worldWidth = value;
            this.plugins.resize();
        }

        /** World height, in pixels */
        get worldHeight()
        {
            if (this._worldHeight)
            {
                return this._worldHeight;
            }

            return this.height / this.scale.y;
        }
        set worldHeight(value)
        {
            this._worldHeight = value;
            this.plugins.resize();
        }

        /** Get visible world bounds of viewport */
         getVisibleBounds()
        {
            return new math.Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
        }

        /** Change coordinates from screen to world */
        



         toWorld(x, y)
        {
            if (arguments.length === 2)
            {
                return this.toLocal(new math.Point(x , y));
            }

            return this.toLocal(x );
        }

        /** Change coordinates from world to screen */
        



         toScreen(x, y)
        {
            if (arguments.length === 2)
            {
                return this.toGlobal(new math.Point(x , y));
            }

            return this.toGlobal(x );
        }

        /** Screen width in world coordinates */
        get worldScreenWidth()
        {
            return this.screenWidth / this.scale.x;
        }

        /** Screen height in world coordinates */
        get worldScreenHeight()
        {
            return this.screenHeight / this.scale.y;
        }

        /** World width in screen coordinates */
        get screenWorldWidth()
        {
            return this.worldWidth * this.scale.x;
        }

        /** World height in screen coordinates */
        get screenWorldHeight()
        {
            return this.worldHeight * this.scale.y;
        }

        /** Center of screen in world coordinates */
        get center()
        {
            return new math.Point(
                this.worldScreenWidth / 2 - this.x / this.scale.x,
                this.worldScreenHeight / 2 - this.y / this.scale.y,
            );
        }
        set center(value)
        {
            this.moveCenter(value);
        }

        /** Move center of viewport to (x, y) */
        




         moveCenter(...args)
        {
            let x;
            let y;

            if (typeof args[0] === 'number')
            {
                x = args[0];
                y = args[1] ;
            }
            else
            {
                x = args[0].x;
                y = args[0].y;
            }

            const newX = (this.worldScreenWidth / 2 - x) * this.scale.x;
            const newY = (this.worldScreenHeight / 2 - y) * this.scale.y;

            if (this.x !== newX || this.y !== newY)
            {
                this.position.set(newX, newY);
                this.plugins.reset();
                this.dirty = true;
            }

            return this;
        }

        /** Top-left corner of Viewport */
        get corner()
        {
            return new math.Point(-this.x / this.scale.x, -this.y / this.scale.y);
        }
        set corner(value)
        {
            this.moveCorner(value);
        }

        /** Move viewport's top-left corner; also clamps and resets decelerate and bounce (as needed) */
        




         moveCorner(...args)
        {
            let x;
            let y;

            if (args.length === 1)
            {
                x = -args[0].x * this.scale.x;
                y = -args[0].y * this.scale.y;
            }
            else
            {
                x = -args[0] * this.scale.x;
                y = -args[1] * this.scale.y;
            }

            if (x !== this.x || y !== this.y)
            {
                this.position.set(x, y);
                this.plugins.reset();
                this.dirty = true;
            }

            return this;
        }

        /** Get how many world pixels fit in screen's width */
        get screenWidthInWorldPixels()
        {
            return this.screenWidth / this.scale.x;
        }

        /** Get how many world pixels fit on screen's height */
        get screenHeightInWorldPixels()
        {
            return this.screenHeight / this.scale.y;
        }

        /**
         * Find the scale value that fits a world width on the screen
         * does not change the viewport (use fit... to change)
         *
         * @param width - Width in world pixels
         * @return - scale
         */
        findFitWidth(width)
        {
            return this.screenWidth / width;
        }

        /**
         * Finds the scale value that fits a world height on the screens
         * does not change the viewport (use fit... to change)
         *
         * @param height - Height in world pixels
         * @return - scale
         */
        findFitHeight(height)
        {
            return this.screenHeight / height;
        }

        /**
         * Finds the scale value that fits the smaller of a world width and world height on the screen
         * does not change the viewport (use fit... to change)
         *
         * @param {number} width in world pixels
         * @param {number} height in world pixels
         * @returns {number} scale
         */
        findFit(width, height)
        {
            const scaleX = this.screenWidth / width;
            const scaleY = this.screenHeight / height;

            return Math.min(scaleX, scaleY);
        }

        /**
         * Finds the scale value that fits the larger of a world width and world height on the screen
         * does not change the viewport (use fit... to change)
         *
         * @param {number} width in world pixels
         * @param {number} height in world pixels
         * @returns {number} scale
         */
        findCover(width, height)
        {
            const scaleX = this.screenWidth / width;
            const scaleY = this.screenHeight / height;

            return Math.max(scaleX, scaleY);
        }

        /**
         * Change zoom so the width fits in the viewport
         *
         * @param width - width in world coordinates
         * @param center - maintain the same center
         * @param scaleY - whether to set scaleY=scaleX
         * @param noClamp - whether to disable clamp-zoom
         * @returns {Viewport} this
         */
        fitWidth(width = this.worldWidth, center, scaleY = true, noClamp)
        {
            let save;

            if (center)
            {
                save = this.center;
            }
            this.scale.x = this.screenWidth / width;

            if (scaleY)
            {
                this.scale.y = this.scale.x;
            }

            const clampZoom = this.plugins.get('clamp-zoom', true);

            if (!noClamp && clampZoom)
            {
                clampZoom.clamp();
            }

            if (center && save)
            {
                this.moveCenter(save);
            }

            return this;
        }

        /**
         * Change zoom so the height fits in the viewport
         *
         * @param {number} [height=this.worldHeight] in world coordinates
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
         * @param {boolean} [noClamp] whether to disable clamp-zoom
         * @returns {Viewport} this
         */
        fitHeight(height = this.worldHeight, center, scaleX = true, noClamp)
        {
            let save;

            if (center)
            {
                save = this.center;
            }
            this.scale.y = this.screenHeight / height;

            if (scaleX)
            {
                this.scale.x = this.scale.y;
            }

            const clampZoom = this.plugins.get('clamp-zoom', true);

            if (!noClamp && clampZoom)
            {
                clampZoom.clamp();
            }

            if (center && save)
            {
                this.moveCenter(save);
            }

            return this;
        }

        /**
         * Change zoom so it fits the entire world in the viewport
         *
         * @param {boolean} center maintain the same center of the screen after zoom
         * @returns {Viewport} this
         */
        fitWorld(center)
        {
            let save;

            if (center)
            {
                save = this.center;
            }

            this.scale.x = this.screenWidth / this.worldWidth;
            this.scale.y = this.screenHeight / this.worldHeight;

            if (this.scale.x < this.scale.y)
            {
                this.scale.y = this.scale.x;
            }
            else
            {
                this.scale.x = this.scale.y;
            }

            const clampZoom = this.plugins.get('clamp-zoom', true);

            if (clampZoom)
            {
                clampZoom.clamp();
            }

            if (center && save)
            {
                this.moveCenter(save);
            }

            return this;
        }

        /**
         * Change zoom so it fits the size or the entire world in the viewport
         *
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @param {number} [width=this.worldWidth] desired width
         * @param {number} [height=this.worldHeight] desired height
         * @returns {Viewport} this
         */
        fit(center, width = this.worldWidth, height = this.worldHeight)
        {
            let save;

            if (center)
            {
                save = this.center;
            }

            this.scale.x = this.screenWidth / width;
            this.scale.y = this.screenHeight / height;

            if (this.scale.x < this.scale.y)
            {
                this.scale.y = this.scale.x;
            }
            else
            {
                this.scale.x = this.scale.y;
            }
            const clampZoom = this.plugins.get('clamp-zoom', true);

            if (clampZoom)
            {
                clampZoom.clamp();
            }
            if (center && save)
            {
                this.moveCenter(save);
            }

            return this;
        }

        // eslint-disable-next-line
        // @ts-ignore
        set visible(value)
        {
            if (!value)
            {
                this.input.clear();
            }

            super.visible = value;
        }

        /**
         * Zoom viewport to specific value.
         *
         * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */
        setZoom(scale, center)
        {
            let save;

            if (center)
            {
                save = this.center;
            }
            this.scale.set(scale);
            const clampZoom = this.plugins.get('clamp-zoom', true);

            if (clampZoom)
            {
                clampZoom.clamp();
            }
            if (center && save)
            {
                this.moveCenter(save);
            }

            return this;
        }

        /**
         * Zoom viewport by a certain percent (in both x and y direction).
         *
         * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */
        zoomPercent(percent, center)
        {
            return this.setZoom(this.scale.x + this.scale.x * percent, center);
        }

        /**
         * Zoom viewport by increasing/decreasing width by a certain number of pixels.
         *
         * @param {number} change in pixels
         * @param {boolean} [center] maintain the same center of the screen after zoom
         * @return {Viewport} this
         */
        zoom(change, center)
        {
            this.fitWidth(change + this.worldScreenWidth, center);

            return this;
        }

        /** Changes scale of viewport and maintains center of viewport */
        get scaled()
        {
            return this.scale.x;
        }
        set scaled(scale)
        {
            this.setZoom(scale, true);
        }

        /**
         * @param {SnapZoomOptions} options
         */
        snapZoom(options)
        {
            this.plugins.add('snap-zoom', new SnapZoom(this, options));

            return this;
        }

        /** Is container out of world bounds */
        OOB()






        {
            return {
                left: this.left < 0,
                right: this.right > this.worldWidth,
                top: this.top < 0,
                bottom: this.bottom > this.worldHeight,
                cornerPoint: new math.Point(
                    this.worldWidth * this.scale.x - this.screenWidth,
                    this.worldHeight * this.scale.y - this.screenHeight
                )
            };
        }

        /** World coordinates of the right edge of the screen */
        get right()
        {
            return -this.x / this.scale.x + this.worldScreenWidth;
        }
        set right(value)
        {
            this.x = -value * this.scale.x + this.screenWidth;
            this.plugins.reset();
        }

        /** World coordinates of the left edge of the screen */
        get left()
        {
            return -this.x / this.scale.x;
        }
        set left(value)
        {
            this.x = -value * this.scale.x;
            this.plugins.reset();
        }

        /** World coordinates of the top edge of the screen */
        get top()
        {
            return -this.y / this.scale.y;
        }
        set top(value)
        {
            this.y = -value * this.scale.y;
            this.plugins.reset();
        }

        /** World coordinates of the bottom edge of the screen */
        get bottom()
        {
            return -this.y / this.scale.y + this.worldScreenHeight;
        }
        set bottom(value)
        {
            this.y = -value * this.scale.y + this.screenHeight;
            this.plugins.reset();
        }

        /**
         * Determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
         */
        get dirty()
        {
            return !!this._dirty;
        }
        set dirty(value)
        {
            this._dirty = value;
        }

        /**
         * Permanently changes the Viewport's hitArea
         *
         * NOTE: if not set then hitArea = PIXI.Rectangle(Viewport.left, Viewport.top, Viewport.worldScreenWidth, Viewport.worldScreenHeight)
         */
        get forceHitArea()
        {
            return this._forceHitArea;
        }
        set forceHitArea(value)
        {
            if (value)
            {
                this._forceHitArea = value;
                this.hitArea = value;
            }
            else
            {
                this._forceHitArea = null;
                this.hitArea = new math.Rectangle(0, 0, this.worldWidth, this.worldHeight);
            }
        }

        /**
         * Enable one-finger touch to drag
         *
         * NOTE: if you expect users to use right-click dragging, you should enable `viewport.options.disableOnContextMenu`
         * to avoid the context menu popping up on each right-click drag.
         *
         * @param {DragOptions} [options]
         * @returns {Viewport} this
         */
         drag(options)
        {
            this.plugins.add('drag', new Drag(this, options));

            return this;
        }

        /**
         * Clamp to world boundaries or other provided boundaries
         *
         * NOTES:
         *   clamp is disabled if called with no options; use { direction: 'all' } for all edge clamping
         *   screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         *
         * @param {ClampOptions} [options]
         * @returns {Viewport} this
         */
         clamp(options)
        {
            this.plugins.add('clamp', new Clamp(this, options));

            return this;
        }

        /**
         * Decelerate after a move
         *
         * NOTE: this fires 'moved' event during deceleration
         *
         * @param {DecelerateOptions} [options]
         * @return {Viewport} this
         */
         decelerate(options)
        {
            this.plugins.add('decelerate', new Decelerate(this, options));

            return this;
        }

        /**
         * Bounce on borders
         * NOTES:
         *    screenWidth, screenHeight, worldWidth, and worldHeight needs to be set for this to work properly
         *    fires 'moved', 'bounce-x-start', 'bounce-y-start', 'bounce-x-end', and 'bounce-y-end' events
         * @param {object} [options]
         * @param {string} [options.sides=all] all, horizontal, vertical, or combination of top, bottom, right, left (e.g., 'top-bottom-right')
         * @param {number} [options.friction=0.5] friction to apply to decelerate if active
         * @param {number} [options.time=150] time in ms to finish bounce
         * @param {object} [options.bounceBox] use this bounceBox instead of (0, 0, viewport.worldWidth, viewport.worldHeight)
         * @param {number} [options.bounceBox.x=0]
         * @param {number} [options.bounceBox.y=0]
         * @param {number} [options.bounceBox.width=viewport.worldWidth]
         * @param {number} [options.bounceBox.height=viewport.worldHeight]
         * @param {string|function} [options.ease=easeInOutSine] ease function or name (see http://easings.net/ for supported names)
         * @param {string} [options.underflow=center] (top/bottom/center and left/right/center, or center) where to place world if too small for screen
         * @return {Viewport} this
         */
         bounce(options)
        {
            this.plugins.add('bounce', new Bounce(this, options));

            return this;
        }

        /**
         * Enable pinch to zoom and two-finger touch to drag
         *
         * @param {PinchOptions} [options]
         * @return {Viewport} this
         */
         pinch(options)
        {
            this.plugins.add('pinch', new Pinch(this, options));

            return this;
        }

        /**
         * Snap to a point
         *
         * @param {number} x
         * @param {number} y
         * @param {SnapOptions} [options]
         * @return {Viewport} this
         */
         snap(x, y, options)
        {
            this.plugins.add('snap', new Snap(this, x, y, options));

            return this;
        }

        /**
         * Follow a target
         *
         * NOTES:
         *    uses the (x, y) as the center to follow; for PIXI.Sprite to work properly, use sprite.anchor.set(0.5)
         *    options.acceleration is not perfect as it doesn't know the velocity of the target
         *    it adds acceleration to the start of movement and deceleration to the end of movement when the target is stopped
         *    fires 'moved' event
         * @param {PIXI.DisplayObject} target to follow
         * @param {FollowOptions} [options]
         * @returns {Viewport} this
         */
         follow(target, options)
        {
            this.plugins.add('follow', new Follow(this, target, options));

            return this;
        }

        /**
         * Zoom using mouse wheel
         *
         * @param {WheelOptions} [options]
         * @return {Viewport} this
         */
         wheel(options)
        {
            this.plugins.add('wheel', new Wheel(this, options));

            return this;
        }

        /**
         * Animate the position and/or scale of the viewport
         *
         * @param {AnimateOptions} options
         * @returns {Viewport} this
         */
         animate(options)
        {
            this.plugins.add('animate', new Animate(this, options));

            return this;
        }

        /**
         * Enable clamping of zoom to constraints
         *
         * The minWidth/Height settings are how small the world can get (as it would appear on the screen)
         * before clamping. The maxWidth/maxHeight is how larger the world can scale (as it would appear on
         * the screen) before clamping.
         *
         * For example, if you have a world size of 1000 x 1000 and a screen size of 100 x 100, if you set
         * minWidth/Height = 100 then the world will not be able to zoom smaller than the screen size (ie,
         * zooming out so it appears smaller than the screen). Similarly, if you set maxWidth/Height = 100
         * the world will not be able to zoom larger than the screen size (ie, zooming in so it appears
         * larger than the screen).
         *
         * @param {ClampZoomOptions} [options]
         * @return {Viewport} this
         */
         clampZoom(options)
        {
            this.plugins.add('clamp-zoom', new ClampZoom(this, options));

            return this;
        }

        /**
         * Scroll viewport when mouse hovers near one of the edges or radius-distance from center of screen.
         *
         * NOTE: fires 'moved' event
         *
         * @param {MouseEdgesOptions} [options]
         */
         mouseEdges(options)
        {
            this.plugins.add('mouse-edges', new MouseEdges(this, options));

            return this;
        }

        /** Pause viewport (including animation updates such as decelerate) */
        get pause()
        {
            return !!this._pause;
        }
        set pause(value)
        {
            this._pause = value;

            this.lastViewport = null;
            this.moving = false;
            this.zooming = false;

            if (value)
            {
                this.input.pause();
            }
        }

        /**
         * Move the viewport so the bounding box is visible
         *
         * @param x - left
         * @param y - top
         * @param width
         * @param height
         * @param resizeToFit - Resize the viewport so the box fits within the viewport
         */
         ensureVisible(x, y, width, height, resizeToFit)
        {
            if (resizeToFit && (width > this.worldScreenWidth || height > this.worldScreenHeight))
            {
                this.fit(true, width, height);
                this.emit('zoomed', { viewport: this, type: 'ensureVisible' });
            }
            let moved = false;

            if (x < this.left)
            {
                this.left = x;
                moved = true;
            }
            else if (x + width > this.right)
            {
                this.right = x + width;
                moved = true;
            }
            if (y < this.top)
            {
                this.top = y;
                moved = true;
            }
            else if (y + height > this.bottom)
            {
                this.bottom = y + height;
                moved = true;
            }
            if (moved)
            {
                this.emit('moved', { viewport: this, type: 'ensureVisible' });
            }
        }
    }

    /**
     * Fires after a mouse or touch click
     * @event Viewport#clicked
     * @type {object}
     * @property {PIXI.Point} screen
     * @property {PIXI.Point} world
     * @property {Viewport} viewport
     */

    /**
     * Fires when a drag starts
     * @event Viewport#drag-start
     * @type {object}
     * @property {PIXI.Point} screen
     * @property {PIXI.Point} world
     * @property {Viewport} viewport
     */

    /**
     * Fires when a drag ends
     * @event Viewport#drag-end
     * @type {object}
     * @property {PIXI.Point} screen
     * @property {PIXI.Point} world
     * @property {Viewport} viewport
     */

    /**
     * Fires when a pinch starts
     * @event Viewport#pinch-start
     * @type {Viewport}
     */

    /**
     * Fires when a pinch end
     * @event Viewport#pinch-end
     * @type {Viewport}
     */

    /**
     * Fires when a snap starts
     * @event Viewport#snap-start
     * @type {Viewport}
     */

    /**
     * Fires when a snap ends
     * @event Viewport#snap-end
     * @type {Viewport}
     */

    /**
     * Fires when a snap-zoom starts
     * @event Viewport#snap-zoom-start
     * @type {Viewport}
     */

    /**
     * Fires when a snap-zoom ends
     * @event Viewport#snap-zoom-end
     * @type {Viewport}
     */

    /**
     * Fires when a bounce starts in the x direction
     * @event Viewport#bounce-x-start
     * @type {Viewport}
     */

    /**
     * Fires when a bounce ends in the x direction
     * @event Viewport#bounce-x-end
     * @type {Viewport}
     */

    /**
     * Fires when a bounce starts in the y direction
     * @event Viewport#bounce-y-start
     * @type {Viewport}
     */

    /**
     * Fires when a bounce ends in the y direction
     * @event Viewport#bounce-y-end
     * @type {Viewport}
     */

    /**
     * Fires when for a mouse wheel event
     * @event Viewport#wheel
     * @type {object}
     * @property {object} wheel
     * @property {number} wheel.dx
     * @property {number} wheel.dy
     * @property {number} wheel.dz
     * @property {Viewport} viewport
     */

    /**
     * Fires when a wheel-scroll occurs
     * @event Viewport#wheel-scroll
     * @type {Viewport}
     */

    /**
     * Fires when a mouse-edge starts to scroll
     * @event Viewport#mouse-edge-start
     * @type {Viewport}
     */

    /**
     * Fires when the mouse-edge scrolling ends
     * @event Viewport#mouse-edge-end
     * @type {Viewport}
     */

    /**
     * Fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
     * @event Viewport#moved
     * @type {object}
     * @property {Viewport} viewport
     * @property {string} type - (drag, snap, pinch, follow, bounce-x, bounce-y,
     *  clamp-x, clamp-y, decelerate, mouse-edges, wheel, ensureVisible)
     */

    /**
     * Fires when viewport moves through UI interaction, deceleration, ensureVisible, or follow
     * @event Viewport#zoomed
     * @type {object}
     * @property {Viewport} viewport
     * @property {string} type (drag-zoom, pinch, wheel, clamp-zoom, ensureVisible)
     */

    /**
     * Fires when viewport stops moving
     * @event Viewport#moved-end
     * @type {Viewport}
     */

    /**
     * Fires when viewport stops zooming
     * @event Viewport#zoomed-end
     * @type {Viewport}
     */

    /**
    * Fires at the end of an update frame
    * @event Viewport#frame-end
    * @type {Viewport}
    */

    exports.Animate = Animate;
    exports.Bounce = Bounce;
    exports.Clamp = Clamp;
    exports.ClampZoom = ClampZoom;
    exports.Decelerate = Decelerate;
    exports.Drag = Drag;
    exports.Follow = Follow;
    exports.InputManager = InputManager;
    exports.MouseEdges = MouseEdges;
    exports.Pinch = Pinch;
    exports.Plugin = Plugin;
    exports.PluginManager = PluginManager;
    exports.Snap = Snap;
    exports.SnapZoom = SnapZoom;
    exports.Viewport = Viewport;
    exports.Wheel = Wheel;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
if (typeof pixi_viewport !== 'undefined') { Object.assign(this.PIXI, pixi_viewport); }
>>>>>>> b5c50cc161419e77dceaa92e8463d9df32f9748f
//# sourceMappingURL=viewport.js.map
