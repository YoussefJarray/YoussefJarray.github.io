import projects from "./projects.json";
import posts from "./posts.json";

export const fileSystem = {
  name: "Home",
  type: "folder",
  children: [
    {
      name: "Projects",
      type: "folder",
      icon: "folder",
      children: projects.map((p) => ({
        name: `${p.name}.md`,
        type: "file",
        icon: "readme",
        meta: {
          title: p.name,
          desc: p.desc,
          tags: p.tags,
          href: p.href,
          color: p.color,
          content: p.readme,
        },
      })),
    },
    {
      name: "Posts",
      type: "folder",
      icon: "folder",
      children: posts.map((p) => ({
        name: `${p.slug}.md`,
        type: "file",
        icon: "post",
        meta: {
          title: p.title,
          date: p.date,
          excerpt: p.excerpt,
          tags: p.tags,
          content: p.content,
          thumbnail: p.thumbnail,
        },
      })),
    },
    {
      name: "github.url",
      type: "file",
      icon: "url",
      meta: {
        title: "GitHub",
        url: "https://github.com/YoussefJarray",
        content: "GitHub profile — open-source projects and contributions.",
      },
    },
    {
      name: "linkedin.url",
      type: "file",
      icon: "url",
      meta: {
        title: "LinkedIn",
        url: "https://www.linkedin.com/in/youssef-jarray-410227112/",
        content: "LinkedIn profile — professional experience and network.",
      },
    },
    {
      name: "email.url",
      type: "file",
      icon: "url",
      meta: {
        title: "Email",
        url: "mailto:youssef.jarray@epi.tn",
        content: "Send me an email.",
      },
    },
    {
      name: "about.txt",
      type: "file",
      icon: "file",
      meta: {
        content: `# About

Student at EPI, trying to break into game dev. C# / Unity.

Open the **About** app on the desktop for the full thing — bio, skills, stats, socials, the whole deal.`,
      },
    },
    {
      name: "welcome.txt",
      type: "file",
      icon: "file",
      meta: {
        content: `Welcome to my portfolio!

This is a fully functional desktop environment built in the browser.
Browse around, open apps, play games, or check out my projects.

Tips:
- Double-click folders and files to open them
- Use the sidebar to navigate
- Check out the Start Menu for all available apps
- Have fun!`,
      },
    },
    {
      name: "resume.pdf",
      type: "file",
      icon: "pdf",
      meta: {
        title: "Resume",
        content: "My latest resume.",
      },
    },
  ],
};