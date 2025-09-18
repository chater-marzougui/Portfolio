// Priority: 0.8
// Function to populate skills
async function populateSkills(jsonFilePath = "./assets/json/skillset.json") {
  const response = await fetch(jsonFilePath);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const skillsData = await response.json();
  const skillsContainer = document.querySelector(".skills-container");

  if (!skillsContainer) {
    return;
  }

  // Clear existing content
  skillsContainer.innerHTML = "";

  // Create Professional Skillset section
  const skillsetTitle = document.createElement("h2");
  skillsetTitle.textContent = "Professional Skillset";
  skillsContainer.appendChild(skillsetTitle);

  const skillsetList = document.createElement("ul");
  skillsData.professionalSkillset.forEach((skill) => {
    const listItem = document.createElement("li");

    // Create icon element
    let iconElement;
    if (skill.iconType === "fontawesome") {
      iconElement = document.createElement("i");
      iconElement.className = skill.iconClass;
      iconElement.style.fontFamily = '"Font Awesome 6 Brands"';
      iconElement.style.fontWeight = "200";
    } else {
      iconElement = document.createElement("img");
      iconElement.className = "icon";
      iconElement.src = skill.iconSrc;
      iconElement.alt = skill.iconAlt;
      if (skill.style) {
        iconElement.setAttribute("style", skill.style);
      }
    }

    // Create skill name element
    const nameElement = document.createElement("h3");
    nameElement.className = "back";
    nameElement.textContent = skill.name;

    listItem.appendChild(iconElement);
    listItem.appendChild(nameElement);
    skillsetList.appendChild(listItem);
  });
  skillsContainer.appendChild(skillsetList);

  // Create Tools section
  const toolsTitle = document.createElement("h2");
  toolsTitle.textContent = "Tools";
  skillsContainer.appendChild(toolsTitle);

  const toolsList = document.createElement("ul");
  skillsData.tools.forEach((tool) => {
    const listItem = document.createElement("li");

    // Create icon element
    let iconElement;
    if (tool.iconType === "fontawesome") {
      iconElement = document.createElement("i");
      iconElement.className = tool.iconClass;
    } else {
      iconElement = document.createElement("img");
      iconElement.className = "icon";
      iconElement.src = tool.iconSrc;
      iconElement.alt = tool.iconAlt;
      if (tool.style) {
        iconElement.setAttribute("style", tool.style);
      }
    }

    // Create tool name element
    const nameElement = document.createElement("h3");
    nameElement.className = "back";
    nameElement.textContent = tool.name;

    listItem.appendChild(iconElement);
    listItem.appendChild(nameElement);
    toolsList.appendChild(listItem);
  });
  skillsContainer.appendChild(toolsList);
}

function createProjectCard(project) {
  // Create card container
  const card = document.createElement("div");
  card.className = "card";

  // Create cover container
  const cover = document.createElement("div");
  cover.className = "cover";

  // Create title
  const title = document.createElement("p");
  title.textContent = project.title;
  title.className = "title";
  if (project.titleStyle) {
    title.style.cssText = project.titleStyle;
  }

  // Create technologies span
  const technologies = document.createElement("span");
  technologies.className = "job";
  technologies.textContent = project.technologies;

  // Create card back
  const cardBack = document.createElement("div");
  cardBack.className = "card-back";

  // Create "More Details" heading
  const detailsHeading = document.createElement("h2");
  detailsHeading.textContent = "More Details:";

  // Create description paragraph
  const description = document.createElement("p");
  description.className = "spbiography";
  description.textContent = project.description;

  // Create links container
  const linksContainer = document.createElement("div");
  linksContainer.className = "project-links";
  if (project.linksStyle) {
    linksContainer.style.cssText = project.linksStyle;
  } else {
    linksContainer.style.cssText = "height: 50px;";
  }
  if (project.cardBackStyle) {
    cardBack.style.cssText = project.cardBackStyle;
  }

  // Create links
  project.links.forEach((link) => {
    const linkElement = document.createElement("a");
    linkElement.href = link.url;
    linkElement.target = "_blank";

    const icon = document.createElement("i");
    icon.className = link.icon;

    const label = document.createElement("h3");
    label.textContent = link.label;

    linkElement.appendChild(icon);
    linkElement.appendChild(label);
    linksContainer.appendChild(linkElement);
  });

  // Assemble the card structure
  cardBack.appendChild(detailsHeading);
  cardBack.appendChild(description);
  cardBack.appendChild(linksContainer);

  cover.appendChild(title);
  cover.appendChild(technologies);
  cover.appendChild(cardBack);

  card.appendChild(cover);

  return card;
}

