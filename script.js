// ===== Enhanced Interactions Script =====

document.addEventListener('DOMContentLoaded', () => {

  // ===== Sidebar Navigation =====
  const navLinks = document.querySelectorAll('.nav-link');
  const mobNavLinks = document.querySelectorAll('.mob-nav-link');
  const pageSections = document.querySelectorAll('.page-section');

  function switchSection(targetId) {
    navLinks.forEach(l => l.classList.remove('active'));
    mobNavLinks.forEach(l => l.classList.remove('active'));
    pageSections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === targetId) sec.classList.add('active');
    });
    navLinks.forEach(l => {
      if (l.getAttribute('data-target') === targetId) l.classList.add('active');
    });
    mobNavLinks.forEach(l => {
      if (l.getAttribute('data-target') === targetId) l.classList.add('active');
    });
    // Scroll to top of content
    window.scrollTo({ top: document.getElementById('page-body').offsetTop - 60, behavior: 'smooth' });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(e.target.getAttribute('data-target'));
    });
  });

  mobNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(e.currentTarget.getAttribute('data-target'));
    });
  });

  // ===== Timetable Day Tabs =====
  const dayTabs = document.querySelectorAll('.day-tab');
  const daySections = document.querySelectorAll('.timetable-day');

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetDay = tab.getAttribute('data-day');
      daySections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetDay) sec.classList.add('active');
      });
    });
  });

  // ===== FAQ Toggles =====
  const faqQuestions = document.querySelectorAll('.faq-q');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const answer = q.nextElementSibling;
      q.classList.toggle('open');
      answer.classList.toggle('open');
    });
  });
  
  // ===== Programme Items Toggle =====
  const progHeaders = document.querySelectorAll('.programme-item-header');
  progHeaders.forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      const arrow = h.querySelector('span');
      if (body.style.display === 'none') {
        body.style.display = 'block';
        if (arrow) arrow.textContent = '▴';
      } else {
        body.style.display = 'none';
        if (arrow) arrow.textContent = '▾';
      }
    });
  });

  // ===== Countdown Timer =====
  const eventDate = new Date('2026-09-22T15:00:00+02:00').getTime();
  
  function updateCountdown() {
    const now = Date.now();
    const diff = eventDate - now;
    
    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '0';
      document.getElementById('cd-mins').textContent = '0';
      document.getElementById('cd-secs').textContent = '0';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ===== Molecular Particle Animation =====
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() > 0.5 ? 185 : 220; // cyan or blue
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }
    
    // Create particles (fewer for performance)
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Pause animation when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  // ===== Scroll Event for Background Opacity =====
  window.addEventListener('scroll', () => {
    // Wait until scrolled down 40vh (closer to the 55vh margin) before darkening
    if (window.scrollY > window.innerHeight * 0.4) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }
  });

});
