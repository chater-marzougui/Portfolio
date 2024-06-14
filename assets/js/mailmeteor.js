function sendEmail() {
    const userEmail = document.getElementById("emailInput").value;
    const userName = document.getElementById("name").value;
    const userSubject = document.getElementById("subjectvalue").value;
    const theMessage = document.getElementById("message").value;

    Email.send({
      SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
      To: 'chater.mrezgui2002@gmail.com',
      From: 'chater.forarduinouse@gmail.com',
      Subject: userName  + " [" +userSubject +"]",
      Body: "User Email: " + userEmail+ "<br><br>" + theMessage
    }).then(
        message => {
            if (message === "OK") {
                alert("Email sent successfully");
            } else {
                alert("Failed to send email: " + message);
            }
        }
    );
 }
 function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomAsteroidImage() {
    const images = ['https://chater-marzougui.github.io/Portfolio/assets/images/meteor1.png','https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png',
         'https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png',
         'https://chater-marzougui.github.io/Portfolio/assets/images/meteor4.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor5.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor6.png'];
    return images[getRandomInt(0, images.length)];
}

function calculateRotationAngle(x, y) {
    return Math.atan2(y, x) + 'rad';
}

function createAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.classList.add('asteroid');

    const startX = getRandomInt(0, window.innerWidth);
    const startY = getRandomInt(0, window.innerHeight);

    asteroid.style.left = `${startX}px`;
    asteroid.style.top = `${startY}px`;
    asteroid.style.backgroundImage = `url('${getRandomAsteroidImage()}')`;

    const endX = startX - window.innerWidth;
    const endY = window.innerHeight;

    asteroid.style.setProperty('--x-end', `${endX}px`);
    asteroid.style.setProperty('--y-end', `${endY}px`);

    const rotationAngle = calculateRotationAngle(endX, endY);
    asteroid.style.setProperty('--rotation-angle', rotationAngle);

    asteroid.style.animation = `move-asteroid ${Math.random() * 3}s linear`;

    document.getElementById('asteroid-container').appendChild(asteroid);
    asteroid.addEventListener('animationend', () => {
        asteroid.remove();
    });
}

setInterval(createAsteroid, 2000);
