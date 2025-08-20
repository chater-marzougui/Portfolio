
const apiUrl = "https://api.github.com/graphql";

const query = `query {
    user(login: "chater-marzougui") {
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
  }`;

const accessToken1 = "4EvxuzzrkM10kJ1dQ";
const accessToken2 = "JluMlCiwAcd5oquyQ5O";
fetch(apiUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ghp_${accessToken2}${accessToken1}`,
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
        if (contributionCount <= 6) {
          contributionColor = Math.floor(contributionCount / 2);
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