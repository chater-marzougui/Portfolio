function sendEmail() {
  const userEmail = document.getElementById("emailInput").value;
  const userName = document.getElementById("name").value;
  const userSubject = document.getElementById("subjectvalue").value;
  const theMessage = document.getElementById("message").value;

  Email.send({
    SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
    To: "chater.mrezgui2002@gmail.com",
    From: "chater.forarduinouse@gmail.com",
    Subject: userName + " [" + userSubject + "]",
    Body: "User Email: " + userEmail + "<br><br>" + theMessage,
  }).then((message) => {
    if (message === "OK") {
      alert("Email sent successfully");
    } else {
      alert("Failed to send email: " + message);
    }
  });
}

function sendVisitEmail() {
  const nowTime = new Date().toLocaleString();
  Email.send({
    SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
    To: "chater.mrezgui2002@gmail.com",
    From: "chater.forarduinouse@gmail.com",
    Subject: "New Visitor Alert",
    Body: `
      <h2>🚀 Someone visited your site!</h2>
      <p>Time: ${nowTime}</p>
      <p>This is an automated notification from your website.</p>
    `,  });
}


let visited = localStorage.getItem("visited");

if (!visited) {
  localStorage.setItem("visited", true);
  sendVisitEmail();
}