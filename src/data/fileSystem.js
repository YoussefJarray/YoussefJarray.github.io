const projects = [
  {
    name: "FitVR",
    desc: "VR fitness game built in Unity 6 with modular architecture.",
    tags: ["Unity", "C#", "VR", "OpenXR"],
    href: "https://github.com/YoussefJarray/FitVR",
    color: "#f97316",
    readme: `# FitVR

A virtual reality fitness game built with **Unity 6**. Players exercise through mini-games while tracking calories, time, and progress.

## Architecture

The project is organized into four core modules:

- **Core** — Game loop, session management, scoring, and audio
- **MiniGames** — A pluggable mini-game system. Each exercise is a self-contained scene implementing a common interface
- **Lobby** — Player hub with stats, customization, and settings
- **Services** — Persistence layer, achievements, and leaderboards

## Key Implementation

\`\`\`csharp
public interface IMiniGame
{
    string GameName { get; }
    void StartGame();
    void EndGame();
    int CalculateScore(float accuracy, float time);
}

public class PunchGame : MonoBehaviour, IMiniGame
{
    public string GameName => "Punch Rhythm";

    public void StartGame()
    {
        SpawnTargets();
        StartCoroutine(GameTimer());
    }

    public int CalculateScore(float accuracy, float time)
    {
        float baseScore = accuracy * 1000;
        float timeBonus = Mathf.Max(0, 300 - time * 10);
        return Mathf.RoundToInt(baseScore + timeBonus);
    }
}
\`\`\`

## Tech Stack

- **Unity 6** with Universal Render Pipeline
- **OpenXR** for cross-platform VR support
- **SteamVR** for room-scale tracking
- **FMOD** for spatial audio

## Challenges

VR development comes with unique constraints. Maintaining **90fps** requires aggressive optimization: GPU instancing, LOD groups, occlusion culling, and single-pass instanced rendering.

*"The hardest part wasn't the gameplay — it was making sure players didn't get motion sick."*`,
  },
  {
    name: "Taskr",
    desc: "Full-featured todo app with drag-and-drop, persistence, and keyboard shortcuts.",
    tags: ["React", "Vite", "JavaScript", "Tailwind"],
    href: "https://github.com/YoussefJarray/Taskr",
    color: "#14b8a6",
    readme: `# Taskr

A minimal, full-featured todo application built with **React** and **Vite**.

## Features

- Create, edit, and delete tasks
- **Drag-and-drop** reordering with smooth animations
- Local storage persistence — your tasks survive reloads
- Dark and light theme
- Keyboard shortcuts for power users

## Usage

\`\`\`bash
git clone https://github.com/YoussefJarray/Taskr
cd Taskr
npm install
npm run dev
\`\`\`

## Architecture

The app uses a simple state management pattern with React hooks:

\`\`\`javascript
function useTasks() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title) => {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, done: false, createdAt: Date.now() },
    ]);
  };

  return { tasks, addTask, removeTask, toggleTask, reorderTasks };
}
\`\`\`

## What I Learned

Building Taskr taught me the importance of **optimistic UI updates**. When dragging a task to reorder, the UI updates immediately before the state settles — this makes drag-and-drop feel instantaneous rather than laggy.`,
  },
  {
    name: "This Portfolio",
    desc: "Linux desktop-inspired portfolio built with Next.js 13.",
    tags: ["Next.js", "Zustand", "Tailwind", "Framer Motion"],
    href: "https://github.com/YoussefJarray/YoussefJarray.github.io",
    color: "#f43f5e",
    readme: `# Portfolio

A **GNOME Linux desktop**-inspired portfolio website. It's not a slideshow — it's a working environment.

## Features

- **Desktop metaphor** — Draggable windows, taskbar, system tray
- **File manager** — Browse projects like real folders
- **Interactive terminal** — Custom commands, command history, neofetch
- **Music player** — Crossfading lo-fi tracks with a Spotify-grade UI
- **Wallpaper & accent customization** — Pick from 3 wallpapers, colors adapt to dark/light mode
- **Boot animation** — Linux-style startup with ESC skip
- **Confetti** — Click the YJ button in the system tray

## Architecture

\`\`\`javascript
// Each window is a React component registered in a map
const appComponents = {
  FileManager, Terminal, AboutApp,
  SettingsApp, BrowserApp, PhotosApp, MarkdownViewer,
};
\`\`\`

State is managed with **Zustand** stores:

- \`windowStore\` — Open windows, focus, z-index
- \`themeStore\` — Dark/light mode
- \`iconStore\` — Desktop icon positions (persisted)
- \`widgetStore\` — Widget positions and visibility
- \`wallpaperStore\` — Selected wallpaper and accent color

## Tech Stack

- **Next.js 13** with App Router
- **Zustand** for state management
- **Tailwind CSS** with CSS variables for theming
- **Framer Motion** for window animations
- **Web Audio API** for music crossfading`,
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
      name: "about.txt",
      type: "file",
      icon: "file",
      meta: {
        content: `# About Me

**Youssef "Yuki" Jarray**

Software Engineering student at **EPI**, specializing in **VR & Game Engineering**.

I build real-time experiences with **Unity**, **C++**, and modern web technologies. Currently working on **FitVR**, a VR fitness game built with Unity 6 and OpenXR.

## Skills

- **Game Dev**: Unity, C#, OpenXR, SteamVR
- **Web**: React, Next.js, TypeScript, Tailwind
- **Tools**: Git, Blender, FMOD, Photoshop
- **Languages**: C#, JavaScript, Python, C++

## Contact

- GitHub: [YoussefJarray](https://github.com/YoussefJarray)
- LinkedIn: [Youssef Jarray](https://www.linkedin.com/in/youssef-jarray-410227112/)
- Location: Sousse, Tunisia`,
      },
    },
  ],
};
