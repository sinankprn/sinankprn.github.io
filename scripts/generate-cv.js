const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const dataDir = path.join(__dirname, "..", "_data");

function load(file) {
  return yaml.load(fs.readFileSync(path.join(dataDir, file), "utf-8"));
}

function texEscape(str) {
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function texBold(str) {
  return str.replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}");
}

function texItalic(str) {
  return str.replace(/\*(.+?)\*/g, "\\textit{$1}");
}

function texLink(str) {
  return str.replace(/\[(.+?)\]\((.+?)\)/g, "\\href{$2}{$1}");
}

const profile = load("profile.yml");
const education = load("education.yml");
const positions = load("positions.yml");
const publications = load("publications.yml");
const talks = load("talks.yml");
const skills = load("skills.yml");
const awards = load("awards.yml");
const supervision = load("supervision.yml");

// --- Build LaTeX sections ---

const positionsTeX = positions
  .map((p) => {
    let tex = `\\textbf{${texEscape(p.title)}} \\hfill ${texEscape(p.period)}\\\\
\\textit{${texEscape(p.organisation)}}`;
    if (p.bullets && p.bullets.length) {
      tex += "\n\\begin{itemize}\n";
      tex += p.bullets.map((b) => `  \\item ${texEscape(b)}`).join("\n");
      tex += "\n\\end{itemize}";
    }
    return tex;
  })
  .join("\n\n\\vspace{0.5em}\n\n");

const publicationsTeX = publications
  .map((p) => {
    const links = p.links
      .map((l) => `\\href{${l.url}}{${texEscape(l.label)}}`)
      .join(" $\\cdot$ ");
    const authors = texBold(texEscape(p.authors_cv));
    return `${authors} (${p.year}). \\textit{${texEscape(p.title)}}. ${texEscape(p.venue)}. ${links}`;
  })
  .join("\n\n");

const educationTeX = education
  .map((e) => {
    let tex = `\\textbf{${texEscape(e.degree)}} --- ${texEscape(e.field)}`;
    tex += ` \\\\
\\textit{${texEscape(e.institution)}}`;
    if (e.period) tex += ` \\hfill ${texEscape(e.period)}`;
    if (e.note) tex += ` \\\\
${texEscape(e.note)}`;
    if (e.gpa) {
      tex += ` \\\\
GPA: ${texEscape(e.gpa)}`;
      if (e.awards) tex += ` $\\cdot$ ${texEscape(e.awards)}`;
    }
    return tex;
  })
  .join("\n\n\\vspace{0.4em}\n\n");

const talksTeX = talks
  .map((t) => {
    return `\\textbf{${texEscape(t.title)}}\\\\
\\textit{${texEscape(t.venue)}} \\hfill ${t.year}`;
  })
  .join("\n\n\\vspace{0.4em}\n\n");

const skillsTeX = skills
  .map((s) => `\\textbf{${texEscape(s.category)}:} ${texEscape(s.items)}`)
  .join(" \\\\\n");

const awardsTeX = awards
  .map((a) => `\\textbf{${texEscape(a.title)}} --- ${texEscape(a.institution)} \\hfill ${texEscape(a.years)}`)
  .join("\n\n");

const supervisionTeX = supervision
  .map((s) => texEscape(s.description))
  .join("\n\n");

// --- Assemble document ---

const tex = `\\documentclass[11pt, a4paper]{article}

\\usepackage[margin=1.8cm]{geometry}
\\usepackage{fontspec}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{parskip}

\\setmainfont{DejaVu Serif}
\\setsansfont{DejaVu Sans}

\\definecolor{sectioncolor}{RGB}{40, 40, 40}
\\definecolor{rulecolor}{RGB}{180, 180, 180}

\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=blue
}

\\titleformat{\\section}{\\large\\bfseries\\color{sectioncolor}}{}{0em}{}[\\vspace{0.2em}{\\color{rulecolor}\\hrule}\\vspace{0.3em}]
\\titlespacing{\\section}{0pt}{1.2em}{0.1em}

\\setlength{\\parskip}{0.5em}
\\setlength{\\parindent}{0pt}

\\setlist[itemize]{nosep, topsep=0.3em, left=1.5em, itemsep=0.25em}
\\renewcommand{\\baselinestretch}{1.1}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{${texEscape(profile.name)}}}\\\\[0.3em]
{\\normalsize ${texEscape(profile.headline).replace(/\|/g, "$|$")}}\\\\[0.2em]
{\\small ${profile.contact.map(texEscape).join(" $\\,|\\,$ ")}}
\\end{center}

\\vspace{0.2em}
{\\color{rulecolor}\\hrule height 0.5pt}
\\vspace{0.5em}

\\section*{Profile}

${texEscape(profile.research_profile.trim())}

\\section*{Research Experience}

${positionsTeX}

\\section*{Publications}

${publicationsTeX}

\\section*{Education}

${educationTeX}

\\section*{Conference Presentations}

${talksTeX}

\\section*{Technical Skills}

${skillsTeX}

\\section*{Awards \\& Honours}

${awardsTeX}

\\section*{Supervision}

${supervisionTeX}

\\end{document}
`;

// Write .tex file for PDF generation
const texPath = path.join(__dirname, "..", "cv.tex");
fs.writeFileSync(texPath, tex);
console.log("CV LaTeX generated at:", texPath);

// Also generate cv.md for reference (Markdown version)
const md = `---
title: "${profile.name}"
---

**${profile.headline}**\\
${profile.contact.join(" | ")}

---

## Profile

${profile.research_profile.trim()}

## Research Experience

${positions
  .map((p) => {
    let entry = `**${p.title}** — ${p.period}\\
*${p.organisation}*`;
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
*${e.institution}*`;
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
  .map((t) => `**${t.title}** — ${t.year}\\
*${t.venue}*`)
  .join("\n\n")}

## Technical Skills

${skills.map((s) => `**${s.category}:** ${s.items}`).join("  \n")}

## Awards & Honours

${awards.map((a) => `**${a.title}** — ${a.institution} · ${a.years}`).join("\n\n")}

## Supervision

${supervision.map((s) => s.description).join("\n\n")}
`;

const mdPath = path.join(__dirname, "..", "cv.md");
fs.writeFileSync(mdPath, md);
console.log("CV Markdown generated at:", mdPath);
