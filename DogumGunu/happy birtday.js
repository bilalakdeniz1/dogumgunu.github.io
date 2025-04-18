<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Doğum Günü</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: black;
    }
    canvas {
      display: block;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <script>
    const c = document.getElementById("c");
    let w = (c.width = window.innerWidth),
        h = (c.height = window.innerHeight),
        ctx = c.getContext("2d"),
        hw = w / 2,
        hh = h / 2;

    const opts = {
      strings: ["İYİKİ", "DOĞDUN", "NİLÜFER"],
      charSize: 30,
      charSpacing: 35,
      lineHeight: 40,

      cx: w / 2,
      cy: h / 2,

      fireworkPrevPoints: 10,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 1200,
      fireworkBaseReachTime: 80,
      fireworkAddedReachTime: 60,
      fireworkCircleBaseSize: 10,
      fireworkCircleAddedSize: 5,
      fireworkCircleBaseTime: 90,
      fireworkCircleAddedTime: 40,
      fireworkCircleFadeBaseTime: 40,
      fireworkCircleFadeAddedTime: 30,
      fireworkBaseShards: 4,
      fireworkAddedShards: 2,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 1.2,
      fireworkShardAddedVel: 0.5,
      fireworkShardBaseSize: 2,
      fireworkShardAddedSize: 2,
      gravity: 0.015,
      upFlow: -0.02,
      letterContemplatingWaitTime: 1000,
      balloonSpawnTime: 100,
      balloonBaseInflateTime: 40,
      balloonAddedInflateTime: 20,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: 0.1,
      balloonAddedVel: 0.1,
      balloonBaseRadian: -(Math.PI / 2 - 0.5),
      balloonAddedRadian: -1,
    };

    const calc = {
      totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length)),
    };

    const Tau = Math.PI * 2;
    const TauQuarter = Tau / 4;
    const letters = [];

    ctx.font = opts.charSize + "px Verdana";

    class Firework {
      constructor(x, y) {
        this.x = x;
        this.y = h;
        this.tx = x;
        this.ty = y;
        this.prevPoints = [[x, h]];
        this.lineWidth = opts.fireworkBaseLineWidth + Math.random() * opts.fireworkAddedLineWidth;
        this.reachTime = opts.fireworkBaseReachTime + Math.random() * opts.fireworkAddedReachTime;
        this.dead = false;
        this.tick = 0;
      }

      update() {
        this.tick++;
        const progress = this.tick / this.reachTime;
        const x = this.x + (this.tx - this.x) * progress;
        const y = this.y + (this.ty - this.y) * progress;
        this.prevPoints.push([x, y]);
        if (this.prevPoints.length > opts.fireworkPrevPoints)
          this.prevPoints.shift();
        if (this.tick >= this.reachTime) {
          this.dead = true;
          fireworks.push(new FireworkCircle(this.tx, this.ty));
          for (let i = 0; i < opts.fireworkBaseShards + Math.random() * opts.fireworkAddedShards; ++i)
            fireworks.push(new FireworkShard(this.tx, this.ty));
        }
      }

      draw() {
        ctx.beginPath();
        let first = true;
        for (const point of this.prevPoints) {
          if (first) {
            ctx.moveTo(point[0], point[1]);
            first = false;
          } else ctx.lineTo(point[0], point[1]);
        }
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
      }
    }

    class FireworkCircle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = opts.fireworkCircleBaseSize + Math.random() * opts.fireworkCircleAddedSize;
        this.time = opts.fireworkCircleBaseTime + Math.random() * opts.fireworkCircleAddedTime;
        this.tick = 0;
        this.fadeTime = opts.fireworkCircleFadeBaseTime + Math.random() * opts.fireworkCircleFadeAddedTime;
      }

      update() {
        this.tick++;
      }

      draw() {
        const opacity = 1 - this.tick / this.fadeTime;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * (this.tick / this.time), 0, Tau);
        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      get dead() {
        return this.tick >= this.fadeTime;
      }
    }

    class FireworkShard {
      constructor(x, y) {
        const rad = Math.random() * Tau;
        const vel = opts.fireworkShardBaseVel + Math.random() * opts.fireworkShardAddedVel;
        this.vx = Math.cos(rad) * vel;
        this.vy = Math.sin(rad) * vel;
        this.x = x;
        this.y = y;
        this.prevPoints = [[x, y]];
        this.size = opts.fireworkShardBaseSize + Math.random() * opts.fireworkShardAddedSize;
        this.gravity = opts.gravity;
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.prevPoints.push([this.x, this.y]);
        if (this.prevPoints.length > opts.fireworkShardPrevPoints)
          this.prevPoints.shift();
      }

      draw() {
        ctx.beginPath();
        let first = true;
        for (const point of this.prevPoints) {
          if (first) {
            ctx.moveTo(point[0], point[1]);
            first = false;
          } else ctx.lineTo(point[0], point[1]);
        }
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = this.size;
        ctx.stroke();
      }

      get dead() {
        return this.y > h;
      }
    }

    class Balloon {
      constructor(x) {
        this.x = x;
        this.y = h + 20;
        this.vel = opts.balloonBaseVel + Math.random() * opts.balloonAddedVel;
        this.size = opts.balloonBaseSize + Math.random() * opts.balloonAddedSize;
        this.inflated = false;
        this.inflation = 0;
        this.inflateTime = opts.balloonBaseInflateTime + Math.random() * opts.balloonAddedInflateTime;
      }

      update() {
        if (!this.inflated) {
          this.inflation++;
          if (this.inflation >= this.inflateTime) this.inflated = true;
        } else {
          this.y -= this.vel;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Tau);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      }

      get dead() {
        return this.y + this.size < 0;
      }
    }

    const fireworks = [];
    const balloons = [];

    let lastSpawn = 0;
    let lastBalloon = 0;

    function anim() {
      window.requestAnimationFrame(anim);

      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, w, h);

      const now = Date.now();

      if (now - lastSpawn > opts.fireworkSpawnTime) {
        fireworks.push(new Firework(
          opts.cx - calc.totalWidth / 2 + Math.random() * calc.totalWidth,
          opts.cy - opts.lineHeight * Math.floor(Math.random() * opts.strings.length)
        ));
        lastSpawn = now;
      }

      if (now - lastBalloon > opts.balloonSpawnTime) {
        balloons.push(new Balloon(Math.random() * w));
        lastBalloon = now;
      }

      fireworks.forEach((f, i) => {
        f.update();
        f.draw();
        if (f.dead) fireworks.splice(i, 1);
      });

      balloons.forEach((b, i) => {
        b.update();
        b.draw();
        if (b.dead) balloons.splice(i, 1);
      });
    }

    anim();

    window.addEventListener("resize", () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
      opts.cx = w / 2;
      opts.cy = h / 2;
      hw = w / 2;
      hh = h / 2;
    });
  </script>
</body>
</html>
