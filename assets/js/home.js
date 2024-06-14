document.addEventListener('DOMContentLoaded', () => {
    const starrySky = document.querySelector('.starry-sky');
    const starCount = 250;

    for (let i = 0; i < starCount; i++) {
        let star = document.createElement('div');
        star.classList.add('star');
        let size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 97}%`;
        star.style.left = `${Math.random() * 94 + 3}%`;
        star.style.animationDuration = `${Math.random() * 10 + 12}s`;
        star.style.animationDelay = `${Math.random() * 15}s`;

        starrySky.appendChild(star);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const jobs = [" Web Developer ", " Mobile Developer ", "n ICT Engineering Student "];
    let jobIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;
    const pauseBetweenJobs = 500;

    function type() {
        const currentJob = jobs[jobIndex];
        const displayedText = isDeleting 
            ? currentJob.substring(0, charIndex--) 
            : currentJob.substring(0, charIndex++);

        document.querySelector('.my-jobs').textContent = displayedText;

        if (!isDeleting && charIndex === currentJob.length) {
            setTimeout(() => isDeleting = true, pauseTime);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            jobIndex = (jobIndex + 1) % jobs.length;
            setTimeout(type, pauseBetweenJobs);
            return;
        }

        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }

    type();
});

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.barItems a');
    
    let currentSection = 'c';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const scrollPosition = window.scrollY+50 || window.pageY; 
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
        if (window.scrollY <= 0) {
            currentSection = "";
        }
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  });