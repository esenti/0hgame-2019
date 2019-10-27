(function() {
 var DEBUG, before, c, clamp, collides, ctx, delta, draw, elapsed, keysDown, keysPressed, load, loading, now, ogre, setDelta, tick, update;

 var BULLET_SPEED = 150.0;
 var ENEMY_SPEED = 50.0;

 c = document.getElementById('draw');

 ctx = c.getContext('2d');

 delta = 0;

 now = 0;

 before = Date.now();

 elapsed = 0;

 loading = 0;

 // DEBUG = false;
 DEBUG = true;

 c.width = 800;

 c.height = 600;

 keysDown = {};

 keysPressed = {};

 images = [];

 audios = [];

 framesThisSecond = 0;
 fpsElapsed = 0;
 fps = 0

 popups = [];
 toBoom = 0.5;
 toToBoom = 0.5;

 click = null

 bullets = []
 enemies = []
 particles = []

 window.addEventListener("keydown", function(e) {
         keysDown[e.keyCode] = true;
         return keysPressed[e.keyCode] = true;
         }, false);

 window.addEventListener("keyup", function(e) {
         return delete keysDown[e.keyCode];
         }, false);

 c.addEventListener("click", function(e) {
   click = {
     'x': e.offsetX,
     'y': e.offsetY,
   }
 })

 setDelta = function() {
     now = Date.now();
     delta = (now - before) / 1000;
     return before = now;
 };

 if (!DEBUG) {
     console.log = function() {
         return null;
     };
 }

 ogre = false;

 clamp = function(v, min, max) {
     if (v < min) {
         return min;
     } else if (v > max) {
         return max;
     } else {
         return v;
     }
 };

 collides = function(a, b) {
     return a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
 };

 player = {
   x: 400 - 25,
   y: 500,
   w: 50,
   h: 100,
 }

 tick = function() {
     setDelta();
     elapsed += delta;
     update(delta);
     draw(delta);
     keysPressed = {};
     click = null;
     if (!ogre) {
         return window.requestAnimationFrame(tick);
     }
 };

 speed = 120;

 shoot = function(x, y) {
   dx = x - player.x;
   dy = y - player.y;

    mag = Math.sqrt(dx * dx + dy * dy);
    ndx = dx / mag;
    ndy = dy / mag;

   bullets.push({
     x: player.x + 25,
     y: player.y + 25,
     dx: ndx,
     dy: ndy,
     w: 5,
     h: 5,
   })
 }

 spawnEnemy = function() {
   y = Math.random() * 500;
   x = Math.random() < 0.5 ? -50 : 850;

   dx = player.x - x;
   dy = player.y - y;

    mag = Math.sqrt(dx * dx + dy * dy);
    ndx = dx / mag;
    ndy = dy / mag;

   enemies.push({
     x: x,
     y: y,
     dx: ndx,
     dy: ndy,
     w: 40,
     h: 30,
   })
 }

 update = function(delta) {

     framesThisSecond += 1;
     fpsElapsed += delta;

     if(fpsElapsed >= 1) {
        fps = framesThisSecond / fpsElapsed;
        framesThisSecond = fpsElapsed = 0;
     }

     if(Math.random() <= 0.05) {
       spawnEnemy();
     }

     for(var i = bullets.length - 1; i >= 0; i--) {
       bullets[i].x += bullets[i].dx * delta * BULLET_SPEED;
       bullets[i].y += bullets[i].dy * delta * BULLET_SPEED;
       for(var j = enemies.length - 1; j >= 0; j--) {
         if(collides(bullets[i], enemies[j])) {
           bullets.splice(i, 1);
           enemies.splice(j, 1);

           break;
         }
       }
     }

     for(var i = enemies.length - 1; i >= 0; i--) {
       enemies[i].x += enemies[i].dx * delta * ENEMY_SPEED;
       enemies[i].y += enemies[i].dy * delta * ENEMY_SPEED;

       if(collides(enemies[i], player)) {
         ogre = true;
       }

       particles.push({
         x: enemies[i].x + Math.random() * 16 - 8 + 20,
         y: enemies[i].y + Math.random() * 16 - 8 + 15,
         w: 1,
         h: 1,
         dx: enemies[i].dx,
         dy: enemies[i].dy,
         ttl: Math.random() * 8,
         speed: ENEMY_SPEED * 0.5,
       })
     }

     for(var i = particles.length - 1; i >= 0; i--) {
       particles[i].ttl -= delta;

       if(particles[i].ttl <= 0) {
         particles.splice(i, 1)
         continue;
       }

       particles[i].x += particles[i].dx * particles[i].speed * delta;
       particles[i].y += particles[i].dy * particles[i].speed * delta;
     }

     if(click) {
       shoot(click.x, click.y);
     }
 };

 draw = function(delta) {
     ctx.fillStyle = "#323fed";
     ctx.fillRect(0, 0, c.width, c.height);

     ctx.fillStyle = "#ffe536";

     particles.forEach(function(particle) {
       ctx.fillRect(particle.x, particle.y, particle.w, particle.h);
     })

     ctx.fillStyle = "#521515";

     bullets.forEach(function(bullet) {
       ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
     })

     ctx.drawImage(images['tree'], player.x, player.y);

     enemies.forEach(function(enemy) {
       ctx.drawImage(enemy.x < 400 ? images['lemur'] : images['lemurf'], enemy.x, enemy.y);
     })

     if(ogre) {
        ctx.fillStyle = "#000000";
        ctx.font = "80px Visitor";
        ctx.fillText("Eaten by lemurs!", 36, 300);
     }
 };

 (function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  vendor = _ref[_i];
  if (w.requestAnimationFrame) {
  break;
  }
  w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
  }
  if (!w.requestAnimationFrame) {
  targetTime = 0;
  return w.requestAnimationFrame = function(callback) {
  var currentTime;
  targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
  return w.setTimeout((function() {
          return callback(+(new Date));
          }), targetTime - currentTime);
  };
  }
 })();

 loadImage = function(name, callback) {
    var img = new Image()
    console.log('loading')
    loading += 1
    img.onload = function() {
        console.log('loaded ' + name)
        images[name] = img
        loading -= 1
        if(callback) {
            callback(name);
        }
    }

    img.src = 'img/' + name + '.png'
 }



    loadImage('tree');
    loadImage('lemur');
    loadImage('lemurf');

//  audios["jeb"] = new Audio('sounds/jeb.ogg');
//  audios["ultimate_jeb"] = new Audio("sounds/ultimate_jeb.ogg");

//  loadMusic("melody1");

 load = function() {
     if(loading) {
         window.requestAnimationFrame(load);
     } else {
         window.requestAnimationFrame(tick);
     }
 };

 load();

}).call(this);
