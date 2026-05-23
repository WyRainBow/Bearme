(function() {
  function init() {
    try {
      var ipcRenderer = require('electron').ipcRenderer;

      var canvas = document.getElementById('codex-rings-canvas');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      var W = 300, H = 300;
      var CX = W / 2, CY = H / 2;

      var dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      var usageData = null;
      var phase = 0;
      var isHovering = false;
      var isVisible = false;

      var OUTER_R = 120;
      var INNER_R = 106;
      var OUTER_LW = 6;
      var INNER_LW = 4.5;
      var TICK_COUNT = 12;
      var GLINT_SIZE = 3.6;

      var COLORS = {
        green:  { r: 61,  g: 235, b: 189, a: 0.96 },
        amber:  { r: 255, g: 173, b: 51,  a: 0.96 },
        red:    { r: 255, g: 66,  b: 56,  a: 0.96 },
        blue:   { r: 92,  g: 179, b: 255, a: 0.90 },
        dim:    { r: 180, g: 180, b: 180, a: 0.18 }
      };

      function ringColor(remaining, role) {
        if (role === 'secondary') return COLORS.blue;
        if (remaining <= 12) return COLORS.red;
        if (remaining <= 30) return COLORS.amber;
        return COLORS.green;
      }

      function calcUrgency(remaining) {
        return Math.min(Math.max((45 - remaining) / 45, 0), 1);
      }

      function rgba(c, alpha) {
        var a = alpha != null ? alpha : c.a;
        return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
      }

      function formatCountdown(seconds) {
        if (seconds == null || seconds <= 0) return '';
        var d = Math.floor(seconds / 86400);
        var h = Math.floor((seconds % 86400) / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        if (d > 0) return d + 'd ' + h + 'h';
        if (h > 0) return h + 'h ' + m + 'm';
        return m + 'm';
      }

      function roundedRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      function clear() {
        ctx.clearRect(0, 0, W, H);
      }

      function drawHalo(u) {
        if (u <= 0) return;
        var breathe = (Math.sin(phase * 2 * Math.PI) + 1) / 2;
        var radius = OUTER_R + 20 + u * breathe * 8;
        var grad = ctx.createRadialGradient(CX, CY, OUTER_R - 10, CX, CY, radius);
        grad.addColorStop(0, rgba(COLORS.amber, 0.06 * u));
        grad.addColorStop(1, rgba(COLORS.amber, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(CX, CY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawRing(radius, lineWidth, remaining, role, u) {
        var color = ringColor(remaining, role);
        var breathe = (Math.sin(phase * 2 * Math.PI) + 1) / 2;
        var pulse = 1 + u * 0.025 * breathe;
        var r = radius * pulse;
        var start = -Math.PI / 2;
        var frac = Math.max(remaining / 100, 0.018);
        var end = start + frac * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(CX, CY, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.22)';
        ctx.lineWidth = lineWidth + 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.save();
        ctx.shadowColor = rgba(color, 0.3);
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(CX, CY, r, start, end);
        ctx.strokeStyle = rgba(color, 0.3);
        ctx.lineWidth = lineWidth + 6;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = rgba(color, 0.6);
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(CX, CY, r, start, end);
        ctx.strokeStyle = rgba(color);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        var gx = CX + r * Math.cos(end);
        var gy = CY + r * Math.sin(end);
        var glintGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLINT_SIZE * 2);
        glintGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
        glintGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glintGrad;
        ctx.beginPath();
        ctx.arc(gx, gy, GLINT_SIZE * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawTickMarks() {
        for (var i = 0; i < TICK_COUNT; i++) {
          var angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
          var tickInner = OUTER_R + 5;
          var tickOuter = OUTER_R + (i % 3 === 0 ? 12 : 8);
          var x1 = CX + tickInner * Math.cos(angle);
          var y1 = CY + tickInner * Math.sin(angle);
          var x2 = CX + tickOuter * Math.cos(angle);
          var y2 = CY + tickOuter * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(255,255,255,' + (i % 3 === 0 ? 0.15 : 0.08) + ')';
          ctx.lineWidth = i % 3 === 0 ? 1.5 : 1;
          ctx.stroke();
        }
      }

      function drawOrbitingGlint() {
        var angle = phase * Math.PI * 2 * 1.5 - Math.PI / 2;
        var x = CX + OUTER_R * Math.cos(angle);
        var y = CY + OUTER_R * Math.sin(angle);
        var grad = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grad.addColorStop(0, 'rgba(255,255,255,0.6)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawTooltip(bucket, yOff) {
        if (!bucket) return;
        var text = Math.round(bucket.remainingPercent) + '%';
        if (bucket.countdownSeconds != null) text += ' (' + formatCountdown(bucket.countdownSeconds) + ')';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
        var tw = ctx.measureText(text).width;
        var px = 8;
        var bx = CX - tw / 2 - px;
        var by = CY + yOff;
        var bw = tw + px * 2;
        var bh = 18;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        roundedRect(bx, by, bw, bh, 4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(text, bx + px, by + 13);
      }

      function drawUsageNumbers(primaryRemaining, secondaryRemaining) {
        var labelY = CY - 8;
        var valueY = CY + 16;
        var primaryText = Math.round(primaryRemaining) + '%';
        var secondaryText = Math.round(secondaryRemaining) + '%';

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        roundedRect(CX - 38, CY - 25, 76, 50, 10);
        ctx.fill();

        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillText('Codex', CX, CY - 18);

        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.96)';
        ctx.fillText(primaryText, CX - 18, labelY);

        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.68)';
        ctx.fillText('/', CX, labelY);

        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.96)';
        ctx.fillText(secondaryText, CX + 20, labelY);

        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.fillText('5h / Weekly', CX, valueY);
        ctx.restore();
      }

      function draw() {
        clear();
        if (!isVisible) return;

        if (!usageData || (!usageData.primary && !usageData.secondary)) {
          // Draw dim placeholder
          [OUTER_R, INNER_R].forEach(function(r, i) {
            ctx.beginPath();
            ctx.arc(CX, CY, r, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(COLORS.dim);
            ctx.lineWidth = i === 0 ? OUTER_LW : INNER_LW;
            ctx.stroke();
          });
          return;
        }

        var pRem = (usageData.primary && usageData.primary.remainingPercent != null) ? usageData.primary.remainingPercent : 100;
        var sRem = (usageData.secondary && usageData.secondary.remainingPercent != null) ? usageData.secondary.remainingPercent : 100;
        var u = Math.max(calcUrgency(pRem), calcUrgency(sRem));

        drawHalo(u);
        if (usageData.primary) drawRing(OUTER_R, OUTER_LW, pRem, 'primary', u);
        if (usageData.secondary) drawRing(INNER_R, INNER_LW, sRem, 'secondary', calcUrgency(sRem));
        drawTickMarks();
        drawOrbitingGlint();
        drawUsageNumbers(pRem, sRem);

        if (isHovering) {
          drawTooltip(usageData.primary, 42);
          drawTooltip(usageData.secondary, 62);
        }
      }

      var FPS = 30;
      var frameMs = 1000 / FPS;
      var lastFrame = 0;

      function loop(now) {
        requestAnimationFrame(loop);
        if (now - lastFrame < frameMs) return;
        lastFrame = now;
        phase += 1 / (FPS * 4.6);
        draw();
      }

      canvas.addEventListener('mousemove', function(e) {
        var rect = canvas.getBoundingClientRect();
        var dx = e.clientX - rect.left - CX;
        var dy = e.clientY - rect.top - CY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        isHovering = dist >= 80 && dist <= OUTER_R + 20;
      });

      canvas.addEventListener('mouseleave', function() { isHovering = false; });

      ipcRenderer.on('codex-usage-update', function(event, data) {
        usageData = data;
      });

      window.codexRings = {
        show: function() { isVisible = true; },
        hide: function() { isVisible = false; isHovering = false; }
      };

      requestAnimationFrame(loop);

    } catch (err) {
      console.error('codex-rings init error:', err);
    }
  }

  // Delay init to ensure DOM is ready and renderer.js has loaded first
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
