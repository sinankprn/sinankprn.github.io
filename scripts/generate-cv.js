const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const dataDir = path.join(__dirname, "..", "_data");

function load(file) {
  return yaml.load(fs.readFileSync(path.join(dataDir, file), "utf-8"));
}

const profile = load("profile.yml");
const education = load("education.yml");
const positions = load("positions.yml");
const publications = load("publications.yml");
const talks = load("talks.yml");
const skills = load("skills.yml");
const awards = load("awards.yml");
const supervision = load("supervision.yml");

const cv = `---
geometry: margin=2cm
fontsize: 11pt
linkcolor: blue
urlcolor: blue
colorlinks: true
header-includes: |
  \\usepackage{titlesec}
  \\titlespacing{\\section}{0pt}{0.6em}{0.3em}
  \\titlespacing{\\subsection}{0pt}{0.4em}{0.2em}
  \\setlength{\\parskip}{0.15em}
  \\pagestyle{empty}
---

\\begin{center}
{\\LARGE \\textbf{${profile.name}}}\\\\[0.2em]
${profile.headline}\\\\[0.15em]
{\\small ${profile.contact.join(" $|$ ")}}
\\end{center}

\\vspace{0.3em}
\\hrule
\\vspace{0.3em}

## Profile

${profile.research_profile.trim()}

## Research Experience

${positions
  .map((p) => {
    let entry = `**${p.title}**\\
${p.organisation} · ${p.period}`;
    if (p.bullets && p.bullets.length) {
      entry += "\n\n" + p.bullets.map((b) => `- ${b}`).join("\n");
    }
    return entry;
  })
  .join("\n\n")}

## Publications

${publications
  .map((p) => {
    const links = p.links.map((l) => `[${l.label}](${l.url})`).join(" · ");
    return `${p.authors_cv} (${p.year}). *${p.title}*. ${p.venue}. ${links}`;
  })
  .join("\n\n")}

## Education

${education
  .map((e) => {
    let entry = `**${e.degree}** — ${e.field}\\
${e.institution}`;
    if (e.period) entry += ` · ${e.period}`;
    if (e.note) entry += `\\
${e.note}`;
    if (e.gpa) entry += `\\
GPA: ${e.gpa}`;
    if (e.awards) entry += ` · ${e.awards}`;
    return entry;
  })
  .join("\n\n")}

## Conference Presentations

${talks
  .map((t) => {
    return `**${t.title}**\\
${t.venue} · ${t.year}`;
  })
  .join("\n\n")}

## Technical Skills

${skills.map((s) => `**${s.category}:** ${s.items}`).join("\\\n")}

## Awards & Honours

${awards.map((a) => `${a.title} — ${a.institution} · ${a.years}`).join("\n\n")}

## Supervision

${supervision.map((s) => s.description).join("\n\n")}
`;

const outputPath = path.join(__dirname, "..", "cv.md");
fs.writeFileSync(outputPath, cv);
console.log("CV generated at:", outputPath);
