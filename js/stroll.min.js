/*!
 * stroll.js 1.2 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Copyright (C) 2012 Hakim El Hattab, http://hakim.se
 */
(function(){var h=500;
var b=!!("ontouchstart" in window);var j=[];var d=false;function i(){if(d){requestAnimFrame(i);for(var n=0,m=j.length;n<m;n++){j[n].update();}}}function l(n,m){if(!n.nodeName||/^(ul|li)$/i.test(n.nodeName)===false){return false;
}else{if(e(n)){g(n);}}var o=b?new c(n):new k(n);if(m&&m.live){o.syncInterval=setInterval(function(){o.sync.call(o);},h);}o.sync();j.push(o);if(j.length===1){d=true;
i();}}function g(n){for(var m=0;m<j.length;m++){var o=j[m];if(o.element==n){o.destroy();j.splice(m,1);m--;}}if(j.length===0){d=false;}}function e(o){for(var n=0,m=j.length;
n<m;n++){if(j[n].element==o){return true;}}return false;}function f(q,r,o){var p,m;if(typeof q==="string"){var n=document.querySelectorAll(q);for(p=0,m=n.length;
p<m;p++){r.call(null,n[p],o);}}else{if(typeof q==="object"&&typeof q.length==="number"){for(p=0,m=q.length;p<m;p++){r.call(null,q[p],o);}}else{if(q.nodeName){r.call(null,q,o);
}else{throw"Stroll target was of unexpected type.";}}}}function a(){return !!document.body.classList;}function k(m){this.element=m;}k.prototype.sync=function(){this.items=Array.prototype.slice.apply(this.element.children);
this.listHeight=this.element.offsetHeight;for(var n=0,m=this.items.length;n<m;n++){var o=this.items[n];o._offsetHeight=o.offsetHeight;o._offsetTop=o.offsetTop;
o._offsetBottom=o._offsetTop+o._offsetHeight;o._state="";}this.update(true);};k.prototype.update=function(q){var r=this.element.pageYOffset||this.element.scrollTop,p=r+this.listHeight;
if(r!==this.lastTop||q){this.lastTop=r;for(var n=0,m=this.items.length;n<m;n++){var o=this.items[n];if(o._offsetBottom<r){if(o._state!=="past"){o._state="past";
o.classList.add("past");o.classList.remove("future");}}else{if(o._offsetTop>p){if(o._state!=="future"){o._state="future";o.classList.add("future");o.classList.remove("past");
}}else{if(o._state){if(o._state==="past"){o.classList.remove("past");}if(o._state==="future"){o.classList.remove("future");}o._state="";}}}}}};k.prototype.destroy=function(){clearInterval(this.syncInterval);
for(var n=0,m=this.items.length;n<m;n++){var o=this.items[n];o.classList.remove("past");o.classList.remove("future");}};function c(m){this.element=m;this.element.style.overflow="hidden";
this.top={value:0,natural:0};this.touch={value:0,offset:0,start:0,previous:0,lastMove:Date.now(),accellerateTimeout:-1,isAccellerating:false,isActive:false};
this.velocity=0;}c.prototype=new k();c.prototype.sync=function(){this.items=Array.prototype.slice.apply(this.element.children);this.listHeight=this.element.offsetHeight;
var o;for(var n=0,m=this.items.length;n<m;n++){o=this.items[n];o._offsetHeight=o.offsetHeight;o._offsetTop=o.offsetTop;o._offsetBottom=o._offsetTop+o._offsetHeight;
o._state="";o.style.opacity=1;}this.top.natural=this.element.scrollTop;this.top.value=this.top.natural;this.top.max=o._offsetBottom-this.listHeight;this.update(true);
this.bind();};c.prototype.bind=function(){var m=this;this.touchStartDelegate=function(n){m.onTouchStart(n);};this.touchMoveDelegate=function(n){m.onTouchMove(n);
};this.touchEndDelegate=function(n){m.onTouchEnd(n);};this.element.addEventListener("touchstart",this.touchStartDelegate,false);this.element.addEventListener("touchmove",this.touchMoveDelegate,false);
this.element.addEventListener("touchend",this.touchEndDelegate,false);};c.prototype.onTouchStart=function(n){n.preventDefault();if(n.touches.length===1){this.touch.isActive=true;
this.touch.start=n.touches[0].clientY;this.touch.previous=this.touch.start;this.touch.value=this.touch.start;this.touch.offset=0;if(this.velocity){this.touch.isAccellerating=true;
var m=this;this.touch.accellerateTimeout=setTimeout(function(){m.touch.isAccellerating=false;m.velocity=0;},500);}else{this.velocity=0;}}};c.prototype.onTouchMove=function(n){if(n.touches.length===1){var m=this.touch.value;
this.touch.value=n.touches[0].clientY;this.touch.lastMove=Date.now();var o=(this.touch.value>this.touch.previous&&this.velocity<0)||(this.touch.value<this.touch.previous&&this.velocity>0);
if(this.touch.isAccellerating&&o){clearInterval(this.touch.accellerateTimeout);this.velocity+=(this.touch.previous-this.touch.value)/10;}else{this.velocity=0;
this.touch.isAccellerating=false;this.touch.offset=Math.round(this.touch.start-this.touch.value);}this.touch.previous=m;}};c.prototype.onTouchEnd=function(n){var m=this.touch.start-this.touch.value;
if(!this.touch.isAccellerating){this.velocity=(this.touch.start-this.touch.value)/10;}if(Date.now()-this.touch.lastMove>200||Math.abs(this.touch.previous-this.touch.value)<5){this.velocity=0;
}this.top.value+=this.touch.offset;this.touch.offset=0;this.touch.start=0;this.touch.value=0;this.touch.isActive=false;this.touch.isAccellerating=false;
clearInterval(this.touch.accellerateTimeout);if(Math.abs(this.velocity)>4||Math.abs(m)>10){n.preventDefault();}};c.prototype.update=function(q){var r=this.top.value+this.velocity+this.touch.offset;
if(this.velocity||this.touch.offset){this.element.scrollTop=r;r=Math.max(0,Math.min(this.element.scrollTop,this.top.max));this.top.value=r-this.touch.offset;
}if(!this.touch.isActive||this.touch.isAccellerating){this.velocity*=0.95;}if(Math.abs(this.velocity)<0.15){this.velocity=0;}if(r!==this.top.natural||q){this.top.natural=r;
this.top.value=r-this.touch.offset;var p=r+this.listHeight;for(var n=0,m=this.items.length;n<m;n++){var o=this.items[n];if(o._offsetBottom<r){if(this.velocity<=0&&o._state!=="past"){o.classList.add("past");
o._state="past";}}else{if(o._offsetTop>p){if(this.velocity>=0&&o._state!=="future"){o.classList.add("future");o._state="future";}}else{if(o._state){if(o._state==="past"){o.classList.remove("past");
}if(o._state==="future"){o.classList.remove("future");}o._state="";}}}}}};c.prototype.destroy=function(){k.prototype.destroy.apply(this);this.element.removeEventListener("touchstart",this.touchStartDelegate,false);
this.element.removeEventListener("touchmove",this.touchMoveDelegate,false);this.element.removeEventListener("touchend",this.touchEndDelegate,false);};window.stroll={bind:function(n,m){if(a()){f(n,l,m);
}},unbind:function(m){if(a()){f(m,g);}}};window.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(m){window.setTimeout(m,1000/60);
};})();})();