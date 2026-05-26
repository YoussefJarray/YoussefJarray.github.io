import rawProjects from "./projects.json";

const mapProject = (p) => ({
  title: p.name,
  desc: p.desc,
  tags: p.tags,
  href: p.href,
});

export const projects = rawProjects.map(mapProject);

export const stats = [
  { value: "C#", label: "Main Language" },
  { value: "Unity", label: "Main Engine" },
  { value: "VR", label: "Focus Area" },
  { value: "FitVR", label: "Current Project" },
];

export const socials = [
  { icon: "FaGithub", href: "https://github.com/YoussefJarray", label: "GitHub" },
  { icon: "FaLinkedin", href: "https://www.linkedin.com/in/youssef-jarray-410227112/", label: "LinkedIn" },
  { icon: "FaYoutube", href: "https://www.youtube.com/channel/UCl6tMupa4HTSdT-eFE4CeWQ", label: "YouTube" },
  { icon: "FaEnvelope", href: "mailto:youssefjarray8@gmail.com", label: "Email" },
];

export const skillCategories = [
  {
    title: "Languages",
    skills: ["C", "C++", "C#", "Java", "Python", "JavaScript"],
  },
  {
    title: "Dev Tools",
    skills: ["Unity", "Git", "MySQL", "Next.js", "React", "Tailwind"],
  },
  {
    title: "Design",
    skills: ["Photoshop", "Illustrator", "Figma", "UI/UX", "Blender"],
  },
];
