// Priority: 1.0
const loadingScreen = document.getElementById("loading-screen");
const welcomeScreen = document.getElementById("welcome-screen");
welcomeScreen.style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    loadingScreen.style.display = "none";
    showWelcomeMessage();
  }, 1000);
});

function showWelcomeMessage() {
  const welcomeMessage = document.getElementById("welcome-message");
  welcomeScreen.style.display = "flex";
  let charIndex = 0;
  const welcomeMess = "Welcome to My Portfolio   ";
  function wType() {
    const displayedText = welcomeMess.substring(0, charIndex++);

    welcomeMessage.textContent = displayedText;
    if (charIndex === welcomeMess.length) {
      setTimeout(() => {
        welcomeMessage.style.display = "none";
        welcomeScreen.style.display = "none";
        document.body.style.overflow = "auto";
        return;
      }, 700);
    }
    setTimeout(wType, 60);
  }

  wType();
}

document.addEventListener("DOMContentLoaded", () => {
  let jobIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;
  const pauseBetweenJobs = 500;

  // Function to check if a word starts with a vowel
  function startsWithVowel(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const firstLetter = word.trim().toLowerCase().charAt(0);
    return vowels.includes(firstLetter);
  }

  function type() {
    const isMobile = window.innerWidth <= 768;
    const jobs = [
      " Web Developer ",
      " Mobile Developer ",
      isMobile ? " ICT Engineering<br>Student " : " ICT Engineering Student ",
      " AI Enthusiast ",
    ];
    const currentJob = jobs[jobIndex];
    const article = startsWithVowel(currentJob) ? "n " : " ";
    const hasBr = currentJob.includes("<br>");
    let displayedText = "";
    if (hasBr) {
      const [firstLine, secondLine] = currentJob.split("<br>");
      displayedText = isDeleting
        ? currentJob.substring(0, charIndex--)
        : currentJob.substring(0, charIndex++);

      if (!isDeleting && charIndex === firstLine.length) {
        charIndex += 3; // Skip the <br> tag
      } else if (isDeleting && charIndex === (firstLine.length + 3)) {
        charIndex -= 3;
      }

    } else {
      displayedText = isDeleting
        ? currentJob.substring(0, charIndex--)
        : currentJob.substring(0, charIndex++);
    }

    const fullText = `<span style="color: aliceblue;">${article}</span><span style="color: var(--primary-color);">${displayedText}</span>`;

    document.querySelector(".my-jobs").innerHTML = fullText;

    if (!isDeleting && charIndex === currentJob.length) {
      setTimeout(() => (isDeleting = true), pauseTime);
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

const navbar = document.querySelector(".navbar");
const scrollProgressBar = document.querySelector(".scroll-progress-bar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / documentHeight) * 100;
  
  // Update progress bar width
  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
  }
});

window.addEventListener("scroll", function () {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".barItems a");

  let currentSection = "c";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const scrollPosition = window.scrollY + 50 || window.pageY;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      currentSection = section.id;
      if (window.scrollY <= 0) {
        currentSection = "";
      }
    }
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").substring(1) === currentSection) {
      link.classList.add("active");
    }
  });
});

// Wheel scrolling travels 1/WHEEL_RESISTANCE as far per notch, eased toward its target.
(() => {
  const WHEEL_RESISTANCE = 1.4;
  let target = window.scrollY;
  let raf = 0;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  let last = 0;
  function tick(now) {
    const diff = target - window.scrollY;
    if (Math.abs(diff) < 0.5) return void (raf = 0);
    // time-based easing (~90ms time constant) so it feels the same at any frame rate
    const k = 1 - Math.exp(-Math.min(now - last, 100) / 90);
    last = now;
    // behavior "instant" because the page sets scroll-behavior: smooth
    const step = Math.sign(diff) * Math.min(Math.abs(diff), Math.max(1, Math.abs(diff) * k));
    window.scrollTo({ top: window.scrollY + step, behavior: "instant" });
    raf = requestAnimationFrame(tick);
  }

  // keyboard, scrollbar drag and nav jumps move the page themselves: resync
  window.addEventListener("scroll", () => { if (!raf) target = window.scrollY; }, { passive: true });

  window.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.defaultPrevented) return; // pinch / ctrl+wheel zoom
    for (let el = e.target; el && el !== document.body; el = el.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return; // inner scroller (textarea)
    }
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    if (!raf) target = window.scrollY;
    target = Math.min(maxScroll(), Math.max(0, target + (e.deltaY * unit) / WHEEL_RESISTANCE));
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }, { passive: false });
})();
