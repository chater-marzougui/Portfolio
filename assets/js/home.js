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
    setTimeout(Wtype, 60);
  }

  Wtype();
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
    console.log(displayedText);

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
