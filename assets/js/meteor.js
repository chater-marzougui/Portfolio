function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomAsteroidImage() {
  const images = [
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor1.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor2.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor3.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor4.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor5.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor6.png",
  ];
  return images[getRandomInt(0, images.length)];
}

function createAsteroid() {
  const asteroid = document.createElement("div");
  asteroid.classList.add("asteroid");

  // Random size
  const sizes = ["small", "medium", "large"];
  const sizeClass = sizes[getRandomInt(0, sizes.length)];
  asteroid.classList.add(sizeClass);

  // Multiple trajectory patterns
  const patterns = ["diagonal", "steep", "curved"];
  const pattern = patterns[getRandomInt(0, patterns.length)];

  let startX, startY, endX, endY, midX, midY;
  let animationName, duration;

  switch (pattern) {
    case "diagonal":
      // Wide diagonal trajectories across screen
      startX = getRandomInt(-100, window.innerWidth + 100);
      startY = getRandomInt(-200, -50);
      endX = startX - window.innerWidth - 200; // More horizontal movement
      endY = startY + 300;
      animationName = "diagonal-fall";
      duration = getRandomFloat(1, 3);
      break;

    case "steep":
      // Steeper angles, more vertical
      startX = getRandomInt(window.innerWidth * 0.3, window.innerWidth + 200);
      startY = getRandomInt(-150, -50);
      endX = startX - window.innerWidth * 0.8;
      endY = startY + window.innerHeight - 150;
      midX = (endX - startX) * 0.6;
      midY = (endY - startY) * 0.4;
      animationName = "steep-fall";
      duration = getRandomFloat(0.5, 2);
      break;

    case "curved":
      // Curved trajectories
      startX = getRandomInt(window.innerWidth * 0.5, window.innerWidth + 150);
      startY = getRandomInt(-100, 0);
      endX = startX - window.innerWidth;
      endY = startY + 300;
      // Curve control point
      midX = (endX - startX) * 0.3 + getRandomInt(-100, 100);
      midY = (endY - startY) * 0.6;
      animationName = "curved-fall";
      duration = getRandomFloat(1.5, 3);
      break;
  }

  // Set position and animation properties
  asteroid.style.left = "0px";
  asteroid.style.top = "0px";
  asteroid.style.backgroundImage = `url('${getRandomAsteroidImage()}')`;

  // Set CSS custom properties
  asteroid.style.setProperty("--start-x", `${startX}px`);
  asteroid.style.setProperty("--start-y", `${startY}px`);
  asteroid.style.setProperty("--end-x", `${endX}px`);
  asteroid.style.setProperty("--end-y", `${endY}px`);

  if (midX !== undefined && midY !== undefined) {
    asteroid.style.setProperty("--mid-x", `${midX}px`);
    asteroid.style.setProperty("--mid-y", `${midY}px`);
  }

  // Apply animation
  asteroid.style.animation = `${animationName} ${duration}s ease-out forwards`;

  console.log(
    `${pattern} asteroid: (${startX}, ${startY}) → (${endX}, ${endY}), duration: ${duration}s`
  );

  document.getElementById("asteroid-container").appendChild(asteroid);

  // Remove after animation
  asteroid.addEventListener("animationend", () => {
    if (asteroid.parentNode) {
      asteroid.remove();
    }
  });

  // Failsafe removal
  setTimeout(() => {
    if (asteroid.parentNode) {
      asteroid.remove();
    }
  }, duration * 1000 + 1000);
}

// Variable spawn rate
function spawnAsteroids() {
  createAsteroid();

  // Variable timing between spawns
  const nextSpawn = getRandomInt(1500, 4000);
  setTimeout(spawnAsteroids, nextSpawn);
}

// Start the asteroid shower
spawnAsteroids();

// Occasionally create burst effects
setInterval(() => {
  if (Math.random() < 0.2) {
    // 20% chance every 10 seconds
    for (let i = 0; i < getRandomInt(3, 6); i++) {
      setTimeout(() => createAsteroid(), i * 200);
    }
  }
}, 10000);

function getStarProps() {
  const phoneAdjust = window.innerWidth < 768 ? 1.25 : 1.05;
  const prob = Math.random();
  const size = Math.random() * 3;
  const startX = Math.random() * 96 + 3;
  const duration = Math.random() * 10 + 12;
  const delay = Math.random() * 12;

  let startY = 0;
  if (prob < 0.3) {
    startY = Math.random() * 97;
  } else {
    startY = (Math.random() * document.body.scrollHeight) / 2;
  }

  const endY = document.body.scrollHeight * phoneAdjust - startY;
  return { startX, startY, size, duration, delay, endY };
}

document.addEventListener("DOMContentLoaded", () => {
  const starrySky = document.querySelector(".starry-sky");
  const starCount = 200;

  for (let i = 0; i < starCount; i++) {
    let star = document.createElement("div");
    star.classList.add("star");
    const starProps = getStarProps();
    star.style.width = `${starProps.size}px`;
    star.style.height = `${starProps.size}px`;
    star.style.top = `${starProps.startY}px`;
    star.style.left = `${starProps.startX}%`;
    star.style.animationDuration = `${starProps.duration}s`;
    star.style.animationDelay = `${starProps.delay}s`;
    star.style.setProperty("--start-y", starProps.startY + "px");
    star.style.setProperty("--end-y", starProps.endY + "px");

    starrySky.appendChild(star);
  }
});
