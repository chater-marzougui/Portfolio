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
  const welcomemess = "Welcome to My Portfolio   ";
  function Wtype() {
    const displayedText = welcomemess.substring(0, charIndex++);

    welcomeMessage.textContent = displayedText;
    if (charIndex === welcomemess.length) {
      setTimeout(() => {
        welcomeMessage.style.display = "none";
        welcomeScreen.style.display = "none";
        document.body.style.overflow = "auto";
        return;
      }, 700);
    }
    setTimeout(Wtype, 100);
  }

  Wtype();
}

document.addEventListener("DOMContentLoaded", () => {
  const jobs = [
    " Web Developer ",
    " Mobile Developer ",
    " ICT Engineering Student ",
    " AI Enthusiast ",
  ];
  let jobIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;
  const pauseBetweenJobs = 500;

  function type() {
    const currentJob = jobs[jobIndex];
    const n = jobIndex === 2 ? "n " : "";
    const displayedText = isDeleting
      ? currentJob.substring(0, charIndex--)
      : currentJob.substring(0, charIndex++);

    const fullText =
      jobIndex === 2
        ? `<span style="color: white;">${n}</span><span style="color: #0935FF;">${displayedText}</span>`
        : `<span style="color: #0935FF;">${displayedText}</span>`;

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
window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
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
