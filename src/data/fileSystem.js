const projects = [
  {
    name: "FitVR",
    desc: "Multiplayer VR fitness platform built in Unity 6 with modular architecture.",
    tags: ["Unity", "C#", "VR", "OpenXR"],
    href: "https://github.com/YoussefJarray/FitVR-Backup",
    color: "#f97316",
    readme: `# FitVR

A **multiplayer virtual reality fitness platform** built in Unity 6. FitVR combines immersive mini-games with real workout routines, letting users exercise together in shared virtual environments — making fitness social, fun, and effective.

## Tech Stack

- **Unity 6000.3.8f1** with Universal Render Pipeline
- **OpenXR** for cross-platform VR headset support
- **C#** for all game logic, interfaces, and services
- **ShaderLab / HLSL** for custom VR-optimized shaders
- **Unity Netcode** for multiplayer session management

## The Problem

Most fitness apps are solo experiences. You open an app, follow a workout, and close it. There's no social element, no shared space, nothing to keep you coming back. FitVR set out to fix that by making exercise something you do *with* people — in a virtual environment that makes you forget you're working out.

The bigger challenge was technical: VR is unforgiving. A frame rate drop doesn't just look bad, it makes people physically sick. Every decision — from how many objects are in a scene to how shaders are written — had to be made with performance as the top constraint.

## What It Does

Players join a shared lobby and choose from a set of fitness mini-games designed around natural full-body movement. The games track effort and score players based on accuracy and timing, turning a workout into something competitive and fun. Progress and session data are saved per user behind a secure authentication system.

The mini-game system is fully modular — each exercise is a self-contained scene. Adding a new workout doesn't require touching any existing code, which kept the project easy to expand as the team added content throughout the semester.

## Challenges

Hitting consistent 90fps on VR hardware with a multiplayer game running is genuinely hard. We had to be aggressive: GPU instancing for repeated objects, LOD groups on every mesh, baked occlusion culling per scene, and single-pass instanced rendering to cut draw calls in half. Profiling became a daily habit rather than an afterthought.

Multiplayer added another layer — syncing player state across a session without introducing jitter or desync required careful thought about what data actually needs to be authoritative versus what can be predicted client-side.

Motion sickness was also a constant concern. We added vignetting during fast movement, snap turning as an option, and teleportation as an alternative locomotion mode. Playtesting revealed issues no amount of code review would catch.

## Takeaways

VR forces you to care about performance in a way most platforms don't. You can't ship and patch later — a laggy experience is a nausea-inducing experience. I came away with a much deeper understanding of Unity's rendering pipeline, and a healthy respect for how much work goes into making something feel comfortable to wear.

Working in a team with a strict modular architecture also taught me the value of enforced boundaries. Because Core could never depend on other modules, we never had circular dependencies or mysterious breakages when someone changed a feature.

## Role

**Game Developer** — 2025 — **School Project**`,
  },
  {
    name: "ModelShare",
    desc: "Collaborative platform for sharing, discovering, and downloading 3D models with real-time preview.",
    tags: ["Angular", "Three.js", "PHP", "Tailwind"],
    href: "https://github.com/YoussefJarray/modelshare",
    color: "#8b5cf6",
    readme: `# ModelShare

A collaborative platform for sharing, discovering, and downloading 3D models with real-time preview capabilities.

Built for my university project, ModelShare provides a browser-based environment for artists to upload and showcase their work.

## Tech Stack

- **Angular** — Front-end framework for high performance and consistent state management
- **Three.js** — Real-time 3D rendering in the browser
- **PHP** — Custom backend for asset orchestration and session handling
- **Tailwind CSS** — Utility-first interface for creative workflows

## The Problem

3D artists don't have a great home on the web. Existing platforms either lock previews behind downloads or offer no inspection tools at all — you're flying blind until you open the file in your software. ModelShare was built around the idea that a 3D asset should be fully explorable in the browser before you ever download it.

## What It Does

### Technical Inspector

The inspector tool centralizes model verification, allowing users to check mesh health, UV layouts, and rig hierarchies in a single view. Integrated Three.js toggles allow for immediate switching between wireframe, textured, and normal-map views.

![Technical Inspector](/ms1.png)

### Playback System

The playback engine supports timeline scrubbing and frame-by-frame speed controls, optimized for checking skinning weights and joint transitions.

![Animation Engine](/ms3.png)

### User Profiles

Artists manage personalized profiles to showcase their galleries. The PHP backend facilitates these interactions via session-based handling to ensure smooth, secure browsing.

![Profiles](/ms2.png)

### Asset Ecosystem

The database stores detailed model metadata and versioning, creating a complete history for every uploaded asset within the community ecosystem.

![Ecosystem](/ms4.png)

## Challenges

Getting Three.js to load arbitrary user-uploaded models reliably was messier than expected. Different exporters produce subtly broken glTF files — missing normals, incorrect bone weights, non-standard material setups. The inspector had to handle all of it gracefully without crashing or showing the user a blank viewport.

On the backend, handling large binary uploads through PHP while keeping response times reasonable required careful chunking and progress tracking. The asset pipeline — upload, process, store, serve — had more edge cases than anticipated.

## Takeaways

Building a full-stack app solo from scratch teaches you to respect the boundaries between layers. Every time I cut a corner on the PHP API, I paid for it on the Angular side. I also learned that user-generated content is unpredictable in ways that unit tests can't fully cover — real-world files from real artists broke things in ways I never would have thought to test for.

## Role

**Full Stack Developer** — 2024 — **University Project**`,
  },
  {
    name: "Taskr",
    desc: "Modern task management app with collections, Kanban board, and GSAP-powered animations.",
    tags: ["React", "Vite", "GSAP", "Tailwind"],
    href: "https://github.com/YoussefJarray/Taskr",
    color: "#14b8a6",
    readme: `# Taskr

A modern task management app built with **React** and **Vite**. Taskr goes beyond a simple todo list — it's a full productivity environment with collections, a Kanban board, and a glassmorphic dark UI powered by GSAP animations.

## Tech Stack

- **React 18** — Component architecture with hooks-based state
- **Vite 4 (SWC)** — Near-instant dev server and optimized builds
- **GSAP 3** — Entrance animations, micro-interactions, and page transitions
- **Tailwind CSS** — Utility-first dark theme with glassmorphism
- **@hello-pangea/dnd** — Accessible drag-and-drop for the Kanban board
- **React Router v6** — Client-side routing between views

## The Problem

Most todo apps are either too simple to be useful or too complex to stay organized in. I wanted something in between — an app that handles real organizational needs (grouping tasks, tracking status, seeing the big picture) without requiring a manual to use.

The secondary goal was to build something that *felt* good to use. A lot of productivity tools are functional but joyless. Taskr was a chance to explore what happens when you treat animation and polish as first-class features rather than afterthoughts.

## What It Does

Tasks can be created with a title, description, and priority level, then organized into color-coded **Collections** — basically folders for related work. A **Dashboard** view gives you an animated overview of total tasks, completion rate, and an SVG progress ring. The **Kanban board** lets you drag tasks between To Do, In Progress, and Done columns when you want a more visual workflow.

Everything saves to localStorage automatically, so nothing is lost on a reload.

## Challenges

GSAP and React don't always play nicely together. React owns the DOM, and GSAP wants to manipulate it directly — if you're not careful, React re-renders will undo your animations mid-flight or cause elements to flicker. I ended up using refs and careful lifecycle management to keep the two in sync.

The drag-and-drop Kanban also required thought around optimistic UI updates. The state needs to reflect the new position immediately when you drop a card, before any async operations settle — otherwise the interaction feels sluggish and the card snaps back before moving to the right place.

## Takeaways

Animation is a design tool, not a decoration. Used well, it communicates state changes and guides attention. Used badly, it just slows the user down. This project made me much more deliberate about *why* something animates, not just *how*.

I also came away with a solid understanding of React's rendering model — knowing exactly when components re-render and how to prevent unnecessary ones became essential when animations were involved.

## Role

**Solo Developer** — 2024 — **Personal Project**`,
  },
  {
    name: "This Portfolio",
    desc: "KDE Linux desktop-inspired portfolio built with Next.js 13.",
    tags: ["Next.js", "Zustand", "Tailwind", "Framer Motion"],
    href: "https://github.com/YoussefJarray/YoussefJarray.github.io",
    color: "#f43f5e",
    readme: `# Portfolio

A **KDE Linux desktop**-inspired portfolio website deployed on GitHub Pages. It's not a page you scroll — it's a working environment you explore.

## Tech Stack

- **Next.js 13.4** with App Router for SSR and file-system routing
- **React 18** for component architecture and portals
- **Zustand 5** for lightweight, modular state management
- **Framer Motion 10** for window animations and transitions
- **Tailwind CSS** with CSS variables for full theming support
- **GSAP** for advanced entrance animations
- **wasm-doom** for an in-browser DOOM engine
- **pdfjs-dist** for in-app PDF rendering

## The Problem

Portfolio websites are almost all the same. A hero section, a grid of projects, a contact form. They're functional but forgettable — and they say nothing about how you actually think or build things.

I wanted a portfolio that was itself a demonstration of what I can do. Something that made people stop and actually interact with it, rather than skim it in 30 seconds. A Linux desktop environment felt like the right metaphor: familiar enough that anyone can navigate it, but surprising enough that people spend time exploring.

## What It Does

The portfolio is a fully functional desktop running in the browser. Windows open, resize, minimize, and stack on top of each other. A system tray in the top panel shows a live volume slider, WiFi indicator, battery monitor, and a calendar. The Start Menu lets you launch any of 16+ applications — including a working terminal with custom commands, a drawing app, a PDF viewer, a GitHub stats dashboard, and a full suite of games (DOOM, Pong, Sudoku, Minesweeper, and more).

Desktop widgets — an analog clock, sticky note, cat widget, and music player — can be dragged anywhere and toggled from the Start Menu. Positions persist across sessions. Dark and light mode are fully supported, with system preference detection on first load.

## Challenges

The window manager was the hardest part to get right. Every window needs its own position, size, z-index, and open/minimize/maximize state — all managed globally so the taskbar and other windows can react to changes. Getting focus management right (clicking a window should always bring it to the front, clicking the taskbar should toggle it) required careful thought about event propagation.

Running wasm-doom inside a React component in a Next.js app was its own adventure. The WASM module has opinions about the DOM that don't align with React's model, and sandboxing it inside a window that can be minimized or closed without crashing the rest of the page took significant effort.

Performance was also a concern — a desktop with 10+ open windows, draggable widgets, and animated transitions can get heavy fast. Zustand's granular subscription model helped a lot: components only re-render when the specific slice of state they care about changes.

## Takeaways

This project pushed my frontend architecture further than anything else I've built. Managing a complex, stateful UI where dozens of independent pieces need to stay in sync taught me to think carefully about state ownership and update boundaries.

It also reinforced something I already suspected: the most memorable projects are the ones that take an unexpected angle on a familiar problem. A portfolio is just a way to show your work — but *how* you show it is itself a statement.

## Role

**Full Stack Developer** — 2024–2025 — **Personal Project**`,
  },
];