async function loadProjects(jsonFilePath = "./assets/json/projects.json") {
  try {
    // Fetch the JSON data
    const response = await fetch(jsonFilePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Get the projects container
    const projectsList = document.getElementById("projects-list");
    if (!projectsList) {
      return;
    }

    // Clear existing content
    projectsList.innerHTML = "";

    // Create and append project cards
    data.projects.forEach((project) => {
      const projectCard = createProjectCard(project);
      projectsList.appendChild(projectCard);
    });
  } catch (error) {
    const projectsList = document.getElementById("projects-list");
    if (projectsList) {
      projectsList.innerHTML = `
                <div class="error-message">
                    <p>Failed to load projects.</p>
                </div>
            `;
    }
  }
}

async function loadContributions() {
  fetch("./assets/json/contributions.json")
    .then((response) => response.json())
    .then((contributionsData) => {
      const contributions = contributionsData.data;
      const totalContributions = contributions.totalContributions;
      const weeks = contributions.weeks;

      const totalContributionsElement = document.createElement("h4");
      totalContributionsElement.textContent = `Total Contributions this year: ${totalContributions}`;
      document.getElementById("legend").after(totalContributionsElement);

      const contributionTable = document.getElementById("contribution-table");

      // Only process weeks if they exist
      if (weeks && weeks.length > 0) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          const row = document.createElement("tr");
          for (
            let weekIndex = 0;
            weekIndex < Math.min(weeks.length, 53);
            weekIndex++
          ) {
            const week = weeks[weekIndex];
            const contributionDay =
              week && week.contributionDays
                ? week.contributionDays[dayOfWeek]
                : null;
            const contributionCount = contributionDay
              ? contributionDay.contributionCount
              : 0;
            const td = document.createElement("td");
            let contributionColor;
            if (contributionCount <= 6) {
              contributionColor = Math.floor(contributionCount / 2);
            } else {
              contributionColor = 4;
            }
            td.className = `contrib-color-${contributionColor}`;
            if (weekIndex > 20) {
              row.appendChild(td);
            }
          }
          contributionTable.appendChild(row);
        }
      }
    })
    .catch(() => {
      const totalContributionsElement = document.createElement("h4");
      totalContributionsElement.textContent =
        "Contributions data temporarily unavailable";
      document.getElementById("legend").after(totalContributionsElement);
    });
}

async function loadSocials() {
  const socialIconsContainer = document.getElementById("social-icons");
  const socialIconsFooterContainer = document.getElementById("social-icons-footer");
  try {
    const data = await fetch("./assets/json/socials.json");
    const socials = await data.json();
    const whiteLine = document.createElement("div");
    whiteLine.className = "whiteline";
    socialIconsContainer.appendChild(whiteLine);

    // Populate social icons
    socials.socials.forEach((social) => {
      const a = document.createElement("a");
      if (social.faIcon) {
        const i = document.createElement("i");
        i.className = social.faIcon;
        i.style.fontFamily = '"Font Awesome 6 Brands"';
        a.appendChild(i);
      } else if (social.imgIcon) {
        const img = document.createElement("img");
        img.src = social.imgIcon;
        img.alt = social.imgAlt;
        a.appendChild(img);
      }
      a.href = social.url;
      a.target = "_blank";
      socialIconsContainer.appendChild(a);
      socialIconsFooterContainer.appendChild(a.cloneNode(true));
    });
    socialIconsContainer.appendChild(whiteLine.cloneNode(true));
  } catch (e) {}
}

// Call the function when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadSocials();
  await loadProjects();
  await populateSkills();
  await loadContributions();
  generateStars();
});
