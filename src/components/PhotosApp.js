"use client";
import { useState } from "react";

const images = [
  { src: "https://picsum.photos/seed/fitvr/400/300", title: "FitVR Gameplay", cat: "Projects" },
  { src: "https://picsum.photos/seed/code/400/300", title: "Code Setup", cat: "Projects" },
  { src: "https://picsum.photos/seed/desk/400/300", title: "Workspace", cat: "Personal" },
  { src: "https://picsum.photos/seed/vr/400/300", title: "VR Headset", cat: "Projects" },
  { src: "https://picsum.photos/seed/sunset/400/300", title: "Sunset", cat: "Personal" },
  { src: "https://picsum.photos/seed/meeting/400/300", title: "Dev Meetup", cat: "Personal" },
  { src: "https://picsum.photos/seed/unity/400/300", title: "Unity Editor", cat: "Projects" },
  { src: "https://picsum.photos/seed/beach/400/300", title: "Beach Day", cat: "Personal" },
  { src: "https://picsum.photos/seed/gear/400/300", title: "Setup", cat: "Personal" },
];

const categories = ["All", "Projects", "Personal"];

export default function PhotosApp() {
  const [activeCat, setActiveCat] = useState("All");
  const [viewer, setViewer] = useState(null);

  const filtered = activeCat === "All" ? images : images.filter((i) => i.cat === activeCat);

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-subtle shrink-0 overflow-x-auto hide-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`text-xs px-3 py-1 rounded-full transition-all font-medium ${
              activeCat === c ? "bg-white/15 text-white" : "text-muted hover:text-secondary hover:bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((img, i) => (
            <button
              key={i}
              onClick={() => setViewer(img)}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-black/30 border border-subtle hover:border-white/20 transition-all"
            >
              <img src={img.src} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white font-medium truncate">{img.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {viewer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setViewer(null)}>
          <div className="max-w-3xl max-h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={viewer.src} alt={viewer.title} className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl" />
            <p className="text-center text-sm text-white/70 mt-3">{viewer.title}</p>
          </div>
          <button onClick={() => setViewer(null)} className="absolute top-4 right-4 text-white/40 hover:text-white/80 text-xl">&times;</button>
        </div>
      )}
    </div>
  );
}
