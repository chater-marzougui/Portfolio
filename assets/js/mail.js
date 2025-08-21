function showToast(message, type, actions = []) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${
      type === 'success' ? '✅' : '❌'
    }</span>
    <span>${message}</span>
    <span class="toast-action">${
      actions.map(a => `<a href="${a.href}" target="_blank">${a.text}</a>`).join('')
    }</span>
  `;
  container.appendChild(toast);
  const toastTimeout = type === 'success' ? 2500 : 6000;
  setTimeout(() => toast.remove(), toastTimeout);
}

async function sendEmail() {
  const userEmail = document.getElementById("emailInput").value;
  const userName = document.getElementById("name").value;
  const userSubject = document.getElementById("subjectvalue").value;
  const theMessage = document.getElementById("message").value;

  await Email.send({
    SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
    To: "chater.mrezgui2002@gmail.com",
    From: "chater.forarduinouse@gmail.com",
    Subject: userName + " [" + userSubject + "]",
    Body: "User Email: " + userEmail + "<br><br>" + theMessage,
  }).then((message) => {
    if (message === "OK") {
      showToast("Email sent successfully!", "success");
    } else {
      showToast(
        "Failed to send email: " + message,
        "error",
        [
          {href: "mailto:chater.mrezgui2002@gmail.com", text: "Try chater.mrezgui2002@gmail.com"},
          {href: "mailto:chater.marzougui@supcom.tn", text: "Try chater.marzougui@supcom.tn"},
        ]
      );
    }
  });
}

function sendVisitEmail() {
  if (localStorage.getItem("visited")) return;
  const nowTime = new Date().toLocaleString();
  Email.send({
    SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
    To: "chater.mrezgui2002@gmail.com",
    From: "chater.forarduinouse@gmail.com",
    Subject: "New Visitor Alert - " + nowTime,
    Body: `
      <h2>🚀 Someone visited your site!</h2>
      <p>Time: ${nowTime}</p>
      <p>This is an automated notification from your website.</p>
    `,
  }).then((message) => {
    if (message === "OK") {
      localStorage.setItem("visited", true);
    }
  });
}
sendVisitEmail();