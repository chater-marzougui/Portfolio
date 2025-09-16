// Priority: 0.1
function showToast(message, type, actions = []) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div>
      <span class="toast-icon">${type === "success" ? "✅" : "❌"}</span>
      <span>${message}</span>
    </div>
    <span class="toast-action">${
      actions.length > 0 ? "<h3> Try:</h3>" + actions
        .map((a) => `<a href="${a.href}" target="_blank">${a.text}</a>`)
        .join("") : ""
    }</span>
  `;
  container.appendChild(toast);
  const toastTimeout = type === 'success' ? 2500 : 6000;
  setTimeout(() => toast.remove(), toastTimeout);
}

function sendEmail() {
  if (typeof Email === "undefined") {
    showToast(
      "Email service is currently unavailable. Please try alternative contact methods.",
      "error",
      [
        {
          href: "mailto:chater.mrezgui2002@gmail.com",
          text: "chater.mrezgui2002@gmail.com",
        },
        {
          href: "mailto:chater.marzougui@supcom.tn",
          text: "chater.marzougui@supcom.tn",
        },
      ]
    );
    return;
  }

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
      showToast("Email sent successfully!", "success");
    } else {
      showToast("Failed to send email: " + message, "error", [
        {
          href: "mailto:chater.mrezgui2002@gmail.com",
          text: "Try chater.mrezgui2002@gmail.com",
        },
        {
          href: "mailto:chater.marzougui@supcom.tn",
          text: "Try chater.marzougui@supcom.tn",
        },
      ]);
    }
  });
}
function sendVisitEmail() {
  if (typeof Email === "undefined") {
    return;
  }

  const now = new Date();
  const nowTime = now.toLocaleString();
  const currentTimestamp = now.getTime();
  
  // Get visitor data from localStorage
  const lastVisitTimestamp = parseInt(localStorage.getItem("visit-timestamp") || "0");
  const visitCount = parseInt(localStorage.getItem("times-visited") || "0");
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  
  // Increment visit counter
  const newVisitCount = visitCount + 1;
  localStorage.setItem("times-visited", newVisitCount);
  
  // Determine if we should send an email
  const isFirstVisit = !lastVisitTimestamp;
  const isReturnAfterThreeDays = lastVisitTimestamp && (currentTimestamp - lastVisitTimestamp > threeDaysInMs);
  
  if (isFirstVisit || isReturnAfterThreeDays) {
    const emailSubject = isFirstVisit 
      ? "New Visitor Alert - " + nowTime
      : "Returning Visitor Alert - " + nowTime;
    
    const emailBody = isFirstVisit
      ? `
        <h2>🚀 Someone visited your site!</h2>
        <p>Time: ${nowTime}</p>
        <p>This is an automated notification from your website.</p>
      `
      : `
        <h2>👋 A visitor has returned!</h2>
        <p>Time: ${nowTime}</p>
        <p>This visitor has visited your site ${newVisitCount} times so far.</p>
        <p>Last visit was ${Math.floor((currentTimestamp - lastVisitTimestamp) / (24 * 60 * 60 * 1000))} days ago.</p>
      `;
    
    Email.send({
      SecureToken: "c99ebf76-7044-4a97-a3a3-986ee50089d5",
      To: "chater.mrezgui2002@gmail.com",
      From: "chater.forarduinouse@gmail.com",
      Subject: emailSubject,
      Body: emailBody,
    }).then((message) => {
      if (message === "OK") {
        // Update timestamp after successful email
        localStorage.setItem("visit-timestamp", currentTimestamp);
      }
    });
  }
}
sendVisitEmail();
