// Simple Interactions script

document.addEventListener('DOMContentLoaded', () => {

  // Navigation tabs (sidebar)
  const navLinks = document.querySelectorAll('.nav-link');
  const pageSections = document.querySelectorAll('.page-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active nav link
      navLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      
      // Show target section
      const targetId = e.target.getAttribute('data-target');
      pageSections.forEach(sec => {
        sec.classList.remove('active');
        if(sec.id === targetId) sec.classList.add('active');
      });
      
      // Scroll to top
      window.scrollTo(0, 0);
    });
  });

  // Timetable day tabs
  const dayTabs = document.querySelectorAll('.day-tab');
  const daySections = document.querySelectorAll('.timetable-day');

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show target day section
      const targetDay = tab.getAttribute('data-day');
      daySections.forEach(sec => {
        sec.classList.remove('active');
        if(sec.id === targetDay) sec.classList.add('active');
      });
    });
  });

  // FAQ toggles
  const faqQuestions = document.querySelectorAll('.faq-q');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const answer = q.nextElementSibling;
      q.classList.toggle('open');
      answer.classList.toggle('open');
    });
  });
  
  // Programme items toggle
  const progHeaders = document.querySelectorAll('.programme-item-header');
  progHeaders.forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      if (body.style.display === 'none') {
        body.style.display = 'block';
      } else {
        body.style.display = 'none';
      }
    });
  });
});
