function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomAsteroidImage() {
  const images = [
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor1.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor2.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteors/meteor3.png",
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

  const startX = getRandomInt(
    Math.floor(window.innerWidth / 2),
    window.innerWidth
  );
  const startY = getRandomInt(0, Math.floor(window.innerHeight / 2));

  asteroid.style.left = `${startX}px`;
  asteroid.style.top = `${startY}px`;
  asteroid.style.backgroundImage = `url('${getRandomAsteroidImage()}')`;

  const endX = startX - window.innerWidth;
  const endY = startY + 500;
  console.log(`Asteroid from (${startX}, ${startY}) to (${endX}, ${endY})`);

  asteroid.style.setProperty("--x-end", `${endX}px`);
  asteroid.style.setProperty("--y-end", `${endY}px`);
  asteroid.style.animation = `move-asteroid ${Math.random() * 3}s linear`;

  document.getElementById("asteroid-container").appendChild(asteroid);
  asteroid.addEventListener("animationend", () => {
    asteroid.remove();
  });
}

setInterval(createAsteroid, 2000);


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