const posts = [
  {
    title: "Building Interactive 3D Worlds with Three.js",
    slug: "threejs-3d-worlds",
    date: "2026-05-10",
    excerpt: "Exploring how Three.js makes WebGL accessible for creating immersive 3D experiences in the browser.",
    tags: ["Three.js", "WebGL", "JavaScript", "3D"],
    thumbnail: "/thumbnails/threejs.svg",
    content: `# Building Interactive 3D Worlds with Three.js

Three.js is the most popular WebGL library for a reason — it turns complex 3D graphics into readable JavaScript.

## Getting Started

\`\`\`javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.1 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
\`\`\`

## Lighting Makes the Difference

A flat-lit 3D scene looks dead. Three.js offers several light types:

- **AmbientLight** — base illumination, no direction
- **DirectionalLight** — sun-like parallel rays
- **PointLight** — emits in all directions from a point
- **SpotLight** — cone-shaped, like a stage light

\`\`\`javascript
const ambient = new THREE.AmbientLight(0x404060);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(5, 10, 7);
scene.add(directional);
\`\`\`

## Loading 3D Models

For anything beyond primitives, you'll want glTF models:

\`\`\`javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('/models/helmet.gltf', (gltf) => {
  scene.add(gltf.scene);
}, undefined, (error) => {
  console.error('Error loading model:', error);
});
\`\`\`

## Animation Loop

The core of any Three.js app is the render loop:

\`\`\`javascript
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
\`\`\`

## Performance Tips

- Use **BufferGeometry** (the default since r125)
- Enable **frustum culling** (it's on by default)
- Merge geometries with **BufferGeometryUtils.mergeGeometries**
- Use **instanced meshes** for repeated objects
- Keep draw calls under 100 for mobile

Three.js makes 3D on the web accessible without sacrificing performance. Whether you're building data visualizations, games, or interactive portfolios, it's the right tool for the job.`,
  },
  {
    title: "Building a VR Game in Unity 6",
    slug: "building-vr-unity-6",
    date: "2025-12-15",
    excerpt: "Lessons learned from developing FitVR, a virtual reality fitness game in Unity 6.",
    tags: ["Unity", "VR", "Game Dev"],
    content: `# Building a VR Game in Unity 6

VR development comes with unique challenges. Here's what I learned building **FitVR**, a full-body workout game for VR.

## Motion Sickness is Real

The biggest hurdle in VR is **player comfort**. If your frame rate drops below 90fps or your movement system feels wrong, players will feel sick within minutes.

We implemented several comfort features:

- **Tunnel vision vignetting** during fast movement — narrows the FOV to reduce visual strain
- **Smooth locomotion** with adjustable speed and snap turning
- **Teleportation** as an alternative movement mode for sensitive players

## Performance Optimization

Maintaining 90fps in VR on standalone headsets requires constant vigilance:

\`\`\`csharp
// Example: Object pooling for frequently spawned items
public class TargetPool : MonoBehaviour
{
    private Queue<GameObject> pool = new Queue<GameObject>();

    public GameObject Get()
    {
        if (pool.Count > 0)
        {
            var obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        return Instantiate(prefab);
    }

    public void Return(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
\`\`\`

Key optimizations:

- **GPU instancing** for repeated objects (targets, obstacles)
- **LOD groups** on every mesh
- **Occlusion culling** — baked into each scene
- **Single-pass instanced rendering** — cuts draw calls in half

## Modular Architecture

FitVR uses a **modular mini-game system**. Each exercise is a self-contained scene that implements a common \`IMiniGame\` interface. This lets us add new exercises without touching core systems.

The result is a flexible VR fitness platform that's comfortable to play and easy to extend.`,
  },
  {
    title: "Why I Built a Linux Desktop Portfolio",
    slug: "linux-desktop-portfolio",
    date: "2025-11-20",
    excerpt: "Most portfolios are boring scrollable pages. I built mine as a functional desktop environment.",
    tags: ["Web Dev", "UX", "Design"],
    content: `# Why I Built a Linux Desktop Portfolio

Most portfolios follow the same pattern: hero, about, skills, projects, contact. I wanted mine to feel like something you *use*, not just read.

## Familiar UX

Linux desktop environments already solve navigation. People understand:

- Windows and applications that you can drag around
- A taskbar with running apps you can click
- File managers with folders you can browse
- A terminal where you can type commands

Instead of *explaining* how I think about systems, I let people *experience* it.

## How It Works

Each "app" is just a React component:

\`\`\`jsx
<Window id="terminal" title="Terminal" icon="terminal">
  <Terminal />
</Window>
\`\`\`

The \`Window\` wrapper handles:

- Dragging (with z-index stacking)
- Resizing from any edge
- Minimize / maximize / close
- Focus management

All windows register in a shared **Zustand store**:

\`\`\`javascript
const useWindowStore = create((set) => ({
  windows: {},
  openWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { isOpen: true, zIndex: getNextZ() },
    },
  })),
}));
\`\`\`

## What I'd Do Differently

If I rebuilt this today, I'd use **WebSocket-based IPC** between windows to support real multitasking, and I'd replace the iframe browser with a WebView-based approach.

But for a portfolio? This is way more fun than another scroll-based landing page.`,
  },
];

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