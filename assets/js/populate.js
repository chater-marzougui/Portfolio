// Function to populate skills
async function populateSkills(jsonFilePath = "./assets/objects/skillset.json") {
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
  const title = document.createElement("h1");
  title.textContent = project.title;
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
  linksContainer.className = "splinks";
  if (project.linksStyle) {
    linksContainer.style.cssText = project.linksStyle;
  } else {
    linksContainer.style.cssText = "height: 70px;";
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

async function loadProjects(jsonFilePath = "./assets/objects/projects.json") {
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

// Call the function when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadProjects();
  await populateSkills();
});

async function loadContributions(username) {
  const url = `https://github.com/users/${username}/contributions`;
  const response = await fetch(url, { mode: "no-cors" }); // works because SVG returns correct headers
  const svg = await response.text();
  document.getElementById("contribution-graph").innerHTML = svg;
}

loadContributions("chater-marzougui");
