/* ============================================================
   PARTICLE SYSTEM — Full-Page Background, Wine/Maroon Theme
   ============================================================ */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 130 };
    this.particleCount = 50;
    this.connectionDistance = 140;
    this.animationId = null;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.createParticles();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(this.particleCount, Math.floor((this.canvas.width * this.canvas.height) / 20000));
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(this.canvas));
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          const opacity = (1 - dist / this.connectionDistance) * 0.12;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(153, 0, 17, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  drawMouseConnections() {
    if (this.mouse.x === null) return;
    for (const p of this.particles) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.mouse.radius) {
        const opacity = (1 - dist / this.mouse.radius) * 0.25;
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(230, 0, 0, ${opacity})`;
        this.ctx.lineWidth = 0.7;
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      p.update(this.canvas, this.mouse);
      p.draw(this.ctx);
    }

    this.drawConnections();
    this.drawMouseConnections();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

class Particle {
  constructor(canvas) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 1.8 + 0.4;
    this.baseSpeedX = (Math.random() - 0.5) * 0.3;
    this.baseSpeedY = (Math.random() - 0.5) * 0.3;
    this.speedX = this.baseSpeedX;
    this.speedY = this.baseSpeedY;
    this.opacity = Math.random() * 0.4 + 0.08;
  }

  update(canvas, mouse) {
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.speedX += Math.cos(angle) * force * 0.15;
        this.speedY += Math.sin(angle) * force * 0.15;
      }
    }

    this.speedX += (this.baseSpeedX - this.speedX) * 0.02;
    this.speedY += (this.baseSpeedY - this.speedY) * 0.02;

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(153, 0, 17, ${this.opacity})`;
    ctx.fill();
  }
}

// Initialize when DOM is ready — full page background
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('particles-bg');
});
