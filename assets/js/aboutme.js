const username = "chater-marzougui";
const accessToken = "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";
const apiUrl = "https://api.github.com/graphql";

const query = `
  query {
    user(login: "${username}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

fetch(apiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query }),
})
  .then((response) => response.json())
  .then((data) => {
    const contributions = data.data.user.contributionsCollection.contributionCalendar;
    const totalContributions = contributions.totalContributions;
    const weeks = contributions.weeks;

    const totalContributionsElement = document.createElement('h4');
    totalContributionsElement.textContent = `Total Contributions this year: ${totalContributions}`;
    document.getElementById('legend').after(totalContributionsElement);

    const contributionTable = document.getElementById("contribution-table");
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row = document.createElement("tr");
      for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
        const week = weeks[weekIndex];
        const contributionDay = week.contributionDays[dayOfWeek];
        const contributionCount = contributionDay ? contributionDay.contributionCount : 0;
        const td = document.createElement("td");
        let contributionColor;
        if (contributionCount === 0) {
          contributionColor = 0;
        } else if (contributionCount === 1) {
          contributionColor = 1;
        } else if (contributionCount === 2) {
          contributionColor = 2;
        } else if (contributionCount === 3) {
          contributionColor = 3;
        } else {
          contributionColor = 4;
        }
        td.className = `color-${contributionColor}`;
        if (weekIndex >20){
            row.appendChild(td);
        }
      }
      contributionTable.appendChild(row);
    }
  })
  .catch((error) => {
    console.error("Error fetching GitHub contributions:", error);
  });
