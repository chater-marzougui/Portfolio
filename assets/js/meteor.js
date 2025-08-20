function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomAsteroidImage() {
  const images = [
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor1.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor4.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor5.png",
    "https://chater-marzougui.github.io/Portfolio/assets/images/meteor6.png",
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
