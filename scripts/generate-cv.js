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
geometry: margin=1.8cm
fontsize: 11pt
linkcolor: blue
urlcolor: blue
colorlinks: true
header-includes: |
  \\usepackage{titlesec}
  \\usepackage{enumitem}
  \\usepackage{xcolor}
  \\definecolor{sectioncolor}{RGB}{40, 40, 40}
  \\definecolor{rulecolor}{RGB}{180, 180, 180}
  \\titleformat{\\section}{\\large\\bfseries\\color{sectioncolor}}{}{0em}{}[\\vspace{0.15em}{\\color{rulecolor}\\hrule}\\vspace{0.25em}]
  \\titlespacing{\\section}{0pt}{0.8em}{0em}
  \\setlength{\\parskip}{0.4em}
  \\setlength{\\parindent}{0pt}
  \\setlist[itemize]{nosep, topsep=0.2em, left=1.5em, itemsep=0.15em}
  \\pagestyle{empty}
---

\\begin{center}
{\\LARGE \\textbf{${profile.name}}}\\\\[0.3em]
{\\normalsize ${profile.headline.replace(/&/g, "\\&")}}\\\\[0.2em]
{\\small ${profile.contact.join(" $\\,|\\,$ ")}}
\\end{center}

\\vspace{0.2em}
{\\color{rulecolor}\\hrule height 0.5pt}
\\vspace{0.5em}

## Profile

${profile.research_profile.trim()}

## Research Experience

${positions
  .map((p) => {
    let entry = `**${p.title}**\\
*${p.organisation}* \\hfill ${p.period}`;
    if (p.bullets && p.bullets.length) {
      entry += "\n\n" + p.bullets.map((b) => `- ${b}`).join("\n");
    }
    return entry;
  })
  .join("\n\n\\vspace{0.3em}\n\n")}

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
    let entry = `**${e.degree}** — ${e.field}`;
    entry += `\\
*${e.institution}*`;
    if (e.period) entry += ` \\hfill ${e.period}`;
    if (e.note) entry += `\\
${e.note}`;
    if (e.gpa) entry += `\\
GPA: ${e.gpa}`;
    if (e.awards) entry += ` · ${e.awards}`;
    return entry;
  })
  .join("\n\n\\vspace{0.15em}\n\n")}

## Conference Presentations

${talks
  .map((t) => {
    return `**${t.title}**\\
*${t.venue}* \\hfill ${t.year}`;
  })
  .join("\n\n")}

## Technical Skills

${skills.map((s) => `**${s.category}:** ${s.items}`).join("\\\\\\relax\n")}

## Awards \\& Honours

${awards.map((a) => `**${a.title}** — ${a.institution} \\hfill ${a.years}`).join("\n\n")}

## Supervision

${supervision.map((s) => s.description).join("\n\n")}
`;

const outputPath = path.join(__dirname, "..", "cv.md");
fs.writeFileSync(outputPath, cv);
console.log("CV generated at:", outputPath);
