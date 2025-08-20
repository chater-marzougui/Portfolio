fetch("./assets/contributions.json")
  .then((response) => response.json())
  .then((contributionsData) => {
    const contributions = contributionsData.data;
    const totalContributions = contributions.totalContributions;
    const weeks = contributions.weeks;

    const totalContributionsElement = document.createElement('h4');
    totalContributionsElement.textContent = `Total Contributions this year: ${totalContributions}`;
    document.getElementById('legend').after(totalContributionsElement);

    const contributionTable = document.getElementById("contribution-table");
    
    // Only process weeks if they exist
    if (weeks && weeks.length > 0) {
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const row = document.createElement("tr");
        for (let weekIndex = 0; weekIndex < Math.min(weeks.length, 53); weekIndex++) {
          const week = weeks[weekIndex];
          const contributionDay = week && week.contributionDays ? week.contributionDays[dayOfWeek] : null;
          const contributionCount = contributionDay ? contributionDay.contributionCount : 0;
          const td = document.createElement("td");
          let contributionColor;
          if (contributionCount <= 6) {
            contributionColor = Math.floor(contributionCount / 2);
          } else {
            contributionColor = 4;
          }
          td.className = `color-${contributionColor}`;
          if (weekIndex > 20){
              row.appendChild(td);
          }
        }
        contributionTable.appendChild(row);
      }
    }
  })
  .catch((error) => {
    console.error("Error loading GitHub contributions:", error);
    // Display fallback message if contributions data fails to load
    const totalContributionsElement = document.createElement('h4');
    totalContributionsElement.textContent = 'Contributions data temporarily unavailable';
    document.getElementById('legend').after(totalContributionsElement);
  });